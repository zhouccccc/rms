export default {
  // **********  任务触发器 ********** //
  'taskTrigger.stateQuery': '状态查询',
  'taskTrigger.startTaskTrigger.tip': '是否确定开始任务?',
  'taskTrigger.pauseTaskTrigger.tip': '是否确定暂停任务?',
  'taskTrigger.endTaskrigger.tip': '确定结束任务吗?',
  'taskTrigger.deleteTaskrigger.tip': '确定删除该任务吗?',
  'taskTrigger.editVariable': '编辑变量',
  'taskTrigger.triggerTasks': '触发任务',
  'taskTrigger.variable': '支持变量',
  'taskTrigger.randomVariable': '随机',
  'taskTrigger.fixedVariable': '固定',
  'taskTrigger.time.tip': '请输入时间间隔(s)',
  'taskTrigger.totalTimes': '总下发次数',
  'taskTrigger.totalTimes.required': '总下发次数或结束时间必填',
  'taskTrigger.dispatchedTimes': '已下发次数',

  // **********  均衡限流器 ********** //
  'taskLimit.currentLimiting': '限流',
  'taskLimit.resourceLimiting': '资源限流',
  'taskLimit.limiting': '任务限流',
  'taskLimit.quantity': '限流数量',
  'taskLimit.batchUpdateQuantity': '批量更新限流数',
  'taskLimit.updateSelectedNum': '更新选中的限流数量',
  'taskLimit.limitTips': '提示: 若限流数量为空 则不会限流',

  // **********  自定义任务 ********** //
  // 预制任务名称(不可删除)
  'customTask.chargeRun': '充电',
  'customTask.chargeRun.charge': '充电',
  'customTask.emptyRun': '空跑',
  'customTask.emptyRun.run': '空跑',
  'customTask.runToRest': '去停车',
  'customTask.runToRest.rest': '休息',
  'customTask.carryLoad': '搬运',
  'customTask.carryLoad.fetch': '取货',
  'customTask.carryLoad.put': '送货',
  'customTask.carryLoad.check': '检测货物',
  'customTask.runToSafetyArea': '去安全区',

  // 表单
  'customTasks.example.field': '字段',
  'customTasks.example.default': '默认值',
  'customTask.backToList': '返回列表',
  'customTask.customTypes': '任务节点',
  'customTasks.button.updateModel': '更新关联信息',
  'customTasks.form.delete.confirm': '即将删除该节点并清空表单数据, 是否确定?',
  'customTasks.form.submit.error': '表单数据采集失败',
  'customTask.form.name': '自定义任务名称',
  'customTask.form.subTaskName': '子任务名称',
  'customTask.form.specify': '指定',
  'customTasks.form.clear.warn': '该操作会清空当前所有的输入数据, 确定执行吗?',
  'customTasks.table.requestBody': '请求体',
  'customTasks.requesting': '请求中',
  'customTasks.requestBodyDemo': '请求体示例',
  'customTasks.cannotEdit': '不可更改',
  'customTask.form.invalid': '表单数据错误',
  'customTasks.operationType.add': '新增动作',
  'customTasks.operationType.update': '替换动作',
  'customTasks.operationType.delete': '删除动作',
  'customTasks.operationType.param': '替换动作参数',
  'customTask.require.vehicle': '请指定分车',
  'customTask.require.target': '请指定目标点',

  // 任务节点名称
  'customTask.type.BASE': '基础信息',
  'customTask.type.START': '任务开始',
  'customTask.type.ACTION': '子任务',
  'customTask.type.WAIT': '待命',
  'customTask.type.PODSTATUS': '载具模拟',
  'customTask.type.END': '任务结束',

  // 开始
  'customTask.form.vehicle': '分车',
  'customTask.form.NO_SPECIFY': '自动分车',
  'customTask.form.SPECIFY_Vehicle': '指定小车',
  'customTask.form.SPECIFY_GROUP': '指定小车组',
  'customTask.form.vehicle.selectType': '请选择小车类型',
  'customTask.form.vehicle.select': '请选择小车',

  'customTask.form.resourceLimit': '资源约束',
  'customTask.form.resourceLimit.vehicleBattery': '车辆电量必须>=',
  'customTask.form.resourceLimit.availableContainerCountLimit': '车辆可用容器可用数量必须>=',
  'customTask.form.resourceLimit.containerTypeLimit': '车辆容器规格必须为',
  'customTask.form.resourceLimit.loadTypeLimit': '载具规格必须为',
  'customTask.form.resourceLimit.isLimitStandBy': '拥有指定载具的待命车辆才可接',
  'customTask.form.resourceLimit.loadWorkLimit': '只使用工作中的载具',

  // 结束
  'customTask.form.vehicleWaitTask': '小车待命',
  'customTask.form.vehicleTaskTypes': '可接任务类型',
  'customTask.form.appointResources': '可接资源任务',
  'customTask.form.vehicleAutoCharge': '可自动退出待命去充电',
  'customTask.form.backZone': '自动找停车点',
  'customTask.form.loadBackZone': '载具自动放回储位',
  'customTask.form.vehicleNeedCharge': '自动充电',

  // 子任务
  'customTask.form.target': '目标',
  'customTask.form.pathCode': '路线区',
  'customTask.form.pathStrategy': '路线策略',
  'customTask.form.keyPointActionConfig': '关键点动作配置',
  'customTask.form.pathProgramming': '路径函数配置',
  'customTask.form.specifyAngle': '指定角度',

  'customTask.form.heavy': '重车',
  'customTask.form.empty': '空车',
  'customTask.form.isPathWithPod': '车辆状态',
  'customTask.form.speed': '行驶速度',
  'customTask.form.canReCalculatePath': '自动切换路线',
  'customTask.form.runAction': '行走动作',
  'customTask.form.turnAction': '转弯动作',
  'customTask.form.podAngle': '载具角度',
  'customTask.form.podSide': '载具面',
  'customTask.form.firstActions': '起点动作',
  'customTask.form.afterFirstActions': '第二点位动作',
  'customTask.form.beforeLastActions': '倒数第二动作',
  'customTask.form.lastActions': '终点动作',
  'customTask.form.programCode': '任务编程',
  'customTask.form.waitTaskCell': '是否去接任务点',

  //// 资源锁 ////
  'customTask.lock.resourceLock': '资源锁',
  'customTask.lock.resourceType': '资源类型',
  'customTask.lock.LOAD': '载具',
  'customTask.lock.STORE': '储位',
  'customTask.lock.TARGET': '目标',
  'customTask.lock.LOCK': '锁定时机',
  'customTask.lock.LOCK.NO': '不锁',
  'customTask.lock.UNLOCK': '解锁时机',
  'customTask.lock.switchToVehicle': '切换为小车', // 目标点
  'customTask.lock.switchToLoad': '切换为载具', // 储位
  'customTask.lock.BeginTaskStart': '任务开始前',
  'customTask.lock.BeginActionStart': '路径动作开始前',
  'customTask.lock.AfterTaskEnd': '任务结束',
  'customTask.lock.AfterActionEnd': '路径动作结束',
  //// 资源锁 ////  end

  'customTask.form.trayActionProtocol': '托盘动作协议',
  'customTask.form.trayLiftProtocol': '顶升协议',
  'customTask.form.trayDownProtocol': '下降协议',
  'customTask.form.lift': '顶升',
  'customTask.form.blindLift': '盲顶',
  'customTask.form.down': '下降',
  'customTask.form.blindDown': '盲降',
  'customTask.form.upAction': '顶升协议',
  'customTask.form.downAction': '下降协议',
  'customTask.form.operatorDirection': '操作者位置',

  // 待命子任务
  'customTask.form.waitTime': '待命时长',

  // 载具模拟
  'customTask.form.podStatus': '载具状态',
  'customTask.form.generate': '生成',
  'customTask.form.disappear': '消失',
  'customTask.form.random': '随机',
  'customTask.form.generateType': '生成方式',

  // 事件
  'customTask.form.payLoad': '消息体',
  'customTask.form.topic': '广播主题',

  // 变量组件 相关
  'variable.customTaskData.missing': '自定义任务数据丢失',
  'variable.task.edit': '编辑任务变量',

  // 快捷任务
  'quickTask.execute': '执行快捷任务',
  'quickTask.create': '创建快捷任务',
  'quickTask.groupManage': '任务组管理',
  'quickTask.button.modifyVariable': '修改变量',
  'quickTask.group.belongs': '所属组',
  'quickTask.group.noExist': '暂无分组',
  'quickTask.group.loss': '组丢失',
  'quickTask.customTask.associated': '关联自定义任务',
  'quickTask.operate.isConfirm': '确认操作',
  'quickTask.operate.isConfirm.message': '确认操作（解锁）：当提交任务时候，是否需要人工再确认一次',
  'quickTask.share': '分享',
  'quickTask.share.message':
    '分享该快捷任务后, 其他用户会浏览到该记录并且可以进行复制操作, 是否确定分享?',
  'quickTask.share.cancel.message':
    '取消分享该快捷任务后, 其他用户将无法浏览到该条记录, 是否确定取消分享?',
  'quickTask.viewType.own': '我的',
  'quickTask.viewType.shared': '分享的',

  // **********  分组管理 ********** //
  'groupManage.management': '分组配置',
  'groupManage.detail': '分组配置信息',
  'groupManage.key': '唯一key',
  'groupManage.key.duplicate': '唯一key不能重复',
  'groupManage.name.duplicate': '组名不能重复',
  'groupManage.fetchFailed': '获取分组信息失败',
  'groupManage.batchUpdate': '批量更新',
  'groupManage.updateSelectedPriority': '更新选中的优先级',
  'groupManage.button.deleteGroup': '清空此分组',
  'groupManage.tip.deleteGroupAll': '确定删除此分组全部记录吗？',
};
