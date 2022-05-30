import React, { memo, useEffect, useState } from 'react';
import { message, Popconfirm } from 'antd';
import { connect } from '@/utils/RmsDva';
import { withRouter } from 'react-router-dom';
import FormattedMessage from '@/components/FormattedMessage';
import {
  fetchAgvInfo,
  fetchAgvRunningInfo,
  fetchMaintain,
  fetchManualMode,
  getAlertCentersByTaskIdOrAgvId,
} from '@/services/api';
import { agvRemoteControl, agvToRest, agvTryToCharge } from '@/services/monitor';
import { dealResponse, formatMessage, isStrictNull, renderAgvState, renderBattery } from '@/utils/util';
import { AppCode } from '@/config/config';
import styles from '../../monitorLayout.module.less';
import style from './index.module.less';
import { find } from 'lodash';

const checkedColor = '#ff8400';
const AGVCategory = {
  LatentLifting: 'latent',
  Tote: 'tote',
  Sorter: 'sorter',
};

const AGVElementProp = (props) => {
  const { data, type, dispatch, history, selectAgv, showRoute, allAGVs } = props;
  const [agvInfo, setAgvInfo] = useState({});
  const [vehicleId, setVehicleId] = useState(null);
  const [mainTain, setMainTain] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [pathChecked, setPathChecked] = useState(false);
  const [agvAlarmList, setAgvAlarmList] = useState([]);

  useEffect(() => {
    async function init() {
      setVehicleId(JSON.parse(data.id));
      if (selectAgv.includes(data.uniqueId) && showRoute) {
        setPathChecked(true);
      } else {
        setPathChecked(false);
      }
      // 1.获取小车属性
      await getAgvInfo();
    }
    init();
  }, [data]);

  async function getAgvInfo() {
    const [response, alertResponse] = await Promise.all([
      fetchAgvInfo(data.id, 'sorter'),
      getAlertCentersByTaskIdOrAgvId({ vehicleId: JSON.parse(data.id) }),
    ]);

    const filterAgvInfo = find(
      allAGVs,
      (item) => item.vehicleId === data.id && item?.agv?.id === data.uniqueId,
    );
    if (!dealResponse(response)) {
      const { agv = {}, agvInfo = {}, agvWorkStatusDTO = {} } = filterAgvInfo;

      setAgvInfo({ ...agvInfo, ...agvWorkStatusDTO });
      setMainTain(agv?.maintain); // 维护
      setManualMode(agv?.manualMode); // 是否手动
    }

    if (alertResponse && !dealResponse(alertResponse)) {
      const newTaskAlarm = [];
      alertResponse.map(({ alertItemList }) => {
        if (Array.isArray(alertItemList)) {
          alertItemList.map((item) => {
            newTaskAlarm.push({ ...item });
          });
        }
      });
      setAgvAlarmList(newTaskAlarm);
      dispatch({ type: 'monitorView/saveAgvAlarmList', payload: newTaskAlarm });
    }
  }

  function goToAgvDetail() {
    const route = `/ResourceManage/Agv/AgvRealTime`;
    history.push({ pathname: route, search: `uniqueId=${data.uniqueId}` });
  }

  function checkTaskDetail(taskId, agvType) {
    dispatch({
      type: 'task/fetchTaskDetailByTaskId',
      payload: { taskId, agvType },
    });
  }

  function showAgvalert() {
    dispatch({
      type: 'monitor/saveCategoryModal',
      payload: 'AgvAlert',
    });
  }

  // 运行时
  async function showRunInfo() {
    const response = await fetchAgvRunningInfo({ vehicleId: vehicleId });
    if (!dealResponse(response)) {
      const newInfoList = [];
      Object.values(response).forEach(({ agvRunningStatus, agvInfoTypeI18n, detailFormat }) => {
        newInfoList.push({ type: agvRunningStatus, title: agvInfoTypeI18n, message: detailFormat });
      });
      dispatch({ type: 'monitor/saveAgvRunningInfoList', payload: 'newInfoList' });
    }
    dispatch({ type: 'monitor/saveCategoryModal', payload: 'AgvRunInfo' });
  }

  function goCharge() {
    agvTryToCharge({ vehicleId: vehicleId, agvType: data.agvType }).then((response) => {
      if (dealResponse(response)) {
        message.error(formatMessage({ id: 'monitor.controller.goCharge.fail' }));
      } else {
        message.success(formatMessage({ id: 'monitor.controller.goCharge.success' }));
      }
    });
  }

  function toRest() {
    agvToRest({ vehicleId: vehicleId, agvType: data.agvType }).then((response) => {
      if (dealResponse(response)) {
        message.error(formatMessage({ id: 'monitor.controller.toRest.fail' }));
      } else {
        message.success(formatMessage({ id: 'monitor.controller.toRest.success' }));
      }
    });
  }

  // 发送小车Hex命令
  async function sendAgvHexCommand(hexCommand, actionContent) {
    const params = {
      vehicleId,
      rawCommandHex: hexCommand,
    };
    const response = await agvRemoteControl(type, params);
    if (dealResponse(response)) {
      message.error(
        formatMessage(
          { id: 'monitor.controller.AGV.tip.customCommandSendFail' },
          { actionContent },
        ),
      );
    } else {
      message.success(
        formatMessage(
          { id: 'monitor.controller.AGV.tip.customCommandSendSuccess' },
          { actionContent },
        ),
      );
    }
  }

  // 维护小车
  async function mainTainAgv() {
    const params = {
      sectionId: window.localStorage.getItem('sectionId'),
      vehicleId,
      disabled: !mainTain,
    };
    const response = await fetchMaintain(type, params);
    if (dealResponse(response)) {
      message.error(formatMessage({ id: 'app.message.operateFailed' }));
    } else {
      message.success(formatMessage({ id: 'app.message.operateSuccess' }));
      setMainTain(!mainTain);
    }
  }

  // 切换小车手动模式
  async function switchManualMode() {
    const params = {
      sectionId: window.localStorage.getItem('sectionId'),
      vehicleId,
      manualMode: !manualMode,
    };
    const response = await fetchManualMode(type, params);
    if (dealResponse(response)) {
      message.error(message.error(formatMessage({ id: 'app.message.operateFailed' })));
    } else {
      message.success(formatMessage({ id: 'app.message.operateSuccess' }));
      setManualMode(!manualMode);
    }
  }

  function agvPthchanged() {
    let allSelectedAGVUniqueIds = [...selectAgv];
    showRoutePollingCallback(false);
    if (pathChecked) {
      allSelectedAGVUniqueIds.splice(allSelectedAGVUniqueIds.indexOf(`${data.uniqueId}`), 1);
      setPathChecked(false);
    } else {
      allSelectedAGVUniqueIds.push(`${data.uniqueId}`);
      setPathChecked(true);
      dispatch({
        type: 'monitorView/saveRouteView',
        payload: {
          showRoute: true,
        },
      });
    }
    dispatch({
      type: 'monitorView/saveViewState',
      payload: { selectAgv: allSelectedAGVUniqueIds },
    });

    if (allSelectedAGVUniqueIds?.length > 0) {
      showRoutePollingCallback(true, allSelectedAGVUniqueIds); // 开启轮询
    }
  }

  // 触发显示路径的轮询
  function showRoutePollingCallback(flag, ids) {
    dispatch({
      type: 'monitorView/routePolling',
      payload: { flag, ids },
    });
  }

  return (
    <>
      <div>
        <FormattedMessage id={'app.common.prop'} />
      </div>
      <div>
        {/* 小车详情 */}
        <div>
          {/* 小车*/}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 45, height: 'auto' }}
                src={require(`../../category/${AGVCategory[type]}_category.svg`).default}
              />
              <span>
                <FormattedMessage id={'app.agv'} />
              </span>
            </div>
            <div className={style.rightSideline} onClick={goToAgvDetail}>
              {agvInfo?.vehicleId}
            </div>
          </div>

          {/* 电量 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 35, height: 35 }}
                src={require('@/packages/Scene/icons/electricity.png').default}
              />
              <span>
                <FormattedMessage id={'app.agv.electricity'} />
              </span>
            </div>
            <div>{agvInfo?.battery && renderBattery(agvInfo?.battery)}</div>
          </div>

          {/* 小车状态 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/state.png').default}
              />
              <span>
                <FormattedMessage id={'app.common.status'} />
              </span>
            </div>
            <div>{renderAgvState(agvInfo?.agvStatus)}</div>
          </div>

          {/* 潜伏货架 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/pod.png').default}
              />
              <span>
                <FormattedMessage id={'app.pod'} />
              </span>
            </div>
            <div>{agvInfo?.upliftPodId}</div>
          </div>

          {/* 任务 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/task.png').default}
              />
              <span>
                <FormattedMessage id={'app.task'} />
              </span>
            </div>
            <div
              style={{ cursor: 'pointer', color: '#fff' }}
              className={style.rightSideline}
              onClick={() => {
                checkTaskDetail(agvInfo?.currentTaskId, type);
              }}
            >
              {!isStrictNull(agvInfo?.currentTaskId)
                ? `*${agvInfo?.currentTaskId.substr(agvInfo?.currentTaskId.length - 6, 6)}`
                : null}
              {}
            </div>
          </div>

          {/* 异常 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'agv'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/error.png').default}
              />
              <span>
                <FormattedMessage id={'app.agv.exception'} />
              </span>
            </div>
            <div
              className={style.rightSideline}
              style={{ color: '#ff0000' }}
              onClick={showAgvalert}
            >
              {agvAlarmList?.length}
            </div>
          </div>
        </div>

        {/* 操作区域*/}
        <div style={{ marginTop: 30 }}>
          {/* 充电、休息 */}
          <div className={styles.rightSideAgvContentOperation}>
            <div className={styles.rightSideAgvContentOperationItem} onClick={goCharge}>
              <img alt={'agv'} src={require('@/packages/Scene/icons/charger.png').default} />
              <div>
                <FormattedMessage id={'monitor.right.charge'} />
              </div>
            </div>
            <div className={styles.rightSideAgvContentOperationItem} onClick={toRest}>
              <img alt={'agv'} src={require('@/packages/Scene/icons/rest.png').default} />
              <div>
                <FormattedMessage id={'monitor.right.goRest'} />
              </div>
            </div>
            <div style={{ width: 65 }} />
          </div>

          {/* 路径、维护、手动 */}
          <div className={styles.rightSideAgvContentOperation}>
            <div className={styles.rightSideAgvContentOperationItem2} onClick={agvPthchanged}>
              <div style={{ background: pathChecked ? checkedColor : '' }}>
                <img alt={'agv'} src={require('@/packages/Scene/icons/path.png').default} />
              </div>
              <div>
                <FormattedMessage id={'monitor.path'} />
              </div>
            </div>

            {/* 维护 */}
            <Popconfirm
              title={
                mainTain
                  ? formatMessage({ id: 'monitor.controller.AGV.tip.cancelMaintain' })
                  : formatMessage({ id: 'monitor.controller.AGV.tip.confirmMaintain' })
              }
              onConfirm={mainTainAgv}
              okText={formatMessage({ id: 'app.button.confirm' })}
              cancelText={formatMessage({ id: 'app.button.cancel' })}
            >
              <div className={styles.rightSideAgvContentOperationItem2}>
                <div style={{ background: mainTain ? checkedColor : '' }}>
                  <img alt={'agv'} src={require('@/packages/Scene/icons/maintain.png').default} />
                </div>
                <div>
                  <FormattedMessage id={'monitor.maintain'} />
                </div>
              </div>
            </Popconfirm>

            {/* 手动*/}
            <Popconfirm
              title={
                manualMode
                  ? formatMessage({ id: 'monitor.controller.AGV.tip.turnOffManualMode' })
                  : formatMessage({ id: 'monitor.controller.AGV.tip.turnOnManualMode' })
              }
              onConfirm={switchManualMode}
              okText={formatMessage({ id: 'app.button.confirm' })}
              cancelText={formatMessage({ id: 'app.button.cancel' })}
            >
              <div className={styles.rightSideAgvContentOperationItem2}>
                <div style={{ background: manualMode ? checkedColor : '' }}>
                  <img alt={'agv'} src={require('@/packages/Scene/icons/manual.png').default} />
                </div>
                <div>
                  <FormattedMessage id={'monitor.manual'} />
                </div>
              </div>
            </Popconfirm>
          </div>

          {/* 重置、重启、运行时 */}
          <div className={styles.rightSideAgvContentOperation}>
            <Popconfirm
              title={formatMessage({ id: 'monitor.controller.AGV.tip.resetAMR' })}
              onConfirm={() =>
                sendAgvHexCommand(
                  type === AppCode.ForkLifting ? '02' : '80',
                  formatMessage({ id: 'app.button.reset' }),
                )
              }
              okText={formatMessage({ id: 'app.button.confirm' })}
              cancelText={formatMessage({ id: 'app.button.cancel' })}
            >
              <div className={styles.rightSideAgvContentOperationItem}>
                <img alt={'agv'} src={require('@/packages/Scene/icons/reset.png').default} />
                <div>
                  <FormattedMessage id={'app.button.reset'} />
                </div>
              </div>
            </Popconfirm>

            <Popconfirm
              title={formatMessage({ id: 'monitor.controller.AGV.tip.rebootAMR' })}
              onConfirm={() =>
                sendAgvHexCommand('02 60 00 00', formatMessage({ id: 'monitor.reboot' }))
              }
              okText={formatMessage({ id: 'app.button.confirm' })}
              cancelText={formatMessage({ id: 'app.button.cancel' })}
            >
              <div className={styles.rightSideAgvContentOperationItem}>
                <img alt={'agv'} src={require('@/packages/Scene/icons/reboot.png').default} />
                <div>
                  <FormattedMessage id={'monitor.reboot'} />
                </div>
              </div>
            </Popconfirm>

            <div className={styles.rightSideAgvContentOperationItem} onClick={showRunInfo}>
              <img alt={'agv'} src={require('@/packages/Scene/icons/runTime.png').default} />
              <div>
                <FormattedMessage id={'monitor.runTime'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default connect(({ monitorView, monitor }) => ({
  selectAgv: monitorView.selectAgv ?? [],
  showRoute: monitorView.routeView?.showRoute,
  allAGVs: monitor?.allAGVs,
}))(withRouter(memo(AGVElementProp)));
