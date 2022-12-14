import React, { memo } from 'react';
import { Button, Col, Form, Row, Select } from 'antd';
import { DisconnectOutlined, RedoOutlined, ScanOutlined } from '@ant-design/icons';
import { connect } from '@/utils/RmsDva';
import { unRegisterDevice } from '@/services/resourceService';
import { dealResponse, formatMessage } from '@/utils/util';
import RmsConfirm from '@/components/RmsConfirm';
import FormattedMessage from '@/components/FormattedMessage';
import commonStyles from '@/common.module.less';
import { GroupManager, GroupResourceMemberId } from '@/components/ResourceGroup';

const EquipmentListTools = (props) => {
  const { dispatch, allDevices, selectedRows, searchParams, onRefresh, cancelSelection } = props;

  const unregisterDevices = allDevices.filter((item) => !item.hasRegistered);
  const registerDevices = allDevices.filter((item) => item.hasRegistered);

  function renderIdFilter() {
    return registerDevices.map(({ deviceID }) => (
      <Select.Option key={deviceID} value={deviceID}>
        {deviceID}
      </Select.Option>
    ));
  }

  function renderConnectTypeFilter() {
    const connectTypes = {
      MODBUS_TCP: 'MODBUS_TCP',
      MODBUS_RTU: 'MODBUS_RTU',
      HTTP: 'HTTP',
      TCP: 'TCP',
      UDP: 'UDP',
    };
    return Object.keys(connectTypes).map((item) => (
      <Select.Option key={item} value={item}>
        {connectTypes[item]}
      </Select.Option>
    ));
  }

  function updateSearchParam(key, value) {
    dispatch({ type: 'equipList/updateSearchParams', payload: { ...searchParams, [key]: value } });
  }

  function cancelRegister() {
    const ids = selectedRows.map(({ deviceID }) => deviceID);
    RmsConfirm({
      content: formatMessage({ id: 'app.message.doubleConfirm' }),
      onOk: async () => {
        const response = await unRegisterDevice(ids);
        if (!dealResponse(response, 1)) {
          dispatch({ type: 'equipList/fetchInitialData' });
        }
      },
    });
  }

  return (
    <div>
      <Row gutter={24}>
        <Col>
          <Form.Item label={<FormattedMessage id='device.id' />}>
            <Select
              allowClear
              mode='multiple'
              style={{ width: 300 }}
              value={searchParams.id}
              onChange={(value) => {
                updateSearchParam('id', value);
              }}
            >
              {renderIdFilter()}
            </Select>
          </Form.Item>
        </Col>
        <Col>
          <Form.Item label={<FormattedMessage id='device.connectionType' />}>
            <Select
              allowClear
              mode='multiple'
              style={{ width: 300 }}
              value={searchParams.connectionType}
              onChange={(value) => {
                updateSearchParam('connectionType', value);
              }}
            >
              {renderConnectTypeFilter()}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row justify={'space-between'}>
        <Col className={commonStyles.tableToolLeft}>
          <Button danger disabled={selectedRows.length === 0} onClick={cancelRegister}>
            <DisconnectOutlined /> <FormattedMessage id={'app.button.logout'} />
          </Button>
          <GroupManager
            type={'DEVICE'}
            memberIdKey={GroupResourceMemberId.DEVICE}
            selections={selectedRows}
            refresh={onRefresh}
            cancelSelection={cancelSelection}
          />
          <Button
            onClick={() => {
              dispatch({ type: 'equipList/fetchInitialData' });
            }}
          >
            <RedoOutlined /> <FormattedMessage id='app.button.refresh' />
          </Button>
        </Col>
        <Col>
          <Button
            type="dashed"
            onClick={() => {
              dispatch({ type: 'equipList/fetchInitialData' });
              dispatch({ type: 'equipList/updateShowRegisterPanel', payload: true });
            }}
          >
            <ScanOutlined /> <FormattedMessage id="app.vehicle.found" />
            {unregisterDevices.length > 0 && (
              <span style={{ marginLeft: 5, color: 'red', fontWeight: 600 }}>
                [{unregisterDevices.length}]
              </span>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
export default connect(({ equipList }) => ({
  allDevices: equipList.allDevices,
  searchParams: equipList.searchParams,
}))(memo(EquipmentListTools));
