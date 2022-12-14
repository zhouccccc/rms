import React, { memo } from 'react';
import { Collapse, Switch, Tag } from 'antd';
import { connect } from '@/utils/RmsDva';
import { formatMessage } from '@/utils/util';
import FormattedMessage from '@/components/FormattedMessage';
import { MonitorSelectableSpriteType } from '@/config/consts';
import { getCurrentLogicAreaData } from '@/utils/mapUtil';
import commonStyles from '@/common.module.less';

const { Panel } = Collapse;
const { Vehicle, LatentPod, ToteRack, WorkStation, Station, Charger, Delivery } =
  MonitorSelectableSpriteType;

const MonitorSelectionPanel = (props) => {
  const { dispatch, height, selections, selectableType } = props;
  const { allVehicles, latentPod } = props;
  const currentLogic = getCurrentLogicAreaData('monitor');

  function filterSelectable(event, type) {
    event.stopPropagation();
    dispatch({ type: 'monitor/updateSelectableType', payload: type });
  }

  function renderExtra(key) {
    return (
      <Switch
        checkedChildren={<FormattedMessage id={'monitor.select.enable'} />}
        unCheckedChildren={<FormattedMessage id={'monitor.select.disable'} />}
        checked={selectableType.includes(key)}
        onChange={(checked, event) => {
          filterSelectable(event, key);
        }}
      />
    );
  }

  function renderHeader(type) {
    switch (type) {
      case 'Vehicle': {
        const selected = selections.filter((item) => item.type === Vehicle);
        return `${formatMessage({ id: 'app.vehicle' })} ${selected.length}/${allVehicles.length}`;
      }
      case LatentPod: {
        const selected = selections.filter((item) => item.type === LatentPod);
        return `${formatMessage({ id: 'app.pod' })} ${selected.length}/${latentPod.length}`;
      }
      case ToteRack: {
        const selected = selections.filter((item) => item.type === ToteRack);
        return `${formatMessage({ id: 'app.map.tote' })} ${selected.length}/0`;
      }
      case Station: {
        const selected = selections.filter((item) => item.type === Station);
        return `${formatMessage({ id: 'app.map.station' })} ${selected.length}/${
          currentLogic.commonList?.length || 0
        }`;
      }
      case WorkStation: {
        const selected = selections.filter((item) => item.type === WorkStation);
        return `${formatMessage({ id: 'app.map.workStation' })} ${selected.length}/${
          currentLogic.workstationList?.length || 0
        }`;
      }
      case Charger: {
        const selected = selections.filter((item) => item.type === Charger);
        return `${formatMessage({ id: 'app.map.charger' })} ${selected.length}/${
          currentLogic.chargerList?.length || 0
        }`;
      }
      case Delivery: {
        const selected = selections.filter((item) => item.type === Delivery);
        return `${formatMessage({ id: 'app.map.delivery' })} ${selected.length}/${
          currentLogic.dumpStations?.length || 0
        }`;
      }
      default:
        return null;
    }
  }

  function renderList(type) {
    if (type === 'Vehicle') {
      const selected = selections.filter((item) => item.type === Vehicle);
      return selected.map((item, index) => <Tag key={index}>{item.id}</Tag>);
    } else {
      const selected = selections.filter((item) => item.type === type);
      return selected.map((item, index) => <Tag key={index}>{item.id || item.name}</Tag>);
    }
  }

  return (
    <div style={{ height, width: 280, right: 65 }} className={commonStyles.categoryPanel}>
      <div>
        <FormattedMessage id={'editor.tools.selections'} />
      </div>
      <div>
        <Collapse accordion>
          <Panel key="Vehicle" header={renderHeader('Vehicle')} extra={renderExtra('Vehicle')}>
            {renderList('Vehicle')}
          </Panel>
          <Panel key={LatentPod} header={renderHeader(LatentPod)} extra={renderExtra(LatentPod)}>
            {renderList(LatentPod)}
          </Panel>
          <Panel key={ToteRack} header={renderHeader(ToteRack)} extra={renderExtra(ToteRack)}>
            {renderList(ToteRack)}
          </Panel>
          <Panel key={Station} header={renderHeader(Station)} extra={renderExtra(Station)}>
            {renderList(Station)}
          </Panel>
          <Panel
            key={WorkStation}
            header={renderHeader(WorkStation)}
            extra={renderExtra(WorkStation)}
          >
            {renderList(WorkStation)}
          </Panel>
          <Panel key={Charger} header={renderHeader(Charger)} extra={renderExtra(Charger)}>
            {renderList(Charger)}
          </Panel>
          <Panel key={Delivery} header={renderHeader(Delivery)} extra={renderExtra(Delivery)}>
            {renderList(Delivery)}
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};
export default connect(({ monitor }) => {
  const {
    allVehicles,
    selections,
    selectableType,
    monitorLoad: { latentPod },
  } = monitor;
  return { allVehicles, latentPod: latentPod ?? [], selections, selectableType };
})(memo(MonitorSelectionPanel));
