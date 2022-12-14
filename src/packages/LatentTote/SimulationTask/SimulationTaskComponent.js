import React, { memo, useState } from 'react';
import { Button, Checkbox, Col, Form, Input, InputNumber, message, Modal, Radio, Row, Select } from 'antd';
import { flatten } from 'lodash';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { dealResponse, formatMessage, getFormLayout, isNull } from '@/utils/util';
import { updateSimulationTask } from '@/services/latentToteService';
import FormattedMessage from '@/components/FormattedMessage';
import { LatentToteTaskTypeOption } from '@/config/consts';
import PodFaceOrderTaskRange from './PodFaceOrderTaskRange';

const priorityOption = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const callTypeOption = [
  { label: formatMessage({ id: 'app.simulateTask.type.Auto' }), value: 'Auto' },
  { label: formatMessage({ id: 'app.simulateTask.type.Appoint' }), value: 'Appoint' },
];
const { formItemLayout } = getFormLayout(6, 16);

const SimulationTaskComponent = (props) => {
  const { visible, onClose, updateRecord, onRefresh } = props;
  const [formRef] = Form.useForm();
  const [callType, setCallType] = useState('Auto');

  const [reredner, setRerender] = useState({});

  function onSave() {
    formRef
      .validateFields()
      .then(async (values) => {
        // if (validateWorkStationCallParms(values?.workStationCallParms)) {
        const methodType = isNull(updateRecord) ? 'POST' : 'PUT';
        const response = await updateSimulationTask(methodType, values);
        if (!dealResponse(response)) {
          onClose();
          onRefresh();
        }
        // }
      })
      .catch((err) => {});
  }

  function validateWorkStationCallParms(stations = []) {
    /*
     *判断工作站是否有重复 stations.length>=2
     *1.workStationCodes为[]--重复
     *2.判断workStationCodes 数组重复
     * */
    if (stations?.length === 0) {
      message.error(formatMessage({ id: 'app.simulateTask.configuration' }));
      return false;
    }
    if (stations?.length === 1) {
      return true;
    }
    let codes = [];
    let allCodes = 0;

    stations?.forEach((item) => {
      const currentCodes = item?.workStationCodes ?? [];
      if (currentCodes.length === 0) {
        allCodes += 1;
      }
      codes.push(currentCodes);
    });
    codes = flatten(codes);
    if (codes.length !== new Set(codes).size || allCodes >= 1) {
      // return Promise.reject(new Error('工作站不能重复'));
      message.error(formatMessage({ id: 'app.simulateTask.stationDuplicate' }));
      return false;
    }
    return true;
    // return Promise.resolve();
  }

  function getVisible(index) {
    const values = formRef.getFieldsValue();
    return values.workStationCallParms?.[index];
  }

  return (
    <Modal
      destroyOnClose
      style={{ top: 30 }}
      onCancel={onClose}
      onOk={onSave}
      visible={visible}
      width={500}
      title={
        <>
          {isNull(updateRecord) ? (
            <FormattedMessage id="app.button.add" />
          ) : (
            <FormattedMessage id="app.button.edit" />
          )}
          <FormattedMessage id="app.simulateTask" />
        </>
      }
      bodyStyle={{ height: `500px`, overflow: 'auto' }}
    >
      <div style={{ marginTop: 10 }}>
        <Form labelWrap form={formRef} {...formItemLayout}>
          <Form.Item
            name="callStatus"
            hidden
            initialValue={updateRecord ? updateRecord.callStatus : 'STOP'}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name={'callType'}
            label={formatMessage({ id: 'app.simulateTask.callType' })}
            rules={[{ required: true }]}
            initialValue={updateRecord ? updateRecord.callType : 'Auto'}
            getValueFromEvent={(v) => {
              const value = v.target.value;
              setCallType(value);
              return value;
            }}
          >
            <Radio.Group optionType="button" buttonStyle="solid" options={callTypeOption} />
          </Form.Item>

          <Form.List
            name="workStationCallParms"
            initialValue={updateRecord?.workStationCallParms || [{}]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                  <Row
                    key={key}
                    style={{
                      border: '1px solid #e0dcdc',
                      padding: '10px',
                      borderRadius: '5px',
                      marginBottom: '20px',
                      marginLeft: 20,
                    }}
                  >
                    <Col span={22}>
                      <Form.Item
                        {...restField}
                        label={formatMessage({ id: 'app.task.name' })}
                        initialValue={'STATION_TO_POD'}
                        name={[name, 'toteTaskType']}
                        fieldKey={[fieldKey, 'toteTaskType']}
                        getValueFromEvent={(value) => {
                          setRerender({});
                          return value;
                        }}
                      >
                        <Select style={{ width: '250px' }}>
                          {LatentToteTaskTypeOption.map((item) => (
                            <Select.Option key={item?.value} value={item?.value}>
                              {formatMessage({ id: `${item?.label}` })}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label={formatMessage({
                          id: 'app.common.priority',
                        })}
                        initialValue={[]}
                        name={[name, 'priorities']}
                        fieldKey={[fieldKey, 'priorities']}
                      >
                        <Select allowClear mode="tags">
                          {priorityOption.map((item) => (
                            <Select.Option value={item} key={item}>
                              {item}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'workStationCodes']}
                        fieldKey={[fieldKey, 'workStationCodes']}
                        label={formatMessage({ id: 'app.map.workStation' })}
                        initialValue={[]}
                      >
                        <Select
                          // mode="multiple"
                          mode="tags"
                          placeholder={formatMessage({
                            id: 'monitor.automaticLatentWorkStationTask.defaultAllStation',
                          })}
                          style={{ width: '80%' }}
                        >
                          {/* {workstationList.map((record, index) => (
                            <Select.Option value={record.stopCellId} key={index}>
                              {record.stopCellId}-{record.angle}°
                            </Select.Option>
                          ))} */}
                        </Select>
                      </Form.Item>

                      {/* 指定才有一个工作站订单总数量 */}
                      {callType === 'Appoint' && (
                        <Form.Item
                          {...restField}
                          label={formatMessage({
                            id: 'monitor.automaticLatentWorkStationTask.maxPodNum',
                          })}
                          initialValue={'100'}
                          name={[name, 'stationOrderTaskTotalNum']}
                          fieldKey={[fieldKey, 'stationOrderTaskTotalNum']}
                        >
                          <InputNumber />
                        </Form.Item>
                      )}

                      <Form.Item
                        {...restField}
                        label={formatMessage({
                          id: 'app.simulateTask.stationMaxOrderTaskNum',
                        })}
                        initialValue={10}
                        name={[name, 'stationMaxOrderTaskNum']}
                        fieldKey={[fieldKey, 'stationMaxOrderTaskNum']}
                      >
                        <InputNumber />
                      </Form.Item>

                      {getVisible(index)?.toteTaskType === 'POD_TO_STATION' && (
                        <>
                          <Form.Item
                            {...restField}
                            label={formatMessage({
                              id: 'app.simulateTask.orderHitquantity',
                            })}
                            name={[name, 'podFacePileOnOrderTaskRange']}
                            fieldKey={[fieldKey, 'podFacePileOnOrderTaskRange']}
                          >
                            <PodFaceOrderTaskRange />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'appointPodIds']}
                            fieldKey={[fieldKey, 'appointPodIds']}
                            label={formatMessage({ id: 'app.pod' })}
                          >
                            <Select
                              mode="multiple"
                              placeholder={formatMessage({
                                id: 'app.simulateTask.defaultAllPod',
                              })}
                              style={{ width: '80%' }}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, 'appointPodFaces']}
                            fieldKey={[fieldKey, 'appointPodFaces']}
                            label={formatMessage({ id: 'app.pod.direction' })}
                          >
                            <Checkbox.Group
                              options={[
                                { label: formatMessage({ id: 'app.pod.side.A' }), value: 'A' },
                                { label: formatMessage({ id: 'app.pod.side.C' }), value: 'C' },
                              ]}
                            />
                          </Form.Item>
                        </>
                      )}

                      <Form.Item
                        {...restField}
                        name={[name, 'taskGenerateIntervalMill']}
                        fieldKey={[fieldKey, 'taskGenerateIntervalMill']}
                        initialValue={3}
                        label={formatMessage({ id: 'app.simulateTask.generateInterval' })}
                      >
                        <InputNumber addonAfter={'s'} />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button
                        type="danger"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Col>
                  </Row>
                ))}
                <Form.Item style={{ marginLeft: 40 }}>
                  <Button block type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    <FormattedMessage id="app.button.add" />
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </div>
    </Modal>
  );
};
export default memo(SimulationTaskComponent);
