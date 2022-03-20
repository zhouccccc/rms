import React, { memo, useEffect } from 'react';
import { throttle } from 'lodash';
import { connect } from '@/utils/RmsDva';
import { isNull } from '@/utils/util';
import MonitorMapView from './MonitorMapView';
import { HeaderHeight, RightToolBarWidth } from '../enums';
import { renderChargerList, renderElevatorList, renderWorkStationList } from '@/utils/mapUtil';
import { ZoneMarkerType } from '@/config/consts';
import MapRatioSlider from '@/packages/XIHE/components/MapRatioSlider';
import commonStyles from '@/common.module.less';
import OperationType from '@/packages/Scene/MapMonitor/components/OperationType';
import MonitorMask from '@/packages/Scene/MapMonitor/components/MonitorMask';

const CLAMP_VALUE = 500;
const MonitorMapContainer = (props) => {
  const { dispatch, currentLogicArea, currentRouteMap, preRouteMap } = props;
  const { mapContext, mapRatio, mapMinRatio, currentMap } = props;

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      throttle(() => {
        const htmlDOM = document.getElementById('mapMonitorPage');
        if (htmlDOM && mapContext) {
          const { width, height } = htmlDOM.getBoundingClientRect();
          mapContext.resize(width - RightToolBarWidth, height - HeaderHeight);
        }
      }, 500),
    );
    resizeObserver.observe(document.getElementById('mapMonitorPage'));

    return () => {
      resizeObserver.disconnect();
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
    mapContext.refresh();

    if (currentMap) {
      renderMap();
      renderLogicArea();
      renderRouteMap();
      dispatch({ type: 'monitor/saveMapRendered', payload: true });

      const minMapRatio = mapContext.centerView('MONITOR_MAP');
      dispatch({ type: 'monitor/saveMapMinRatio', payload: minMapRatio });

      // 监听地图缩放比例
      viewport.off('zoomed-end');
      viewport.on('zoomed-end', function () {
        dispatch({ type: 'monitor/saveMapRatio', payload: this.scale.x });
      });

      // 添加事件处理地图跑出Screen
      viewport.off('moved');
      viewport.on(
        'moved',
        throttle(function () {
          const { x, y, width, height } = JSON.parse(window.sessionStorage.getItem('MONITOR_MAP'));
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
        }, 200),
      );
    }
  }, [currentMap, currentLogicArea, mapContext]);

  useEffect(() => {
    if (currentMap && !isNull(mapContext)) {
      renderRouteMap();
    }
  }, [currentRouteMap, mapContext]);

  function renderMap() {
    dispatch({ type: 'editor/saveState', payload: { selectCells: [], selectLines: [] } });
    // 渲染点位(不渲染电梯内部点)
    const elevatorInnerCells = [];
    if (Array.isArray(currentMap.elevatorList)) {
      currentMap.elevatorList.forEach((item) => {
        elevatorInnerCells.push(...item.innerCellId);
      });
    }

    const cellsToRender = [];
    const { rangeStart, rangeEnd } = currentMap?.logicAreaList?.[currentLogicArea];
    for (let index = rangeStart; index <= rangeEnd; index++) {
      const cellData = currentMap.cellMap[index];
      if (cellData && !elevatorInnerCells.includes(cellData.id)) {
        cellsToRender.push(cellData);
      }
    }
    mapContext.renderCells(cellsToRender);
    dispatch({ type: 'monitor/saveCurrentCells', payload: cellsToRender });

    // 渲染电梯
    if (Array.isArray(currentMap.elevatorList)) {
      const elevatorData = renderElevatorList(
        currentMap.elevatorList,
        cellsToRender,
        currentLogicArea,
      );
      const logicElevator = elevatorData?.filter((item) => item.logicAreaId === currentLogicArea);
      mapContext.renderElevator(logicElevator || []);
    }
  }

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
    // 休息区
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

    const { workstationList, chargerList, commonList } = currentLogicAreaData;
    // 充电桩
    if (Array.isArray(chargerList)) {
      const chargerListData = renderChargerList(chargerList, currentMap.cellMap);
      mapContext.renderChargers(chargerListData);
    }
    // 工作站
    if (Array.isArray(workstationList)) {
      const workStationListData = renderWorkStationList(workstationList, currentMap.cellMap);
      workStationListData.forEach((workStation) => {
        mapContext.addWorkStation(workStation, null);
      });
    }
    // 通用站点
    if (Array.isArray(commonList)) {
      mapContext.renderCommonFunction(commonList);
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

      // TODO: 需要额外处理Monitor创建的急停区
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
    mapContext.renderCostLines(relations, relations, false);
    mapContext.refresh();
  }

  function onSliderChange(value) {
    dispatch({ type: 'monitor/saveMapRatio', payload: value });
  }

  return (
    <div
      id={'monitorPixiContainer'}
      className={commonStyles.monitorBodyMiddle}
      style={{ position: 'relative' }}
    >
      <MonitorMapView />
      <MonitorMask />

      {/* 平板不用显示滑条 */}
      {!window.currentPlatForm.isTablet && (
        <>
          <OperationType />
          <MapRatioSlider mapRatio={mapRatio} mapMinRatio={mapMinRatio} onChange={onSliderChange} />
        </>
      )}
    </div>
  );
};
export default connect(({ monitor }) => {
  const {
    currentMap,
    currentLogicArea,
    currentRouteMap,
    preRouteMap,
    mapContext,
    mapRatio,
    mapMinRatio,
  } = monitor;
  return {
    currentMap,
    currentLogicArea,
    currentRouteMap,
    preRouteMap,
    mapContext,
    mapRatio,
    mapMinRatio,
  };
})(memo(MonitorMapContainer));