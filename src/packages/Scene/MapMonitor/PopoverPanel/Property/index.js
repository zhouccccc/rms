import React, { memo } from 'react';
import { connect } from '@/utils/RmsDva';
import { isNull } from '@/utils/util';
import { MapSelectableSpriteType, MonitorSelectableSpriteType } from '@/config/consts';
import WorkStationProperty from './WorkStationProperty';
import CommonStationProperty from './CommonStationProperty';
import VehicleElementProp from './VehicleProperty';
import ChargeProperty from './ChargeProperty';
import EStopProperty from './EmergencyStopProperty';
import commonStyle from '@/common.module.less';

const Property = (props) => {
  const { height, selection } = props;

  function renderContent() {
    if (!isNull(selection)) {
      const { type } = selection;
      switch (type) {
        case MapSelectableSpriteType.WORKSTATION:
          return <WorkStationProperty data={selection} />;
        case MapSelectableSpriteType.EMERGENCYSTOP:
          return <EStopProperty data={selection} />;
        case MapSelectableSpriteType.STATION:
          return <CommonStationProperty data={selection} />;
        case MonitorSelectableSpriteType.Vehicle:
          return <VehicleElementProp data={selection} />;
        case MapSelectableSpriteType.CHARGER:
          return <ChargeProperty data={selection} />;
        default:
          return null;
      }
    } else {
      return null;
    }
  }

  return (
    <div style={{ height, width: 250, right: 65 }} className={commonStyle.categoryPanel}>
      {renderContent()}
    </div>
  );
};
export default connect(({ monitor }) => ({
  selection: monitor.selections[0],
  checkingElement: monitor.checkingElement,
}))(memo(Property));
