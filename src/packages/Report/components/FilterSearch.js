import React, { memo, useState, useEffect } from 'react';
import { Row, Col, Form, Radio, Tag, Divider } from 'antd';
import { getAllCellId } from './GroundQrcodeEcharts';
import FormattedMessage from '@/components/FormattedMessage';

const taskTypes = {
  EMPTY_RUN: '空跑',
  CHARGE_RUN: '充电',
  REST_UNDER_POD: '回休息区',
  CARRY_POD_TO_CELL: '搬运货架',
  CARRY_POD_TO_STATION: '工作站任务',
  SUPER_CARRY_POD_TO_CELL: '高级搬运任务',
  HEARVY_CARRY_POD_TO_STORE: '重车回存储区',
  CUSTOM_TASK: '自定义任务',
  FROCK_CARRY_TO_CELL: '工装车搬运',
  HEARVY_CARRY_POD_TO_STATION: '重车去工作站',
  ROLLER_CARRY_TO_CELL: '滚筒搬运',
  RUN_TO_SAFETY_AREA: '异常车去安全区',
};
const { CheckableTag } = Tag;

const formLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

const FilterSearch = (props) => {
  const { data = [], filterSearch, showCellId, showTask } = props;

  const [form] = Form.useForm();

  const [agvTagsData, setAgvTagsData] = useState([]);
  const [taskTypeData, setTaskTypeData] = useState([]);

  const [selectedTaskType, setSelectedTaskType] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeType, setTimeType] = useState('hour');

  useEffect(() => {
    let tagsData = [];
    if (showCellId) {
      tagsData = getAllCellId(data, 'cellId');
    } else {
      tagsData = getAllCellId(data, 'agvId');
    }

    if (showTask) {
      const typeTags = getAllCellId(data, 'agvTaskType');
      setTaskTypeData(typeTags);
      setSelectedTaskType(typeTags);
    }
    setAgvTagsData(tagsData);
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
    <div key="a" style={{ marginTop: 8, fontSize: '13px', width: '100%' }}>
      <Form form={form} {...formLayout}>
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
                  <FormattedMessage id="app.agv" />
                )
              }
            >
              {agvTagsData.map((tag) => (
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
      <Divider />
    </div>
  );
};
export default memo(FilterSearch);
