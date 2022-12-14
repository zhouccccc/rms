import React, { memo, useEffect, useState } from 'react';
import { Col, Form, Radio, Row, Tag } from 'antd';
import { getAllCellId } from './GroundQrcodeEcharts';
import FormattedMessage from '@/components/FormattedMessage';

const taskTypes = {};
const { CheckableTag } = Tag;

const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

const FilterSearch = (props) => {
  const { data = [], filterSearch, showCellId, showTask, showCode } = props;

  const [form] = Form.useForm();

  const [vehicleTagsData, setVehicleTagsData] = useState([]);
  const [taskTypeData, setTaskTypeData] = useState([]);

  const [selectedTaskType, setSelectedTaskType] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeType, setTimeType] = useState('hour');

  useEffect(() => {
    let tagsData = [];
    if (showCellId) {
      tagsData = getAllCellId(data, 'cellId');
    } else {
      tagsData = getAllCellId(data, 'vehicleId');
    }

    if (showTask) {
      const typeTags = getAllCellId(data, 'vehicleTaskType');
      setTaskTypeData(typeTags);
      setSelectedTaskType(typeTags);
    }
    setVehicleTagsData(tagsData);
    setSelectedTags(tagsData);
  }, [data]);

  //selectedIds
  function handleChange(value, key) {
    let currentSelectedTags = [...selectedTags];
    if (key) {
      currentSelectedTags = [...currentSelectedTags, value];
    } else {
      currentSelectedTags.splice(currentSelectedTags.indexOf(value), 1);
    }
    setSelectedTags(currentSelectedTags);

    filterSearch({
      timeType,
      selectedIds: currentSelectedTags,
      taskType: selectedTaskType,
    });
  }

  function taskChange(value, key) {
    let currentTags = [...selectedTaskType];
    if (key) {
      currentTags = [...currentTags, value];
    } else {
      currentTags.splice(currentTags.indexOf(value), 1);
    }
    setSelectedTaskType(currentTags);

    filterSearch({
      timeType,
      selectedIds: selectedTags,
      taskType: currentTags,
    });
  }

  function dayChange(e) {
    const type = e.target.value;
    setTimeType(type);
    filterSearch({
      timeType: type,
      selectedIds: selectedTags,
      taskType: selectedTaskType,
    });
  }

  return (
    <div
      style={{
        background: '#e6e6e6',
        height: '50px',
        border: '1px solid #e8e8e8',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Form form={form} {...formLayout} style={{ width: '100%' }}>
        <Row style={{ height: '30px' }}>
          <Col style={{ width: '200px' }}>
            <Form.Item
              name={'timeType'}
              label={<FormattedMessage id="app.time" />}
              initialValue={'hour'}
            >
              <Radio.Group
                buttonStyle="solid"
                defaultValue={'hour'}
                size={'small'}
                onChange={(e) => dayChange(e)}
              >
                <Radio.Button value="hour">
                  <FormattedMessage id="reportCenter.hour" />
                </Radio.Button>
                <Radio.Button value="day">
                  <FormattedMessage id="reportCenter.day" />
                </Radio.Button>
                <Radio.Button value="month">
                  <FormattedMessage id="reportCenter.month" />
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name={'selectedIds'}
              label={
                showCellId ? (
                  <FormattedMessage id="app.map.cell" />
                ) : (
                  <>
                    {showCode ? (
                      <FormattedMessage id="app.common.code" />
                    ) : (
                      <FormattedMessage id="app.vehicle" />
                    )}
                  </>
                )
              }
            >
              {vehicleTagsData.map((tag) => (
                <CheckableTag
                  key={tag}
                  checked={selectedTags.indexOf(tag) > -1}
                  onChange={(checked) => handleChange(tag, checked)}
                >
                  {tag}
                </CheckableTag>
              ))}
            </Form.Item>
          </Col>

          {showTask && (
            <Col flex="auto">
              <Form.Item name={'taskType'} label={<FormattedMessage id="app.task" />}>
                {taskTypeData.map((tag) => (
                  <CheckableTag
                    key={tag}
                    checked={selectedTaskType.indexOf(tag) > -1}
                    onChange={(checked) => taskChange(tag, checked)}
                  >
                    {taskTypes[tag] ?? tag}
                  </CheckableTag>
                ))}
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>
    </div>
  );
};
export default memo(FilterSearch);
