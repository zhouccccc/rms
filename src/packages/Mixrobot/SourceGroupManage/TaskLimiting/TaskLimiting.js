import React, { Component } from 'react';
import { Table, Button, Row, Card, Modal, message, Spin } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';
import { dealResponse, isNull,formatMessage } from '@/utils/utils';
import RcsConfirm from '@/components/RcsConfirm';
import { fetchGetActiveMap } from '@/services/map';
import {
  getAgvTasksByCustomGroup,
  getAgvTasksByType,
  saveTaskLimit,
  getTaskLimit,
  deleteTaskLimit,
} from '@/services/api';
import TaskLimitModal from '../components/TaskLimitModal';

class TaskTrigger extends Component {
  state = {
    checkedType: [],
    getTasksByType: [], // 任务类型限流
    getTasksByCustomGroup: [], // 资源组限流
    taskLimitings: [],
    spinningFlag: false,
    selectedRows: [],
    selectedRowKeys: [],
    updateLimitRecord: null,
    limitModalVisible: false, // 任务限流弹框
    mapId: null,
    page: {
      current: 1,
      size: 10,
    },
  };

  formRef = React.createRef();

  columns = [
    {
      title:<FormattedMessage id="customTasks.taskLimit"/> ,
      dataIndex: 'groupName',
      width: '25%',
      // render: (text,record) => <a>{text}</a>,
    },
    {
      title:<FormattedMessage id="app.common.description"/> ,
      dataIndex: 'describe',
      render: (text,record) => <>{record && record.children ?record.children[0].describe:""}</>,
    },
    {
      title: <FormattedMessage id="customTasks.taskLimit.num"/> ,
      dataIndex: 'limitNum',
    },
    {
      title:<FormattedMessage id="app.common.operation"/> ,
      dataIndex: 'key',
      render: (_, record) => {
        return (
          <>
            {record && record.children ? (
              <Button
                type="link"
                onClick={() => {
                  this.updateGroupItem(record);
                }}
              >
                {formatMessage({ id: 'app.button.edit' })}
              </Button>
            ) : (
              ''
            )}
          </>
        );
      },
    },
  ];

  componentDidMount() {
    this.getAgvTasks();
  }

  getAgvTasks = async () => {
    this.setState({ spinningFlag: true });
    const originalMapData = await fetchGetActiveMap();
    if (originalMapData) {
      const payload = { mapId: originalMapData.id };
      this.getAgvTaskLists(originalMapData.id);
      // 根据mapId 获取资源组限流
      const response = await getAgvTasksByCustomGroup(payload);
      if (!dealResponse(response)) {
        this.setState({
          getTasksByCustomGroup: response,
        });
      } else {
        message.error(formatMessage({ id: 'app.taskLimiting.getCustomTaskFailed' }));
      }
    } else {
      message.error(formatMessage({ id: 'app.storageManage.map.fetchFailed' }));
    }
    this.setState({ spinningFlag: false });
    const getTasksByType = await getAgvTasksByType(); // 类型限流
    if (!dealResponse(getTasksByType)) {
      this.setState({
        getTasksByType,
        mapId: originalMapData.id,
      });
    }
  };

  getAgvTaskLists = async (mapId, type) => {
    // 列表接口
    const query = {};
    if (!isNull(mapId)) query.mapId = mapId;
    if (!isNull(type)) query.type = type;
    const responseLists = await getTaskLimit({ ...query });
    let taskLists = [];
    if (!dealResponse(responseLists)) {
      const currentLists = [...responseLists];
      currentLists.map((item) => {
        if (isNull(item.name) && item.limitDatas) {
          const sourceItem = {
            groupName: '类型',
            type: 'taskLimit',
            children: [...item.limitDatas],
          };
          taskLists = [...taskLists, sourceItem];
        } else {
          const sourceItem = {
            groupName: item.name,
            type: 'sourceLimit',
            children: [...item.limitDatas],
          };
          taskLists = [...taskLists, sourceItem];
        }
      });

      this.setState({
        taskLimitings: [...taskLists],
      });
    }
  };

  handleLimitModal = () => {
    const { getTasksByCustomGroup, getTasksByType } = this.state;
    this.setState({
      limitModalVisible: true,
      getTasksByCustomGroup,
      getTasksByType,
    });
  };

  // 保存
  taskLimitSubmit = async (values) => {
    // 调保存接口
    // 刷新当前页面
    const { mapId } = this.state;
    const currentValues = { ...values };
    currentValues.mapId = mapId;
    const response = await saveTaskLimit(currentValues);
    if (!dealResponse(response)) {
      message.success(formatMessage({ id: 'app.message.operateSuccess' }));
      this.setState({
        limitModalVisible: false,
        updateLimitRecord:null,
      });
      this.getAgvTaskLists(mapId);
    }
  };

  // 编辑
  updateGroupItem = (record) => {
    this.setState({
      limitModalVisible: true,
      updateLimitRecord: record,
    });
  };

  checkBoxOnChange = (checkedValues) => {
    this.setState({ checkedType: checkedValues });
  };

  search = () => {
    const { mapId } = this.state;
    this.getAgvTaskLists(mapId);
  };

  // 任务取消
  onDelete = () => {
    const { selectedRows } = this.state;
    const currentseleteRows = selectedRows.filter((item) => isNull(item.children));
    const _this = this;

    RcsConfirm({
      content: formatMessage({ id: 'customTasks.taskLimit.delete.confirm' }),
      onOk: async () => {
        // delete 调接口
        const deleteIds = currentseleteRows.map(({ id }) => id);
        const deleteResult = await deleteTaskLimit([...deleteIds]);
        if (!dealResponse(deleteResult)) {
          message.success(formatMessage({ id: 'app.message.operateSuccess' }));
          _this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          });
          _this.search();
        }else{
          message.error(formatMessage({id:deleteResult.message}));
        }
      },
      onCancel() {
        _this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      },
    });
  };

  render() {
    const {
      taskLimitings,
      spinningFlag,
      selectedRowKeys,
      limitModalVisible,
      updateLimitRecord,
      getTasksByType,
      getTasksByCustomGroup,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      checkStrictly: false,
      onChange: (_selectedRowKeys, _selectedRows) => {
        this.setState({ selectedRows: _selectedRows, selectedRowKeys: _selectedRowKeys });
      },
    };

    return (
      <div style={{ margin: '20px 20px 0 20px', minHeight: '90%' }}>
        <Spin spinning={spinningFlag}>
          {/*  搜索 */}
          {/* <Card style={{ marginBottom: 15 ,}}>
            <Row>
              <Col md={9} sm={24}>
                  <Checkbox.Group style={{ width: '100%' }} onChange={this.checkBoxOnChange}>
                    <Row>
                      <Col span={8}>
                        <Checkbox value="A">
                          {formatMessage({ id: 'app.taskLimiting.sourceGroup' })}
                        </Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="B">
                          {formatMessage({ id: 'app.taskLimiting.tasktype' })}
                        </Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
              </Col>

              <Col md={8} sm={24}>
                    <Button
                      type="primary"
                      onClick={() => {
                        this.search();
                      }}
                    >
                      <FormattedMessage id="form.taskSearch" />
                    </Button>
              </Col>
            </Row>
        </Card> */}

          <Card>
            <Row style={{ marginBottom: 10 }}>
              <Button
                disabled={selectedRowKeys.length === 0}
                onClick={() => {
                  this.onDelete();
                }}
              >
                {formatMessage({ id: 'app.button.delete' })}
              </Button>

              <Button
                type="primary"
                style={{ marginLeft: 15 }}
                onClick={() => {
                  this.handleLimitModal();
                }}
              >
                <FormattedMessage id="app.button.add" />
              </Button>
            </Row>

            <Table
              pagination={false}
              rowSelection={rowSelection}
              columns={this.columns}
              dataSource={taskLimitings}
              rowKey={'groupName'}
            />
          </Card>
        </Spin>

        {/*  新增 编辑的弹窗 */}
        <Modal
          visible={limitModalVisible}
          footer={null}
          destroyOnClose
          maskClosable={false}
          title={!updateLimitRecord
              ? formatMessage({ id: 'app.button.add' })
              : formatMessage({ id: 'app.button.update' })}
          width={550}
          onCancel={() => {
            this.setState({ limitModalVisible: false, updateLimitRecord: null });
          }}
          style={{ top: 10 }}
        >
          {
            <TaskLimitModal
              onSubmit={this.taskLimitSubmit}
              updateItem={updateLimitRecord}
              tasksByTypeOptions={getTasksByType}
              getTasksByCustomGroup={getTasksByCustomGroup}
            />
          }
        </Modal>
      </div>
    );
  }
}
export default TaskTrigger;
