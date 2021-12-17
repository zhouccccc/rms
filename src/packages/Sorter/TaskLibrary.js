import React, { memo } from 'react';
import { hasPermission } from '@/utils/Permission';
import TaskLibraryComponent from '@/pages/TaskLibrary/TaskLibraryComponent';
import { AGVType } from '@/config/config';

const TaskLibrary = () => {
  const cancelFlag = hasPermission('/sorter/task/taskManger/cancel');
  return (
    <TaskLibraryComponent
      agvType={AGVType.Sorter} // 标记当前页面的车型
      cancel={cancelFlag} // 标记该页面是否允许执行取消操作
    />
  );
};
export default memo(TaskLibrary);
