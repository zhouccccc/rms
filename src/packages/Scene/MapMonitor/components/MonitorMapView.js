import React from 'react';
import { message } from 'antd';
import { find } from 'lodash';
import * as PIXI from 'pixi.js';
import { SmoothGraphics } from '@pixi/graphics-smooth';
import { VehicleType, NavigationType, NavigationTypeView } from '@/config/config';
import PixiBuilder from '@/entities/PixiBuilder';
import {
  dealResponse,
  formatMessage,
  getToteLayoutBaseParam,
  isEqual,
  isNull,
  isStrictNull,
} from '@/utils/util';
import {
  VehicleState,
  ElementType,
  EStopStateColor,
  GeoLockColor,
  LatentPodSize,
  SelectionType,
  ToteVehicleSize,
  zIndex,
} from '@/config/consts';
import {
  convertToteLayoutData,
  getElevatorMapCellId,
  getLockCellBounds,
  getTextureFromResources,
  hasLatentPod,
  loadMonitorExtraTextures,
  unifyVehicleState,
} from '@/utils/mapUtil';
import {
  BitText,
  Cell,
  EmergencyStop,
  GeoLock,
  LatentVehicle,
  LatentPod,
  OpenLock,
  RealtimeRate,
  SorterVehicle,
  TaskPath,
  TemporaryLock,
  ToteVehicle,
  TotePod,
} from '@/entities';
import BaseMap from '@/components/BaseMap';
import { fetchVehicleInfo } from '@/services/api';
import { coordinateTransformer } from '@/utils/coordinateTransformer';

class MonitorMapView extends BaseMap {
  constructor() {
    super();

    // 记录显示控制的参数
    this.states = {
      showTote: true,
      showCoordinate: false,
      showCellPoint: true,
      shownPriority: [10, 20, 100, 1000],
      showDistance: false,
      showRealTimeRate: false,
      showBackImg: false,
      emergencyAreaShown: true, // 紧急区域
    };

    // 料箱货架数据 (用来处理 重载地图 时候多个逻辑区的料箱货架渲染问题)
    this.totePodsData = {};
    // 选中的元素数据
    this.selections = [];

    // 监控相关
    this.idVehicleMap = new Map(); // {carID: [VehicleEntity]}
    this.idLatentPodMap = new Map(); // {cellId: [PodEntity]}
    this.idLatentPodInCar = new Map(); // {podId:null} // 用来标识有哪些货架在小车身上
    this.idTotePodMap = new Map(); // {cellId_L: [PodEntity]} ||  {cellId_R: [PodEntity]}
    this.emergencyAreaMap = new Map(); // 紧急区域

    // Locks
    this.vehicleLocksMap = new Map();
    this.cellLocker = null;
    this.TemporaryLockMap = new Map(); // {[x${x}y${y}]: [LockEntity]}

    // 热度
    this.cellHeatMap = new Map();

    // 站点实时速率
    this.stationRealTimeRateMap = new Map();

    // 显示小车路径
    this.filteredVehicle = []; // 存放小车的uniqueId
    this.showTaskPath = false;
    this.vehicleTaskMap = new Map(); // {uniqueId: TaskActions}
    this.vehiclePathMap = new Map(); // {uniqueId:[TaskPathEntity]}
    this.vehicleTargetLineMap = new Map(); // {uniqueId:SmoothGraphics}

    // 料箱实时
    this.toteTaskRealtimePath = [];
    this.toteTaskRealtimeState = [];

    // 小车追踪
    this.trackVehicleId = null;
  }

  async componentDidMount() {
    const htmlDOM = document.getElementById('monitorPixi');
    const { width, height } = htmlDOM.getBoundingClientRect();
    this.pixiUtils = new PixiBuilder(width, height, htmlDOM, () => {});
    window.MonitorPixiUtils = window.PixiUtils = this.pixiUtils;
    window.$$dispatch({ type: 'monitor/saveMapContext', payload: this });
    await loadMonitorExtraTextures(this.pixiUtils.renderer);
  }

  componentWillUnmount() {
    this.clearMapStage();
    this.idCellMap.clear();
    this.idVehicleMap.clear();
    this.idLatentPodMap.clear();
    this.idLineMap = { 10: new Map(), 20: new Map(), 100: new Map(), 1000: new Map() };
  }

  // 清除监控有关的地图数据
  clearMonitorLoad = () => {
    this.emergencyAreaMap.clear();
  };

  // ************************ 可见性控制相关 **********************
  // 地图点位显示
  switchCellShown = (flag) => {
    this.states.showCellPoint = flag;
    this.idCellMap.forEach((cell) => {
      cell.switchShown(flag);
    });
  };

  // 地图料箱显示
  switchToteShown = (flag) => {
    this.states.showTote = flag;
    this.idTotePodMap.forEach((tote) => tote.switchShown(flag));
  };

  // 站点实时速率显示
  switchStationRealTimeRateShown = (flag) => {
    this.states.showRealTimeRate = flag;
    this.stationRealTimeRateMap.forEach(function (value) {
      value.switchStationRateEntityShown(flag);
    });
  };

  // 背景显示
  switchBackImgShown = (flag) => {
    this.states.showBackImg = flag;
    this.backImgMap.forEach(function (value) {
      value.switchBackImgEntityShown(flag);
    });
  };

  // 紧急区域
  emergencyAreaShown = (flag) => {
    this.states.emergencyAreaShown = flag;
    this.emergencyAreaMap.forEach((eStop) => {
      eStop.switchEStopsVisible(flag);
    });
  };

  // 追踪小车
  trackVehicle = (vehicleId) => {
    this.trackVehicleId = vehicleId;
  };

  // 定位:type --> 小车、点位、货架
  locationElements = (type, id) => {
    let x;
    let y;
    let scaled;
    switch (type) {
      case 'cell': {
        const cellEntity = this.idCellMap.get(Number(id));
        if (cellEntity) {
          x = cellEntity.x;
          y = cellEntity.y;
          scaled = 0.7;
        }
        break;
      }
      case 'vehicle': {
        const vehicle = this.idVehicleMap.get(`${id}`);
        if (vehicle) {
          x = vehicle.x;
          y = vehicle.y;
          scaled = 0.3;
        }
        break;
      }
      case 'pod': {
        const pod = this.idLatentPodMap.get(`${id}`);
        if (pod) {
          x = pod.x;
          y = pod.y;
          scaled = 0.3;
        } else {
          // 如果地上的潜伏货架没有符合条件的就查看潜伏车身上的货架
          const vehicleId = this.idLatentPodInCar.get(id);
          if (isNull(vehicleId)) return;
          const vehicleEntity = this.idVehicleMap.get(`${vehicleId}`);
          x = vehicleEntity.x;
          y = vehicleEntity.y;
          scaled = 0.3;
        }
        break;
      }
      default:
        break;
    }
    if (!isNull(x) && !isNull(y)) {
      this.moveTo(x, y, scaled);
      this.refresh();
    }
  };

  // ************************ 点位相关 **********************
  renderCells = (cells) => {
    if (isNull(this.naviCellTypeColor)) {
      this.naviCellTypeColor = {};
      NavigationTypeView.forEach(({ code, color }) => {
        this.naviCellTypeColor[code] = color;
      });
    }

    cells.forEach((item) => {
      const cell = new Cell({
        ...item,
        color: this.naviCellTypeColor[item.navigationType], // 导航点背景色
        showCoordinate: this.states.showCoordinate,
      });
      const xyCellMapKey = `${item.x}_${item.y}`;
      if (!Array.isArray(this.xyCellMap.get(xyCellMapKey))) {
        this.xyCellMap.set(xyCellMapKey, [cell]);
      } else {
        this.xyCellMap.get(xyCellMapKey).push(cell);
      }
      this.idCellMap.set(item.id, cell);
      this.pixiUtils.viewportAddChild(cell);
    });
  };

  select = (entity, mode) => {
    // Chrome调试会误将this指向Cell, 为了便于调试所以使用_this
    const _this = this;

    // 先判断是否是取消选择
    const isCull = _this.selections.includes(entity);
    if (isCull) {
      _this.selections = this.selections.filter((item) => item !== entity);
    } else {
      if (mode === SelectionType.SINGLE) {
        if (entity instanceof Cell) {
          _this.currentClickedCell = entity;
        }
        _this.selections.forEach((entity) => entity.onUnSelect());
        _this.selections.length = 0;
        _this.selections.push(entity);
      } else if (mode === SelectionType.CTRL) {
        if (entity instanceof Cell) {
          _this.currentClickedCell = entity;
        }
        _this.selections.push(entity);
      } else {
        _this.shiftSelectCell(entity);
      }
    }
    _this.refresh();
    window.$$dispatch({ type: 'monitor/updateSelections', payload: [..._this.selections] });
  };

  // ************************ 临时不可走点锁 **********************
  // 渲染临时不可走点锁
  renderTemporaryLock = (inputData) => {
    // 清除所有的临时不可走点
    this.clearTemporaryLock();

    // 渲染新的临时不可走点
    inputData?.forEach((lock) => {
      const cellEntity = this.idCellMap.get(lock.cellId);
      if (cellEntity) {
        const { x, y } = cellEntity;
        const texture = getTextureFromResources('tmp_block_lock');
        const locker = new TemporaryLock(texture, x, y);
        this.pixiUtils.viewportAddChild(locker);
        this.TemporaryLockMap.set(`x${x}y${y}`, locker);
      }
    });
    this.refresh();
  };

  // 清除临时不可走点锁
  clearTemporaryLock = () => {
    this.TemporaryLockMap.forEach((locker) => {
      this.pixiUtils.viewportRemoveChild(locker);
      locker.destroy({ children: true });
    });
    this.TemporaryLockMap.clear();
    this.refresh();
  };

  // 地图元素点击事件
  onVehicleClick = async ({ type, id }) => {
    const { dispatch } = this.props;
    const response = await fetchVehicleInfo(id, type);
    if (dealResponse(response)) {
      message.error(formatMessage({ id: 'app.message.fetchDataFailed' }));
    } else {
      const { mongodbVehicle = {}, redisVehicle = {} } = response;
      dispatch({
        type: 'monitor/saveCheckingElement',
        payload: { type: ElementType.Vehicle, payload: { ...mongodbVehicle, ...redisVehicle } },
      });
    }
  };

  // ************************ 站点报表速率显示 ********************** //
  renderCommonStationRate = (allData) => {
    const showRealTimeRate = this.states.showRealTimeRate;
    const currentMap = new Map([...this.commonFunctionMap, ...this.workStationMap]);
    allData.forEach((currentdata) => {
      const stopCellId = currentdata.stationCellId;
      const _station = currentMap.get(`${stopCellId}`);
      const cellEntity = this.idCellMap.get(stopCellId);
      if (isNull(_station) || !cellEntity) return;
      // 如果4个显示都为null 则直接return
      const { goodsRate, vehicleRate, waitTime, vehicleAndTaskProportion } = currentdata;
      if (
        isStrictNull(vehicleRate) &&
        isStrictNull(goodsRate) &&
        isStrictNull(waitTime) &&
        isStrictNull(vehicleAndTaskProportion)
      )
        return;
      const _currentdata = {
        ...currentdata,
        showRealTimeRate,
        x: _station?.x,
        y: _station?.y || 0,
        iconwidth: _station?.width || 0,
        iconheight: _station?.height || 0,
        angle: _station?.$angle || 0,
      };
      let _entity = this.stationRealTimeRateMap.get(`${stopCellId}`);
      if (!isNull(_entity)) {
        this.pixiUtils.viewportRemoveChild(_entity);
        _entity.destroy(true);
        this.stationRealTimeRateMap.delete(`${stopCellId}`);
      }
      // 新增
      const newEntity = new RealtimeRate(_currentdata);
      this.pixiUtils.viewportAddChild(newEntity);
      this.stationRealTimeRateMap.set(`${stopCellId}`, newEntity);
    });
    this.refresh();
  };

  // ************************ 小车 & 货架相关 **********************
  updateVehicleCommonState = (vehiclec, vehicleState, vehicleEntity, vehicleType) => {
    const { x, y, vehicleId, uniqueId, battery, mainTain, manualMode, errorLevel } = vehicleState;
    // TODO: 测试
    const {
      navigationType = NavigationType.M_QRCODE,
      vehicleStatus,
      currentCellId,
      currentDirection,
    } = vehicleState;

    // 判断该 vehicleId 对应的小车是否是潜伏车
    if (vehicleEntity.type !== vehicleType) {
      console.warn(
        `检测到小车ID冲突. 目标ID: [${vehicleId}], 目标小车类型: [${vehicleEntity.type}]; 实际应该是: [${vehicleType}]`,
      );
      return;
    }

    // 1. 如果小车数据【vehicle.c】与 currentCellId 不一致说小车当前在电梯中；
    // 2. 此时需要对比 currentCellId 对应的点位位置与 x,y 是否一样; 一样表示在当前逻辑区，不一样表示当前小车不在这个逻辑区需要隐藏
    // 3. 但是有个隐藏bug，如果楼层间的电梯都处于同一个点位那么这个逻辑就会失效，就得要求后台在小车消息中加sectionId
    const cellEntity = this.idCellMap.get(currentCellId);
    if (cellEntity) {
      if (vehiclec !== currentCellId) {
        if (cellEntity.x !== x || cellEntity.y !== y) {
          this.pixiUtils.viewportRemoveChild(vehicleEntity);
          vehicleEntity.__gui__on__map = false;
          return;
        }
      }
      if (!vehicleEntity.__gui__on__map) {
        vehicleEntity.__gui__on__map = true;
        this.pixiUtils.viewportAddChild(vehicleEntity);
      }
    } else {
      // 如果找不到点位，那就说明现在小车在别的逻辑区
      this.pixiUtils.viewportRemoveChild(vehicleEntity);
      vehicleEntity.__gui__on__map = false;
      return;
    }

    // 更新位置
    const pixiCoordinate = coordinateTransformer({ x, y }, navigationType);
    vehicleEntity.x = pixiCoordinate.x;
    vehicleEntity.y = pixiCoordinate.y;
    vehicleEntity.currentCellId = currentCellId;

    // 更新小车状态
    if (vehicleStatus && vehicleEntity.state !== vehicleStatus) {
      vehicleEntity.updateVehicleState(vehicleStatus);
    }

    // 手动模式
    if (manualMode !== vehicleEntity.manualMode) {
      vehicleEntity.updateManuallyMode(manualMode);
    }

    // 更新小车方向
    if (!isNull(currentDirection)) {
      vehicleEntity.angle = currentDirection;
    }

    // 刷新行驶路线
    this.showTaskPath && this.updateTaskPath(`${uniqueId}`);

    // 更新小车电池状态
    if (battery && vehicleEntity.battery !== battery) {
      vehicleEntity.updateBatteryState(battery);
    }

    // 更新小车错误等级(0:无错误; 1:error错误;  2:warn错误; 3:info错误)
    if (vehicleEntity.errorLevel !== errorLevel) {
      vehicleEntity.updateErrorLevel(errorLevel);
    }

    // 更新小车维护中状态
    if (vehicleEntity.mainTain !== !!mainTain) {
      vehicleEntity.updateMainTainState(mainTain);
    }

    // 执行跟踪
    vehicleId === `${this.trackVehicleId}` && this.moveTo(vehicleEntity.x, vehicleEntity.y, 0.1);
  };

  // ********** 潜伏车 ********** //
  addLatentVehicle = (latentVehicleData) => {
    // 如果点位未渲染好直接退出
    if (this.idCellMap.size === 0) return;
    // 这里需要一个检查，因为在页面存在车的情况下刷新页面，socket信息可能比小车列表数据来得快，所以update**Vehicle就会创建一台车[offline]
    // 但是一旦小车列表数据到了后会再次渲染出相同的小车, 所以这里需要检查当前id的车是否存在。如果小车存在就更新，如果小车不存在且点位存在就新建小车
    let latentVehicle = this.idVehicleMap.get(`${latentVehicleData.vehicleId}`);
    const cellEntity = this.idCellMap.get(latentVehicleData.currentCellId);
    if (latentVehicle) {
      this.updateLatentVehicle([latentVehicleData]);
      return latentVehicle;
    }
    latentVehicle = new LatentVehicle({
      id: latentVehicleData.vehicleId,
      x: latentVehicleData.x || cellEntity?.x,
      y: latentVehicleData.y || cellEntity?.y,
      uniqueId: latentVehicleData.uniqueId,
      vehicleType: latentVehicleData.vehicleType,
      vehicleIcon: latentVehicleData.vehicleIcon,
      battery: latentVehicleData.battery || 0,
      errorLevel: latentVehicleData.errorLevel || 0,
      state: latentVehicleData.vehicleStatus ?? VehicleState.offline,
      mainTain: latentVehicleData.mainTain,
      manualMode: latentVehicleData.manualMode,
      cellId: latentVehicleData.currentCellId,
      angle: latentVehicleData.currentDirection,
      select: this.select,
    });
    cellEntity && this.pixiUtils.viewportAddChild(latentVehicle);
    this.idVehicleMap.set(`${latentVehicleData.vehicleId}`, latentVehicle);
    return latentVehicle;
  };

  renderLatentVehicle = (latentVehicleList) => {
    if (Array.isArray(latentVehicleList)) {
      latentVehicleList.forEach((latentVehicleData) => {
        const latentVehicle = this.idVehicleMap.get(`${latentVehicleData.vehicleId}`);
        if (isNull(latentVehicle)) {
          this.addLatentVehicle(latentVehicleData);
        }
      });
    }
  };

  updateLatentVehicle = (allVehicleStatus) => {
    for (const vehicle of allVehicleStatus) {
      const unifiedVehicleState = unifyVehicleState(vehicle);
      const {
        x,
        y,
        podId,
        vehicleId,
        battery,
        mainTain,
        vehicleStatus,
        podDirection,
        currentCellId,
        currentDirection,
        errorLevel,
        uniqueId,
        vehicleType,
        vehicleIcon,
      } = unifiedVehicleState;

      if (isNull(currentCellId)) return;

      // 首先处理删除小车的情况
      if (currentCellId === -1) {
        this.removeLatentVehicle(vehicleId);
        this.refresh();
        return;
      }

      let latentVehicle = this.idVehicleMap.get(`${vehicleId}`);
      // 如果小车不存在
      if (isNull(latentVehicle)) {
        // 新增小车: 登陆小车的第一条信息没有【状态】值, 就默认【离线】
        latentVehicle = this.addLatentVehicle({
          x,
          y,
          vehicleId,
          uniqueId,
          vehicleType,
          vehicleIcon,
          mainTain,
          currentCellId,
          currentDirection,
          battery: battery || 0,
          vehicleStatus: vehicleStatus || 'Offline',
          errorLevel: errorLevel || 0,
        });
      }
      if (isNull(latentVehicle)) return;

      // 更新通用状态
      this.updateVehicleCommonState(
        vehicle.c,
        unifiedVehicleState,
        latentVehicle,
        VehicleType.LatentLifting,
      );

      // 卸货: podId不存在但是小车还有货物的时候需要卸货 --> {vehicleId: "x", currentCellId: 46, currentDirection: 0, mainTain: false, battery: 54, podId: 0}
      if (!hasLatentPod(podId) && latentVehicle && latentVehicle.pod) {
        this.idLatentPodInCar.delete(latentVehicle.pod.id);
        latentVehicle.downPod();
      }

      // 刷新小车上货架的状态
      if (hasLatentPod(podId)) {
        this.refreshLatentPod({
          podId,
          vehicleId,
          cellId: currentCellId,
          direction: podDirection,
          h: 1050, // 下车身上的货架不需要展示尺寸，所以随便给个数值
          w: 1050,
        });
      }

      latentVehicle.dirty = true;
      this.refresh();
    }
  };

  removeLatentVehicle = (vehicleId) => {
    const latentVehicle = this.idVehicleMap.get(`${vehicleId}`);
    if (latentVehicle) {
      // 如果现在身上驮着货架就要放下
      if (latentVehicle.podId) {
        const podId = latentVehicle.podId;
        const podAngle = latentVehicle.pod.angle;
        latentVehicle.downPod();
        // 删除该货架在车身的标记
        this.idLatentPodInCar.delete(podId);
        // 将该货架刷新到地上
        this.refreshLatentPod({ podId, cellId: latentVehicle.currentCellId, direction: podAngle });
      }
      this.pixiUtils.viewportRemoveChild(latentVehicle);
      latentVehicle.destroy({ children: true });
      this.idVehicleMap.delete(`${vehicleId}`);
    }
  };

  // ********** 潜伏货架 ********** //
  addLatentPod = (latentPodData) => {
    if (this.idCellMap.size === 0) return;
    const { podId, cellId, angle, width, length: height } = latentPodData;
    const cellEntity = this.idCellMap.get(cellId);
    // 这里需要做一次检查: 因为小车的状态信息可能比货架信息来的早, 一旦某货架和小车已经存在绑定关系
    // 就会在渲染的小车上渲染出该货架, 但后到的货架信息会在该点重新渲染正常状态的货架从而造成一个地图上存在两个相同的货架
    const exist = this.idLatentPodInCar.has(podId);
    if (!exist) {
      const latentPod = new LatentPod({
        id: podId,
        cellId,
        width,
        height,
        angle: angle || 0,
        x: cellEntity ? cellEntity.x : null,
        y: cellEntity ? cellEntity.y : null,
        select: this.select,
      });
      latentPod.dirty = true;
      cellEntity && this.pixiUtils.viewportAddChild(latentPod);
      this.idLatentPodMap.set(`${podId}`, latentPod);
    }
  };

  renderLatentPod = (latentPodList) => {
    if (Array.isArray(latentPodList)) {
      latentPodList.forEach((latentPod) => {
        this.addLatentPod(latentPod);
      });
      this.refresh();
    }
  };

  refreshLatentPod = (podStatus) => {
    // {"podId":"22","direction":0,"cellId":22,"h":1050,"w":1050}
    const { podId, vehicleId, cellId: currentCellId, direction: podDirection = 0 } = podStatus;
    const width = podStatus.w || LatentPodSize.width;
    const height = podStatus.h || LatentPodSize.height;

    if (currentCellId === -1) {
      // 删除Pod
      const latentPod = this.idLatentPodMap.get(`${podId}`);
      if (latentPod) {
        this.pixiUtils.viewportRemoveChild(latentPod);
        latentPod.destroy({ children: true });
        this.idLatentPodMap.delete(`${podId}`);
        this.refresh();
      }
      return;
    }

    // 如果当前车找不到点位就不做任何更新
    const cellEntity = this.idCellMap.get(currentCellId);
    if (!cellEntity) return;

    if (vehicleId) {
      // 如果有货架绑定在车上，那么此时货架要么在点位上要么在车上
      const latentVehicle = this.idVehicleMap.get(`${vehicleId}`);
      if (latentVehicle) {
        let latentPod;
        if (latentVehicle.pod) {
          // 如果在小车上只需要更新部分数据
          latentPod = latentVehicle.pod;
        } else {
          // 地上的货架和新建的货架都需要更新大量的数据，所以这里放在一起无差别处理
          latentPod = this.idLatentPodMap.get(`${podId}`);
          if (!latentPod) {
            if (cellEntity) {
              latentPod = new LatentPod({
                id: podId,
                angle: podDirection,
                cellId: currentCellId,
                x: cellEntity.x,
                y: cellEntity.y,
                width,
                height,
                select: this.select,
              });
            } else {
              return;
            }
          }
          latentPod.position.set(0, 0);
          latentPod.setAlpha(0.9);
          latentPod.width = LatentPodSize.width / 2;
          latentPod.height = LatentPodSize.height / 2;
          // 标记该潜伏货架正在小车身上
          this.idLatentPodInCar.set(`${podId}`, vehicleId);
          latentVehicle.upPod(latentPod);
          this.idLatentPodMap.delete(`${podId}`);
        }
        latentPod.visible = true;
        latentPod.cellId = currentCellId;
        latentPod.setAngle(podDirection);
      }
    } else {
      // 首先看这个pod是否已经存在, 不存在的话再添加, 存在的话可能是更新位置
      const latentPod = this.idLatentPodMap.get(`${podId}`);
      if (latentPod) {
        latentPod.x = cellEntity.x;
        latentPod.y = cellEntity.y;
        latentPod.resize(width, height);
        latentPod.setAngle(podDirection);
      } else {
        this.addLatentPod({
          podId,
          cellId: currentCellId,
          angle: podDirection,
          width,
          length: height,
        });
      }
    }
    this.refresh();
  };

  // ********** 料箱车 ********** //
  addToteVehicle = (toteVehicleData) => {
    // 如果点位未渲染好直接退出
    if (this.idCellMap.size === 0) return;
    // 这里需要一个检查，因为在页面存在车的情况下刷新页面，socket信息可能比小车列表数据来得快，所以update**Vehicle就会创建一台车[offline]
    // 但是一旦小车列表数据到了后会再次渲染出相同的小车, 所以这里需要检查当前id的车是否存在。如果小车存在就更新，如果小车不存在且点位存在就新建小车
    let toteVehicle = this.idVehicleMap.get(`${toteVehicleData.vehicleId}`);
    const cellEntity = this.idCellMap.get(toteVehicleData.currentCellId);
    if (toteVehicle) {
      this.updateToteVehicle([toteVehicleData]);
      return toteVehicle;
    }
    const { checkVehicle, simpleCheckVehicle } = this.props;
    toteVehicle = new ToteVehicle({
      x: toteVehicleData.x || cellEntity.x,
      y: toteVehicleData.y || cellEntity.y,
      id: toteVehicleData.vehicleId,
      uniqueId: toteVehicleData.uniqueId,
      vehicleType: toteVehicleData.vehicleType,
      vehicleIcon: toteVehicleData.vehicleIcon,
      cellId: toteVehicleData.currentCellId,
      angle: toteVehicleData.currentDirection,
      shelfs: toteVehicleData.shelfs || 0,
      battery: toteVehicleData.battery || 0,
      errorLevel: toteVehicleData.errorLevel || 0,
      state: toteVehicleData.vehicleStatus || VehicleState.offline,
      manualMode: toteVehicleData.manualMode,
      toteCodes: toteVehicleData.toteCodes || [null],
      active: true,
      checkVehicle,
      simpleCheckVehicle,
    });
    cellEntity && this.pixiUtils.viewportAddChild(toteVehicle);
    this.idVehicleMap.set(`${toteVehicleData.vehicleId}`, toteVehicle);

    return toteVehicle;
  };

  renderToteVehicle = (toteVehicleList) => {
    if (Array.isArray(toteVehicleList)) {
      toteVehicleList.forEach((toteVehicleData) => {
        const toteVehicle = this.idVehicleMap.get(`${toteVehicleData.vehicleId}`);
        if (isNull(toteVehicle)) {
          this.addToteVehicle(toteVehicleData);
        }
      });
    }
  };

  removeToteVehicle = (vehicleId) => {
    const toteVehicle = this.idVehicleMap.get(`${vehicleId}`);
    if (toteVehicle) {
      this.pixiUtils.viewportRemoveChild(toteVehicle);
      toteVehicle.destroy({ children: true });
      this.idVehicleMap.delete(`${vehicleId}`);
    }
  };

  updateToteVehicle = (toteVehicleStatus) => {
    for (const vehicle of toteVehicleStatus) {
      const unifiedVehicleState = unifyVehicleState(vehicle);
      const {
        x,
        y,
        vehicleId,
        battery,
        shelfs,
        mainTain,
        holdTote,
        toteCodes,
        vehicleStatus,
        currentCellId,
        currentDirection,
        errorLevel,
        uniqueId,
        vehicleType,
        vehicleIcon,
      } = unifiedVehicleState;

      if (isNull(currentCellId)) return;

      // 首先处理删除小车的情况
      if (currentCellId === -1) {
        this.removeToteVehicle(vehicleId);
        this.refresh();
        return;
      }

      let toteVehicle = this.idVehicleMap.get(`${vehicleId}`);
      // 如果小车不存在
      if (isNull(toteVehicle)) {
        // 新增小车: 登陆小车的第一条信息没有【状态】值, 就默认【离线】
        toteVehicle = this.addToteVehicle({
          x,
          y,
          vehicleId,
          shelfs,
          mainTain,
          toteCodes,
          currentCellId,
          currentDirection,
          battery: battery || 0,
          vehicleStatus: vehicleStatus || 'Offline',
          errorLevel: errorLevel || 0,
          uniqueId,
          vehicleType,
          vehicleIcon,
        });
      }
      if (isNull(toteVehicle)) return;

      // 更新通用状态
      this.updateVehicleCommonState(vehicle.c, unifiedVehicleState, toteVehicle, VehicleType.Tote);

      // 更新料箱车货架
      if (shelfs && toteVehicle.shelfs !== shelfs) {
        toteVehicle.refreshShelfs(shelfs);
      }

      // 更新料箱车料箱
      if (toteCodes && !isEqual(toteVehicle.toteCodes, toteCodes)) {
        toteVehicle.updateTotes(toteCodes);
      }

      // 更新抱夹料箱
      toteVehicle.updateHolding(holdTote);

      // 渲染料箱任务实时路径(北斗七星图)
      if (Array.isArray(this.toteTaskRealtimeData) && this.toteTaskRealtimeData.length > 0) {
        const realtime = find(this.toteTaskRealtimeData, { rid: vehicleId });
        realtime && this.renderToteTaskRealtimePaths(vehicleId, x, y, realtime.bcodes ?? []);
      }

      toteVehicle.dirty = true;
      this.refresh();
    }
  };

  // 更新料箱车车上货架显示效果和抱夹显示效果
  updateToteState = (toteState) => {
    const { vehicleId, toteCodes, holdingTote } = toteState;
    const toteVehicle = this.idVehicleMap.get(`${vehicleId}`);
    if (toteVehicle) {
      toteVehicle.updateTotes(toteCodes);
      toteVehicle.updateHolding(holdingTote);
      this.refresh();
    }
  };

  // ********** 料箱货架 ********** //
  addTotePod = (totePodData) => {
    /**
     * @Update 更新方法使其支持四个方向: 2020年07月28日
     * @Tip 这里的 leftRack 和 rightRack 是相当于小车的方向
     * @vehicleDirection === 0 向上
     * @vehicleDirection === 1 向右
     * @vehicleDirection === 2 向下
     * @vehicleDirection === 3 向左
     */
    this.totePodsData = totePodData;
    const _this = this;
    if (!totePodData.rackGroups) return;
    Object.keys(totePodData.rackGroups).forEach((rack) => {
      // 巷道数据, 包含车辆方向和料箱数据
      const rackGroupData = totePodData.rackGroups[rack];
      const { vehicleDirection, leftRack, rightRack } = rackGroupData;
      // 左侧料箱货架
      if (leftRack && leftRack.bins) {
        const { angle, XBase, YBase, offset, adapte } = getToteLayoutBaseParam(
          vehicleDirection,
          'L',
        );
        leftRack.bins.forEach((bin) => {
          const cellEntity = _this.idCellMap.get(bin.binCellId);
          if (cellEntity && !bin.disable) {
            let x;
            let y;
            if (adapte === 'X') {
              x = cellEntity.x + XBase * (bin.depth / 2 + ToteVehicleSize.width / 2 + 150);
              y = cellEntity.y + YBase * offset;
            } else {
              x = cellEntity.x + XBase * offset;
              y = cellEntity.y + YBase * (bin.depth / 2 + ToteVehicleSize.width / 2 + 150);
            }
            const totePod = new TotePod({
              x,
              y,
              angle,
              side: 'L',
              checkTote: this.props.checkTote,
              ...bin,
            });
            totePod.switchShown(this.states.showTote);
            _this.pixiUtils.viewportAddChild(totePod);
            _this.idTotePodMap.set(bin.code, totePod);
          }
        });
      }
      // 右侧料箱货架
      if (rightRack && rightRack.bins) {
        const { angle, XBase, YBase, offset, adapte } = getToteLayoutBaseParam(
          vehicleDirection,
          'R',
        );
        rightRack.bins.forEach((bin) => {
          const cellEntity = _this.idCellMap.get(bin.binCellId);
          if (cellEntity && !bin.disable) {
            let x;
            let y;
            if (adapte === 'X') {
              x = cellEntity.x + XBase * (bin.depth / 2 + ToteVehicleSize.width / 2 + 150);
              y = cellEntity.y + YBase * offset;
            } else {
              x = cellEntity.x + XBase * offset;
              y = cellEntity.y + YBase * (bin.depth / 2 + ToteVehicleSize.width / 2 + 150);
            }
            const totePod = new TotePod({
              x,
              y,
              angle,
              side: 'R',
              checkTote: this.props.checkTote,
              ...bin,
            });
            _this.pixiUtils.viewportAddChild(totePod);
            _this.idTotePodMap.set(bin.code, totePod);
          }
        });
      }
    });
  };

  renderTotePod = (toteLayoutData) => {
    const rackGroups = toteLayoutData?.rackGroups;
    if (!rackGroups) return;
    const newTotePodData = convertToteLayoutData(toteLayoutData);
    this.addTotePod(newTotePodData);
  };

  // ********** 分拣车 ********** //
  addSorterVehicle = (sorterVehicleData, callback) => {
    // 如果点位未渲染好直接退出
    if (this.idCellMap.size === 0) return;
    // 这里需要一个检查，因为在页面存在车的情况下刷新页面，socket信息可能比小车列表数据来得快，所以update**Vehicle就会创建一台车[offline]
    // 但是一旦小车列表数据到了后会再次渲染出相同的小车, 所以这里需要检查当前id的车是否存在。如果小车存在就更新，如果小车不存在且点位存在就新建小车
    let sorterVehicle = this.idVehicleMap.get(`${sorterVehicleData.vehicleId}`);
    const cellEntity = this.idCellMap.get(sorterVehicleData.currentCellId);
    if (sorterVehicle) {
      this.updateSorterVehicle([sorterVehicleData]);
      return sorterVehicle;
    }
    const { simpleCheckVehicle } = this.props;
    sorterVehicle = new SorterVehicle({
      $$formData: sorterVehicleData, // 原始DB数据
      id: sorterVehicleData.vehicleId,
      x: sorterVehicleData.x || cellEntity.x,
      y: sorterVehicleData.y || cellEntity.y,
      uniqueId: sorterVehicleData.uniqueId,
      vehicleType: sorterVehicleData.vehicleType,
      vehicleIcon: sorterVehicleData.vehicleIcon,
      battery: sorterVehicleData.battery || 0,
      errorLevel: sorterVehicleData.errorLevel || 0,
      state: sorterVehicleData.vehicleStatus ?? VehicleState.offline,
      mainTain: sorterVehicleData.mainTain,
      manualMode: sorterVehicleData.manualMode,
      cellId: sorterVehicleData.currentCellId,
      angle: sorterVehicleData.currentDirection,
      active: true,
      select: typeof callback === 'function' ? callback : this.select,
      simpleCheckVehicle,
    });
    cellEntity && this.pixiUtils.viewportAddChild(sorterVehicle);
    this.idVehicleMap.set(`${sorterVehicleData.vehicleId}`, sorterVehicle);
    return sorterVehicle;
  };

  renderSorterVehicle = (sorterVehicleList) => {
    if (Array.isArray(sorterVehicleList)) {
      sorterVehicleList.forEach((sorterVehicleData) => {
        const sorterVehicle = this.idVehicleMap.get(`${sorterVehicleData.vehicleId}`);
        if (isNull(sorterVehicle)) {
          this.addSorterVehicle(sorterVehicleData);
        }
      });
    }
  };

  updateSorterVehicle = (allVehicleStatus) => {
    for (const vehicle of allVehicleStatus) {
      const unifiedVehicleState = unifyVehicleState(vehicle);
      const {
        x,
        y,
        vehicleId,
        battery,
        mainTain,
        vehicleStatus,
        sorterPod,
        currentCellId,
        currentDirection,
        errorLevel,
        uniqueId,
        vehicleType,
        vehicleIcon,
      } = unifiedVehicleState;

      if (isNull(currentCellId)) return;

      // 首先处理删除小车的情况
      if (currentCellId === -1) {
        this.removeSorterVehicle(vehicleId);
        this.refresh();
        return;
      }

      let sorterVehicle = this.idVehicleMap.get(`${vehicleId}`);
      // 如果小车不存在
      if (isNull(sorterVehicle)) {
        // 新增小车: 登陆小车的第一条信息没有【状态】值, 就默认【离线】
        sorterVehicle = this.addSorterVehicle({
          x,
          y,
          vehicleId,
          uniqueId,
          vehicleType,
          vehicleIcon,
          mainTain,
          currentCellId,
          currentDirection,
          battery: battery || 0,
          errorLevel: errorLevel || 0,
          vehicleStatus: vehicleStatus || 'Offline',
        });
      }
      if (isNull(sorterVehicle)) return;

      // 更新通用状态
      this.updateVehicleCommonState(
        vehicle.c,
        unifiedVehicleState,
        sorterVehicle,
        VehicleType.Sorter,
      );

      // 更新小车车身货架
      sorterVehicle.updatePod(sorterPod);

      sorterVehicle.dirty = true;
      this.refresh();
    }
  };

  removeSorterVehicle = (vehicleId) => {
    const sorterVehicle = this.idVehicleMap.get(`${vehicleId}`);
    if (sorterVehicle) {
      this.pixiUtils.viewportRemoveChild(sorterVehicle);
      sorterVehicle.destroy({ children: true });
      this.idVehicleMap.delete(`${vehicleId}`);
    }
  };

  // ************************ 渲染小车锁格 ********************** //
  renderLockCell = (inputData) => {
    const { allVehicles } = window.$$state().monitor;
    // 清除所有的几何锁
    this.clearAllLocks();

    // 渲染新的所有指定类型的锁
    inputData.forEach((lockData) => {
      const {
        geoModel: {
          dimension,
          position: { x, y },
          angle,
        },
      } = lockData;
      // 更新位置
      const navigationType = NavigationType.M_QRCODE;
      const currentPosition = coordinateTransformer({ x, y }, navigationType);
      const { width, height } = getLockCellBounds(dimension);
      // 校验锁格数据，尤其是宽高
      if (!height || !width) {
        message.error(
          formatMessage(
            { id: 'monitor.tip.LockDataAbnormal' },
            {
              detail: `vehicleId: ${lockData.vehicleId}; Height: ${height}; Width: ${width}`,
            },
          ),
        );
      }

      const color = GeoLockColor['PATH'];
      let geoLock;
      const currentLockData = {
        ...lockData,
        ...currentPosition,
        ...dimension,
        width,
        height,
        angle,
        uniqueId: lockData.vehicleId,
        vehicleId: find(allVehicles, { uniqueId: lockData.vehicleId })?.vehicleId,
      };
      if (lockData.boxType === 'GOTO_ROTATING') {
        geoLock = new OpenLock({ ...currentLockData, color });
      } else {
        geoLock = new GeoLock({ ...currentLockData, color });
      }
      this.vehicleLocksMap.set(
        `r${lockData.vehicleId}x${currentPosition.x}y${currentPosition.y}t${Math.random()}`, // 防止重复key导致覆盖
        geoLock,
      );
      this.pixiUtils.viewportAddChild(geoLock);
    });
  };

  clearAllLocks = () => {
    this.vehicleLocksMap.forEach((locker) => {
      this.pixiUtils.viewportRemoveChild(locker);
      if (locker instanceof OpenLock) {
        locker.destroy(true);
      } else {
        if (locker.shape === 'Rectangle') {
          locker.destroy({ children: true });
        } else {
          locker.destroy(true);
        }
      }
    });
    this.vehicleLocksMap.clear();
  };

  // ************************ 渲染点位锁格 ********************** //
  renderCellLocks = (lockData) => {
    const { allVehicles } = window.$$state().monitor;
    // 清除所有的几何锁
    this.clearCellLocks();
    if (!lockData) return;

    const {
      geoModel: {
        dimension,
        position: { x, y },
        angle,
      },
    } = lockData;

    const navigationType = NavigationType['M_QRCODE'];
    const currentPosition = coordinateTransformer({ x, y }, navigationType);

    const { width, height } = getLockCellBounds(dimension);
    // 渲染新的所有指定类型的锁
    // 校验锁格数据，尤其是宽高
    if (!height || !width) {
      message.error(
        formatMessage(
          { id: 'monitor.tip.LockDataAbnormal' },
          {
            detail: `vehicleId: ${lockData.vehicleId}; Height: ${height}; Width: ${width}`,
          },
        ),
      );
    }

    const color = GeoLockColor['PATH'];
    let geoLock;
    const currentLockData = {
      ...lockData,
      ...currentPosition,
      ...dimension,
      width,
      height,
      angle,
      uniqueId: lockData.vehicleId,
      vehicleId: find(allVehicles, { uniqueId: lockData.vehicleId })?.vehicleId,
    };
    if (lockData.boxAction === 'GOTO_ROTATING') {
      geoLock = new OpenLock({ ...currentLockData, color });
    } else {
      geoLock = new GeoLock({ ...currentLockData, color });
    }
    this.cellLocker = geoLock;
    this.pixiUtils.viewportAddChild(geoLock);
  };

  clearCellLocks = () => {
    if (isNull(this.cellLocker)) return;
    this.pixiUtils.viewportRemoveChild(this.cellLocker);
    if (this.cellLocker instanceof OpenLock) {
      this.cellLocker.destroy(true);
    } else {
      if (this.cellLocker.shape === 'Rectangle') {
        this.cellLocker.destroy({ children: true });
      } else {
        this.cellLocker.destroy(true);
      }
    }
    this.cellLocker = null;
  };

  // ************************ 渲染小车行驶路径路径 ********************** //
  registerShowTaskPath = (vehicleTasks = [], showTaskPath) => {
    this.filteredVehicle = window.$$state().monitorView.selectVehicle;
    this.showTaskPath = showTaskPath;

    // 前置处理
    if (!this.showTaskPath) {
      // 清除所有路线数据缓存
      this.vehicleTaskMap.clear();
      // 清除掉所有的路线
      this.vehiclePathMap.forEach((paths) => {
        paths.forEach((path) => {
          this.pixiUtils.viewportRemoveChild(path);
          path.destroy({ children: true });
        });
        paths.length = 0;
      });
      this.vehiclePathMap.clear();
    } else {
      // 根据最新的vehicleTasks来确定目前需要渲染的小车任务路径，删除不需要渲染的路径. 比如：搜索 100，101小车，但是101小车没有任务路径，所以返回值不会包含101小车的数据
      const vehicleToRenderPath = vehicleTasks.map((vehicleTask) => `${vehicleTask.v}`);
      const vehicleToSplit = [];
      [...this.vehiclePathMap.keys()].forEach((id) => {
        if (!vehicleToRenderPath.includes(id)) {
          vehicleToSplit.push(id);
          const paths = this.vehiclePathMap.get(id);
          paths.forEach((path) => {
            this.pixiUtils.viewportRemoveChild(path);
            path.destroy({ children: true });
          });
        }
      });
      vehicleToSplit.forEach((id) => {
        this.vehiclePathMap.delete(id);
        this.vehicleTaskMap.delete(id);
      });
    }

    // 缓存当前执行的任务
    vehicleTasks.forEach((vehicleTask) => {
      // 现在只会在路径发生变化的时候才会发送路径点位cId, 所以这里只会保存包含cId的消息, 不包含cId的消息只会用来更新si和ei字段
      if (vehicleTask.hasOwnProperty('c')) {
        this.vehicleTaskMap.set(`${vehicleTask.v}`, vehicleTask);
      } else {
        // 否则只是更改 startIndex(si) 和 endIndex(ei)
        const storedVehicleTask = this.vehicleTaskMap.get(`${vehicleTask.v}`);
        if (storedVehicleTask) {
          storedVehicleTask.si = vehicleTask.si;
          storedVehicleTask.ei = vehicleTask.ei;
        }
      }
    });
    this.refresh();
  };

  updateTaskPath = (uniqueId) => {
    // 清除路径线
    const paths = this.vehiclePathMap.get(uniqueId);
    if (paths && paths.length > 0) {
      paths.forEach((path) => {
        this.pixiUtils.viewportRemoveChild(path);
        path.destroy({ children: true });
      });
    }
    this.vehiclePathMap.delete(uniqueId);

    // 清除目标线
    const targetLineSprite = this.vehicleTargetLineMap.get(uniqueId);
    if (targetLineSprite) {
      this.pixiUtils.viewportRemoveChild(targetLineSprite);
      targetLineSprite.destroy(true);
      this.vehicleTargetLineMap.delete(uniqueId);
    }

    // 渲染新的路线
    if (!this.filteredVehicle.includes(uniqueId)) return;
    this.renderTaskPaths(uniqueId);
    this.refresh();
  };

  renderTaskPaths = (uniqueId) => {
    const { showFullPath, showTagetLine } = window.$$state().monitorView.routeView;
    const { allVehicles } = window.$$state().monitor;
    // 渲染新的路径
    const _this = this;
    const vehicleTaskMessage = this.vehicleTaskMap.get(uniqueId);
    if (vehicleTaskMessage) {
      const { si: startIndex, ei: endIndex, c: cellIds } = vehicleTaskMessage;
      const types = { passed: [], locked: [], future: [] };
      const pathCellIds = cellIds.map((id) => id);

      // 确定区间
      // 只要是走过的线段都是灰色的
      if (showFullPath) {
        const tmpPassed = pathCellIds.slice(0, startIndex + 1);
        tmpPassed.length > 0 &&
          tmpPassed.reduce((pre, next) => {
            types.passed.push({ start: pre, end: next });
            return next;
          });
      }

      // 已经锁中的为绿色
      const tmpLocked = pathCellIds.slice(startIndex, endIndex + 1);
      tmpLocked.length > 0 &&
        tmpLocked.reduce((pre, next) => {
          types.locked.push({ start: pre, end: next });
          return next;
        });

      // 将要走的是黄色
      if (showFullPath) {
        const tmpFuture = pathCellIds.slice(endIndex, cellIds.length + 1);
        tmpFuture.length > 0 &&
          tmpFuture.reduce((pre, next) => {
            types.future.push({ start: pre, end: next });
            return next;
          });
      }

      // 开始渲染
      Object.keys(types).forEach((typeKey) => {
        types[typeKey].forEach((path) => {
          _this.addTaskPath(
            getElevatorMapCellId(path.start),
            getElevatorMapCellId(path.end),
            typeKey,
            uniqueId,
          );
        });
      });

      // 渲染小车到目标点的连线
      if (showTagetLine) {
        const { vehicleId } = find(allVehicles, { uniqueId });
        const vehicleData = this.idVehicleMap.get(vehicleId);
        let lineEnd = pathCellIds[pathCellIds.length - 1];
        lineEnd = getElevatorMapCellId(lineEnd);
        const targetCell = this.idCellMap.get(lineEnd);

        const targetLineSprite = new PIXI.Graphics();
        targetLineSprite.lineStyle(20, 0x287ada, 1);
        targetLineSprite.moveTo(vehicleData.x, vehicleData.y);
        targetLineSprite.lineTo(targetCell.x, targetCell.y);
        targetLineSprite.zIndex = zIndex.targetLine;
        this.pixiUtils.viewportAddChild(targetLineSprite);
        this.vehicleTargetLineMap.set(uniqueId, targetLineSprite);
      }
    }
  };

  addTaskPath = (start, end, type, uniqueId) => {
    const startCell = this.idCellMap.get(start);
    const endCell = this.idCellMap.get(end);
    if (startCell && endCell) {
      const taskPath = new TaskPath({
        type,
        startPoint: { x: startCell.x, y: startCell.y },
        endPoint: { x: endCell.x, y: endCell.y },
        uniqueId,
      });
      let paths = this.vehiclePathMap.get(uniqueId);
      if (paths && Array.isArray(paths)) {
        paths.push(taskPath);
      } else {
        paths = [];
        paths.push(taskPath);
        this.vehiclePathMap.set(uniqueId, paths);
      }
      this.pixiUtils.viewportAddChild(taskPath);
    }
  };

  // ************************ 料箱任务目标线 ********************** //
  recordToteTaskRealtimeData = (realtime) => {
    this.toteTaskRealtimeData = realtime;
    this.clearToteTaskRealtimePaths();
  };

  clearToteTaskRealtimePaths = () => {
    this.toteTaskRealtimePath.forEach((sprite) => {
      this.pixiUtils.viewportRemoveChild(sprite);
      sprite.destroy(true);
    });
    this.toteTaskRealtimePath = [];
  };

  renderToteTaskRealtimePaths = (vehicleId, vehicleX, vehicleY, data) => {
    // 绘制
    const pathXY = [{ x: vehicleX, y: vehicleY }];
    data.forEach(({ bc, t }) => {
      const toteEntity = this.idTotePodMap.get(bc);
      toteEntity && pathXY.push({ x: toteEntity.x, y: toteEntity.y, action: t });
    });

    const pathLineData = [];
    pathXY.reduce((pre, next) => {
      pathLineData.push({ start: pre, end: next });
      return next;
    });

    // 先清理
    this.clearToteTaskRealtimePaths();

    // 画线条
    pathLineData.forEach(({ start, end }) => {
      const realTimeLineSprite = new SmoothGraphics();
      // 根据end任务类型选择不同颜色
      const color = end.action === 'f' ? 0x34bf49 : 0xfbb034;
      realTimeLineSprite.lineStyle(50, color, 1);
      realTimeLineSprite.moveTo(start.x, start.y);
      realTimeLineSprite.lineTo(end.x, end.y);
      realTimeLineSprite.drawCircle(end.x, end.y, 150);
      realTimeLineSprite.zIndex = zIndex.cellHeat;
      this.pixiUtils.viewportAddChild(realTimeLineSprite);
      this.toteTaskRealtimePath.push(realTimeLineSprite);
    });
  };

  // ************************ 料箱任务实时分布 ********************** //
  renderToteRealtimeState = (type, data) => {
    // 清理
    this.toteTaskRealtimeState.forEach((sprite) => {
      this.pixiUtils.viewportRemoveChild(sprite);
      sprite.destroy(true);
    });
    this.toteTaskRealtimeState = [];

    // 重置料箱的任务分布标识
    this.idTotePodMap.forEach((toteEntity) => {
      toteEntity.highlight(isNull(type) ? 'pod' : 'pod_grey');
    });

    // 渲染
    if (!isNull(type)) {
      if (type === 'USED') {
        Object.keys(data).forEach((toteColumnCode) => {
          const toteEntity = this.idTotePodMap.get(toteColumnCode);
          if (toteEntity) {
            toteEntity.highlight('pod');
            const sprite = new BitText(
              data[toteColumnCode],
              toteEntity.x,
              toteEntity.y,
              0xffffff,
              200,
            );
            sprite.anchor.set(0.5);
            sprite.zIndex = zIndex.cellHeat;
            this.pixiUtils.viewportAddChild(sprite);
            this.toteTaskRealtimeState.push(sprite);
          }
        });
      } else {
        Object.keys(data).forEach((taskType) => {
          Object.keys(data[taskType]).forEach((toteColumnCode) => {
            const toteEntity = this.idTotePodMap.get(toteColumnCode);
            if (toteEntity) {
              // 替换料箱材质
              toteEntity.highlight(`pod_${taskType}`);
              // 添加数字标识
              if (taskType === 'BOTH') {
                const [PUT, FETCH] = data[taskType][toteColumnCode].split('/');
                const putLabelSprite = new BitText(
                  PUT,
                  toteEntity.angle === 0
                    ? toteEntity.x - toteEntity.depth / 4
                    : toteEntity.x + toteEntity.depth / 4,
                  toteEntity.y,
                  0xffffff,
                  200,
                );
                putLabelSprite.anchor.set(0.5);
                putLabelSprite.zIndex = zIndex.cellHeat;
                this.pixiUtils.viewportAddChild(putLabelSprite);
                this.toteTaskRealtimeState.push(putLabelSprite);

                const fetchLabelSprite = new BitText(
                  FETCH,
                  toteEntity.angle === 0
                    ? toteEntity.x + toteEntity.depth / 4
                    : toteEntity.x - toteEntity.depth / 4,
                  toteEntity.y,
                  0xffffff,
                  200,
                );
                fetchLabelSprite.anchor.set(0.5);
                fetchLabelSprite.zIndex = zIndex.cellHeat;
                this.pixiUtils.viewportAddChild(fetchLabelSprite);
                this.toteTaskRealtimeState.push(fetchLabelSprite);
              } else {
                const sprite = new BitText(
                  data[taskType][toteColumnCode],
                  toteEntity.x,
                  toteEntity.y,
                  0xffffff,
                  200,
                );
                sprite.anchor.set(0.5);
                sprite.zIndex = zIndex.cellHeat;
                this.pixiUtils.viewportAddChild(sprite);
                this.toteTaskRealtimeState.push(sprite);
              }
            }
          });
        });
      }
    }
  };

  // ************************ 点位热度 ********************** //
  renderCellHeat = (data) => {
    if (!data) return;
    const { costHeatOpacity } = window.$$state().monitorView;
    // 每次渲染前都是替换，所以第一步需要清除所有点位热度对象
    this.clearCellHeat();
    data.forEach((item) => {
      const { cellId, x, y, heat } = item;
      const textureName = PIXI.utils.TextureCache[`_cellHeat${heat}`];
      const exsitCellHeat = this.cellHeatMap.get(`${cellId}`);
      if (exsitCellHeat) {
        console.log(`本次刷新出现重复数据: Cell: ${cellId}, Cost: ${heat}, X: ${x}, Y:${y}`);
      }
      if (textureName) {
        const cellEntity = this.idCellMap.get(cellId);
        const heatSprite = new PIXI.Sprite(textureName);
        heatSprite.anchor.set(0.5);
        heatSprite.x = x;
        heatSprite.y = y;
        heatSprite.alpha = costHeatOpacity ? 0.5 : 1;
        heatSprite.zIndex = zIndex.cellHeat;
        this.cellHeatMap.set(`${cellId}`, heatSprite);
        cellEntity && this.pixiUtils.viewportAddChild(heatSprite);
      }
    });
  };

  clearCellHeat = () => {
    this.cellHeatMap.forEach((cellHeat) => {
      this.pixiUtils.viewportRemoveChild(cellHeat);
      cellHeat.destroy({ children: true });
    });
    this.cellHeatMap.clear();
  };

  // ************************ 工作站标记 ********************** //
  markWorkStation = (workStationId, isShown, color) => {
    const workStation = this.workStationMap.get(workStationId);
    workStation && workStation.switchMarkerShown(isShown, color);
  };

  // ************************ 小车标记 ********************** //
  markWorkStationVehicle = (vehicles, isShown, color, workStationId) => {
    // 先做清理操作, 只重置正在为该工作站服务的小车
    this.idVehicleMap.forEach((vehicle) => {
      if (vehicle.employer === workStationId) {
        vehicle.switchMarkerShown(false, null, null);
      }
    });
    const workStation = this.workStationMap.get(workStationId);
    const renderColor = color ?? workStation.employeeColor; // 边缘Case: 请求发送完成到请求返回中间时间工作站被取消显示小车
    if (isShown && renderColor) {
      vehicles.forEach((vehicleId) => {
        const vehicle = this.idVehicleMap.get(vehicleId);
        if (vehicle && workStation) {
          // 这里 color有可能是null, 是因为该方法是轮询机制调用的
          vehicle.switchMarkerShown(true, workStationId, renderColor);
        }
      });
    }
  };

  // ************************ 通用站点标记 start ********************** //
  markCommonPoint = (commonPointId, isShown, color) => {
    const commonPoint = this.commonFunctionMap.get(commonPointId);
    commonPoint && commonPoint.switchCommonMarkerShown(isShown, color);
  };

  // ************************ 通用站点标记 小车标记 ********************** //
  markCommonPointVehicle = (vehicles, isShown, color, commonPointId) => {
    // 先做清理操作, 只重置正在为该工作站服务的小车
    this.idVehicleMap.forEach((vehicle) => {
      if (vehicle.employer === commonPointId) {
        vehicle.switchMarkerShown(false, null, null);
      }
    });

    const commonPoint = this.commonFunctionMap.get(commonPointId);
    const renderColor = color ?? commonPoint.employeeColor; // 边缘Case: 请求发送完成到请求返回中间时间工作站被取消显示小车
    if (isShown && renderColor) {
      vehicles.forEach((vehicleId) => {
        const vehicle = this.idVehicleMap.get(vehicleId);
        if (vehicle && commonPoint) {
          // 这里 color有可能是null, 是因为该方法是轮询机制调用的
          vehicle.switchMarkerShown(true, commonPointId, renderColor);
        }
      });
    }
  };

  // ************************ 充电桩状态更新 ********************** //
  updateChargerState = ({ n: name, s: state }) => {
    const chargerEntity = this.chargerMap.get(name);
    chargerEntity && chargerEntity.updateChargerState(state);
  };

  // ************************ 充电桩chargeId更新 ********************** //
  updateChargerHardware = (name, chargerId,id) => {
    const chargerEntity = this.chargerMap.get(name);
    chargerEntity && chargerEntity.updateHardwareId(chargerId,id);
  };

  // ************************ 渲染 清除 紧急停止区域 ********************** //
  renderEmergencyStopArea = (allData) => {
    const { globalActive, logicActive, currentLogicArea } = window.$$state().monitor;
    const logicEStopData = allData.filter((item) => item.logicId === currentLogicArea);
    const showEmergency = this.states.emergencyAreaShown;

    // 根据store数据初步判定visible
    let sectionEStopVisibleFlag = false;
    let logicEStopVisibleFlag = false;
    if (globalActive) {
      sectionEStopVisibleFlag = true;
    } else {
      logicEStopVisibleFlag = logicActive.includes(currentLogicArea);
    }

    logicEStopData.forEach((currentData) => {
      if (!['Section', 'Logic', 'Area'].includes(currentData.estopType)) {
        return;
      }
      if (currentData.estopType !== 'Section' && currentData.logicId !== currentLogicArea) {
        return;
      }

      const eStopData = {
        ...currentData,
        worldBounds: this.pixiUtils.viewport.getLocalBounds(),
        select: this.select,
      };

      if (['Section', 'Logic'].includes(currentData.estopType)) {
        let updateSectionFlag = currentData.estopType === 'Section';
        let updateLogicFlag = currentData.estopType === 'Logic';

        let entity = this.emergencyAreaMap.get(`special${currentData.estopType}`);
        if (isNull(entity)) {
          entity = new EmergencyStop(eStopData);
          this.pixiUtils.viewportAddChild(entity);
          this.emergencyAreaMap.set(`special${currentData.estopType}`, entity);
        }

        if (currentData.estopType === 'Section') {
          const sectionMaskSprite = this.emergencyAreaMap.get('specialSection');
          if (sectionMaskSprite) {
            // TODO: 使用 visible 控制无效
            sectionMaskSprite.renderable = showEmergency && sectionEStopVisibleFlag;
            if (updateSectionFlag) {
              sectionMaskSprite.sectionEStop.tint = currentData.isSafe
                ? EStopStateColor.active.safe.fillColor
                : EStopStateColor.active.unSafe.fillColor;
            }
          }
        }

        if (currentData.estopType === 'Logic') {
          const logicMaskSprite = this.emergencyAreaMap.get('specialLogic');
          if (logicMaskSprite) {
            // TODO: 使用 visible 控制无效
            logicMaskSprite.renderable = showEmergency && logicEStopVisibleFlag;
            if (updateLogicFlag) {
              logicMaskSprite.logicEStop.tint = currentData.isSafe
                ? EStopStateColor.active.safe.fillColor
                : EStopStateColor.active.unSafe.fillColor;
            }
          }
        }
      } else {
        const stopEntity = this.emergencyAreaMap.get(`${currentData.code}`);
        if (stopEntity) {
          stopEntity.update(eStopData);
        } else {
          const eStop = new EmergencyStop(eStopData);
          this.pixiUtils.viewportAddChild(eStop);
          this.emergencyAreaMap.set(`${currentData.code}`, eStop);
        }
      }
    });
    this.refresh();
  };

  // 清除所有的紧急停止区域
  clearEmergencyStopArea = () => {
    this.emergencyAreaMap.forEach((estop) => {
      this.pixiUtils.viewportRemoveChild(estop);
      estop.destroy({ children: true });
    });
    this.emergencyAreaMap.clear();
    this.refresh();
  };

  // 删除--清除单个紧急停止区
  removeCurrentEmergencyFunction = (code) => {
    const estop = this.emergencyAreaMap.get(`${code}`);
    if (estop) {
      this.emergencyAreaMap.delete(`${code}`);
      this.pixiUtils.viewportRemoveChild(estop);
      estop.destroy({ children: true });
      this.refresh();
    }
  };

  render() {
    // FBI WARNING: 这里一定要给canvas父容器一个"font-size:0", 否则会被撑开5px左右
    return <div id="monitorPixi" style={{ height: '100%', fontSize: 0 }} />;
  }
}

export default MonitorMapView;
