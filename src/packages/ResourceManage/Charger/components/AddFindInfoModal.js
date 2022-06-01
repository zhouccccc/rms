/* TODO: I18N */
import React, { memo, useEffect } from 'react';
import { Form, Modal, Select, Input, InputNumber } from 'antd';
import { connect } from '@/utils/RmsDva';
import { getFormLayout, dealResponse } from '@/utils/util';
import FormattedMessage from '@/components/FormattedMessage';
import { formatMessage } from '@/utils/util';
import { findCharger } from '@/services/resourceManageAPI';

const { formItemLayout } = getFormLayout(5, 17);
const AddRegistrationModal = (props) => {
  const { dispatch, visible, allAdaptors } = props;
  const [formRef] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      formRef.resetFields();
    }
  }, [visible]);

  function onSubmit() {
    formRef
      .validateFields()
      .then(async (values) => {
        const { adapterType, ip, port } = values;
        const params = {
          parameter: {
            adapterCode: adapterType[0],
            typeCode: adapterType[1],
            ip,
            port,
          },
        };
        const response = await findCharger(params);
        if (!dealResponse(response)) {
          await dispatch({ type: 'chargerList/fetchInitialData' });
          closeModal();
        }
      })
      .catch(() => {});
  }

  function closeModal() {
    dispatch({ type: 'chargerList/updateAddRegistrationModalShown', payload: false });
  }

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title={'添加发现'}
      maskClosable={false}
      onCancel={closeModal}
      onOk={onSubmit}
    >
      <Form form={formRef} {...formItemLayout}>
        <Form.Item
          name={'adapterType'}
          label={<FormattedMessage id={'app.configInfo.header.adapter'} />}
          rules={[{ required: true }]}
        >
          <Select allowClear>
            {allAdaptors?.map((adapter) => {
              const { chargerAdapterTypes } = adapter;
              return (
                <Select.OptGroup
                  key={adapter.code}
                  label={`${formatMessage({ id: 'app.configInfo.header.adapter' })}: ${
                    adapter.name
                  }`}
                >
                  {chargerAdapterTypes.map((chargeType, index) => (
                    <Select.Option
                      key={index}
                      value={`${adapter.code}@${chargeType.code}`}
                      disabled={!chargeType.addDiscovery}
                    >
                      {chargeType.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item name={'ip'} label={'IP'}>
          <Input />
        </Form.Item>

        <Form.Item name={'port'} label={<FormattedMessage id={'app.vehicle.port'} />}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default connect(({ chargerList }) => ({
  allAdaptors: chargerList.allAdaptors,
  visible: chargerList.addRegistrationModalShown,
}))(memo(AddRegistrationModal));
