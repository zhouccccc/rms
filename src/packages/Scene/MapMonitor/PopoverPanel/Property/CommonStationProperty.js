import React, { memo, useEffect, useState } from 'react';
import { Col, InputNumber, Popover, Row, Switch, Tag } from 'antd';
import { connect } from '@/utils/RmsDva';
import FormattedMessage from '@/components/FormattedMessage';
import { fetchCommonPointInstrument } from '@/services/monitorService';
import { CommonStationStatePolling } from '@/workers/WebWorkerManager';
import {
  transformCommonTrafficData,
  transitionVehicles,
} from '../../Modal/CommonStationReport/commonStationEchart';
import { dealResponse, formatMessage, isNull, isStrictNull } from '@/utils/util';
import { StationStateColor } from '@/config/consts';
import styles from '../../monitorLayout.module.less';
import { CarOutlined } from '@ant-design/icons';

const CommonStationProperty = (props) => {
  const {
    data,
    data: { $$formData },
    dispatch,
    mapContext,
    commonStationView: { commonPointOB, commonPointPolling, commonPointTaskHistoryData },
  } = props;
  const [checked, setChecked] = useState(false);
  const [color, setColor] = useState('#efa283');
  const [vehicleIds, setVehicleIds] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState({});
  const [popVisible, setPopVisible] = useState(false);

  useEffect(() => {
    async function init() {
      setChecked(data.showEmployee ?? false);
      setColor(data?.employeeColor || '#efa283');
      // 1.获取状态任务数
      // 2.获取分车带数
      await checkStation();
    }
    init();
  }, [data]);

  // 通用站点 点击
  async function checkStation() {
    const { stopCellId, angle } = $$formData;
    const curentStation = {
      name: data?.name,
      angle,
      stopCellId,
      showEmployee: data?.showEmployee,
      employeeColor: data?.employeeColor,
    };
    if (!isNull(stopCellId) && !isNull(angle)) {
      const taskResponse = await fetchCommonPointInstrument({
        stopCellId,
        stopDirection: angle,
      });
      if (!dealResponse(taskResponse)) {
        const taskCountData = { ...taskResponse };
        const vehicleIdMap = transitionVehicles(taskCountData);
        const vehicleIds = [];
        Object.values(vehicleIdMap).map((ids) => {
          vehicleIds.push(...ids);
        });
        // setVehicleIds([1, 2, 4]);
        // setVehicleTypes({
        //   LatentLifting: [1, 2, 4],
        // });
        dispatch({
          type: 'monitorView/saveCommonStationView',
          payload: {
            commonPointOB: curentStation,
          },
        });
      }
    }
  }

  function showStationReport() {
    dispatch({
      type: 'monitor/saveCategoryModal',
      payload: 'station',
    });
  }

  // 动作操作
  function operateStatus(status) {}

  // 标记
  function markerStation(vehicles, checked, commonOB) {
    const { stopCellId, color, angle: direction } = commonOB;
    const currentStopCellId = `${stopCellId}`;

    // 更新地图显示
    mapContext.markCommonPoint(currentStopCellId, checked, color);
    mapContext.markCommonPointVehicle(vehicles, checked, color, currentStopCellId);

    let _currenyPollingData = [...commonPointPolling];
    if (checked) {
      _currenyPollingData.push(`${currentStopCellId}-${direction}`);
    } else {
      _currenyPollingData.splice(
        _currenyPollingData.indexOf(`${currentStopCellId}-${direction}`),
        1,
      );
    }
    dispatch({
      type: 'monitorView/saveWorkStationView',
      payload: {
        commonPointOB: commonOB,
        commonPointPolling: [..._currenyPollingData],
      },
    });
    // 根据_currenyWorkStations 决定轮询是开启还是关闭
    commonStationPollingCallback(_currenyPollingData);
  }

  /***轮询标记****/

  function commonStationPollingCallback(pollingData) {
    closePolling();
    if (pollingData?.length > 0) {
      const promises = [];
      // 收集请求队列
      pollingData.forEach((workStationID) => {
        const [stopCellId, direction] = workStationID.split('-');
        promises.push({ stopCellId, stopDirection: direction });
      });
      openPolling(promises);
    }
  }

  function openPolling(params) {
    CommonStationStatePolling.start(params, (response) => {
      const currentResponse = [...response];
      const _commonPointTaskHistoryData = { ...commonPointTaskHistoryData };
      currentResponse.map((data, index) => {
        if (!dealResponse(data)) {
          const stopCellId = data?.stopCellId; // 轮询返回结果 前端加上的
          const TaskCountData = { ...data };
          const vehicleIdMap = transitionVehicles(TaskCountData); // TODO:vehicleId 要是唯一Id
          const taskHistoryData = transformCommonTrafficData(TaskCountData);
          _commonPointTaskHistoryData[stopCellId] = {
            vehicleIdMap,
            taskHistoryData,
          };
        }
      });
      dispatch({
        type: 'monitorView/saveWorkStationView',
        payload: {
          commonPointTaskHistoryData: _commonPointTaskHistoryData,
        },
      });
      // 根据返回数据刷新小车标记
      Object.keys(_commonPointTaskHistoryData).forEach((stopId) => {
        const { vehicleIdMap } = _commonPointTaskHistoryData[stopId];
        const vehicleIds = [];
        Object.values(vehicleIdMap).map((ids) => {
          vehicleIds.push(...ids);
        });
        mapContext.markCommonPointVehicle(vehicleIds, true, null, stopId);
      });
    });
  }

  function closePolling() {
    CommonStationStatePolling.terminate();
  }
  /**轮询结束***/

  function renderVehicleTypesContent() {
    if (vehicleIds?.length > 0) {
      return (
        <div>
          {Object.entries(vehicleTypes).map(([type, value]) => {
            if (vehicleTypes[type]) {
              return (
                <>
                  <Row key={`${type}-${value}`}>
                    <Col>{formatMessage({ id: `app.vehicleType.${type}` })}:</Col>
                    <Col style={{ marginLeft: 10 }}>
                      {value.length > 0
                        ? value.map((id) => {
                            return (
                              <Tag key={id} color="blue">
                                {id}
                              </Tag>
                            );
                          })
                        : '--'}
                    </Col>
                  </Row>
                </>
              );
            }
          })}
        </div>
      );
    } else {
      return (
        <span style={{ color: 'rgb(3, 137, 255)' }}>
          <FormattedMessage id="monitor.tip.noTask" />
        </span>
      );
    }
  }

  return (
    <>
      <div>
        <FormattedMessage id={'app.map.station'} />
        <FormattedMessage id={'app.common.prop'} />
      </div>
      <div>
        <div>
          {/* 站点*/}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'station'}
                style={{ width: 45, height: 'auto' }}
                src={require('../../category/workStationTask_category.png').default}
              />
              <span>
                <FormattedMessage id={'app.map.station'} />
              </span>
            </div>
            <div>{data?.name || $$formData?.station}</div>
          </div>

          {/* 状态 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'station'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/state.png').default}
              />
              <span>
                <FormattedMessage id={'app.common.status'} />
              </span>
            </div>
            <div>
              {!isStrictNull(data.status) && (
                <Tag color={StationStateColor[data.status]}>
                  <FormattedMessage id={`monitor.station.status.${data.status}`} />
                </Tag>
              )}
            </div>
          </div>

          {/* 任务数 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <img
                alt={'station'}
                style={{ width: 25, height: 25 }}
                src={require('@/packages/Scene/icons/task.png').default}
              />
              <span>
                <FormattedMessage id={'app.task'} />
              </span>
            </div>
            <div style={{ cursor: 'pointer', color: '#fff' }}>
              {!isStrictNull(data.taskNum) ? data.taskNum : null}
              {}
            </div>
          </div>

          {/* 分车数 */}
          <div className={styles.rightSideContentDetail}>
            <div>
              <CarOutlined style={{ fontSize: 20 }} />{' '}
              <FormattedMessage id={'monitor.workstation.allocateAMRnum'} />
            </div>

            <Popover
              content={
                <Row style={{ maxWidth: 250, wordBreak: 'break-all' }}>
                  {renderVehicleTypesContent()}
                </Row>
              }
              placement="bottom"
              trigger="click"
              visible={popVisible}
              onVisibleChange={(visible) => {
                setPopVisible(visible);
              }}
              style={{ minWidth: 260 }}
              title={<FormattedMessage id="monitor.workstation.label.serviceAMR" />}
            >
              <div>{vehicleIds?.length}</div>
            </Popover>
          </div>

          {!isStrictNull(vehicleIds) && vehicleIds.length > 0 && (
            <div>
              <div className={styles.allocatedContent}>
                {vehicleIds.map((item, index) => {
                  if (index < 10) {
                    return <span key={item}>{item}</span>;
                  } else if (index === 10) {
                    return (
                      <Tag
                        key={`${item}${index}`}
                        color="rgba(1,137,255,0.6)"
                        onClick={() => {
                          setPopVisible(true);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <FormattedMessage id="monitor.station.more" />
                      </Tag>
                    );
                  }
                })}
              </div>

              {/* 标记 */}
              <div className={styles.markedContent}>
                <div className={styles.marked}>
                  <input
                    disabled={checked || !vehicleIds || vehicleIds.length === 0}
                    type="color"
                    value={color}
                    onChange={(e) => {
                      setColor(e.target.value);
                    }}
                  />

                  <div style={{ marginLeft: '5px' }}>
                    <Switch
                      checked={checked}
                      checkedChildren={formatMessage({
                        id: 'monitor.workstation.label.marked',
                      })}
                      unCheckedChildren={formatMessage({
                        id: 'monitor.workstation.label.unmarked',
                      })}
                      onChange={(value) => {
                        setChecked(value);
                        markerStation(vehicleIds, value, {
                          ...commonPointOB,
                          color,
                          flag: value,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 分车上限 */}
          <div className={styles.rightSideContentDetail}>
            <div style={{ width: 60 }}>
              <img
                alt={'station'}
                style={{ width: 25, height: 25 }}
                src={require('../../category/max.png').default}
              />
              <span>
                <FormattedMessage id={'monitor.workstation.allocateAMRnum.limit'} />
              </span>
            </div>
            <div style={{ cursor: 'pointer', color: '#fff' }}>
              <InputNumber value={data?.maxCount} min={0} />
            </div>
          </div>
        </div>

        {/* 操作区域*/}
        <div style={{ marginTop: 30 }}>
          {/* 开启结束暂停 查看报表 */}
          <div className={styles.rightSideVehicleContentOperation}>
            <div className={styles.rightSideVehicleContentOperationItem2}>
              <div
                onClick={() => {
                  operateStatus('start');
                }}
                style={{ background: data?.status === 'start' ? '#ff8400' : '' }}
              >
                <img
                  alt={'vehicle'}
                  src={require('@/packages/Scene/MapMonitor/category/start.png').default}
                />
              </div>
              <div>
                <FormattedMessage id={'app.button.turnOn'} />
              </div>
            </div>
            <div className={styles.rightSideVehicleContentOperationItem2}>
              <div
                onClick={() => {
                  operateStatus('paused');
                }}
                style={{ background: data?.status === 'paused' ? '#ff8400' : '' }}
              >
                <img
                  alt={'vehicle'}
                  src={require('@/packages/Scene/MapMonitor/category/paused.png').default}
                />
              </div>
              <div>
                <FormattedMessage id={'app.triggerAction.pause'} />
              </div>
            </div>
            <div className={styles.rightSideVehicleContentOperationItem2}>
              <div
                onClick={() => {
                  operateStatus('end');
                }}
                style={{ background: data?.status === 'end' ? '#ff8400' : '' }}
              >
                <img
                  alt={'vehicle'}
                  src={require('@/packages/Scene/MapMonitor/category/end.png').default}
                />
              </div>
              <div>
                <FormattedMessage id={'app.triggerState.end'} />
              </div>
            </div>
          </div>

          <div className={styles.rightSideVehicleContentOperation}>
            <div className={styles.rightSideVehicleContentOperationItem2}>
              <div onClick={showStationReport}>
                <img
                  alt={'station'}
                  style={{ width: 35 }}
                  src={require('@/packages/Scene/MapMonitor/category/report_category.svg').default}
                />
              </div>
              <div>
                <FormattedMessage id={'app.common.report'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(({ monitor, monitorView }) => ({
  mapContext: monitor.mapContext,
  categoryModal: monitor.categoryModal,
  categoryPanel: monitor.categoryPanel,
  commonStationView: monitorView.commonStationView,
}))(memo(CommonStationProperty));
