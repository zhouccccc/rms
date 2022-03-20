import React, { memo, useEffect, useRef } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import classnames from 'classnames';
import { connect } from '@/utils/RmsDva';
import { isNull, dealResponse, isStrictNull } from '@/utils/util';
import { setMonitorSocketCallback } from '@/utils/mapUtil';
import MonitorMapContainer from './components/MonitorMapContainer';
import MonitorBodyRight from './components/MonitorBodyRight';
import MonitorHeader from './components/MonitorHeader';
import { fetchStationRealTimeRate } from '@/services/monitor';
import MonitorModals from './Modal';
import { HeaderHeight, MonitorOperationType } from './enums';
import styles from './monitorLayout.module.less';
import commonStyles from '@/common.module.less';

const MapMonitor = (props) => {
  const { dispatch, socketClient, currentMap, mapContext, mapRendered } = props;
  const keyDown = useRef(false);

  useEffect(() => {
    socketClient.applyMonitorRegistration();
    dispatch({ type: 'monitor/initMonitorMap' });

    return () => {
      socketClient.cancelMonitorRegistration();
      dispatch({
        type: 'saveState',
        payload: { mapContext: false },
      });
    };
  }, []);

  useEffect(() => {
    if (!isNull(mapContext)) {
      // 初始化MQ回调
      setMonitorSocketCallback(socketClient, mapContext, dispatch);
      fetchStationRealTimeRate().then((response) => {
        if (!dealResponse(response)) {
          // 后端类型返回 不为空 就存起来 return 目前理论上只会有一个类型有值
          let currentData = Object.values(response).filter((item) => !isStrictNull(item));
          currentData = currentData[0];
          mapContext.renderCommonStationRate(currentData);
          dispatch({ type: 'monitor/saveStationRate', payload: currentData });
        }
      });

      // ****************************** S键 ****************************** //
      // 按下S键
      function onXKeyDown(event) {
        // 不能干扰输入框
        if (event.target instanceof HTMLInputElement) return;
        if (event.keyCode === 83 && !keyDown.current) {
          keyDown.current = true;
          if (mapContext) {
            mapContext.pixiUtils.viewport.drag({ pressDrag: false });
            dispatch({ type: 'monitor/saveOperationType', payload: MonitorOperationType.Choose });
          }
        }
      }
      // 抬起S键
      function onXKeyUp(event) {
        if (event.target instanceof HTMLInputElement) return;
        if (event.keyCode === 83) {
          keyDown.current = false;
          if (props.mapContext) {
            props.mapContext.pixiUtils.viewport.drag({ pressDrag: true });
            dispatch({ type: 'monitor/saveOperationType', payload: MonitorOperationType.Drag });
          }
        }
      }

      if (window.currentPlatForm.isPc) {
        document.addEventListener('keydown', onXKeyDown);
        document.addEventListener('keyup', onXKeyUp);
      }

      return () => {
        if (window.currentPlatForm.isPc) {
          document.removeEventListener('keydown', onXKeyDown);
          document.removeEventListener('keyup', onXKeyUp);
        }
      };
    }
  }, [mapContext]);

  useEffect(() => {
    if (mapRendered) {
      renderMonitorLoad();
    }
  }, [mapRendered]);

  // 渲染监控里的小车、货架等
  async function renderMonitorLoad() {
    const resource = await dispatch({ type: 'monitor/initMonitorLoad' });
    if (!isNull(resource)) {
      const { latentAgv, latentPod, toteAgv, toteRack, sorterAgv } = resource;
      mapContext.renderLatentAGV(latentAgv);
      mapContext.renderLatentPod(latentPod);
      mapContext.renderToteAGV(toteAgv);
      mapContext.renderTotePod(toteRack);
      mapContext.renderSorterAGV(sorterAgv);

      const { temporaryBlock, emergencyStopList, chargerList } = resource;
      // 临时不可走点
      mapContext.renderTemporaryLock(temporaryBlock);

      // 急停区
      mapContext.renderEmergencyStopArea(emergencyStopList);
      dispatch({ type: 'monitor/saveEmergencyStopList', payload: emergencyStopList });

      // 渲染充电桩已绑定HardwareID标记(这里只是处理已经绑定HardwareId的情况)
      if (Array.isArray(chargerList)) {
        chargerList.forEach((item) => {
          mapContext.updateChargerHardware(item.name, item.hardwareId);
          mapContext.updateChargerState({ n: item.name, s: item.status });
        });
      }
    }
  }

  return (
    <div id={'mapMonitorPage'} className={commonStyles.commonPageStyleNoPadding}>
      <div
        style={{ flex: `0 0 ${HeaderHeight}px` }}
        className={classnames(commonStyles.mapLayoutHeader, styles.monitorHeader)}
      >
        {currentMap === undefined ? (
          <LoadingOutlined style={{ fontSize: 20, color: '#fff' }} spin />
        ) : (
          <MonitorHeader />
        )}
      </div>
      <div className={commonStyles.mapLayoutBody}>
        <MonitorMapContainer />
        <MonitorBodyRight />
      </div>
      <MonitorModals />
    </div>
  );
};
export default connect(({ monitor, global }) => ({
  socketClient: global.socketClient,
  currentMap: monitor.currentMap,
  mapContext: monitor.mapContext,
  mapRendered: monitor.mapRendered,
}))(memo(MapMonitor));