export default {
  'monitor.MRV': 'MRV',
  'monitor.dashboard': '仪表盘',
  'monitor.location': '定位',
  'monitor.reload': '重载地图',

  'monitor.runTime': '运行时',
  'monitor.maintain': '维护',
  'monitor.path': '路径',
  'monitor.manual': '手动',
  'monitor.reboot': '重启',

  // Right Tools
  'monitor.right.latent': '潜伏车操作',
  'monitor.right.tote': '料箱车操作',
  'monitor.right.sorter': '分拣车操作',
  'monitor.right.simulator': '模拟器',
  'monitor.right.navigation': '导航',
  'monitor.right.resource': '资源',
  'monitor.right.message': '消息',
  'monitor.right.emptyRun': '空跑',
  'monitor.right.charge': '充电',
  'monitor.right.goRest': '休息',
  'monitor.right.carry': '搬运',
  'monitor.right.advancedCarry': '高级搬运',
  'monitor.right.workStationTask': '工作站任务',
  'monitor.right.stationTask': '站点任务',
  'monitor.right.autoCall': '自动呼叫',
  'monitor.right.remoteControl': '遥控',
  'monitor.right.pickCargo': '取货',
  'monitor.right.dumpCargo': '抛货',
  'monitor.right.pathLock': '路径锁格',
  'monitor.right.mapView': '地图显示',
  'monitor.right.latentDisplay': '潜伏显示',
  'monitor.right.toteDisplay': '料箱显示',
  'monitor.right.sorterDisplay': '分拣显示',
  'monitor.right.cellheat': '点位热度',
  'monitor.right.tracking': '追踪',

  // 提醒
  'monitor.tip.fetchLockFail': '获取锁格信息失败',
  'monitor.tip.LockDataAbnormal': '锁格数据异常: {detail}',
  'monitor.tip.fetchCellLockFail': '获取点位锁格信息失败',

  // modal title
  'monitor.goRest.toRestArea': '回休息区',
  'monitor.advancedcarry.released': '释放',
  'monitor.pod.noRotation': '不旋转',
  'monitor.direction.topSide': '目标点上方',
  'monitor.direction.rightSide': '目标点右方',
  'monitor.direction.bottomSide': '目标点下方',
  'monitor.direction.leftSide': '目标点左方',
  'monitor.advancedcarry.arrivalStatus': '到站状态',
  'monitor.advancedcarry.putDown': '放下货架',
  'monitor.advancedcarry.notPutDown': '不放下货架',
  'monitor.advancedcarry.toRestPoint': '回休息点',
  'monitor.advancedcarry.backZone': '放回区域',
  'monitor.advancedcarry.scopeCode': '作用域',
  'monitor.automaticLatentWorkStationTask.defaultAllStation': '默认使用所有工作站',
  'monitor.automaticLatentWorkStationTask.maxPodNum': '任务上限',
  'monitor.automaticLatentWorkStationTask.callIntervalMill': '呼叫间隔',
  'monitor.automaticLatentWorkStationTask.delayReleaseSecondMill': '释放延迟',
  'monitor.automaticLatentWorkStationTask.addConfiguration': '添加配置',
  'monitor.automaticLatentWorkStationTask.updateConfiguration': '更新配置',
  'monitor.automaticLatentWorkStationTask.handleAutoRelease': '自动释放',
  'monitor.automaticLatentWorkStationTask.deleteConfig.success': '删除配置成功',
  'monitor.latentAutoTaskOn': '自动呼叫已开启',
  'monitor.latentAutoTaskOff': '自动呼叫已关闭',
  'monitor.latentAutoTaskReleaseOn': '自动释放已开启',
  'monitor.latentAutoTaskReleaseOff': '自动释放已关闭',
  'monitor.remotecontrol.agvStraight': '小车直行',
  'monitor.remotecontrol.followStraight': '跟车直行',
  'monitor.remotecontrol.agvTurn': '小车转向',
  'monitor.remotecontrol.palletRotation': '托盘旋转',
  'monitor.remotecontrol.asideToTop': 'A面朝上',
  'monitor.remotecontrol.asideToBottom': 'A面朝下',
  'monitor.remotecontrol.asideToLeft': 'A面朝左',
  'monitor.remotecontrol.asideToRight': 'A面朝右',
  'monitor.remotecontrol.liftingShelf': '升降货架',

  'monitor.requestor.execute.failed': '任务执行失败',
  'monitor.requestor.execute.success': '任务执行成功',

  'monitor.dumpCargo.frontRoller': '前滚筒',
  'monitor.dumpCargo.rearRoller': '后滚筒',
  'monitor.dumpCargo.bothRoller': '前后滚筒',

  'monitor.operate.targetStation': '抛货框',
  'monitor.operate.actionType': '动作类型',
  'monitor.operate.actionType.WAIT_TASK': '等待任务',
  'monitor.operate.actionType.STOP_THROW': '停车抛货',
  'monitor.operate.actionType.NON_STOP_THROW': '边走边抛',
  'monitor.operate.actionType.CONVEYOR.pick': '滚筒站任务',
  'monitor.operate.actionType.CONVEYOR.put': '送至滚筒站',
  'monitor.operate.goodsCode': '货物编码',

  'monitor.view.selectAgvall': '全部',
  'monitor.view.lockView': '显示锁格',
  'monitor.view.lock.path': '一般锁',
  'monitor.view.lock.rotation': '旋转锁',
  'monitor.view.lock.special': '特殊锁',
  'monitor.view.pathView': '显示路径',
  'monitor.view.path.fullPath': '全路径',
  'monitor.view.path.targetLine': '目标线',
  'monitor.view.cellLock': '点位锁格',
  'monitor.view.cell.required': '请输入点位ID',
  'monitor.view.require.AGV': '请先选择小车',
  'monitor.view.temporaryBlock': '临时不可走点',
  'monitor.view.temporaryBlock.required': '请输入临时不可走点',
  'monitor.view.mapCellView': '地图点位',
  'monitor.view.coordinateDisplay': '点位坐标',
  'monitor.view.stationRealtimeRate': '站点速率',
  'monitor.view.toteRack': '料箱货架',
  'monitor.view.toteTaskPath': '料箱任务路径',
  'monitor.view.toteBinState': '料箱实时状态',
  'monitor.view.bothTaskCount': '实时任务分布',
  'monitor.view.binUsedState': '货位使用情况',
  'monitor.view.heat.queryType': '查询类型',
  'monitor.view.heat.clear': '清除',
  'monitor.view.heat.cost': '成本热度',
  'monitor.view.heat.require.timeRange': '请选择时间区间',
  'monitor.view.heat.isTransparent': '是否透明',

  'monitor.simulator.config': '配置',
  'monitor.simulator.action.batchAddPods': '批量添加货架',
  'monitor.simulator.action.remove': '移除',
  'monitor.simulator.action.beatStop': '拍急停',
  'monitor.simulator.action.loosenStop': '松急停',
  'monitor.simulator.action.shutDown': '关机',
  'monitor.simulator.action.bootUp': '开机',
  'monitor.simulator.list.snapStop': '急停',
  'monitor.simulator.list.movable': '可动',
  'monitor.simulator.list.unMovable': '不可动',

  'monitor.tracking.trackAMR': '追踪小车',
  'monitor.tracking.trackAMR.track': '开始追踪',
  'monitor.tracking.trackAMR.untrack': '取消追踪',
  'monitor.tracking.require.trackAMR': '请选择需要追踪的小车',

  'monitor.simulator.config.title': '模拟车配置',
  'monitor.simulator.config.consumePowerSpeed': '耗电速度',
  'monitor.simulator.config.actionConsumePowerSpeed': '执行任务时耗电',
  'monitor.simulator.config.chargeSpeed': '充电速度',
  'monitor.simulator.config.startStopSpeed': '小车启停耗时',
  'monitor.simulator.config.agvEmptyRotateSpeed': '空车旋转速度',
  'monitor.simulator.config.agvHeavyRotateSpeed': '重车旋转速度',
  'monitor.simulator.config.podRobotRotateSpeed': '同步旋转速度',
  'monitor.simulator.config.backSpeed': '小车倒退速度',
  'monitor.simulator.config.upSpeed': '顶升速度',
  'monitor.simulator.config.downSpeed': '托盘下降速度',
  'monitor.simulator.config.podRotate90Speed': '托盘旋转90度时间',
  'monitor.simulator.config.pickPlaceSpeed': '取货放货速度',
  'monitor.simulator.config.leve': '层',
  'monitor.simulator.config.lineSpeed': '直线行驶档位',
  'monitor.simulator.config.bezierSpeed': '曲线行驶档位',
  'monitor.simulator.config.forkPickPlaceSpeed': '调整插齿高度耗时',
  'monitor.simulator.config.AMRGearSpeed': '车档位速度',
  'monitor.simulator.config.1Gear': '1档',
  'monitor.simulator.config.2Gear': '2档',
  'monitor.simulator.config.3Gear': '3档',
  'monitor.simulator.config.4Gear': '4档',
  'monitor.simulator.config.5Gear': '5档',
  'monitor.simulator.config.6Gear': '6档',
  'monitor.simulator.simulateAMRError': '模拟小车错误',
  'monitor.simulator.AMRSubType': '小车子类',
  'monitor.simulator.addAMR': '添加小车',
  'monitor.simulator.AMRCount': '小车数量',
  'monitor.simulator.incrementAdd': '增量添加',
  'monitor.simulator.addAMR.success': '添加小车成功',
  'monitor.simulator.addAMR.failed': '添加小车失败',

  'monitor.simulator.subType.normal': '普通',
  'monitor.simulator.subType.infrared': '红外',
  'monitor.simulator.subType.frock': '工装车',
  'monitor.simulator.subType.tote': '料箱工装车',

  'monitor.operation.podProps': 'POD属性', //@
  'monitor.operation.batchAdd': '批量添加',
  'monitor.operation.setLatentPodSuccessfully': '设置货架命令下发完成',
  'monitor.operation.removeLatentPodSuccessfully': '移除货架命令下发完成',
  'monitor.operation.setupPod': '设置货架',
  'monitor.operation.movePod': '移动货架',
  'monitor.operation.resizePod': '修改货架尺寸',
  'monitor.operation.set': '设置',


  'monitor.models.storageArea': '当前逻辑区没有存储区',
  'monitor.operation.commandSendSuccessfully': '{type}命令下发成功',
  'monitor.operation.deleteAndBatchAdd': '清空后批量添加',
  'monitor.operation.confirmCode': '确认码',
  'monitor.pod.batchAngle': 'Pod方向',
  'monitor.pod.podNumber': 'Pod数量',
  'monitor.pod.podSize': '货架尺寸',
  'monitor.pod.podSize.required': '请输入货架尺寸',
  'monitor.pod.podSize.incomplete': '请完善尺寸数据',
  'monitor.pod.podSize.invalid': '货架尺寸必须大于0',
  'monitor.simulator.action.clearPodBatchAddWarn':
    "注意！货架将被全部清空后再被批量添加，请确认明白你现在的操作，填入确认码 <b style='color:black'>{confirmCode}</b> 后继续点按钮操作",

  'monitor.simulator.errorCode': '错误代码',
  'monitor.simulator.errorCode.success': '模拟错误成功',

  'monitor.emergency.temporaryBlock': '临时不可走',
  'monitor.emergency.operation': '急停区操作',
  'monitor.emergency.drag': '拖拽急停区',

  'monitor.message.podToWorkstationInfo': '到站消息',
  'monitor.message.latentStopMessage': '暂停消息',
  'monitor.message.releasePodSuccess': '释放成功',
};
