import React, { Component } from 'react';
import { Button, Col, Form, message, Modal, Row, Select, Switch, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined, SyncOutlined } from '@ant-design/icons';
import { connect } from '@/utils/RmsDva';
import { IconFont } from '@/components/IconFont';
import FormattedMessage from '@/components/FormattedMessage';
import { adjustModalWidth, copyToClipBoard, dealResponse, formatMessage, isNull } from '@/utils/util';
import {
  addUserManager,
  fetchDeleteUser,
  fetchUserManagerList,
  saveUsersAssignedRole,
  saveUserSections,
  updateUserManage,
  updateUserPassword,
} from '@/services/SSOService';
import { AdminTColor, AdminTLabelMap, UserTColor } from './userManagerUtils';
import RmsConfirm from '@/components/RmsConfirm';
import TableWithPages from '@/components/TableWithPages';
import TablePageWrapper from '@/components/TablePageWrapper';
import AddUserModal from './components/AddUser';
import UpdatePasswordModal from './components/UpdatePassword';
import SectionAssignModal from './components/SectionAssign';
import RoleAssignModal from './components/RoleAssign';
import commonStyles from '@/common.module.less';

const AdminTypeLabelMap = AdminTLabelMap();
const { Option } = Select;

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class UserManager extends Component {
  state = {
    selectRow: [],
    selectRowKey: [],
    searchUsers: [],
    dataList: [],
    adminType: null,
    loading: false,
    updateItem: null,

    // 是否可以更新账户信息
    updateEnabled: false,
    // 新增 & 更新用户Modal
    addUserVisible: false,
    // 重置用户密码Modal
    updatePwdVisible: false,
    // 区域分配Modal
    sectionAssignVisible: false,
    // 角色分配Modal
    roleAssignVisible: false,
  };

  columns = [
    {
      title: <FormattedMessage id="sso.user.name" />,
      dataIndex: 'username',
      align: 'center',
    },
    {
      title: <FormattedMessage id='app.common.type' />,
      dataIndex: 'userType',
      align: 'center',
      render: (text) => {
        return (
          <Tag color={UserTColor[text]}>
            {text === 'USER' ? (
              <FormattedMessage id='sso.user' />
            ) : (
              <FormattedMessage id='app.module' />
            )}
          </Tag>
        );
      },
    },
    {
      title: <FormattedMessage id='sso.user.adminType' />,
      dataIndex: 'adminType',
      align: 'center',
      render: (text) => {
        const adminType = text || 'USER';
        return <Tag color={AdminTColor[adminType]}>{AdminTypeLabelMap[adminType]}</Tag>;
      },
    },
    {
      title: <FormattedMessage id='sso.assignedRoles' />,
      dataIndex: 'roles',
      align: 'center',
      render: (value) => {
        if (Array.isArray(value)) {
          return value.map((item, index) => (
            <Tag key={index} color={'blue'}>
              {item}
            </Tag>
          ));
        }
        return null;
      },
    },
    {
      title: <FormattedMessage id='sso.assignedSections' />,
      dataIndex: 'sections',
      align: 'center',
      render: (value) => {
        if (Array.isArray(value)) {
          return value.map(({ sectionName, id }) => (
            <Tag key={id} color={'blue'}>
              {sectionName}
            </Tag>
          ));
        }
        return null;
      },
    },
    {
      title: <FormattedMessage id="app.common.status" />,
      dataIndex: 'disabled',
      align: 'center',
      render: (text, record) => {
        return (
          <Switch
            checked={!record.disable}
            onClick={() => {
              this.changeStatus(record.id);
            }}
            checkedChildren={formatMessage({ id: 'app.common.enabled' })}
            unCheckedChildren={formatMessage({ id: 'app.common.disabled' })}
          />
        );
      },
    },
  ];

  expandColumns = [
    {
      title: <FormattedMessage id='translator.languageManage.language' />,
      dataIndex: 'language',
      align: 'center',
    },
    {
      title: <FormattedMessage id='sso.user.email' />,
      dataIndex: 'email',
      align: 'center',
    },
    {
      title: <FormattedMessage id='app.common.creationTime' />,
      dataIndex: 'createDate',
      align: 'center',
    },
    {
      title: <FormattedMessage id='app.common.remark' />,
      dataIndex: 'description',
      align: 'center',
    },
    {
      title: 'Token',
      dataIndex: 'token',
      align: 'center',
      render: (text, record) => {
        if (record.userType === 'APP') {
          return (
            <Button
              type='link'
              onClick={() => {
                copyToClipBoard(text);
              }}
            >
              <FormattedMessage id='app.button.copy' />
            </Button>
          );
        } else {
          return null;
        }
      },
    },
  ];

  componentDidMount() {
    const { currentUser } = this.props;
    const adminType = currentUser.adminType || 'USER';
    this.setState({ adminType });
    this.getUserDataList();
  }

  getUserDataList = async () => {
    this.setState({ loading: true, selectRow: [], selectRowKey: [] });
    const response = await fetchUserManagerList();
    if (!dealResponse(response)) {
      this.setState({ dataList: response });
    }
    this.setState({ loading: false });
  };

  tableRowSelection = (selectRowKey, selectRow) => {
    const { currentUser } = this.props;
    let updateEnabled = false;
    if (selectRow.length > 1) {
      this.setState({ updateItem: null, selectRowKey, selectRow });
    } else {
      const updateItem = { ...selectRow[0] };
      updateItem.adminType = updateItem.adminType ? updateItem.adminType : 'USER';

      // 当前管理员只能修改小于自己level的账户信息 或者 修改本身
      updateEnabled =
        currentUser.level > updateItem.level || updateItem.username === currentUser.username;
      this.setState({ updateItem, selectRowKey, selectRow, updateEnabled });
    }
  };

  // 用户名搜索
  userHandleChange = (searchUsers) => {
    const { dataList } = this.state;
    const { currentUser } = this.props;
    const selectRow = dataList.filter((record) => searchUsers.includes(record.id));
    const selectRowKey = selectRow.map((record) => record.id);

    if (selectRow.length > 0) {
      if (selectRow.length === 1) {
        const updateItem = { ...selectRow[0] };
        updateItem.adminType = updateItem.adminType ? updateItem.adminType : 'USER';

        // 当前管理员只能修改小于自己level的账户信息 或者 修改本身
        const updateEnabled =
          currentUser.level > updateItem.level || updateItem.username === currentUser.username;
        this.setState({ searchUsers, updateItem, selectRowKey, selectRow, updateEnabled });
      } else {
        this.setState({ searchUsers, updateItem: null, selectRowKey, selectRow });
      }
    } else {
      this.setState({
        searchUsers: [],
        updateItem: null,
        selectRowKey: [],
        selectRow: [],
        updateEnabled: false,
      });
    }
  };

  // 重置密码
  submitUpdatedPwd = async (values) => {
    const { selectRowKey } = this.state;
    const params = {
      userId: selectRowKey[0],
      changePassword: values.password,
    };
    const updateRes = await updateUserPassword(params);
    if (!dealResponse(updateRes, true)) {
      this.setState(
        { updatePwdVisible: false, selectRow: [], selectRowKey: [] },
        this.getUserDataList,
      );
    }
  };

  // 用户表单提交
  onSubmit = async (values) => {
    const { updateItem, selectRow } = this.state;
    let response;
    // 编辑
    if (!isNull(updateItem)) {
      response = await updateUserManage({ ...values, id: selectRow[0].id });
    } else {
      response = await addUserManager(values);
    }
    if (!dealResponse(response, true)) {
      this.setState(
        {
          addUserVisible: false,
          updateItem: null,
          selectRow: [],
          selectRowKey: [],
        },
        this.getUserDataList,
      );
    } else {
      message.error(response.message);
    }
  };

  // 注销用户
  deleteUser = () => {
    const { selectRow } = this.state;
    const content = (
      <>
        {formatMessage({ id: 'sso.user.deleteUser.snippet1', format: false })}
        <span style={{ margin: '0px 5px', color: 'red' }}>{selectRow[0].username}</span>
        {formatMessage({ id: 'sso.user.deleteUser.snippet2', format: false })}
      </>
    );
    const this_ = this;
    RmsConfirm({
      content: content,
      onOk: async () => {
        const deleteRes = await fetchDeleteUser({ id: selectRow[0].id });
        if (!dealResponse(deleteRes, true)) {
          this_.setState({ selectRow: [], selectRowKey: [] }, this_.getUserDataList);
        }
      },
    });
  };

  // 状态更改
  changeStatus = async (id) => {
    const { dataList } = this.state;
    const currentRow = dataList.filter((record) => record.id === id)[0];
    const params = {
      ...currentRow,
      disable: !currentRow.disable,
    };
    const updateRes = await updateUserManage(params);
    if (!dealResponse(updateRes, true)) {
      this.getUserDataList();
    }
  };

  // 区域分配
  updateSectionList = async (values) => {
    const { selectRow } = this.state;
    const selectionRes = await saveUserSections({
      sections: [...values],
      userId: selectRow[0].id,
    });
    if (!dealResponse(selectionRes, true)) {
      this.setState({ sectionAssignVisible: false }, this.getUserDataList);
    }
  };

  // 角色分配
  updateRoleList = async (values) => {
    const { selectRow } = this.state;
    const rolesRes = await saveUsersAssignedRole({
      roleIds: [...values],
      userId: selectRow[0].id,
    });
    if (!dealResponse(rolesRes, true)) {
      this.setState({ roleAssignVisible: false }, this.getUserDataList);
    }
  };

  render() {
    const {
      loading,
      dataList,
      selectRow,
      selectRowKey,
      updateItem,
      updateEnabled,
      searchUsers,
      adminType,
      addUserVisible,
      roleAssignVisible,
      sectionAssignVisible,
    } = this.state;
    const showUsersList = dataList.filter((record) => {
      if (searchUsers.length > 0) {
        return searchUsers.includes(record.id);
      } else {
        return true;
      }
    });
    return (
      <TablePageWrapper>
        <div>
          <Form.Item label={<FormattedMessage id="sso.user.name" />}>
            <Select
              showSearch
              allowClear
              mode="multiple"
              style={{ width: '50%' }}
              onChange={this.userHandleChange}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {dataList.map((rec) => {
                return (
                  <Option key={rec.id} value={rec.id}>
                    {rec.username}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Row>
            <Col flex="auto" className={commonStyles.tableToolLeft}>
              {/* 新增用户 */}
              <Button
                type="primary"
                onClick={() => {
                  this.setState({ addUserVisible: true, updateItem: null });
                }}
              >
                <PlusOutlined /> <FormattedMessage id="app.button.add" />
              </Button>

              {/* 编辑 */}
              <Button
                disabled={selectRowKey.length !== 1 || !updateEnabled}
                onClick={() => {
                  this.setState({ addUserVisible: true, updateItem: selectRow[0] });
                }}
              >
                <EditOutlined /> <FormattedMessage id="app.button.edit" />
              </Button>

              {/* 重置密码 */}
              <Button
                disabled={selectRowKey.length !== 1 || !updateEnabled}
                onClick={() => {
                  this.setState({ updatePwdVisible: true });
                }}
              >
                <SyncOutlined /> <FormattedMessage id="sso.user.action.resetPwd" />
              </Button>

              {/* 删除用户 */}
              <Button
                danger
                disabled={selectRowKey.length !== 1 || !updateEnabled}
                onClick={this.deleteUser}
              >
                <DeleteOutlined /> <FormattedMessage id="app.button.delete" />
              </Button>

              {/* 分配区域 */}
              <Button
                disabled={selectRowKey.length !== 1 || !updateEnabled}
                onClick={() => {
                  this.setState({ sectionAssignVisible: true });
                }}
              >
                <IconFont type="icon-assign" /> <FormattedMessage id="sso.user.sectionAssign" />
              </Button>

              {/* 分配角色 */}
              <Button
                disabled={selectRowKey.length !== 1 || !updateEnabled}
                onClick={() => {
                  this.setState({ roleAssignVisible: true });
                }}
              >
                <IconFont type="icon-assign" /> <FormattedMessage id="sso.user.roleAssign" />
              </Button>

              {/* 刷新 */}
              <Button onClick={this.getUserDataList}>
                <ReloadOutlined /> <FormattedMessage id="app.button.refresh" />
              </Button>
            </Col>
          </Row>
        </div>
        <TableWithPages
          bordered
          columns={this.columns}
          expandColumns={this.expandColumns}
          expandColumnSpan={8}
          rowKey={(record) => record.id}
          dataSource={showUsersList}
          loading={loading}
          rowSelection={{
            selectedRowKeys: selectRowKey,
            onChange: this.tableRowSelection,
          }}
        />

        {/* 新建编辑用户 */}
        <Modal
          destroyOnClose
          footer={null}
          maskClosable={false}
          style={{ top: 30 }}
          width={700}
          visible={addUserVisible}
          title={
            !isNull(updateItem) ? (
              <FormattedMessage id="sso.user.updateUserInfo" />
            ) : (
              <FormattedMessage id="sso.user.newUser" />
            )
          }
          onCancel={() => {
            this.setState({ addUserVisible: false, updateItem: null });
          }}
        >
          <AddUserModal type={adminType} updateRow={updateItem} onAddUser={this.onSubmit} />
        </Modal>

        {/**修改密码***/}
        <Modal
          width={400}
          footer={null}
          title={formatMessage({ id: 'sso.user.action.resetPwd', format: false })}
          destroyOnClose
          visible={this.state.updatePwdVisible}
          onCancel={() => {
            this.setState({ updatePwdVisible: false });
          }}
        >
          <UpdatePasswordModal onSubmit={this.submitUpdatedPwd} />
        </Modal>

        {/* 区域分配 */}
        <Modal
          destroyOnClose
          style={{ top: 20 }}
          footer={null}
          title={<FormattedMessage id="sso.user.sectionAssign" />}
          width={adjustModalWidth() * 0.58 < 500 ? 500 : adjustModalWidth() * 0.58}
          onCancel={() => {
            this.setState({ sectionAssignVisible: false });
          }}
          visible={sectionAssignVisible}
        >
          <SectionAssignModal selectRow={selectRow} onSubmit={this.updateSectionList} />
        </Modal>

        {/* 角色分配 */}
        <Modal
          destroyOnClose
          style={{ top: 20 }}
          footer={null}
          title={<FormattedMessage id="sso.user.roleAssign" />}
          width={adjustModalWidth() * 0.58 < 550 ? 550 : adjustModalWidth() * 0.58}
          onCancel={() => {
            this.setState({ roleAssignVisible: false });
          }}
          visible={roleAssignVisible}
        >
          <RoleAssignModal selectRow={selectRow} onSubmit={this.updateRoleList} />
        </Modal>
      </TablePageWrapper>
    );
  }
}
export default UserManager;
