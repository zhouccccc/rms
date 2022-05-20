import intl from 'react-intl-universal';
import { dealResponse, isStrictNull, extractNameSpaceInfoFromEnvs } from '@/utils/util';
import { AppCode } from '@/config/config';
import requestAPI from '@/utils/requestAPI';
import { getTranslationByCode } from '@/services/translator';
import { fetchAllEnvironmentList } from '@/services/SSO';
import { getSystemLanguage } from '@/packages/Strategy/LanguageManage/translateUtils';
import { find } from 'lodash';
import { mockData } from '@/packages/SSO/CustomMenuManager/components/mockData';

export async function initI18nInstance() {
  const language = getLanguage();
  const systemLanguage = await getSystemLanguage();
  window.$$dispatch({ type: 'global/saveSystemLanguage', payload: systemLanguage });

  // 1. 读取本地国际化数据
  const locales = {};
  try {
    locales[language] = require(`@/locales/${language}`).default;
  } catch (e) {
    locales[language] = {};
  }

  // 2. 拉取远程国际化数据并进行merge操作 --> 远程覆盖本地
  const i18nData = await getTranslationByCode('FE');
  if (!dealResponse(i18nData, false, false) && Array.isArray(i18nData?.Custom)) {
    const { Custom } = i18nData;
    Custom.forEach(({ languageKey, languageMap }) => {
      locales[language][languageKey] = languageMap[language];
    });

    //  远程覆盖本地
    await intl.init({ currentLocale: language, locales });
  } else {
    // 用本地国际化数据先初始化
    console.warn('Failed to fetch remote I18N Data, will use local I18n Data');
    await intl.init({ currentLocale: language, locales });
  }
  return true;
}

export function handleNameSpace(dispatch) {
  return new Promise(async (resolve, reject) => {
    // 获取所有环境配置信息
    try {
      let urlDir = { ...requestAPI() }; // 所有的url链接地址信息
      let allEnvironment = await fetchAllEnvironmentList();
      if (dealResponse(allEnvironment, null, false)) {
        allEnvironment = [];
      } else {
        dispatch({ type: 'global/saveAllEnvironments', payload: allEnvironment });
      }

      // 获取NameSpace数据 & 并整合运维配置
      if (allEnvironment.length > 0) {
        const activeNameSpace = allEnvironment.filter(({ flag }) => flag === '1');
        if (activeNameSpace.length > 0) {
          // 若自定义环境出现两个已激活项目, 将默认启用第一项
          urlDir = {
            ...urlDir,
            ...extractNameSpaceInfoFromEnvs(activeNameSpace[0]),
          };
        }
      }

      // 合并本地自定义的SSO配置
      const envs = getLocalStorageEnv();
      urlDir = { ...urlDir, ...envs };
      window.nameSpacesInfo = urlDir;
      resolve();
    } catch (e) {
      reject();
    }
  });
}

export function getLocalStorageEnv() {
  let result = {};
  const sso = window.localStorage.getItem('sso');
  if (!isStrictNull(sso)) {
    result.sso = sso;
  }
  return result;
}

export function sortAppList(appList) {
  //资源管理在最上, I18N,SSO 排在最后
  let list = appList.filter(
    (item) => ![AppCode.ResourceManage, AppCode.SSO, AppCode.I18N].includes(item),
  );
  if (appList.includes(AppCode.ResourceManage)) {
    list.unshift(AppCode.ResourceManage);
  }
  if (appList.includes(AppCode.I18N)) {
    list.push(AppCode.I18N);
  }
  list.push(AppCode.SSO);
  return list;
}

export function generateRouteLocaleKeyMap(data, result, parentName) {
  if (Array.isArray(data)) {
    data.forEach((record) => {
      const { path, routes, name, customNode } = record;
      if (Array.isArray(routes)) {
        generateRouteLocaleKeyMap(routes, result, `${parentName}.${name}`);
      } else {
        if (customNode) {
          result[path] = `${name}`;
        } else {
          result[path] = parentName ? `${parentName}.${name}` : `${name}`;
        }
      }
    });
  }
}

export function generateMenuNodeLocaleKey(data = [], parentName) {
  return data
    .map((item) => {
      if (!item.name) {
        return null;
      }

      let locale;
      if (item.customNode) {
        locale = item.name;
      } else {
        if (!isStrictNull(parentName)) {
          locale = `${parentName}.${item.name}`;
        } else {
          locale = `menu.${item.name}`;
        }
      }

      const result = { ...item, locale };
      if (item.routes) {
        result.routes = generateMenuNodeLocaleKey(item.routes, locale);
      }
      return result;
    })
    .filter(Boolean);
}

export function filterMenuData(menuData) {
  if (!menuData) {
    return [];
  }
  return menuData.filter((item) => item.name && !item.hideInMenu).map((item) => getSubMenu(item));
}

export function getSubMenu(item) {
  if (item.routes && !item.hideInMenu && item.routes.some((child) => child.name)) {
    return { ...item, routes: filterMenuData(item.routes) };
  }
  return item;
}

export function checkPermission(router, permissionMap, appCode) {
  const result = [];
  for (let i = 0; i < router.length; i++) {
    const routerElement = router[i];
    const { path, hooks, routes } = routerElement;
    if (path && appCode !== AppCode.SSO) {
      // 如果父节点无法验证通过就直接跳过该节点的所有子节点
      if (Array.isArray(hooks)) {
        if (!validateHookPermission(hooks)) {
          continue;
        }
      } else {
        if (!permissionMap[path]) {
          continue;
        }
      }
    }

    if (routes != null) {
      const grantedRoutes = checkPermission(routes, permissionMap, appCode);
      result.push({ ...routerElement, routes: grantedRoutes });
    } else {
      result.push(routerElement);
    }
  }
  return result;
}

export function convertToRoute(data, baseContext) {
  return data
    .map((item) => {
      const result = {};
      result.path = `${baseContext}${item.key}`;
      result.icon = item.icon;
      result.name = item.name || item.label;
      result.hideInMenu = item.hideInMenu;
      if (item.routes) {
        result.routes = convertToRoute(item.routes, baseContext);
      }
      return result;
    })
    .filter(Boolean);
}

export function convertAllMenu(adminType, allModuleMenuData, permissionMap) {
  const routeLocaleKeyMap = { '/': 'menu.home' };
  // 1. 根据菜单的hook和authority字段进行第一次权限筛选
  const allRoutes = Object.keys(allModuleMenuData).map((appCode) => {
    let appMenu = allModuleMenuData[appCode];

    // 处理自定义的菜单 start
    appMenu = getNewMenuDataByMergeCustomNodes([...appMenu], mockData, appCode);
    // end

    // 如果是SSO, 需要根据adminType对菜单数据进行筛选
    if (appCode === AppCode.SSO) {
      appMenu = appMenu.filter((route) => {
        // 权限控制基于 authority 和 hooks，且hooks优先
        if (Array.isArray(route.hooks)) {
          return validateHookPermission(route.hooks);
        }
        if (Array.isArray(route.authority)) {
          return route.authority.includes(adminType);
        }
        return false;
      });
    }
    // 组装多标签Label Map -- {路由History: 路由名称国际化Key}
    generateRouteLocaleKeyMap(appMenu, routeLocaleKeyMap, 'menu');
    return { appMenu, appCode };
  });

  // 2. 将一般路由数据转换成最终路由数据, 包括格式化、权限等等
  const allModuleFormattedMenuData = allRoutes.map((appRoute) => {
    const { appMenu, appCode } = appRoute;
    // 菜单项权限根据 AuthKey 再一次筛选
    const grantedMenu = checkPermission(appMenu, permissionMap, appCode);
    // 获取菜单节点名称的国际化key
    const menu = generateMenuNodeLocaleKey(grantedMenu);
    return { appCode, menu };
  });
  return { allModuleFormattedMenuData, routeLocaleKeyMap };
}

export function getLanguage() {
  const cachedLocale = window.localStorage.getItem('currentLocale');
  const browserLocale = navigator.language;
  return cachedLocale || browserLocale;
}

export function validateHookPermission(hook) {
  if (isStrictNull(hook) || !Array.isArray(hook)) {
    return false;
  }
  for (let index = 0; index < hook.length; index++) {
    if (window.localStorage.getItem(hook[index]) === 'true') {
      return true;
    }
  }
  return false;
}

export function validateRouteAuthority(record, adminType) {
  return Array.isArray(record?.authority) && record.authority.includes(adminType);
}

/*
 *自定义的节点菜单与现有菜单合并
 *@params {*} appMenu 前端本地的菜单
 *@params {*} mockData 自定义的菜单节点
 *@params {*} filterCustom  当前的appCode
 */
export function getNewMenuDataByMergeCustomNodes(appMenu, mockData, appCode) {
  // 处理自定义的菜单 start
  const startsBase = '@@_';
  const primaryNodes = mockData.filter(({ parentPath }) => parentPath.startsWith(startsBase));

  let newAppMenu = [...appMenu];
  primaryNodes?.map((primaryNode) => {
    const newPath = primaryNode.parentPath.replace(startsBase, '');
    if (appCode === newPath) {
      newAppMenu.push({
        ...primaryNode,
        path: `/${newPath}/${primaryNode.key}`,
        component: primaryNode.url,
        customNode: true, // 标志自定义
      });
    }
  });

  const filterCustom = mockData?.filter((data) => data.appCode === appCode);
  newAppMenu = generateAllMenuData(newAppMenu, filterCustom);
  return newAppMenu;
  // end
}

// 把自定义的节点 添加到对应的routes
export function generateAllMenuData(currentMenuData, filterData = []) {
  return currentMenuData
    ?.map((item) => {
      const result = { ...item };
      const findObj = find(filterData, { parentPath: item.path });

      if (findObj && Object.keys(findObj).length > 0) {
        const itemRoutes = [...item.routes];
        itemRoutes.push({
          ...findObj,
          path: `${findObj.parentPath}/${findObj.key}`,
          component: findObj.url,
          customNode: true, // 标志自定义
        });
        result.routes = [...itemRoutes];
      } else {
        if (item.routes) {
          result.routes = generateAllMenuData(item.routes, filterData);
        }
      }
      return result;
    })
    .filter(Boolean);
}
