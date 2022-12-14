import React, { memo, useState } from 'react';
import ReportGroupList from './components/ReportGroupList';
import ReportGroup from '@/pages/ReportCenter/components/ReportGroupDetail';

const ReportCenterComponent = (props) => {
  const { vehicleType } = props;
  const [view, setView] = useState(0);
  const [reportGroup, setReportGroup] = useState(null);

  return (
    <div style={{ height: '100%' }}>
      {view === 0 && (
        <ReportGroupList
          vehicleType={vehicleType}
          gotoDetail={(record) => {
            setView(1);
            setReportGroup(record);
          }}
        />
      )}
      {view === 1 && (
        <ReportGroup
          data={reportGroup}
          vehicleType={vehicleType}
          gotoList={() => {
            setView(0);
            setReportGroup(null);
          }}
        />
      )}
    </div>
  );
};
export default memo(ReportCenterComponent);
