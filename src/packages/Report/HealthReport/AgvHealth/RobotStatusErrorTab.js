import React, { memo } from 'react';
import { formatMessage } from '@/utils/util';
import OfflineOrStatusErrorComponent from './components/OfflineOrStatusErrorComponent';

const AgvErrorComponent = (props) => {
  const { originData, keyDataMap, activeTab } = props;
  return (
    <>
      <OfflineOrStatusErrorComponent
        codeDomId="statusErrorHealthByAgvIdHistory"
        chartTitle={formatMessage({ id: 'reportCenter.agv.error' })}
        chartSubTitle={formatMessage({ id: 'reportCenter.way.agv' })}
        dateDomId="statusErrorHealthBydateHistory"
        originData={originData}
        keyData={keyDataMap}
        activeTab={activeTab}
      />
    </>
  );
};
export default memo(AgvErrorComponent);