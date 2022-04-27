import React, { memo } from 'react';
import { Card, Descriptions, List, Tag } from 'antd';
import RobotModelViewer from '@/packages/ResourceManage/Agv/components/RobotModelViewer';

const responsiveGrid = {
  gutter: 8,
  xs: 1,
  sm: 2,
  md: 2,
  lg: 2,
  xl: 2,
  xxl: 3,
};
const AgvTypeDetail = (props) => {
  const { dataSource } = props;
  const { code, name, supportScene, robotModel, actionTemplate } = dataSource;

  function renderListItem({ actionCode, actionName, robotAction }) {
    const { actionList, actionParams, blockingType, simulatorIndex, simulatorSpeed } = robotAction;
    return (
      <Card title={`${actionName} [ ${actionCode} ]`}>
        <Descriptions>
          <Descriptions.Item span={3} label='动作列表'>
            {actionList?.map((item, index) => (
              <Tag key={index}>{item}</Tag>
            ))}
          </Descriptions.Item>
          <Descriptions.Item span={1} label='动作参数'>
            {actionParams}
          </Descriptions.Item>
          <Descriptions.Item span={2} label='动作限制'>
            {blockingType}
          </Descriptions.Item>
          <Descriptions.Item span={1} label='模拟序号'>
            {simulatorIndex}
          </Descriptions.Item>
          <Descriptions.Item span={2} label='模拟速度'>
            {simulatorSpeed}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  }

  return (
    <div>
      <h3>基本信息</h3>
      <Descriptions bordered layout='vertical'>
        <Descriptions.Item label='编码'>{code}</Descriptions.Item>
        <Descriptions.Item label='名称'>{name}</Descriptions.Item>
        <Descriptions.Item label='场景支持'>
          {supportScene?.map((item, index) => (
            <Tag key={index}>{item}</Tag>
          ))}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <h3>{actionTemplate.name}</h3>
      <List
        grid={responsiveGrid}
        dataSource={Object.values(actionTemplate?.actionModels || {})}
        renderItem={(item) => <List.Item>{renderListItem(item)}</List.Item>}
      />
      <h3>{robotModel.name}</h3>
      <RobotModelViewer data={robotModel.geoModel} />
    </div>
  );
};
export default memo(AgvTypeDetail);
