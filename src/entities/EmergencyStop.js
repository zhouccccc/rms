import * as PIXI from 'pixi.js';
import { EStopStateColor, MapSelectableSpriteType, SelectionType, zIndex, ZoneMarkerType } from '@/config/consts';
import { SmoothGraphics } from '@pixi/graphics-smooth';
import Text from '@/entities/Text';
import { isNull } from '@/utils/util';
import { adaptLabelSize, getTextureFromResources } from '@/utils/mapUtil';

const BorderWidth = 50;
class EmergencyStop extends PIXI.Container {
  constructor(props) {
    super();
    this.type = MapSelectableSpriteType.EMERGENCYSTOP;
    this.code = props.code;
    this.x = props.x + props.xlength / 2;
    this.y = props.y + props.ylength / 2;
    this.angle = props.angle || 0;
    this.cullable = true;
    this.zIndex = zIndex.emergencyStop;
    this.alpha = 0.75;

    this.$angle = props.angle || 0; // 仅用于纠正名称角度
    this.activated = props.activated || false;
    this.safe = props.safe || 0;
    this.estopType = props.estopType;
    this.boxType = props.ylength && props.xlength ? ZoneMarkerType.RECT : ZoneMarkerType.CIRCLE;
    this.xlength = props.xlength;
    this.ylength = props.ylength;
    this.r = props.r;
    this.sectionEStop = null;
    this.logicEStop = null;

    this.select = props.select;
    this.selected = false;

    if (['Section', 'Logic'].includes(props.estopType)) {
      this.drawEStopMask(props);
    } else {
      this.create(props);
      this.pivot.x = props.xlength / 2;
      this.pivot.y = props.ylength / 2;
    }
  }

  // 选择相关
  onSelect = () => {
    if (!this.selected) {
      this.selected = true;
      this.selectionBorder.visible = true;
    }
  };

  onUnSelect = () => {
    if (this.selected) {
      this.selected = false;
      this.selectionBorder.visible = false;
    }
  };

  click = () => {
    this.selected ? this.onUnSelect() : this.onSelect();
    this.select && this.select(this, SelectionType.SINGLE);
  };

  // 创建选择边框
  create(props) {
    this.createEStopArea(props);
    this.createName(props);

    // fixIcon 和 eIcon 不需要同时呈现
    if (props.isFixed) {
      this.createFixIcon(props);
    } else {
      this.createIcon(props);
    }
    this.createSelectionBorder();

    // 处理点击事件
    this.areaSprite.interactive = true;
    this.areaSprite.buttonMode = true;
    this.areaSprite.interactiveChildren = false;
    this.areaSprite.on('pointerdown', this.click);
  }

  update(params) {
    if (this.areaSprite) {
      this.removeChild(this.areaSprite);
      this.areaSprite.destroy(true);
      this.areaSprite = null;
    }
    if (!isNull(this.namTextSprite)) {
      this.removeChild(this.namTextSprite);
      this.namTextSprite.destroy(true);
      this.namTextSprite = null;
    }
    if (!isNull(this.fixIcon)) {
      this.removeChild(this.fixIcon);
      this.fixIcon.destroy();
      this.fixIcon = null;
    }
    if (!isNull(this.eIcon)) {
      this.removeChild(this.eIcon);
      this.eIcon.destroy();
      this.eIcon = null;
    }
    if (!isNull(this.selectionBorder)) {
      this.removeChild(this.selectionBorder);
      this.selectionBorder.destroy(true);
      this.selectionBorder = null;
    }

    if (!isNull(params.x)) {
      this.x = params.x + params.xlength / 2;
    }
    if (!isNull(params.y)) {
      this.y = params.y + params.ylength / 2;
    }
    if (!isNull(params.angle)) {
      this.angle = params.angle;
    }
    this.create(params);
  }

  createSelectionBorder() {
    const padding = 200;
    const width = this.boxType === ZoneMarkerType.RECT ? this.xlength : this.r * 2;
    const height = this.boxType === ZoneMarkerType.RECT ? this.ylength : this.r * 2;
    this.selectionBorder = new SmoothGraphics();
    this.selectionBorder.lineStyle(5, 0xff0000);
    this.selectionBorder.drawRect(-padding / 2, -padding / 2, width + padding, height + padding);
    this.selectionBorder.alpha = 0.8;
    this.selectionBorder.visible = false;
    this.addChild(this.selectionBorder);
  }

  // 安全显示红色，不安全显示黄色，禁用显示灰色
  createEStopArea(props) {
    const { activated, isSafe, xlength, ylength, r } = props;
    let color, fillColor;
    if (activated) {
      if (isSafe) {
        color = EStopStateColor.active.safe.color;
        fillColor = EStopStateColor.active.safe.fillColor;
      } else {
        color = EStopStateColor.active.unSafe.color;
        fillColor = EStopStateColor.active.unSafe.fillColor;
      }
    } else {
      color = EStopStateColor.inactive.color;
      fillColor = EStopStateColor.inactive.fillColor;
    }
    this.areaSprite = this.addChild(new PIXI.Graphics());
    this.areaSprite.lineStyle(BorderWidth, color, 1);
    this.areaSprite.beginFill(fillColor);
    if (isNull(r)) {
      this.areaSprite.drawRect(0, 0, xlength, ylength);
    } else {
      this.areaSprite.drawCircle(0, 0, r);
    }
    this.areaSprite.endFill();
  }

  createName(props) {
    const { name, code, group } = props;
    let { xlength: width, ylength: height, r: radius } = props;
    this.nameText = name ? name : group ? `${group}: ${code}` : code;
    if (isNull(width) || isNull(height)) {
      width = radius * 2;
      height = radius * 2;
    }
    this.namTextSprite = this.addChild(
      new Text(this.nameText, width / 2, height / 2, 0xffffff, true, 200),
    );
    this.namTextSprite.anchor.set(0.5);
    this.namTextSprite.angle = -this.angle;

    // 字体大小自适应急停区大小
    const [textWidth, textHeight] = adaptLabelSize(
      { width, height },
      this.namTextSprite,
      this.boxType === ZoneMarkerType.RECT,
    );
    this.namTextSprite.width = textWidth;
    this.namTextSprite.height = textHeight;
    this.namTextSprite.zIndex = 2;
  }

  createIcon(props) {
    const { xlength, ylength, r: radius } = props;
    let _x, _y;
    if (this.boxType === ZoneMarkerType.RECT) {
      _x = xlength - 300;
      _y = ylength - 300;
    } else {
      _x = 0;
      _y = radius - 300;
    }
    const eIconTexture = getTextureFromResources('barrier');
    this.eIcon = this.addChild(new PIXI.Sprite(eIconTexture));
    this.eIcon.x = _x;
    this.eIcon.y = _y;
    this.eIcon.zIndex = 2;
    this.eIcon.angle = -this.angle;
    this.eIcon.anchor.set(0.5);
  }

  createFixIcon(props) {
    const { xlength, ylength, r: radius } = props;
    let _x, _y;
    if (this.boxType === ZoneMarkerType.RECT) {
      _x = xlength - 300;
      _y = ylength - 300;
    } else {
      _x = radius * Math.cos(45) - 200;
      _y = radius * Math.sin(45) - 200;
    }
    const fixedTexture = getTextureFromResources('pin');
    this.fixedIcon = this.addChild(new PIXI.Sprite(fixedTexture));
    this.fixedIcon.x = _x;
    this.fixedIcon.y = _y;
    this.fixedIcon.zIndex = 2;
    this.fixedIcon.angle = -this.angle;
    this.fixedIcon.anchor.set(0.5);
  }

  drawEStopMask(props) {
    const { isSafe, worldBounds, estopType } = props;
    let fillColor = 0xdec674;
    if (isSafe) {
      fillColor = 0xf3704b;
    }
    const { x, y, width, height } = worldBounds;
    const estopMask = new PIXI.Sprite(PIXI.Texture.WHITE);
    estopMask.x = x;
    estopMask.y = y;
    estopMask.width = width;
    estopMask.height = height;
    estopMask.alpha = 0.4;
    estopMask.tint = fillColor;

    if (estopType === 'Section') {
      this.sectionEStop = estopMask;
    } else {
      this.logicEStop = estopMask;
    }
    this.addChild(estopMask);
  }
}
export default EmergencyStop;
