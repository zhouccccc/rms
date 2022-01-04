import * as PIXI from 'pixi.js';
import { SimpleCull } from '@/libs/SimpleCull';
import { Viewport } from 'pixi-viewport';

export default class PixiBuilder {
  constructor(width, height, htmlDOM) {
    this.width = width;
    this.height = height;
    this.loader = new PIXI.Loader();
    this.resources = this.loader.resources;

    // 初始化渲染器
    this.renderer = new PIXI.Renderer({
      width,
      height,
      antialias: true,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio,
      powerPreference: 'high-performance',
    });
    htmlDOM.appendChild(this.renderer.view);

    // 创建视窗组件
    this.viewport = new Viewport({
      screenWidth: width,
      screenHeight: height,
      passiveWheel: false, // Event passive
      stopPropagation: true,
      divWheel: htmlDOM,
      interaction: this.renderer.plugins.interaction,
    });
    this.viewport.drag().pinch().wheel().decelerate().clampZoom({ minScale: 0.001, maxScale: 0.5 });
    this.viewport.fitWorld(false);
    this.viewport.sortableChildren = true;

    // 创建cull组件
    this.cull = new SimpleCull();
    this.cull.addList(this.viewport.children);
    this.cull.cull(this.viewport.getVisibleBounds());

    // 渲染标记
    this.isNeedRender = true;
    this.ticker = PIXI.Ticker.shared;
    this.ticker.maxFPS = 10;
    this.ticker.add(() => {
      if (this.isNeedRender || this.viewport.dirty) {
        if (this.viewport.dirty) {
          // 重新计算cull边界
          this.cull.cull(this.viewport.getVisibleBounds());
        }
        this.isNeedRender = false;
        this.viewport.dirty = false;
        this.renderer.render(this.viewport);
      }
    });
  }

  // 手动触发渲染，只更改渲染标记
  callRender = () => {
    this.isNeedRender = true;
  };

  viewportAddChild = (child) => {
    this.viewport.addChild(child);
  };

  viewportRemoveChild = (child) => {
    this.viewport.removeChild(child);
  };

  viewportRemoveChildren = () => {
    this.viewport.removeChildren();
  };

  destroy = () => {
    PIXI.utils.destroyTextureCache();
    this.loader.reset();
    this.cull.removeList(this.viewport.children);
    this.viewport.removeChildren();
    this.viewport.destroy(true);
    this.renderer.destroy();
  };
}