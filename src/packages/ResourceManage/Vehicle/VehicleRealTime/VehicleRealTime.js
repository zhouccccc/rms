import React, { memo } from 'react';
import { Card, Col, Descriptions, Popconfirm, Row, Tag } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import {
  convertToUserTimezone,
  formatMessage,
  getSuffix,
  getVehicleStatusTag,
  isNull,
  isStrictNull,
} from '@/utils/util';
import { connect } from '@/utils/RmsDva';
import Dictionary from '@/utils/Dictionary';
import FormattedMessage from '@/components/FormattedMessage';

const { red, green, orange, blue } = Dictionary().color;

const VehicleRealTime = (props) => {
  const { data } = props;

  function renderVehicleWorkingState(value, disabled) {
    if (disabled) {
      return (
        <Tag color={red}>
          <FormattedMessage id={'app.common.disabled'} />
        </Tag>
      );
    }
    if (!isStrictNull(value)) {
      return getVehicleStatusTag(value);
    }
    return null;
  }

  function renderMaintenanceState(maintain) {
    if (isStrictNull(maintain)) return null;
    if (maintain) {
      return (
        <Row>
          <Col>
            <Tag color={orange} style={{ fontWeight: 700 }}>
              <ToolOutlined /> <FormattedMessage id={'vehicle.maintenanceState.true'} />
            </Tag>
          </Col>
          <Col>
            <Popconfirm title={formatMessage({ id: 'app.message.doubleConfirm' })}>
              <span style={{ color: blue, cursor: 'pointer' }}>
                <FormattedMessage id={'vehicle.maintenanceState.terminate'} />
              </span>
            </Popconfirm>
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col>
            <Tag color={green}>
              <FormattedMessage id={'app.common.normal'} />
            </Tag>
          </Col>
          <Col>
            <Popconfirm title={formatMessage({ id: 'vehicle.turnOnMaintain.tip' })}>
              <span style={{ color: blue, cursor: 'pointer' }}>
                <FormattedMessage id={'vehicle.maintenanceState.enter'} />
              </span>
            </Popconfirm>
          </Col>
        </Row>
      );
    }
  }

  function renderManualMode(inManualMod) {
    if (isNull(inManualMod)) return null;
    if (inManualMod) {
      return (
        <Row>
          <Col>
            <Tag>
              <FormattedMessage id={'vehicle.manualMode.true'} />
            </Tag>
          </Col>
          <Col style={{ display: 'flex', alignItems: 'center' }}>
            <Popconfirm title={formatMessage({ id: 'app.message.doubleConfirm' })}>
              <span style={{ color: blue, cursor: 'pointer' }}>
                <FormattedMessage id={'vehicle.manualMode.switchToAuto'} />
              </span>
            </Popconfirm>
          </Col>
        </Row>
      );
    } else {
      return (
        <Row>
          <Col>
            <Tag>
              <FormattedMessage id={'vehicle.manualMode.false'} />
            </Tag>
          </Col>
          <Col style={{ display: 'flex', alignItems: 'center' }}>
            <Popconfirm title={formatMessage({ id: 'app.message.doubleConfirm' })}>
              <span style={{ color: blue, cursor: 'pointer' }}>
                <FormattedMessage id={'vehicle.manualMode.switchToAutoManual'} />
              </span>
            </Popconfirm>
          </Col>
        </Row>
      );
    }
  }

  function renderCoordinator(x, y) {
    if (isStrictNull(x) || isStrictNull(y)) return;
    return `(${x}, ${y})`;
  }

  function renderArriveTime(value) {
    if (isStrictNull(value)) return null;
    return convertToUserTimezone(value).format('YYYY-MM-DD HH:mm:ss');
  }

  function renderOnlineState(value) {
    if (value) {
      if (value === 'ONLINE') {
        return (
          <Tag color={green}>
            <FormattedMessage id={'vehicle.onlineState.online'} />
          </Tag>
        );
      }
      return (
        <Tag color={red}>
          <FormattedMessage id={'vehicle.onlineState.offline'} />
        </Tag>
      );
    }
    return null;
  }

  /**
   * ????????????
   * ????????????
   * ?????????
   */
  function renderAbnormalState(value) {
    const { error, warning } = Dictionary().color;
    if (value) {
      //
    }
    return null;
  }

  /**
   * WAITING - ??????
   * INITIALIZING - ?????????
   * RUNNING - ?????????
   * PAUSED - ??????
   * FINISHED - ??????
   * FAILED - ??????
   */
  function renderSubActionState(value) {
    if (value) {
      //
    }
    return null;
  }

  function renderRunningState(state) {
    if (isStrictNull(state)) return null;
    return state;
  }

  function renderVehicleStorageStatue(state) {
    if (isStrictNull(state)) return null;
    return state;
  }

  return (
    <Card title={<FormattedMessage id={'vehicle.realTime'} />}>
      <Descriptions>
        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.currentPosition'} />}>
          {data.vehicleInfo?.currentNaviId}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.currentCoordinator'} />}>
          {renderCoordinator(data.vehicleInfo?.x, data.vehicleInfo?.y)}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.direction'} />}>
          {data.vehicleInfo?.direction && getSuffix(data.vehicleInfo.direction, '??')}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        {/*<Descriptions.Item label={<FormattedMessage id={'app.arriveTime'} />}>*/}
        {/*  {renderArriveTime(data.vehicleInfo?.arriveTime)}*/}
        {/*</Descriptions.Item>*/}

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.speed'} />}>
          {data.vehicleInfo?.speed}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.onlineState'} />}>
          {renderOnlineState(data.vehicleWorkStatusDTO?.onlineStatus)}
        </Descriptions.Item>

        {/************ ?????????????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.workingState'} />}>
          {renderVehicleWorkingState(
            data.vehicleWorkStatusDTO?.vehicleStatus,
            data.vehicle?.disabled,
          )}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.abnormalState'} />}>
          {renderAbnormalState()}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.runningState'} />}>
          {renderRunningState()}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.maintenanceState'} />}>
          {renderMaintenanceState(data.vehicle?.maintain)}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.manualMode'} />}>
          {renderManualMode(data.vehicle?.manualMode)}
        </Descriptions.Item>

        {/************ ?????????????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.vehicleStorageStatue'} />}>
          {renderVehicleStorageStatue()}
        </Descriptions.Item>

        {/************ ??????????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'vehicle.subActionState'} />}>
          {renderSubActionState()}
        </Descriptions.Item>

        {/************ ?????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'resource.load'} />}>
          {data.vehicleInfo?.loads}
        </Descriptions.Item>

        {/************ ???????????? ************/}
        <Descriptions.Item label={<FormattedMessage id={'resource.load.direction'} />}>
          {data.vehicleInfo?.loadAngle}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
export default connect(({ global }) => ({
  allTaskTypes: global.allTaskTypes,
}))(memo(VehicleRealTime));
