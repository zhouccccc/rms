import menu from './zh-CN/menu';
import task from './zh-CN/task';
import global from './zh-CN/global';
import common from './zh-CN/common';
import agvList from './zh-CN/agvList';
import request from './zh-CN/request';
import collection from './zh-CN/collection';
import agvRealTime from './zh-CN/agvRealTime';
import chargingStrategy from './zh-CN/chargingStrategy';
import systemParameters from './zh-CN/systemParameters';
import reportCenter from './zh-CN/reportCenter';
import translator from './zh-CN/Translator/translator';
import portal from './zh-CN/Portal/portal';
import userManager from './zh-CN/SSO/userManager';
import sectionManager from './zh-CN/SSO/sectionManager';
import userLoginHistory from './zh-CN/SSO/userHistory';
import accountCenter from './zh-CN/SSO/accountCenter';
import roleManager from './zh-CN/SSO/roleManager';
import environmentManager from './zh-CN/SSO/environmentManager';
import authorizationCenter from './zh-CN/SSO/authorizationCenter';
import customConfiguration from './zh-CN/SSO/customConfiguration';
import latentLiftingReport from './zh-CN/LatentLifting/report';
import customTasks from './zh-CN/XIHE/customTasks';
import operationLog from './zh-CN/XIHE/operationlog';
import charging from './zh-CN/XIHE/charging';
import webHook from './zh-CN/XIHE/webHook';
import lockManage from './zh-CN/XIHE/lockManage';
import mapEditor from './zh-CN/XIHE/editor';
import mapMonitor from './zh-CN/XIHE/monitor';
import notification from './zh-CN/XIHE/notification';
import sourcemanage from './zh-CN/XIHE/sourcemanage';

export default {
  ...menu,
  ...task,
  ...global,
  ...common,
  ...collection,
  ...agvList,
  ...request,
  ...agvRealTime,
  ...chargingStrategy,
  ...systemParameters,
  ...reportCenter,
  ...translator,
  ...portal,
  ...userManager,
  ...sectionManager,
  ...userLoginHistory,
  ...accountCenter,
  ...roleManager,
  ...environmentManager,
  ...authorizationCenter,
  ...customConfiguration,
  ...latentLiftingReport,
  ...customTasks,
  ...operationLog,
  ...charging,
  ...webHook,
  ...lockManage,
  ...mapEditor,
  ...mapMonitor,
  ...notification,
  ...sourcemanage,
};
