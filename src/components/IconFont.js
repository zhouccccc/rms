import React from 'react';
import { isPlainObject } from 'lodash';
import { createFromIconfontCN } from '@ant-design/icons';

const ExtraIconCharge = createFromIconfontCN({
  // scriptUrl: ['IconFont.js'],
  scriptUrl: ['//at.alicdn.com/t/font_2597007_fc7vs1z4k45.js'],
});

export function getIconFont(icon, style) {
  if (isPlainObject(style)) {
    return <ExtraIconCharge style={style} type={icon} />;
  }
  return <ExtraIconCharge type={icon} />;
}

export function IconFont({ type, style }) {
  return getIconFont(type, style);
}
