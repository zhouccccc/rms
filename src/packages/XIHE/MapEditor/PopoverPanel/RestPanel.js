import React, { memo, useState } from 'react';
import { Button, Empty } from 'antd';
import { LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { connect } from '@/utils/RmsDva';
import { formatMessage, getRandomString, isNull } from '@/utils/util';
import { getCurrentLogicAreaData } from '@/utils/mapUtil';
import FormattedMessage from '@/components/FormattedMessage';
import FunctionListItem from '../components/FunctionListItem';
import RestForm from './RestForm';
import editorStyles from '../editorLayout.module.less';

const RestPanel = (props) => {
  const { height, dispatch, mapContext, restCells } = props;

  const [addFlag, setAddFlag] = useState(-1);
  const [editing, setEditing] = useState(null);
  const [formVisible, setFormVisible] = useState(null);

  function edit(index, record) {
    setEditing(record);
    setFormVisible(true);
    setAddFlag(index);
  }

  function remove(flag) {
    dispatch({
      type: 'editor/removeFunction',
      payload: { flag, type: 'restCells', scope: 'logic' },
    }).then((result) => {
      mapContext.renderRestCells(result, 'remove');
      mapContext.refresh();
    });
  }

  function getListData() {
    return restCells.map((item, index) => {
      const { agvTypes, cellIds, priority } = item;
      return {
        name: index + 1,
        index,
        rawData: item,
        fields: [
          {
            field: 'priority',
            label: <FormattedMessage id={'app.common.priority'} />,
            value: priority,
          },
          {
            field: 'cellIds',
            label: <FormattedMessage id={'editor.restCells'} />,
            value: cellIds,
          },
          {
            field: 'agvTypes',
            label: <FormattedMessage id={'app.agv.type'} />,
            value: agvTypes,
          },
        ],
      };
    });
  }

  const listData = getListData();
  return (
    <div style={{ height, width: 350 }} className={editorStyles.categoryPanel}>
      {/* 标题栏 */}
      <div>
        {formVisible ? (
          <LeftOutlined
            style={{ cursor: 'pointer', marginRight: 5 }}
            onClick={() => {
              setFormVisible(false);
              setEditing(null);
            }}
          />
        ) : null}
        <FormattedMessage id={'app.map.restArea'} />
        {formVisible ? <RightOutlined style={{ fontSize: 16, margin: '0 5px' }} /> : null}
        <span style={{ fontSize: 15, fontWeight: 500 }}>
          {formVisible
            ? isNull(editing)
              ? formatMessage({ id: 'app.button.add' })
              : formatMessage({ id: 'app.button.update' })
            : null}
        </span>
      </div>

      {/* 列表区 */}
      <div>
        {formVisible ? (
          <RestForm rest={editing} flag={addFlag} />
        ) : (
          <>
            <div style={{ width: '100%', textAlign: 'end' }}>
              <Button
                type="primary"
                style={{ marginBottom: 10 }}
                onClick={() => {
                  setAddFlag(restCells.length + 1);
                  setFormVisible(true);
                }}
              >
                <PlusOutlined /> <FormattedMessage id="app.button.add" />
              </Button>
            </div>
            {listData.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              listData.map((item) => (
                <FunctionListItem
                  key={getRandomString(6)}
                  data={item}
                  onEdit={edit}
                  onDelete={remove}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default connect(({ editor }) => {
  const currentLogicAreaData = getCurrentLogicAreaData();
  const restCells = currentLogicAreaData?.restCells ?? [];
  return { restCells, mapContext: editor.mapContext };
})(memo(RestPanel));
