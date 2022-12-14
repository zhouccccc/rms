import React, { Component } from 'react';
import { Form, Button, Select, Input } from 'antd';
import { connect } from '@/utils/RmsDva';
import FormattedMessage from '@/components/FormattedMessage';
import { generateLevelOptions } from '../../UserManager/userManagerUtils';
import { getFormLayout, isStrictNull } from '@/utils/util';

const { Option } = Select;
const { formItemLayout, formItemLayoutNoLabel } = getFormLayout(4, 18);

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class AddRoleModal extends Component {
  formRef = React.createRef();

  state = {
    levelOptions: [],
  };

  componentDidMount() {
    const { currentUser, updateRow } = this.props;
    const type = currentUser.adminType || 'USER';
    const { setFieldsValue } = this.formRef.current;
    if (!isStrictNull(updateRow) && updateRow.length > 0) {
      const currentItem = updateRow[0];
      const params = {
        code: currentItem.code,
        label: currentItem.label,
        level: currentItem.level,
        description: currentItem.description,
      };
      setFieldsValue({ ...params });
    }
    const levelOptions = generateLevelOptions(type);
    this.setState({ levelOptions });
  }

  submit = (values) => {
    const { validateFields } = this.formRef.current;
    const { onAddRoles } = this.props;
    validateFields().then((allValues) => {
      onAddRoles(allValues);
    });
  };

  render() {
    const { levelOptions } = this.state;
    return (
      <div>
        <Form {...formItemLayout} ref={this.formRef}>
          <Form.Item
            label={<FormattedMessage id="app.common.code" />}
            name="code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={<FormattedMessage id="app.common.name" />}
            name="label"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={<FormattedMessage id="sso.user.level" />}
            name="level"
            rules={[{ required: true }]}
          >
            <Select>
              {levelOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label={<FormattedMessage id="app.common.description" />} name="description">
            <Input />
          </Form.Item>
          <Form.Item {...formItemLayoutNoLabel}>
            <Button type="primary" onClick={this.submit}>
              <FormattedMessage id="app.button.submit" />
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}
export default AddRoleModal;
