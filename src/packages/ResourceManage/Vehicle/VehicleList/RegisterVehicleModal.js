/* TODO: I18N */
import React, { memo, useEffect } from 'react';
import { Form, Modal, Select } from 'antd';
import { connect } from '@/utils/RmsDva';
import { getFormLayout } from '@/utils/util';

const { formItemLayout } = getFormLayout(5, 17);
const RegisterVehicleModal = (props) => {
  const { dispatch, visible, allAdaptors, onSubmit } = props;
  const [formRef] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      formRef.resetFields();
    }
  }, [visible]);

  function submit() {
    formRef
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch(() => {});
  }

  return (
    <Modal
      destroyOnClose
      visible={visible}
      title={'车辆注册'}
      maskClosable={false}
      onCancel={() => {
        dispatch({ type: 'vehicleList/updateRegisterVehicleModalShown', payload: false });
      }}
      onOk={submit}
    >
      <Form form={formRef} {...formItemLayout}>
        <Form.Item name={'vehicleType'} label={'车辆类型'} rules={[{ required: true }]}>
          <Select>
            {Object.values(allAdaptors).map(({ adapterType }) => {
              const { id, name, vehicleTypes } = adapterType;
              return (
                <Select.OptGroup key={id} label={name}>
                  {vehicleTypes.map((item, index) => (
                    <Select.Option key={index} value={`${id}@${item.code}`}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select.OptGroup>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default connect(({ vehicleList }) => ({
  allAdaptors: vehicleList.allAdaptors,
  visible: vehicleList.registerVehicleModalShown,
}))(memo(RegisterVehicleModal));