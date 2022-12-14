import React, { memo, useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Table } from 'antd';
import FormattedMessage from '@/components/FormattedMessage';
import { adjustModalWidth } from '@/utils/util';
import { sortBy } from 'lodash';

const UpdateEditListModal = (props) => {
  const { columns, source, onCancel, visible, deleteHandle } = props;
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [dataList, setDataList] = useState([]);

  useEffect(() => {
    let _sources = (source && Object.values(source)) || [];
    _sources = sortBy(_sources, (o) => {
      return o.languageKey;
    });
    setDataList(_sources);
  }, [source]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };
  function getColumns() {
    if (Array.isArray(columns) && columns.length > 0) {
      const currentColumns = [
        {
          title: 'KEY',
          field: 'languageKey',
          dataIndex: 'languageKey',
        },
      ];
      columns.map(({ code }) => {
        currentColumns.push({
          title: code,
          field: code,
          dataIndex: code,
        });
      });
      return currentColumns;
    }
    return [];
  }

  return (
    <div>
      <Modal
        width={adjustModalWidth()}
        footer={null}
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
      >
        <Row style={{ marginBottom: 10 }}>
          <Col span={4}>
            <Button
              onClick={() => {
                const currentSource = { ...source };
                const filterData = dataList.filter((record) => {
                  if (selectedRowKeys.indexOf(record.languageKey) !== -1) {
                    delete currentSource[record.languageKey];
                    return false;
                  }
                  return true;
                });
                if (deleteHandle) {
                  deleteHandle(currentSource);
                  setDataList(filterData);
                }
              }}
              disabled={selectedRowKeys.length === 0}
            >
              <FormattedMessage id="app.button.delete"></FormattedMessage>
            </Button>
          </Col>
        </Row>

        <Table
          rowSelection={rowSelection}
          dataSource={dataList}
          columns={getColumns()}
          rowKey={(record) => {
            return record.languageKey;
          }}
          pagination={false}
        />
      </Modal>
    </div>
  );
};
export default memo(UpdateEditListModal);
