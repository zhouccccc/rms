import React, { memo } from 'react';
import { Tooltip } from 'antd';
import { isNull } from '@/utils/util';
import { connect } from '@/utils/RmsDva';
import { Cell, LineArrow } from '@/entities';
import { filterMapSpriteByRange, transformScreenToWorldCoordinator } from '@/utils/mapUtil';
import { EditorLeftTools, LeftCategory, LeftToolBarWidth } from '../enums';
import styles from '../editorLayout.module.less';

/**
 * 这里使用class组件原因在于需要对renderer.plugins.interaction进行绑定&解绑事件, class组件处理起来更方便
 */
class EditorBodyLeft extends React.PureComponent {
  // 首次进入页面需要对renderer进行绑定事件
  firstReceiveProps = true;

  // 标记指针相关数据
  pinterIsDown = false;
  pinterIsMoving = false;
  pinterDownTimestamp = null;

  // 框选的screen坐标数据
  pointerDownX = null;
  pointerDownY = null;
  pointerUpX = null;
  pointerUpY = null;

  componentWillReceiveProps(nextProps) {
    const { activeKey, mapContext } = nextProps;
    if (activeKey !== this.props.activeKey || this.firstReceiveProps) {
      this.firstReceiveProps = false;
      if (!isNull(mapContext?.pixiUtils?.renderer)) {
        this.handleMaskEvent(activeKey, mapContext.pixiUtils.renderer);
      }
    }
  }

  selectCategory = (value) => {
    const { dispatch, mapContext } = this.props;
    // 重置选择框DOM样式
    this.hideMask();

    // 只有Drag模式下才可以拖拽ViewPort
    mapContext.pixiUtils.viewport.drag({
      pressDrag: value === LeftCategory.Drag,
    });

    // 只有选择模式下才可以点击
    mapContext.pixiUtils.viewport.children.forEach((element) => {
      if (element instanceof Cell) {
        element.interact(value === LeftCategory.Choose);
      }
      if (element instanceof LineArrow) {
        element.clickable = value === LeftCategory.Choose;
      }
    });

    dispatch({ type: 'editor/updateLeftActiveCategory', payload: value });
  };

  hideMask = () => {
    const maskDOM = document.getElementById('mapSelectionMask');
    maskDOM.style.display = 'none';
    maskDOM.style.width = `${0}px`;
    maskDOM.style.height = `${0}px`;
  };

  handleMaskEvent = (activeKey, renderer) => {
    if (
      [
        LeftCategory.Choose,
        LeftCategory.Font,
        LeftCategory.Rectangle,
        LeftCategory.Circle,
        LeftCategory.Image,
      ].includes(activeKey)
    ) {
      renderer.plugins.interaction.on('pointerdown', this.onMouseDown);
      renderer.plugins.interaction.on('pointermove', this.onMouseMove);
      renderer.plugins.interaction.on('pointerup', this.onMouseUp);
      // 解决向左上方画区域不会触发 pointerup 事件
      renderer.plugins.interaction.on('pointerupoutside', this.onMouseUp);
    } else {
      renderer.plugins.interaction.off('pointerdown', this.onMouseDown);
      renderer.plugins.interaction.off('pointermove', this.onMouseMove);
      renderer.plugins.interaction.off('pointerup', this.onMouseUp);
      renderer.plugins.interaction.off('pointerupoutside', this.onMouseUp);
    }
  };

  onMouseDown = (ev) => {
    this.pinterDownTimestamp = new Date().getTime();
    // 不能阻止点击地图上任何元素
    if (!this.pinterIsDown && !isNull(ev.target.worldScreenWidth)) {
      this.pinterIsDown = true;
      const maskDOM = document.getElementById('mapSelectionMask');
      const { x, y } = ev.data.global;
      this.pointerDownX = x;
      this.pointerDownY = y;
      maskDOM.style.left = `${x}px`;
      maskDOM.style.top = `${y}px`;
    }
  };

  onMouseMove = (ev) => {
    if (this.pinterIsDown) {
      this.pinterIsMoving = true;
      const { activeKey } = this.props;
      this.pointerUpX = ev.data.global.x;
      this.pointerUpY = ev.data.global.y;
      const selectWidth = Math.abs(this.pointerUpX - this.pointerDownX);
      const selectHeight = Math.abs(this.pointerUpY - this.pointerDownY);

      // 此时判断是画矩形还是圆形
      const maskDOM = document.getElementById('mapSelectionMask');

      // 这个逻辑是为了解决第一次click不触发 pointerup 事件；因为事件触发在Mask节点上而不是Canvas，导致触发了 pointerupoutside 事件
      if (selectWidth * selectHeight >= 40) {
        maskDOM.style.display = 'block';
      }

      if (
        [
          LeftCategory.Choose,
          LeftCategory.Font,
          LeftCategory.Rectangle,
          LeftCategory.Image,
        ].includes(activeKey)
      ) {
        maskDOM.style.left = `${Math.min(this.pointerUpX, this.pointerDownX)}px`;
        maskDOM.style.top = `${Math.min(this.pointerUpY, this.pointerDownY)}px`;
        maskDOM.style.width = `${selectWidth}px`;
        maskDOM.style.height = `${selectHeight}px`;
      } else {
        maskDOM.style.left = `${this.pointerDownX - selectWidth / 2}px`;
        maskDOM.style.top = `${this.pointerDownY - selectWidth / 2}px`;
        maskDOM.style.width = `${selectWidth}px`;
        maskDOM.style.height = `${selectWidth}px`;
      }
    }
  };

  onMouseUp = (ev) => {
    if (!this.pinterIsDown) return;
    const { x, y } = ev.data.global;
    this.pointerUpX = x;
    this.pointerUpY = y;

    // 手动模拟点击事件
    const pointerTimeGap = new Date().getTime() - this.pinterDownTimestamp;
    if (!this.pinterIsMoving && pointerTimeGap <= 150) {
      this.cancelSelections();
    } else {
      const { activeKey, dispatch } = this.props;
      // 框选动作，只有选择模式下鼠标抬起才需要隐藏选择框
      if (activeKey === LeftCategory.Choose) {
        this.hideMask();
        this.onSelectElement();
      }

      // 插入图片，鼠标抬起后立即弹出图片选择框
      if (activeKey === LeftCategory.Image) {
        document.getElementById('editorMaskFilePicker').click();
      }

      // 插入文字，鼠标抬起后立即弹出输入框
      if (LeftCategory.Font === activeKey) {
        dispatch({ type: 'editor/updateMaskInputVisible', payload: true });
      }

      // 画矩形和圆形情况下显示MaskTool
      dispatch({
        type: 'editor/updateMaskToolVisible',
        payload: [LeftCategory.Rectangle, LeftCategory.Circle].includes(activeKey),
      });
    }

    // 重置参数
    this.pinterIsMoving = false;
    this.pinterIsDown = false;
    this.pointerDownX = null;
    this.pointerDownY = null;
    this.pointerUpX = null;
    this.pointerUpY = null;
  };

  // 取消选择所以已选中的元素
  cancelSelections = () => {
    const { dispatch, selections, mapContext } = this.props;
    mapContext.rangeSelection(selections, false);
    dispatch({ type: 'editor/updateSelections', payload: [] });
  };

  // 框选地图元素
  onSelectElement = () => {
    this.cancelSelections();
    const { dispatch, mapContext, currentCells } = this.props;

    // 收集转换所需的数据
    const viewport = mapContext.pixiUtils.viewport;
    const mapDOM = document.getElementById('editorPixi');

    // 转换坐标
    const [rangeWorldStartX, rangeWorldStartY] = transformScreenToWorldCoordinator(
      { x: this.pointerDownX, y: this.pointerDownY },
      mapDOM,
      viewport,
    );
    const [rangeWorldEndX, rangeWorldEndY] = transformScreenToWorldCoordinator(
      { x: this.pointerUpX, y: this.pointerUpY },
      mapDOM,
      viewport,
    );

    const [_startX, _endX] = [rangeWorldStartX, rangeWorldEndX].sort((x, y) => x - y);
    const [_startY, _endY] = [rangeWorldStartY, rangeWorldEndY].sort((x, y) => x - y);

    const selections = filterMapSpriteByRange(currentCells, _startX, _endX, _startY, _endY);
    mapContext.rangeSelection(selections);
    dispatch({ type: 'editor/updateSelections', payload: selections });
  };

  render() {
    const { activeKey } = this.props;
    return (
      <div style={{ width: `${LeftToolBarWidth}px` }} className={styles.bodyLeftSide}>
        {EditorLeftTools.map(({ label, value, icon }) => (
          <Tooltip key={value} placement="right" title={label}>
            <span
              className={activeKey === value ? styles.contentActive : undefined}
              onClick={() => {
                this.selectCategory(value);
              }}
            >
              {icon}
            </span>
          </Tooltip>
        ))}
      </div>
    );
  }
}
export default connect(({ editor }) => ({
  mapContext: editor.mapContext,
  selections: editor.selections,
  currentCells: editor.currentCells,
  activeKey: editor.leftActiveCategory,
}))(memo(EditorBodyLeft));
