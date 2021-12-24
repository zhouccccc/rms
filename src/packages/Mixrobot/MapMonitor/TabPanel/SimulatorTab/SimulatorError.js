import React, { PureComponent } from 'react';
import { Button, Card, Form, Input, Select } from 'antd';
import { dealResponse, formatMessage } from '@/utils/utils';
import FormattedMessage from '@/components/FormattedMessage';
import { fetchSimulatorErrorMessage } from '@/services/monitor';

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
export default class SimulatorError extends PureComponent {
  formRef = React.createRef();

  componentDidMount() {
    const { selectIds } = this.props;
    const { setFieldsValue } = this.formRef.current;
    setFieldsValue({ robotIds: selectIds });
  }

  confirm = () => {
    const {
      logicId,
      onCancel,
      dispatch,
      form: { validateFields },
    } = this.props;
    validateFields((error, value) => {
      if (error) return false;
      const { robotIds, msgCode } = value;
      const params = { logicId, msgCode, robotId: robotIds.join(',') };
      fetchSimulatorErrorMessage(params).then((res) => {
        if (!dealResponse(res, 1, '模拟错误成功')) {
          onCancel();
          dispatch({ type: 'simulator/fetchSimulatorLoginAGV' });
        }
      });
    });
  };

  cancel = () => {
    const { onCancel } = this.props;
    onCancel();
  };

  render() {
    return (
      <Card title={formatMessage({ id: 'app.simulator.form.label.simulateAMRError' })}>
        <Form ref={this.formRef}>
          <Form.Item
            {...layout}
            name={'robotIds'}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'app.simulator.form.require.agv' }),
              },
            ]}
            label={formatMessage({ id: 'app.simulator.form.label.AMRID' })}
          >
            <Select allowClear showSearch mode="tags" maxTagCount={4} style={{ width: '90%' }} />
          </Form.Item>

          <Form.Item
            {...layout}
            name={'msgCode'}
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'app.simulator.form.require.errorCode' }),
              },
            ]}
            label={formatMessage({ id: 'app.simulator.form.label.errorCode' })}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ span: 16, offset: 6 }}>
            <Button size="small" onClick={this.confirm}>
              <FormattedMessage id="app.simulator.action.confirm" />
            </Button>
            <Button onClick={this.cancel} size="small" style={{ marginLeft: 20 }}>
              <FormattedMessage id="app.simulator.action.cancel" />
            </Button>
          </Form.Item>
        </Form>
      </Card>
    );
  }
}