/* TODO: I18N */
import React, { memo, useState, useEffect } from 'react';
import { Row, Col, Button } from 'antd';
import { EditOutlined, DeleteOutlined, RedoOutlined, PlusOutlined } from '@ant-design/icons';
import TablePageWrapper from '@/components/TablePageWrapper';
import TableWithPages from '@/components/TableWithPages';
import FormattedMessage from '@/components/FormattedMessage';
import {
  deleteSelectedLoad,
  fetchAllLoad,
  fetchAllLoadSpecification,
} from '@/services/resourceService';
import { dealResponse, isStrictNull } from '@/utils/util';
import AddLoadModal from './component/AddLoadModal';
import SearchLoadComponent from './component/SearchLoadComponent';
import commonStyles from '@/common.module.less';

const ContainerManage = (props) => {
  const [allLoadSpec, setAllLoadSpec] = useState([]);
  const [allData, setAllDllData] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [updateRecord, setUpdateRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'loadId', align: 'center' },
    {
      title: <FormattedMessage id="app.common.name" />,
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: <FormattedMessage id="app.common.angle" />,
      dataIndex: 'angle',
      align: 'center',
    },
    {
      title: '载具规格',
      dataIndex: 'loadSpecificationCode',
      align: 'center',
    },
    {
      title: '位置',
      dataIndex: 'cargoStorageSpace',
      align: 'center',
    },
    {
      title: <FormattedMessage id="app.common.status" />,
      align: 'center',
      dataIndex: 'disabled',
      render: (text, record) => {
        if (text) {
          return <FormattedMessage id="app.common.disable" />;
        }
        return <FormattedMessage id="app.common.enable" />;
      },
    },
    {
      title: <FormattedMessage id="app.button.edit" />,
      align: 'center',
      fixed: 'right',
      render: (text, record) => (
        <EditOutlined
          style={{ color: '#1890FF', fontSize: 18 }}
          onClick={() => {
            editRow(record);
          }}
        />
      ),
    },
  ];

  const expandColumns = [{ title: '组名', dataIndex: 'groups', align: 'center' }];

  function addSpec() {
    setVisible(true);
  }

  function editRow(record) {
    setVisible(true);
    setUpdateRecord(record);
  }

  function onCancel() {
    setVisible(false);
    setUpdateRecord(null);
  }

  function onSubmit() {
    onCancel();
    getData();
  }

  // 删除载具
  async function deleteSpec() {
    const response = await deleteSelectedLoad(selectedRowKeys);
    if (!dealResponse(response, 1)) {
      getData();
    }
  }

  async function getData() {
    setLoading(true);
    const [response, specResponse] = await Promise.all([
      fetchAllLoad(),
      fetchAllLoadSpecification(),
    ]);
    if (!dealResponse(response)) {
      setAllDllData(response);
      filterData(response);
    }

    if (!dealResponse(specResponse)) {
      setAllLoadSpec(specResponse);
    }
    setLoading(false);
  }

  // 搜索
  async function filterData(list, values) {
    let currentData = [...list];
    const currentValues = { ...formValues, ...values };
    const { id, loadSpecificationCode, cargoStorageSpace } = currentValues;
    if (!isStrictNull(id)) {
      currentData = currentData.filter(({ loadId }) => loadId === id);
    }

    if (!isStrictNull(loadSpecificationCode)) {
      currentData = currentData.filter(
        (item) => item.loadSpecificationCode === loadSpecificationCode,
      );
    }

    if (cargoStorageSpace?.length > 0) {
      currentData = currentData.filter((item) =>
        cargoStorageSpace.includes(item.loadSpecificationCode),
      );
    }

    setDataSource(currentData);
  }

  function rowSelectChange(selectedRowKeys) {
    setSelectedRowKeys(selectedRowKeys);
  }

  return (
    <TablePageWrapper>
      <div>
        <SearchLoadComponent allLoadSpec={allLoadSpec} search={filterData} list={allData} />
        <Row justify={'space-between'} style={{ userSelect: 'none' }}>
          <Col className={commonStyles.tableToolLeft} flex="auto">
            <Button type="primary" onClick={addSpec}>
              <PlusOutlined /> <FormattedMessage id="app.button.add" />
            </Button>
            <Button danger disabled={selectedRowKeys.length === 0} onClick={deleteSpec}>
              <DeleteOutlined /> <FormattedMessage id="app.button.delete" />
            </Button>

            <Button onClick={getData}>
              <RedoOutlined /> <FormattedMessage id="app.button.refresh" />
            </Button>
          </Col>
        </Row>
      </div>
      <TableWithPages
        columns={columns}
        dataSource={dataSource}
        expandColumns={expandColumns}
        expandColumnsKey={'loadType'}
        loading={loading}
        rowSelection={{ selectedRowKeys, onChange: rowSelectChange }}
        rowKey={(record) => {
          return record.id;
        }}
      />

      {/*新增/编辑 载具 */}
      <AddLoadModal
        visible={visible}
        onCancel={onCancel}
        onOk={getData}
        updateRecord={updateRecord}
        allLoadSpec={allLoadSpec}
      />
    </TablePageWrapper>
  );
};
export default memo(ContainerManage);
