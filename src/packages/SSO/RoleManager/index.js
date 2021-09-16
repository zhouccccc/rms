import React, { Component } from 'react';
import { Button, Table, Col, Row, Modal, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ImportOutlined,
  ExportOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import IconFont from '@/utils/ExtraIcon';
import { dateFormat, dealResponse, formatMessage, adjustModalWidth } from '@/utils/utils';
import {
  fetchAllRoleList,
  fetchAddRole,
  fetchUpdateRole,
  fetchDeleteRoleById,
} from '@/services/user';
import FormattedMessage from '@/components/FormattedMessage';
import AddRoleModal from './components/AddRoleModal';
import commonStyles from '@/common.module.less';

export default class index extends Component {
  state = {
    selectedRowKeys: [],
    selectedRow: [],
    roleList: [],
    loading: false,
    addRoleVisble: false,
    updateRoleFlag: false,
    uploadModal: false,
  };

  componentDidMount() {
    this.getRoleList();
  }

  getRoleList = async () => {
    this.setState({ loading: true });
    const roleList = await fetchAllRoleList();
    if (!dealResponse(roleList)) {
      this.setState({ roleList });
    }
    this.setState({ loading: false });
  };

  // 新增 编辑角色
  updateRole = async (values) => {
    const { selectedRow, updateRoleFlag } = this.state;
    let response = null;
    if (updateRoleFlag) {
      response = await fetchUpdateRole({ ...values, id: selectedRow[0].id });
    } else {
      response = await fetchAddRole(values);
    }
    if (!dealResponse(response)) {
      message.info(formatMessage({ id: 'app.tip.operationFinish' }));
      this.setState(
        {
          addRoleVisble: false,
          updateRoleFlag: false,
          selectedRow: [],
          selectedRowKeys: [],
        },
        this.getRoleList,
      );
    } else {
      message.error(response.message);
    }
  };

  columns = [
    {
      title: <FormattedMessage id="rolemanager.code" />,
      dataIndex: 'code',
      align: 'center',
    },
    {
      title: <FormattedMessage id="app.common.name" />,
      dataIndex: 'label',
      align: 'center',
    },
    {
      title: <FormattedMessage id="rolemanager.description" />,
      dataIndex: 'description',
      align: 'center',
    },
    {
      title: <FormattedMessage id="app.taskDetail.createTime" />,
      dataIndex: 'createDate',
      align: 'center',
      render: (text) => {
        return text && dateFormat(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: <FormattedMessage id="rolemanager.updateTime" />,
      dataIndex: 'updateDate',
      align: 'center',
      render: (text) => {
        return text && dateFormat(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];

  export = () => {
    const { selectedRow, roleList } = this.state;
    const exportData = selectedRow.length === 0 ? roleList : selectedRow;
    const blob = new Blob(['\uFEFF' + JSON.stringify(exportData, null, 4)], {
      type: 'text/plain;charset=utf-8;',
    });
    saveAs(blob, 'Role_Info.json');
  };

  render() {
    const { selectedRowKeys, selectedRow, roleList, loading, addRoleVisble, updateRoleFlag } =
      this.state;
    return (
      <div className={commonStyles.globalPageStyle}>
        <Row className={commonStyles.mb20}>
          <Col flex="auto" className={commonStyles.tableToolLeft}>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                this.setState({ addRoleVisble: true });
              }}
            >
              <FormattedMessage id="app.button.add" />
            </Button>
            <Button
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => {
                this.setState({ addRoleVisble: true, updateRoleFlag: true });
              }}
            >
              <FormattedMessage id="sso.user.edit" />
            </Button>
            <Button disabled={selectedRowKeys.length === 0} icon={<DeleteOutlined />}>
              <FormattedMessage id="app.button.delete" />
            </Button>
            <Button disabled={selectedRowKeys.length !== 1}>
              <IconFont type="icon-fenpei" />
              <FormattedMessage id="rolemanager.authAssign" />
            </Button>
            <Button
              disabled={roleList.length === 0}
              icon={<ExportOutlined />}
              onClick={this.export}
            >
              <FormattedMessage id="app.button.export" />
            </Button>
            <Button
              icon={<ImportOutlined />}
              onClick={() => {
                this.setState({ uploadModal: true });
              }}
            >
              <FormattedMessage id="app.button.import" />
            </Button>
          </Col>
          <Col>
            <Button type="primary" icon={<ReloadOutlined />} onClick={this.getRoleList}>
              <FormattedMessage id="app.button.refresh" />
            </Button>
          </Col>
        </Row>

        <div className={commonStyles.divContent}>
          <Table
            bordered
            columns={this.columns}
            dataSource={roleList}
            loading={loading}
            rowKey="id"
            scroll={{ x: 'max-content' }}
            rowSelection={{
              selectedRowKeys,
              onChange: (selectedRowKeys, selectedRow) => {
                this.setState({ selectedRowKeys, selectedRow });
              },
            }}
          />
        </div>

        <Modal
          footer={null}
          visible={addRoleVisble}
          destroyOnClose
          title={
            updateRoleFlag ? (
              <FormattedMessage id="app.button.add" />
            ) : (
              <FormattedMessage id="sso.user.edit" />
            )
          }
          onCancel={() => {
            this.setState({ addRoleVisble: false, updateRoleFlag: false });
          }}
        >
          <AddRoleModal onAddRoles={this.updateRole} updateRow={selectedRow} />
        </Modal>
      </div>
    );
  }
}
