import React, { memo } from 'react';
import { hasPermission } from '@/utils/Permission';
import TaskLibraryComponent from '@/pages/TaskLibrary/TaskLibraryComponent';
import { VehicleType } from '@/config/config';

const TaskExecuted = () => {
  const cancelFlag = hasPermission('/tote/task/taskManger/cancel');
  return (
    <TaskLibraryComponent
      vehicleType={VehicleType.Tote} // 标记当前页面的车型
      cancel={cancelFlag} // 标记该页面是否允许执行取消操作
    />
  );
};
export default memo(TaskExecuted);
