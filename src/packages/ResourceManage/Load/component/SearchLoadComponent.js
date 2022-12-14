import React, { memo } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import FormattedMessage from '@/components/FormattedMessage';
import { convertToUserTimezone } from '@/utils/util';

const { RangePicker } = DatePicker;
const page = {
  currentPage: 1,
  size: 10,
};

const SearchLoadComponent = (props) => {
  const { allLoadSpec, onSearch } = props;
  const [formRef] = Form.useForm();

  function search() {
    formRef.validateFields().then((values) => {
      const params = {};
      if (values.createDate) {
        params.createTimeStart = convertToUserTimezone(values.createDate[0]).format(
          'YYYY-MM-DD HH:mm:ss',
        );
        params.createTimeEnd = convertToUserTimezone(values.createDate[1]).format(
          'YYYY-MM-DD HH:mm:ss',
        );
      }
      onSearch({ ...values, ...params }, page);
    });
  }

  return (
    <Form form={formRef}>
      <Row gutter={24}>
        <Col span={4}>
          <Form.Item label={<FormattedMessage id="resource.load.id" />} name={'loadId'}>
            <Input allowClear />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item
            label={<FormattedMessage id="resource.load.specification" />}
            name="loadSpecificationCode"
          >
            <Select allowClear style={{ width: '100%' }}>
              {allLoadSpec?.map((item) => (
                <Select.Option key={item?.id} value={item?.code}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name={'createDate'} label={<FormattedMessage id="app.common.creationTime" />}>
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col>
          <Form.Item>
            <Button type="primary" onClick={search}>
              <SearchOutlined /> <FormattedMessage id="app.button.search" />
            </Button>
            <Button
              style={{ marginLeft: 15 }}
              onClick={() => {
                formRef.resetFields();
                onSearch({}, page);
              }}
            >
              <ReloadOutlined /> <FormattedMessage id="app.button.reset" />
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
export default memo(SearchLoadComponent);
