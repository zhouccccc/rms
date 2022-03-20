import { AppCode } from '../config';

export default [
  {
    path: `/${AppCode.Report}/healthReport`,
    name: 'healthReport',
    icon: 'icon-reportForm',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    routes: [
      {
        path: `/${AppCode.Report}/healthReport/agv`,
        name: 'agv',
        component: '/Report/HealthReport/AgvHealth/index',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
      {
        path: `/${AppCode.Report}/healthReport/network`,
        name: 'network',
        component: '/Report/HealthReport/NetworkHealth',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
      {
        path: `/${AppCode.Report}/healthReport/qrcode`,
        name: 'qrcode',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        routes: [
          {
            path: `/${AppCode.Report}/healthReport/groundQrcodeHealth`,
            name: 'ground',
            component: '/Report/HealthReport/GroundQrcodeHealth',
          },
          {
            path: `/${AppCode.Report}/healthReport/latentPodQrcodeHealth`,
            name: 'latentPod',
            component: '/Report/HealthReport/LatentPodQrcodeHealth',
          },
          {
            path: `/${AppCode.Report}/healthReport/toteQrcodeHealth`,
            name: 'tote',
            component: '/Report/HealthReport/ToteQrcodeHealth',
          },
        ],
      },
      {
        path: `/${AppCode.Report}/healthReport/chargerHealth`,
        name: 'chargerHealth',
        component: '/Report/HealthReport/ChargerHealth',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
      {
        path: `/${AppCode.Report}/healthReport/automationHealth`,
        name: 'automationHealth',
        component: '/Report/HealthReport/AutomationHealth',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
    ],
  },
  {
    path: `/${AppCode.Report}/loadReport`,
    name: 'loadReport',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    hooks: ['dev'],
    routes: [
      {
        path: `/${AppCode.Report}/loadReport/agvLoad`,
        name: 'agvLoad',
        component: '/Report/LoadReport/AgvLoadReport',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        hooks: ['dev'],
      },
      {
        path: `/${AppCode.Report}/loadReport/taskLoad`,
        name: 'taskLoad',
        component: '/Report/LoadReport/TaskLoadReport',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        hooks: ['dev'],
      },

      {
        path: `/${AppCode.Report}/loadReport/containerLoad`,
        name: 'containerLoad',
        component: '/Report/LoadReport/ContainerLoadReport',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
      {
        path: `/${AppCode.Report}/loadReport/chargerLoad`,
        name: 'chargerLoad',
        component: '/Report/LoadReport/ChargerLoadReport',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
      },
    ],
  },

  {
    path: `/${AppCode.Report}/sourceDownload`,
    name: 'sourceDownload',
    icon: 'environment',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/SourceDownload',
  },
  {
    path: `/${AppCode.Report}/customReport`,
    name: 'customReport',
    icon: 'environment',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/CustomReport',
  },
  {
    path: `/${AppCode.Report}/taskReport`,
    name: 'taskReport',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/TaskReport/index',
  },
  {
    path: `/${AppCode.Report}/formManger/stationReport`,
    name: 'stationReport',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/StationReport/index',
  },
  {
    path: `/${AppCode.Report}/waitingReport`,
    name: 'waitingReport',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/WaitingReport/index',
  },
  {
    path: `/${AppCode.Report}/flowReport`,
    name: 'flowReport',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/Report/FlowReport',
  },
];