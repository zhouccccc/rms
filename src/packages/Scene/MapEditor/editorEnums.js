import React from 'react';
import { IconFont } from '@/components/IconFont';
import {
  BankOutlined,
  DropboxOutlined,
  EyeOutlined,
  NodeExpandOutlined,
  SettingOutlined,
  StopOutlined,
} from '@ant-design/icons';
import FormattedMessage from '@/components/FormattedMessage';

export const HeaderHeight = 35;
export const FooterHeight = 25;
export const LeftToolBarWidth = 65;
export const RightToolBarWidth = 50;

export const LeftCategory = {
  Drag: 'Drag',
  Choose: 'Choose',
  Image: 'Image',
  Font: 'Font',
  Rectangle: 'Rectangle',
  Circle: 'Circle',
  Template: 'Template',
};

export const RightCategory = {
  Prop: 'PROP',
  Aisle: 'AISLE',
  Cell: 'CELL',
  Cost: 'COST',
  CellType: 'CELL_TYPE',
  Elevator: 'ELEVATOR',
  WorkStation: 'WORK_STATION',
  Station: 'COMMON_STATION',
  Charger: 'CHARGER',
  View: 'VIEW',
  Rest: 'REST',
  EmergencyStop: 'EMERGENCY_STOP',
  Delivery: 'DELIVERY',
  Intersection: 'INTERSECTION',
  Programing: 'PROGRAMING',
  Template: 'TEMPLATE',
  History: 'HISTORY',
};

export const EditorLeftTools = [
  {
    label: <FormattedMessage id={'app.common.select'} />,
    value: LeftCategory.Choose,
    icon: <IconFont type={'icon-click'} />,
  },
  {
    label: <FormattedMessage id={'app.common.drag'} />,
    value: LeftCategory.Drag,
    icon: <IconFont type={'icon-drag'} />,
  },
  {
    label: <FormattedMessage id={'editor.tools.insertFont'} />,
    value: LeftCategory.Font,
    icon: <IconFont type={'icon-font'} />,
  },
  {
    label: <FormattedMessage id={'editor.tools.insertRect'} />,
    value: LeftCategory.Rectangle,
    icon: <IconFont type={'icon-rectangle'} />,
  },
  {
    label: <FormattedMessage id={'editor.tools.insertCircle'} />,
    value: LeftCategory.Circle,
    icon: <IconFont type={'icon-circle'} />,
  },
  {
    label: <FormattedMessage id={'editor.tools.insertPicture'} />,
    value: LeftCategory.Image,
    icon: <IconFont type={'icon-image'} />,
  },
  // {
  //   label: <FormattedMessage id={'editor.tools.useTemplate'} />,
  //   value: LeftCategory.Template,
  //   icon: <IconFont type={'icon-template'} />,
  // },
];

export const EditorRightTools = [
  {
    label: <FormattedMessage id={'app.common.prop'} />,
    value: RightCategory.Prop,
    icon: <SettingOutlined />,
  },
  {
    label: <FormattedMessage id={'app.map.view'} />,
    value: RightCategory.View,
    icon: <EyeOutlined />,
  },
  {
    label: <FormattedMessage id={'app.map.cell'} />,
    value: RightCategory.Cell,
    icon: <IconFont type={'icon-cell'} />,
  },
  {
    label: <FormattedMessage id={'app.map.route'} />,
    value: RightCategory.Cost,
    icon: <IconFont type={'icon-routeMap'} />,
  },
  {
    label: <FormattedMessage id={'app.map.function'} />,
    value: RightCategory.CellType,
    icon: <IconFont type={'icon-feature'} />,
  },
  // {
  //   label: <FormattedMessage id={'app.map.workStation'} />,
  //   value: RightCategory.WorkStation,
  //   icon: <IconFont type={'icon-station'} />,
  // },
  {
    label: <FormattedMessage id={'app.map.station'} />,
    value: RightCategory.Station,
    icon: <BankOutlined />,
  },
  // {
  //   label: <FormattedMessage id={'app.map.elevator'} />,
  //   value: RightCategory.Elevator,
  //   icon: <IconFont type={'icon-elevator'} />,
  // },
  {
    label: <FormattedMessage id={'app.map.charger'} />,
    value: RightCategory.Charger,
    icon: <IconFont type={'icon-charger2'} />,
  },
  {
    label: <FormattedMessage id={'app.map.emergencyStop'} />,
    value: RightCategory.EmergencyStop,
    icon: <StopOutlined />,
  },
  {
    label: <FormattedMessage id={'app.map.restArea'} />,
    value: RightCategory.Rest,
    icon: <IconFont type={'icon-rest2'} />,
  },
  {
    label: <FormattedMessage id={'app.map.aisle'} />,
    value: RightCategory.Aisle,
    icon: <NodeExpandOutlined />,
  },
  {
    label: <FormattedMessage id={'app.map.delivery'} />,
    value: RightCategory.Delivery,
    icon: <DropboxOutlined />,
  },
  // {
  //   label: <FormattedMessage id={'app.map.intersection'} />,
  //   value: RightCategory.Intersection,
  //   icon: <IconFont type={'icon-intersection'} />,
  // },
  {
    label: <FormattedMessage id={'app.map.programing'} />,
    value: RightCategory.Programing,
    icon: <IconFont type={'icon-programing'} />,
  },
  // {
  //   label: <FormattedMessage id={'editor.tools.createTemplate'} />,
  //   value: RightCategory.Template,
  //   icon: <IconFont type={'icon-template'} />,
  // },
  // {
  //   label: <FormattedMessage id={'editor.tools.history'} />,
  //   value: RightCategory.History,
  //   icon: <IconFont type={'icon-history'} />,
  // },
];

export const CellTypeSetting = [
  // ????????????
  {
    type: 'blockCellIds',
    picture: 'block_cell.png',
    i18n: 'editor.cellType.forbid',
    scope: 'routeMap',
  },
  // ?????????
  {
    type: 'storeCellIds',
    picture: 'store_cell.png',
    i18n: 'editor.cellType.storage',
    scope: 'logic',
  },
  // ?????????
  {
    type: 'followCellIds',
    picture: 'follow_cell.png',
    i18n: 'editor.cellType.follow',
    scope: 'routeMap',
  },
  // ?????????
  {
    type: 'waitCellIds',
    picture: 'wait_cell.png',
    i18n: 'editor.cellType.waiting',
    scope: 'routeMap',
  },
  // ????????????
  {
    type: 'taskCellIds',
    picture: 'get_task.png',
    i18n: 'editor.cellType.getTask',
    scope: 'logic',
  },
  // ?????????
  {
    type: 'safeAreaCellIds',
    picture: 'safe_cell.png',
    i18n: 'editor.cellType.safe',
    scope: 'logic',
  },
  // ???????????????
  {
    type: 'rotateCellIds',
    picture: 'round.png',
    i18n: 'editor.cellType.rotation',
    scope: 'logic',
  },
];

export const CostOptions = [
  { value: 10, label: 'map.cost.green' },
  { value: 20, label: 'map.cost.blue' },
  { value: 100, label: 'map.cost.yellow' },
  { value: 1000, label: 'map.cost.red' },
];

// ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????pixi??????
export const DirectionOption = [
  { value: 0, label: 'app.direction.top' },
  { value: 1, label: 'app.direction.right' },
  { value: 2, label: 'app.direction.bottom' },
  { value: 3, label: 'app.direction.left' },
];
