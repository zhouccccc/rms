import React, { memo, useState } from 'react';
import { Form, Select, Radio, InputNumber, Button } from 'antd';
import { connect } from '@/utils/dva';
import { formatMessage } from '@/utils/utils';
import FormattedMessage from '@/components/FormattedMessage';
import { getCurrentLogicAreaData } from '@/utils/mapUtils';
import styles from './popoverPanel.module.less';

const GenerateCellCode = (props) => {
  const { dispatch, submit, selectCells, rangeStart, rangeEnd } = props;

  const [formRef] = Form.useForm();
  const [generateWay, setGenerateWay] = useState('increment');

  function onWayChanged(ev) {
    setGenerateWay(ev.target.value);
    formRef.setFieldsValue({
      startCode: ev.target.value === 'increment' ? rangeStart : rangeEnd,
    });
    formRef.validateFields();
  }

  return (
    <div className={styles.formWhiteLabel}>
      <Form form={formRef} layout={'vertical'}>
        {/* 操作点 */}
        <Form.Item
          name={'cellIds'}
          rules={[{ required: true }]}
          label={formatMessage({ id: 'app.map.cell' })}
        >
          <Select maxTagCount={3} mode="multiple" style={{ width: 250 }} notFoundContent={null} />
        </Form.Item>

        {/* 递增/递减 */}
        <Form.Item
          name={'way'}
          rules={[{ required: true }]}
          initialValue={generateWay}
          label={formatMessage({ id: 'editor.generateCode.way' })}
          getValueFromEvent={(ev) => {
            onWayChanged(ev);
            return ev.target.value;
          }}
        >
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="increment">
              {formatMessage({ id: 'editor.generateCode.way.increment' })}
            </Radio.Button>
            <Radio.Button value="decrease">
              {formatMessage({ id: 'editor.generateCode.way.decrease' })}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* 起始码 */}
        <Form.Item
          name={'startCode'}
          initialValue={rangeStart}
          rules={[{ required: true }]}
          label={formatMessage({ id: 'editor.batchAddCell.firstCode' })}
        >
          <InputNumber style={{ width: 150 }} />
        </Form.Item>

        {/* 递增/递减值 */}
        <Form.Item
          name={'step'}
          initialValue={1}
          rules={[{ required: true }]}
          label={formatMessage({ id: `editor.generateCode.way.${generateWay}.value` })}
        >
          <InputNumber style={{ width: 150 }} />
        </Form.Item>

        {/* 确定 */}
        <Form.Item>
          <Button type="primary" disabled={selectCells.length === 0} onClick={submit}>
            <FormattedMessage id="app.button.confirm" />
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default connect(({ editor }) => {
  const { selectCells, visible } = editor;
  const currentLogicAreaData = getCurrentLogicAreaData();
  return {
    selectCells,
    rangeStart: currentLogicAreaData?.rangeStart,
    rangeEnd: currentLogicAreaData?.rangeEnd,
  };
})(memo(GenerateCellCode));