import React, { memo } from 'react';
import { connect } from '@/utils/RmsDva';
import EmptyRun from './EmptyRun';
import Charging from './Charging';
import ToRest from './ToRest';
import CarryPod from './CarryPod';
import AdvancedCarry from './AdcancedCarry';
import LatentWorkStationTask from './LatentWorkStationTask';
import AutomaticLatentWorkstationTask from './AutomaticLatentWorkstationTask';
import AutomaticToteWorkstationTask from './AutomaticToteWorkstationTask';
import RemoteControl from './RemoteControl';
import CustomComponent from './CustomComponent';
import Parabolic from './Parabolic';
import PickCargo from './PickCargo';
import PathLock from './PathLock';
import MapShowComponet from './MapShowComponent';

const MonitorModals = (props) => {
  const { categoryModal, categoryPanel } = props;
  return (
    <>
      {categoryModal === 'emptyRun' && <EmptyRun />}
      {categoryModal === 'charge' && <Charging />}
      {categoryModal === 'goRest' && <ToRest />}
      {categoryModal === 'carry' && <CarryPod />}
      {categoryModal === 'advancedCarry' && <AdvancedCarry />}
      {categoryModal === 'workStationTask' && categoryPanel === 'LatentAGV' && (
        <LatentWorkStationTask />
      )}
      {categoryModal === 'autoCall' && categoryPanel === 'LatentAGV' && (
        <AutomaticLatentWorkstationTask />
      )}
      {categoryModal === 'workStationTask' && categoryPanel === 'ToteAGV' && (
        <AutomaticToteWorkstationTask />
      )}
      {categoryModal === 'remoteControl' && <RemoteControl />}
      {categoryModal === 'custom' && <CustomComponent category={categoryPanel} />}
      {categoryModal === 'dumpCargo' && <Parabolic />}
      {categoryModal === 'pickCargo' && <PickCargo />}
      {categoryModal === 'pathLock' && <PathLock />}
      {categoryModal === 'mapShow' && <MapShowComponet />}
    </>
  );
};
export default connect(({ monitor }) => ({
  categoryModal: monitor.categoryModal,
  categoryPanel: monitor.categoryPanel,
}))(memo(MonitorModals));
