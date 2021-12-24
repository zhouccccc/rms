import React, { PureComponent } from 'react';
import { Form, InputNumber, Button } from 'antd';
import { connect } from '@/utils/dva';
import { dealResponse, GMT2UserTimeZone, formatMessage } from '@/utils/utils';
import { fetchForkLiftAutoCall } from '@/services/monitor';

const layout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };
const noLabelLayout = { wrapperCol: { span: 16, offset: 6 } };

@connect(({ monitor }) => ({ monitor }))
class ForkLiftAutomaticWorkstationTask extends PureComponent {
  formRef = React.createRef();

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'monitor/fetchAutomaticForkLiftWorkstationTaskStatus',
    });
  };

  updateAutoCallPodToWorkstation = () => {
    const {
      monitor: { automaticForkLiftWorkstationTaskStatus },
    } = this.props;
    const { validateFields } = this.formRef.current;
    if (automaticForkLiftWorkstationTaskStatus.isAutoCall) {
      const params = { isAutoCall: false };
      fetchForkLiftAutoCall(params).then((res) => {
        if (
          !dealResponse(
            res,
            true,
            formatMessage({
              id: 'app.monitorOperation.automaticToteWorkstationTask.fetchAutoCallClose',
            }),
          )
        ) {
          this.getData();
          return false;
        }
      });
    } else {
      validateFields().then((value) => {
        const { maxTaskNum, maxHeight } = value;
        const params = { maxTaskNum, maxHeight, isAutoCall: true };
        fetchForkLiftAutoCall(params).then((res) => {
          if (
            !dealResponse(
              res,
              true,
              formatMessage({
                id: 'app.monitorOperation.automaticToteWorkstationTask.fetchAutoCallOpen',
              }),
            )
          ) {
            this.getData();
          }
        });
      });
    }
  };

  render() {
    const {
      monitor: { automaticForkLiftWorkstationTaskStatus },
    } = this.props;
    const locale = window.localStorage.getItem('umi_locale') || 'zh-CN';
    return (
      <Form ref={this.formRef}>
        <Form.Item
          name={'maxTaskNum'}
          initialValue={automaticForkLiftWorkstationTaskStatus.maxTaskNum}
          label={formatMessage({
            id: 'app.monitorOperation.automaticLatentWorkStationTask.maxPodNum',
          })}
          {...layout}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          {...(locale === 'zh-CN'
            ? layout
            : {
                labelCol: { span: 9 },
                wrapperCol: { span: 15 },
              })}
          name={'maxHeight'}
          initialValue={automaticForkLiftWorkstationTaskStatus.maxHeight || -1}
          getValueFromEvent={(val) => {
            const { getFieldValue } = this.formRef.current;
            const value = parseInt(val, 10); // 当前值
            const exValue = getFieldValue('maxHeight'); // 前一个值
            if (value < -1) {
              return -1;
            }
            if (exValue === -1 && value === 0) {
              return 1;
            }
            if (exValue === 1 && value === 0) {
              return -1;
            }
            return value;
          }}
          label={formatMessage({
            id: 'app.monitorOperation.automaticForkLiftWorkstationTask.maxHeight',
          })}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item {...noLabelLayout}>
          <Button
            type={automaticForkLiftWorkstationTaskStatus.isAutoCall ? 'danger' : 'primary'}
            onClick={this.updateAutoCallPodToWorkstation}
          >
            {automaticForkLiftWorkstationTaskStatus.isAutoCall
              ? formatMessage({
                  id: 'app.monitorOperation.automaticToteWorkstationTask.cancelFetchAutoCall',
                })
              : formatMessage({
                  id: 'app.monitorOperation.automaticToteWorkstationTask.fetchAutoCall',
                })}
          </Button>
        </Form.Item>

        <Form.Item
          {...layout}
          label={formatMessage({
            id: 'app.monitorOperation.automaticToteWorkstationTask.lastOperator',
          })}
        >
          {automaticForkLiftWorkstationTaskStatus.updatedByUser}
        </Form.Item>
        <Form.Item
          {...layout}
          label={formatMessage({
            id: 'app.monitorOperation.automaticToteWorkstationTask.lastOperateDate',
          })}
        >
          {GMT2UserTimeZone(automaticForkLiftWorkstationTaskStatus.updateTime).format(
            'YYYY-MM-DD HH:mm',
          )}
        </Form.Item>
      </Form>
    );
  }
}
export default ForkLiftAutomaticWorkstationTask;