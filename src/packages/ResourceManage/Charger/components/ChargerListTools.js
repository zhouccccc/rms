import React, { memo } from 'react';
import { Button, Col, Form, Row, Select } from 'antd';
import { DisconnectOutlined, RedoOutlined, ScanOutlined } from '@ant-design/icons';
import { connect } from '@/utils/RmsDva';
import { operateChargers } from '@/services/resourceService';
import { dealResponse, formatMessage } from '@/utils/util';
import RmsConfirm from '@/components/RmsConfirm';
import FormattedMessage from '@/components/FormattedMessage';
import { ChargerStatus } from './chargeConfig';
import commonStyles from '@/common.module.less';
import { GroupManager, GroupResourceMemberId } from '@/components/ResourceGroup';

const ChargerListTools = (props) => {
  const { onRefresh, cancelSelection, dispatch, allChargers, selectedRows, searchParams } = props;
  const unregisterCharges = allChargers.filter((item) => !item.register);
  const registerCharges = allChargers.filter((item) => item.register);

  function renderIdFilter() {
    return registerCharges.map(({ chargerId }) => (
      <Select.Option key={chargerId} value={chargerId}>
        {chargerId}
      </Select.Option>
    ));
  }

  function rendeStatusFilter() {
    return Object.keys(ChargerStatus).map((item) => (
      <Select.Option key={item} value={item}>
        {ChargerStatus[item]}
      </Select.Option>
    ));
  }

  function updateSearchParam(key, value) {
    dispatch({
      type: 'chargerList/updateSearchParams',
      payload: { ...searchParams, [key]: value },
    });
  }

  function cancelRegister() {
    const ids = selectedRows.map(({ id }) => id);
    const params = {
      updateType: 'LOGOUT',
      ids: ids,
    };
    RmsConfirm({
      content: formatMessage({ id: 'app.message.doubleConfirm' }),
      onOk: async () => {
        const response = await operateChargers(params);
        if (!dealResponse(response, 1)) {
          dispatch({ type: 'chargerList/fetchInitialData' });
        }
      },
    });
  }

  return (
    <div>
      <Row className={commonStyles.tableToolLeft} style={{ marginBottom: 0 }}>
        <Form.Item label={<FormattedMessage id="charger.id" />}>
          <Select
            allowClear
            mode="multiple"
            style={{ width: 300 }}
            value={searchParams.id}
            onChange={(value) => {
              updateSearchParam('id', value);
            }}
          >
            {renderIdFilter()}
          </Select>
        </Form.Item>
        <Form.Item label={<FormattedMessage id="app.common.status" />}>
          <Select
            allowClear
            mode="multiple"
            style={{ width: 300 }}
            value={searchParams.chargerStatus}
            onChange={(value) => {
              updateSearchParam('chargerStatus', value);
            }}
          >
            {rendeStatusFilter()}
          </Select>
        </Form.Item>
      </Row>
      <Row justify={'space-between'}>
        <Col className={commonStyles.tableToolLeft}>
          <Button danger disabled={selectedRows.length === 0} onClick={cancelRegister}>
            <DisconnectOutlined /> <FormattedMessage id='app.button.logout' />
          </Button>

          <GroupManager
            type={'CHARGER'}
            memberIdKey={GroupResourceMemberId.CHARGER}
            selections={selectedRows}
            refresh={onRefresh}
            cancelSelection={cancelSelection}
          />

          <Button onClick={onRefresh}>
            <RedoOutlined /> <FormattedMessage id='app.button.refresh' />
          </Button>
        </Col>
        <Col>
          <Button
            type='dashed'
            onClick={() => {
              dispatch({ type: 'chargerList/fetchInitialData' });
              dispatch({ type: 'chargerList/updateShowRegisterPanel', payload: true });
            }}
          >
            <ScanOutlined /> <FormattedMessage id="app.vehicle.found" />
            {unregisterCharges.length > 0 && (
              <span style={{ marginLeft: 5, color: 'red', fontWeight: 600 }}>
                [{unregisterCharges.length}]
              </span>
            )}
          </Button>
        </Col>
      </Row>
    </div>
  );
};
export default connect(({ chargerList }) => ({
  allChargers: chargerList.allChargers,
  searchParams: chargerList.searchParams,
}))(memo(ChargerListTools));
