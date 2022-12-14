import React, { memo, useCallback, useEffect } from 'react';
import { debounce, throttle } from 'lodash';
import { connect } from '@/utils/RmsDva';
import EventManager from '@/utils/EventManager';
import { getRandomString, isNull } from '@/utils/util';
import { convertLandCoordinate2Navi, transformXYByParams } from '@/utils/mapTransformer';
import { MonitorMapSizeKey, ZoneMarkerType } from '@/config/consts';
import MonitorMapView from './MonitorMapView';
import MonitorMask from '@/packages/Scene/MapMonitor/components/MonitorMask';
import MonitorFooter from '@/packages/Scene/MapMonitor/components/MonitorFooter';
import { FooterHeight, HeaderHeight, RightToolBarWidth } from '../MonitorConts';
import commonStyles from '@/common.module.less';
import { CoordinateType } from '@/config/config';

const CLAMP_VALUE = 500;
const MonitorMapContainer = (props) => {
  const { dispatch, mapContext, currentLogicArea, currentRouteMap, preRouteMap } = props;
  const {
    mapRatio,
    currentMap,
    monitorLoad,
    mapMinRatio,
    shownNavigationType,
    shownCellCoordinateType,
  } = props;

  useEffect(() => {
    const functionId = getRandomString(8);

    function resize(rect) {
      const { width, height } = rect;
      const { mapContext: _mapContext } = window.$$state().monitor;
      _mapContext.resize(width - RightToolBarWidth, height - HeaderHeight - FooterHeight);
    }

    EventManager.subscribe('resize', resize, functionId);
    return () => {
      EventManager.unsubscribe('resize', functionId);
    };
  }, []);

  useEffect(() => {
    if (isNull(mapContext)) return;
    const { viewport } = mapContext.pixiUtils;
    viewport.setZoom(mapRatio, true);
  }, [mapRatio]);

  useEffect(() => {
    if (isNull(mapContext)) return;
    const { viewport } = mapContext.pixiUtils;
    // 很重要: 一定要先取消旧的clamp，不然新的会无法生效
    viewport.clampZoom(null);

    // 清空相关数据
    mapContext.clearMapStage();
    mapContext.clearMonitorLoad();
    mapContext.refresh();

    if (currentMap && shownCellCoordinateType && shownNavigationType.length > 0) {
      // 先记录当前点位使用的坐标类型(物理还是导航)
      mapContext.cellCoordinateType = shownCellCoordinateType;
      mapContext.currentLogicArea = currentLogicArea;
      renderMap();
      renderLogicArea();
      renderRouteMap();
      renderMonitorLoad();
      mapContext.centerView();
      doClampZoom();

      // 监听地图缩放比例
      viewport.off('zoomed');
      viewport.on('zoomed', zoomedCallback());

      // 添加事件处理地图跑出Screen
      viewport.off('moved');
      viewport.on('moved', avoidOffScreen());
    }
  }, [currentMap, currentLogicArea, mapContext, shownCellCoordinateType, shownNavigationType]);

  useEffect(() => {
    if (currentMap && !isNull(mapContext)) {
      renderRouteMap();
    }
  }, [currentRouteMap, mapContext]);

  function avoidOffScreen() {
    return throttle(function() {
      const { x, y, width, height } = JSON.parse(window.sessionStorage.getItem(MonitorMapSizeKey));
      const topLimit = y + (height - CLAMP_VALUE);
      if (this.top >= topLimit) {
        this.top = topLimit;
      }

      const bottomLimit = y + CLAMP_VALUE;
      if (this.bottom <= bottomLimit) {
        this.bottom = bottomLimit;
      }

      const leftLimit = x + (width - CLAMP_VALUE);
      if (this.left >= leftLimit) {
        this.left = leftLimit;
      }

      const rightLimit = x + CLAMP_VALUE;
      if (this.right <= rightLimit) {
        this.right = rightLimit;
      }
    }, 200);
  }

  function zoomedCallback() {
    return debounce(function() {
      dispatch({ type: 'editor/saveMapRatio', payload: this.scale.x });
    }, 100);
  }

  function renderMap() {
    const cellsToRender = Object.values(currentMap.cellMap)
      .filter((item) => shownNavigationType.includes(item.navigationType))
      .map((item) => {
        if (shownCellCoordinateType === CoordinateType.NAVI) {
          // 除了牧星点，别的厂商导入的地图的导航坐标都是直接从该厂商的导航点坐标转换而来，没有经过任何旋转等(假如有旋转等参数，而且必须不能转换，因为这个数据后台需要用)
          const { x, y } = transformXYByParams({ x: item.nx, y: item.ny }, item.navigationType);
          return {
            ...item,
            x,
            y,
            coordinateType: shownCellCoordinateType,
            coordinate: { x: item.x, y: item.y, nx: item.nx, ny: item.ny },
          };
        } else {
          // TIPS: 地图展示永远是展示导航位置，即使是物理也要转成导航
          return {
            ...item,
            ...convertLandCoordinate2Navi(item),
            coordinateType: shownCellCoordinateType,
            coordinate: { x: item.x, y: item.y, nx: item.nx, ny: item.ny },
          };
        }
      });
    mapContext.renderCells(cellsToRender);
  }

  const doClampZoom = useCallback(
    function () {
      const { viewport } = mapContext.pixiUtils;
      const minMapRatio = mapContext.clampZoom(viewport, MonitorMapSizeKey);
      dispatch({ type: 'monitor/saveMapMinRatio', payload: minMapRatio });
    },
    [mapContext],
  );

  function renderLogicArea() {
    const currentLogicAreaData = currentMap?.logicAreaList?.[currentLogicArea];
    if (!currentLogicAreaData) return;

    const {
      restCells,
      taskCellIds,
      storeCellIds,
      rotateCellIds,
      safeAreaCellIds,
      intersectionList,
    } = currentLogicAreaData;
    // 停车点
    if (Array.isArray(restCells)) {
      restCells.forEach((item) => {
        mapContext.renderRestCells(item);
      });
    }
    // 存储区
    if (Array.isArray(storeCellIds)) {
      mapContext.renderCellsType(storeCellIds, 'store_cell');
    }
    // 接任务点
    if (Array.isArray(taskCellIds)) {
      mapContext.renderCellsType(taskCellIds, 'get_task');
    }
    // 安全区
    if (Array.isArray(safeAreaCellIds)) {
      mapContext.renderCellsType(safeAreaCellIds, 'safe_cell');
    }
    // 旋转点
    if (Array.isArray(rotateCellIds)) {
      mapContext.renderCellsType(rotateCellIds, 'round');
    }
    // 交汇点
    if (Array.isArray(intersectionList)) {
      mapContext.renderIntersection(intersectionList);
    }

    const { chargerList, commonList } = currentLogicAreaData;
    // 充电桩
    if (Array.isArray(chargerList) && chargerList.length > 0) {
      mapContext.renderChargers(chargerList, () => {
      }, currentMap.cellMap);
    }
    // 通用站点
    if (Array.isArray(commonList)) {
      mapContext.renderStation(commonList, () => {
      }, currentMap.cellMap);
    }

    const { dumpStations, zoneMarker, labels, emergencyStopFixedList } = currentLogicAreaData;
    // 抛货点
    if (Array.isArray(dumpStations)) {
      mapContext.renderDumpFunction(dumpStations);
    }
    // 背景(线框&图片)
    if (Array.isArray(zoneMarker)) {
      zoneMarker.forEach((zoneMarkerItem) => {
        // 线框
        if (zoneMarkerItem.type === ZoneMarkerType.RECT) {
          const { code, x, y, width, height, color, text } = zoneMarkerItem;
          mapContext.drawRectArea({ code, x, y, width, height, color, text }, false);
        }

        if (zoneMarkerItem.type === ZoneMarkerType.CIRCLE) {
          const { code, x, y, radius, color, text } = zoneMarkerItem;
          mapContext.drawCircleArea({ code, x, y, radius, color, text }, false);
        }

        if (zoneMarkerItem.type === ZoneMarkerType.IMG) {
          const { code, x, y, width, height, data } = zoneMarkerItem;
          mapContext.renderImage({ code, x, y, width, height, data }, false);
        }
      });
    }
    // 文字标记
    if (Array.isArray(labels)) {
      labels.forEach((item) => {
        mapContext.renderLabel(item, false);
      });
    }
    // 紧急停止区
    if (Array.isArray(emergencyStopFixedList)) {
      mapContext.renderEmergencyStopArea(emergencyStopFixedList);
    }
    mapContext.refresh();
  }

  function renderRouteMap() {
    const currentLogicAreaData = currentMap?.logicAreaList?.[currentLogicArea];
    if (!currentLogicAreaData) return;

    // 先清空路线区相关标记
    if (preRouteMap && preRouteMap.code !== currentRouteMap) {
      const { blockCellIds, followCellIds, waitCellIds, nonStopCellIds, tunnels } = preRouteMap;
      // 不可走点
      if (Array.isArray(blockCellIds)) {
        mapContext.renderCellsType(blockCellIds, 'block_cell', 'remove');
      }
      // 跟车点
      if (Array.isArray(followCellIds)) {
        mapContext.renderCellsType(followCellIds, 'follow_cell', 'remove');
      }
      // 等待点
      if (Array.isArray(waitCellIds)) {
        mapContext.renderCellsType(waitCellIds, 'wait_cell', 'remove');
      }
      // 不可逗留点
      if (Array.isArray(nonStopCellIds)) {
        mapContext.renderNonStopCells(nonStopCellIds, 'remove');
      }
      // 通道
      if (Array.isArray(tunnels)) {
        mapContext.renderTunnel(tunnels, false, 'remove');
      }
      // 清空优先级线条
      mapContext.destroyAllLines();
    }

    // 新增当前路线区相关标记
    const currentRouteMapData = currentLogicAreaData.routeMap?.[currentRouteMap];
    if (!currentRouteMapData) return;
    const { blockCellIds, followCellIds, waitCellIds } = currentRouteMapData;
    // 不可走点
    if (Array.isArray(blockCellIds)) {
      mapContext.renderCellsType(blockCellIds, 'block_cell');
    }
    // 跟车点
    if (Array.isArray(followCellIds)) {
      mapContext.renderCellsType(followCellIds, 'follow_cell');
    }
    // 等待点
    if (Array.isArray(waitCellIds)) {
      mapContext.renderCellsType(waitCellIds, 'wait_cell');
    }

    const { nonStopCellIds, tunnels, relations } = currentRouteMapData;
    // 不可逗留点
    if (Array.isArray(nonStopCellIds)) {
      mapContext.renderNonStopCells(nonStopCellIds);
    }
    // 通道
    if (Array.isArray(tunnels)) {
      mapContext.renderTunnel(tunnels);
    }
    // 渲染线条
    mapContext.renderCostLines(relations, shownCellCoordinateType, currentMap.transform);
    mapContext.refresh();
  }

  // 渲染监控里的小车、货架等
  function renderMonitorLoad() {
    if (!isNull(monitorLoad)) {
      const { latentVehicle, loadList } = monitorLoad;
      // mapContext.renderLatentVehicle(latentVehicle);

      // 分类展示载具
      if (Array.isArray(loadList)) {
        const currentLatentLoad = loadList?.filter(
          ({ lt }) => lt === 'LOAD_TYPE_LatentJackingLoadType',
        );
        mapContext.renderLatentPod(currentLatentLoad);

        // const currentToteLoad = loadList?.filter(({ lt }) => lt === 'tote');
        // mapContext.renderTotePod(currentToteLoad);
      }

      const { toteVehicle, sorterVehicle, toteRack } = monitorLoad;
      // mapContext.renderToteVehicle(toteVehicle);
      // mapContext.renderSorterVehicle(sorterVehicle);
      // mapContext.renderTotePod(toteRack);

      const { temporaryBlock, chargerList, emergencyStopList } = monitorLoad;
      // 临时不可走点
      mapContext.renderTemporaryLock(temporaryBlock ?? []);

      // 渲染充电桩已绑定chargerId标记(这里只是处理已经绑定chargerId的情况)
      if (Array.isArray(chargerList)) {
        chargerList.forEach((item) => {
          mapContext.updateChargerHardware(item.name, item.chargerId, item.id);
          mapContext.updateChargerState({ n: item.name, s: item.chargerStatus });
        });
      }

      // 急停区
      // mapContext.renderEmergencyStopArea(emergencyStopList);
      // dispatch({ type: 'monitor/saveEmergencyStopList', payload: emergencyStopList });
    }
  }

  function onSliderChange(value) {
    dispatch({ type: 'monitor/saveMapRatio', payload: value });
  }

  return (
    <div id={'monitorPixiContainer'} className={commonStyles.monitorBodyMiddle}>
      <MonitorMapView />
      <MonitorFooter mapRatio={mapRatio} onSliderChange={onSliderChange} />
      <MonitorMask />
    </div>
  );
};
export default connect(({ monitor, monitorView }) => {
  const {
    currentMap,
    currentLogicArea,
    currentRouteMap,
    preRouteMap,
    mapContext,
    mapRatio,
    mapMinRatio,
    monitorLoad,
  } = monitor;
  return {
    currentMap,
    currentLogicArea,
    currentRouteMap,
    preRouteMap,
    mapContext,
    mapRatio,
    mapMinRatio,
    monitorLoad,
    shownNavigationType: monitorView.shownNavigationType,
    shownCellCoordinateType: monitorView.shownCellCoordinateType,
  };
})(memo(MonitorMapContainer));
