import React, { memo, useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Form, Row, Col, Button, InputNumber, Checkbox, TimePicker, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { formatMessage, isStrictNull } from '@/utils/util';
import FormattedMessage from '@/components/FormattedMessage';
import { saveIdleHoursStrategy, fetchIdleHourChargeStrategy } from '@/services/resourceManageAPI';
import styles from './idleChargingStrategy.module.less';
import { dealResponse } from '@/utils/util';

const tailFormItemLayout = { wrapperCol: { offset: 1, span: 23 } };
const { RangePicker } = TimePicker;
const Days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const IdleChargingStrategy = (props) => {
  const { onCancel, data } = props;

  const [form] = Form.useForm();
  const [pastMinuts, setPastMinuts] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [useVehicleStandByPercent, setUseVehicleStandByPercent] = useState(false); // 第一条策略
  const [useIdleHours, setUseIdleHours] = useState(false); // 第二条策略
  const [id, setId] = useState(false);

  useEffect(() => {
    if (!isStrictNull(data) && data?.id) {
      fetchIdleHourChargeStrategy({ Id: data.id }).then((response) => {
        if (!dealResponse(response)) {
          const { idleHoursQuantumDTOS } = response;
          setPastMinuts(response.vehicleStandbyMinute);
          setPercentage(response.vehicleStandbyPercent);
          setUseVehicleStandByPercent(response.useVehicleStandByPercent);
          setUseIdleHours(response.useIdleHours);
          setId(response.id);

          const fieldsValue = idleHoursQuantumDTOS?.map(({ startTime, endTime, weeks }) => {
            return {
              weeks,
              time: [startTime && moment(startTime, 'HH:mm'), endTime && moment(endTime, 'HH:mm')],
            };
          });
          form.setFieldsValue({ idleHoursQuantumDTOS: fieldsValue || [] });
        }
      });
    }
  }, []);

  function submit() {
    form.validateFields().then((values) => {
      const { idleHoursQuantumDTOS } = values;
      let result = null;
      if (idleHoursQuantumDTOS != null) {
        result = idleHoursQuantumDTOS.map((record) => {
          const { time, weeks } = record;
          const obj = { weeks };
          if (time != null) {
            obj.startTime = time[0] ? time[0].format('HH:mm') : null;
            obj.endTime = time[1] ? time[1].format('HH:mm') : null;
          }
          return obj;
        });
      }

      const requestBody = {
        id,
        chargeStrategyId: data?.id,
        sectionId: window.localStorage.getItem('sectionId'),
        idleHoursQuantumDTOS: result,
        vehicleStandbyMinute: pastMinuts,
        vehicleStandbyPercent: percentage,
        useVehicleStandByPercent,
        useIdleHours,
      };
      saveIdleHoursStrategy(requestBody).then((response) => {
        if (!dealResponse(response)) {
          message.success(formatMessage({ id: 'app.chargeStrategy.idle.save.success' }));
          onCancel();
        } else {
          message.error(formatMessage({ id: 'app.chargeStrategy.idle.save.failed' }));
        }
      });
    });
  }

  return (
    <Card bordered={false}>
      <div className={styles.strategyRow}>
        <div className={styles.checkBox}>
          <Checkbox
            checked={useVehicleStandByPercent}
            onChange={(ev) => {
              setUseVehicleStandByPercent(ev.target.checked);
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FormattedMessage id="app.chargeStrategy.past" />
          <InputNumber style={{ margin: '0 10px' }} value={pastMinuts} onChange={setPastMinuts} />
          <FormattedMessage id="app.chargeStrategy.minute" />{' '}
          <FormattedMessage id="app.chargeStrategy.percentageOfFreeVehicle" />
          <InputNumber style={{ margin: '0 10px' }} value={percentage} onChange={setPercentage} />%
        </div>
      </div>
      <div className={styles.strategyRow}>
        <div className={styles.checkBox} style={{ alignItems: 'flex-start' }}>
          <Checkbox
            checked={useIdleHours}
            onChange={(ev) => {
              setUseIdleHours(ev.target.checked);
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FormattedMessage id="app.chargeStrategy.idleTimeRangeTip" />
          <Form form={form}>
            <Form.List name={'idleHoursQuantumDTOS'}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Row
                      key={key}
                      style={{
                        border: '1px solid #e0dcdc',
                        padding: '25px 10px 0 0',
                        borderRadius: '5px',
                        marginBottom: '20px',
                      }}
                    >
                      <Col span={21}>
                        {/* 时间区间 */}
                        <Form.Item
                          {...tailFormItemLayout}
                          {...restField}
                          name={[name, 'time']}
                          fieldKey={[fieldKey, 'time']}
                        >
                          <RangePicker format={'HH:mm'} />
                        </Form.Item>

                        {/* 天 */}
                        <Form.Item
                          {...tailFormItemLayout}
                          {...restField}
                          name={[name, 'weeks']}
                          fieldKey={[fieldKey, 'weeks']}
                        >
                          <Checkbox.Group style={{ width: '100%', display: 'flex' }}>
                            {Days.map((item) => (
                              <Col key={item} span={3}>
                                <Checkbox value={item}>{item.slice(0, 3)}</Checkbox>
                              </Col>
                            ))}
                          </Checkbox.Group>
                        </Form.Item>
                      </Col>
                      <Col span={3} style={{ textAlign: 'center' }}>
                        <Button
                          type="danger"
                          icon={<PlusOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      <FormattedMessage id="app.button.add" />
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </div>
      </div>
      <div className={styles.buttons}>
        <Button onClick={onCancel}>
          <FormattedMessage id="app.button.cancel" />
        </Button>
        <Button type="primary" onClick={submit}>
          <FormattedMessage id="app.button.submit" />
        </Button>
      </div>
    </Card>
  );
};
export default memo(IdleChargingStrategy);
