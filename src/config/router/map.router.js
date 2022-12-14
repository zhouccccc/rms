import { AppCode } from '@/config/config';

export default [
  {
    path: `/${AppCode.Map}/map/editor`,
    name: 'editor',
    icon: 'editor',
    component: '/Scene/MapEditor/index',
    authority: ['ADMIN', 'SUPERMANAGER'],
  },
  {
    path: `/${AppCode.Map}/map/monitor`,
    name: 'monitor',
    icon: 'monitor',
    component: '/Scene/MapMonitor/index',
    authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
  },
  // {
  //   path: `/${AppCode.Scene}/map/recorder`,
  //   name: 'recorder',
  //   component: '/Scene/MapRecorder/index',
  //   authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
  // },
  // {
  //   path: `/${AppCode.Scene}/customDashboard`,
  //   name: 'customDashboard',
  //   icon: 'screenReport',
  //   component: '/Scene/CustomDashboard/index',
  //   authority: ['ADMIN', 'SUPERMANAGER', 'MANAGER'],
  // },
];
