import React, { Component } from 'react';
import { Form, Input, Button } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';
import { formatMessage, getFormLayout } from '@/utils/util';

const { formItemLayout, formItemLayoutNoLabel } = getFormLayout(6, 18);

export default class UpdatePassword extends Component {
  formRef = React.createRef();

  submit = () => {
    const { validateFields } = this.formRef.current;
    const { onSubmit } = this.props;
    validateFields().then((allValues) => {
      onSubmit(allValues);
    });
  };

  render() {
    const { needOriginal } = this.props;
    return (
      <Form {...formItemLayout} ref={this.formRef}>
        {needOriginal ? (
          <Form.Item
            label={formatMessage({ id: 'accountCenter.oldPassword' })}
            name="originalPassword"
            rules={[{ required: true }]}
          >
            <Input.Password autoComplete="off" type="password" />
          </Form.Item>
        ) : (
          ''
        )}
        <Form.Item
          label={formatMessage({ id: 'sso.user.password' })}
          name="password"
          rules={[{ required: true }]}
        >
          <Input.Password autoComplete="off" type="password" />
        </Form.Item>
        <Form.Item
          label={formatMessage({ id: 'sso.user.password2' })}
          name="surePassword"
          dependencies={['password']}
          rules={[
            { required: true },
            {
              validator: (_, value) => {
                const { getFieldValue } = this.formRef.current;
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error(
                    formatMessage({ id: 'sso.user.require.passwordConsistent', format: false }),
                  ),
                );
              },
            },
          ]}
        >
          <Input.Password autoComplete="off" type="password" />
        </Form.Item>

        <Form.Item {...formItemLayoutNoLabel}>
          <Button onClick={this.submit} type="primary">
            <FormattedMessage id="app.button.submit" />
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
