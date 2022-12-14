import React, { memo, useState } from 'react';
import { Button, Form, Input, Switch } from 'antd';
import { CloseOutlined, SendOutlined } from '@ant-design/icons';
import { connect } from '@/utils/RmsDva';
import { emptyRun } from '@/services/taskService';
import { dealResponse, formatMessage, getFormLayout, getMapModalPosition } from '@/utils/util';
import VehicleFormComponent from '@/components/VehicleFormComponent';
import FormattedMessage from '@/components/FormattedMessage';
import styles from '../monitorLayout.module.less';

const { formItemLayout, formItemLayoutNoLabel } = getFormLayout(5, 17);

const EmptyRun = (props) => {
  const { dispatch } = props;
  const [formRef] = Form.useForm();
  const [executing, setExecuting] = useState(false);

  function close() {
    dispatch({ type: 'monitor/saveCategoryModal', payload: null });
  }

  function doEmptyRun() {
    formRef
      .validateFields()
      .then((values) => {
        setExecuting(true);
        emptyRun({ ...values })
          .then((response) => {
            dealResponse(response, formatMessage({ id: 'app.message.sendCommandSuccess' }));
          })
          .finally(() => {
            setExecuting(false);
            close();
          });
      })
      .catch(() => {});
  }

  return (
    <div style={getMapModalPosition(550)} className={styles.monitorModal}>
      <div className={styles.monitorModalHeader}>
        <FormattedMessage id={'monitor.right.emptyRun'} />
        <CloseOutlined onClick={close} style={{ cursor: 'pointer' }} />
      </div>
      <div className={styles.monitorModalBody} style={{ paddingTop: 20 }}>
        <Form labelWrap form={formRef} {...formItemLayout}>
          <VehicleFormComponent form={formRef} />
          <Form.Item
            name={'targetCellId'}
            label={formatMessage({ id: 'app.common.targetCell' })}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={'emergencyAreaChecked'}
            label={'允许进入急停区'}
            valuePropName={'checked'}
            initialValue={false}
          >
            <Switch />
          </Form.Item>
          <Form.Item {...formItemLayoutNoLabel}>
            <Button type={'primary'} onClick={doEmptyRun} loading={executing} disabled={executing}>
              <SendOutlined /> <FormattedMessage id={'app.button.execute'} />
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default connect(({ monitor }) => ({
  allVehicles: monitor.allVehicles,
}))(memo(EmptyRun));
