import { AGVType, AppCode } from '@/config/config';

export const AllAGVTypes = [
  {
    name: 'app.monitor.modal.AGV.latent',
    value: 0,
    key: AppCode.LatentLifting,
    standardName: AGVType.LatentLifting,
  },
  {
    name: 'app.monitor.modal.AGV.tote',
    value: 1,
    key: AppCode.Tote,
    standardName: AGVType.Tote,
  },
  {
    name: 'app.monitor.modal.AGV.fork',
    value: 2,
    key: AppCode.ForkLifting,
    standardName: AGVType.ForkLifting,
  },
  {
    name: 'app.monitor.modal.AGV.sorter',
    value: 3,
    key: AppCode.Sorter,
    standardName: AGVType.Sorter,
  },
];

export const LatentOperation = [
  {
    name: 'app.monitorOperation.emptyRun',
    key: 'emptyRun',
    auth: '/map/monitor/action/latent/emptyRun',
  },
  {
    name: 'app.monitorOperation.setupPod',
    key: 'setupPod',
    auth: '/map/monitor/action/latent/setupPod',
  },
  {
    name: 'app.monitorOperation.toRestArea',
    key: 'toRestArea',
    auth: '/map/monitor/action/latent/toRestArea',
  },
  {
    name: 'app.monitorOperation.charger',
    key: 'charger',
    auth: '/map/monitor/action/latent/charger',
  },
  {
    name: 'app.monitorOperation.command',
    key: 'command',
    auth: '/map/monitor/action/latent/command',
  },
  {
    name: 'app.monitorOperation.handlingRack',
    key: 'handlingRack',
    auth: '/map/monitor/action/latent/handlingRack',
  },
  {
    name: 'app.monitorOperation.advancedHandlingRack',
    key: 'advancedHandlingRack',
    auth: '/map/monitor/action/latent/advancedHandlingRack',
  },
  {
    name: 'app.monitorOperation.callRackToWorkstation',
    key: 'callRackToWorkstation',
    auth: '/map/monitor/action/latent/callRackToWorkstation',
  },
  {
    name: 'app.monitorOperation.autoLatentWorkstationTask',
    key: 'autoLatentWorkstationTask',
    auth: '/map/monitor/action/latent/autoLatentWorkstationTask',
  },
];

export const ToteOperation = [
  {
    name: 'app.monitorOperation.emptyRun',
    key: 'emptyRun',
    auth: '/map/monitor/action/tote/emptyRun',
  },
  {
    name: 'app.monitorOperation.toRestArea',
    key: 'toRestArea',
    auth: '/map/monitor/action/tote/toRestArea',
  },
  {
    name: 'app.monitorOperation.charger',
    key: 'charger',
    auth: '/map/monitor/action/tote/charger',
  },
  {
    name: 'app.monitorOperation.command',
    key: 'command',
    auth: '/map/monitor/action/tote/command',
  },
  {
    name: 'app.monitorOperation.toteWorkstationTask',
    key: 'toteWorkstationTask',
    auth: '/map/monitor/action/tote/toteWorkstationTask',
  },
  {
    name: 'app.monitorOperation.autoToteWorkstationTask',
    key: 'autoToteWorkstationTask',
    auth: '/map/monitor/action/tote/autoToteWorkstationTask',
  },
];

export const ForkOperation = [
  {
    name: 'app.monitorOperation.emptyRun',
    key: 'emptyRun',
    auth: '/map/monitor/action/forklift/emptyRun',
  },
  {
    name: 'app.monitorOperation.toRestArea',
    key: 'toRestArea',
    auth: '/map/monitor/action/forklift/toRestArea',
  },
  {
    name: 'app.monitorOperation.charger',
    key: 'charger',
    auth: '/map/monitor/action/forklift/charger',
  },
  {
    name: 'app.monitorOperation.carryPod',
    key: 'forkPickPodTask',
    auth: '/map/monitor/action/forklift/carryPod',
  },
  {
    name: 'app.monitorOperation.command',
    key: 'command',
    auth: '/map/monitor/action/forklift/command',
  },
  {
    name: 'app.monitorOperation.autoForkLiftWorkstationTask',
    key: 'autoForkLiftWorkstationTask',
    auth: '/map/monitor/action/forklift/autoForkLiftWorkstationTask',
  },
];

export const SorterOperation = [
  {
    name: 'app.monitorOperation.emptyRun',
    key: 'emptyRun',
    auth: '/map/monitor/action/sorter/emptyRun',
  },
  {
    name: 'app.monitorOperation.charger',
    key: 'charger',
    auth: '/map/monitor/action/sorter/charger',
  },
  {
    name: 'app.monitorOperation.toRestArea',
    key: 'toRestArea',
    auth: '/map/monitor/action/sorter/toRestArea',
  },
  {
    name: 'app.monitorOperation.pick',
    key: 'sorterPick',
    auth: '/map/monitor/action/sorter/pick',
  },
  {
    name: 'app.monitorOperation.throw',
    key: 'sorterThrow',
    auth: '/map/monitor/action/sorter/throw',
  },
];

export const AGVSubTypeMap = {
  LatentLifting: [
    {
      label: 'app.simulator.form.label.normal',
      value: 'Normal',
    },
    {
      label: 'app.simulator.form.label.infrared',
      value: 'Infrared',
    },
    {
      label: 'app.simulator.form.label.frock',
      value: 'Frock',
    },
    {
      label: 'app.simulator.form.label.tote',
      value: 'Tote',
    },
  ],
  Tote: [
    {
      label: 'app.simulator.form.label.normal',
      value: 'Normal',
    },
    {
      label: 'app.simulator.form.label.infrared',
      value: 'Infrared',
    },
  ],
};