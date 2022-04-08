import { AppCode } from '@/config/config';

export default [
  {
    path: `/${AppCode.LatentTote}/latentToteTaskManagement`,
    name: 'latentToteTaskManagement',
    icon: 'taskExecuted',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/LatentTote/LantentToteTaskManagement',
  },
  {
    path: `/${AppCode.LatentTote}/simulationTask`,
    name: 'mockTask',
    icon: 'mockTask',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/LatentTote/SimulationTask/SimulationTask',
  },

  {
    path: '/pod',
    name: 'pod',
    icon: 'pod',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    hooks: ['dev'],
    routes: [
      {
        path: `/${AppCode.LatentTote}/podManagement`,
        name: 'podManagement',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        component: '/LatentTote/PodManagement',
        hooks: ['dev'],
      },
    ],
  },

  {
    path: `/${AppCode.LatentTote}/ScoringAlgorithm`,
    icon: 'scoringAlgorithm',
    name: 'scoringAlgorithm',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    component: '/LatentTote/ScoringAlgorithm',
  },
  {
    path: `/${AppCode.LatentTote}/latentToteStation`,
    name: 'latentToteStation',
    icon: 'home',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
    routes: [
      {
        path: `/${AppCode.LatentTote}/latentToteStation/stationList`,
        name: 'stationList',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        component: '/LatentTote/Station/StationList',
      },
      {
        path: `/${AppCode.LatentTote}/latentToteStation/stationFaultManage`,
        name: 'stationFaultManage',
        authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
        component: '/LatentTote/Station/StationFaultManage',
      },
    ],
  },
];
