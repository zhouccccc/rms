import React from 'react';
import ReactDOM from 'react-dom';
import { LINE_SCALE_MODE, settings } from '@pixi/graphics-smooth';
import createRcsDva from '@/utils/RmsDva';
import App from '@/pages/App';
import models from '@/models';
import './global.less';
import { isPlainObject } from 'lodash';

// https://github.com/pixijs/graphics-smooth
settings.PIXEL_LINE = 1;
// settings.LINE_SCALE_MODE = LINE_SCALE_MODE.NONE;

// 判定当前是否是产品环境
window.$$isProduction = isPlainObject(window.extraConfig);

// 全局错误处理(尝试版)
// window.onerror = function (message, source, lineno, colno, error) {
//   console.log('捕获到[onError]异常：', { message, source, lineno, colno, error });
// };
//
// window.addEventListener('error', (error) => {
//   console.log('捕获到[Error]异常：', error);
// });
//
// window.addEventListener('unhandledrejection', (error) => {
//   console.log('捕获到[unhandledrejection]异常：', error);
// });

// 1. 初始化Dva对象(包含dva层统一错误处理)
const dvaOption = {};
if (window.$$isProduction) {
  dvaOption.onError = function (e, dispatch) {
    console.log(e.message);
  };
}
const DvaProvider = createRcsDva(dvaOption, models);

ReactDOM.render(
  <DvaProvider>
    <App />
  </DvaProvider>,
  document.getElementById('root'),
);
