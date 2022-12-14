import React, { Component } from 'react';
import { Button, Empty, Tabs, Tree } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { difference, transform } from 'lodash';
import { connect } from '@/utils/RmsDva';
import { formatMessage, isNull } from '@/utils/util';
import { generateTreeData, handlePermissions } from './assignUtils';
import { AppCode } from '@/config/config';
import FormattedMessage from '@/components/FormattedMessage';
import { generateMenuNodeLocaleKey, getNewMenuDataByMergeCustomNodes, validateRouteAuthority } from '@/utils/init';
import allModuleRouter from '@/config/router';

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
class RoleAssignModal extends Component {
  state = {
    activeKey: null,
    permissionList: [], // tree data
    checkedKeys: [],
    permissionMap: {}, // 所有父级下的自己
  };

  componentDidMount() {
    const { data } = this.props;
    if (isNull(data)) return;
    const authorityKeys = data.authorityKeys || [];
    const allRoutes = Object.keys(allModuleRouter).map((key) => {
      const currentRoutes = allModuleRouter[key] || [];
      return { appCode: key, appMenu: currentRoutes };
    });

    const allAuthorityData = allRoutes
      .map((appRoute) => {
        // 处理menu, 需要跳过SSO
        const { appCode, appMenu } = appRoute;
        if (appCode === AppCode.SSO) {
          return null;
        }

        // 处理自定义的菜单 start
        let newAppMenu = [...appMenu];
        newAppMenu = getNewMenuDataByMergeCustomNodes(newAppMenu, [], appCode);
        // end

        const menuData = generateMenuNodeLocaleKey(newAppMenu);

        // TODO: 处理自定义的权限数据
        // const codePermissionMap = transform(
        //   allModulePermission[appCode],
        //   (result, record) => {
        //     const { page, children } = record;
        //     result[page] = children;
        //   },
        //   {},
        // );

        // 将路由与自定义权限合并
        const codePermissionMap = {};
        const authRoutes = this.combineMenuAndPermission(menuData, codePermissionMap) || [];
        return {
          appCode,
          appMenu: {
            key: `@@_${appCode}`,
            title: formatMessage({ id: 'app.module' }),
            children: authRoutes.filter(Boolean),
          },
        };
      })
      .filter(Boolean);

    // 权限扁平化 每个父节点的value是下面所有的子集
    const permissionMap = transform(
      allAuthorityData,
      (result, record) => {
        const { appCode, appMenu } = record;
        const temp = {};
        handlePermissions(appMenu, temp);
        result[appCode] = temp;
      },
      {},
    );

    // 这里要对authorityKeys中的对象进行筛选，在权限树中不存在的key就过滤掉
    let flatPermissionMap = {};
    Object.values(permissionMap).forEach((item) => {
      flatPermissionMap = { ...flatPermissionMap, ...item };
    });
    const _authorityKeys = authorityKeys.filter((item) => !!flatPermissionMap[item]);

    this.setState({
      permissionMap,
      permissionList: allAuthorityData,
      activeKey: allAuthorityData[0].appCode,
      checkedKeys: { checked: [..._authorityKeys], halfChecked: [] },
    });
  }

  // 处理menu
  getSubMenu = (item, codePermission) => {
    const { currentUser } = this.props;
    const adminType = currentUser.adminType || 'USER';

    // 不显示存在 hooks 属性的路由节点
    if (Array.isArray(item.hooks) && item.hooks.length > 0) {
      return null;
    }

    // 对 authority 字段进行验证
    if (validateRouteAuthority(item, adminType)) {
      if (Array.isArray(item.routes)) {
        return {
          ...item,
          key: item.path,
          title: formatMessage({ id: `${item.label}` }),
          children: this.combineMenuAndPermission(item.routes, codePermission).filter(Boolean),
        };
      } else {
        return {
          ...item,
          key: item.path,
          title: formatMessage({ id: `${item.label}` }),
          children: codePermission?.[item.path] || [],
        };
      }
    }
  };

  combineMenuAndPermission = (menuData, codePermission) => {
    if (!menuData) return [];
    return menuData.map((item) => this.getSubMenu(item, codePermission)).filter(Boolean);
  };

  hasParentNode = (node, permissionsMap) => {
    const result = [];
    Object.keys(permissionsMap).forEach((key) => {
      if (permissionsMap[key] != null && permissionsMap[key].indexOf(node) !== -1) {
        result.push(key);
      }
    });
    if (result.length === 0) {
      return [];
    } else {
      return Array.from(new Set([...result]));
    }
  };

  //点击复选框触发
  onCheck = (checkedKeys, { checked }) => {
    const { permissionMap, activeKey, checkedKeys: oldCheckedKeys } = this.state;
    const permissions = permissionMap[activeKey];
    let diffKey;
    if (checked) {
      //当前点击的节点
      diffKey = difference(checkedKeys.checked, oldCheckedKeys.checked || [])[0];
      const set = new Set(oldCheckedKeys.checked || []);
      // 1.点击的节点 没有下级 直接添加节点
      if (permissions[diffKey] == null) {
        set.add(diffKey);
      } else {
        // 2，点击节点存在下级，下级都要放进去
        set.add(diffKey);
        permissions[diffKey].forEach((key) => {
          set.add(key);
        });
      }
      // 找到此节点的上级节点
      const parentNode = this.hasParentNode(diffKey, permissions);
      if (parentNode.length > 0) {
        parentNode.forEach((node) => {
          if (!set.has(node)) {
            set.add(node);
          }
        });
      }
      this.setState({
        checkedKeys: { halfChecked: [], checked: Array.from(set) },
      });
    } else {
      //删除
      diffKey = difference(oldCheckedKeys.checked, checkedKeys.checked)[0];
      const set = new Set(oldCheckedKeys.checked || []);
      if (permissions[diffKey] == null) {
        set.delete(diffKey);
      } else {
        set.delete(diffKey);
        permissions[diffKey].forEach((key) => {
          set.delete(key);
        });
      }
      this.setState({
        checkedKeys: { halfChecked: [], checked: Array.from(set) },
      });
    }
  };

  render() {
    const { activeKey, permissionList, checkedKeys } = this.state;
    const { submitAuthKeys, currentUser } = this.props;
    const adminType = currentUser.adminType || 'USER';
    return (
      <div>
        <Tabs
          activeKey={activeKey}
          style={{ marginBottom: 50 }}
          onChange={(key) => {
            this.setState({ activeKey: key });
          }}
        >
          {permissionList.map(({ appCode, appMenu }, index) => {
            const treeData = generateTreeData(appMenu, adminType);
            return (
              <Tabs.TabPane key={appCode} tab={formatMessage({ id: `app.module.${appCode}` })}>
                {appMenu.length !== 0 ? (
                  <Tree
                    checkable
                    checkStrictly
                    defaultExpandAll
                    autoExpandParent
                    onCheck={this.onCheck}
                    checkedKeys={checkedKeys}
                    treeData={[treeData]}
                  />
                ) : (
                  <Empty />
                )}
              </Tabs.TabPane>
            );
          })}
        </Tabs>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            textAlign: 'right',
            background: '#fff',
          }}
        >
          <Button
            type="primary"
            onClick={() => {
              submitAuthKeys(checkedKeys.checked);
            }}
          >
            <CheckOutlined /> <FormattedMessage id="app.button.submit" />
          </Button>
        </div>
      </div>
    );
  }
}
export default RoleAssignModal;
