import React, { PureComponent } from 'react';
import { Row, Col, Pagination } from 'antd';
import { formatMessage } from '@/utils/utils';
import ErrorList from '@/components/TaskDetail/components/ErrorList';

class ErrorRecordTab extends PureComponent {
  render() {
    const { data, allErrorDefinitions = {}, onDetail } = this.props;
    return (
      <div>
        <Col span={24} style={{ minHeight: 550, marginTop: 15 }}>
          <Row>
            {data ? (
              <ErrorList
                onDetail={onDetail}
                agvErrorList={data.list}
                errorCodes={allErrorDefinitions}
              />
            ) : null}
          </Row>

          <div style={{ position: 'absolute', bottom: 0, right: 10 }}>
            <Pagination
              pageSize={3}
              current={data && data.page ? data.page.currentPage : 0}
              total={data && data.page ? data.page.totalElements : 0}
              showTotal={(total) =>
                formatMessage({ id: 'app.common.tableRecord' }, { count: total })
              }
              showSizeChanger={false}
              onChange={(current) => {
                let params = {
                  current: current,
                  size: 3,
                };
                const { pageOnchange } = this.props;
                if (pageOnchange) {
                  pageOnchange(params);
                }
              }}
            />
          </div>
        </Col>
      </div>
    );
  }
}

export default ErrorRecordTab;