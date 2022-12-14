import * as PIXI from 'pixi.js';
import { getTextureFromResources } from '@/utils/mapUtil';
import BitText from './BitText';
import { GlobalAlpha, zIndex } from '@/config/consts';

export default class GroundStorage extends PIXI.Container {
  constructor(props) {
    super();
    this.x = props.x;
    this.y = props.y;
    this.cellId = props.cellId;
    this.code = props.code;
    this.$height = props.height;
    this.$width = props.width;
    this.cullable = true;
    this.angle = props.angle || 0;
    this.zIndex = zIndex.functionIcon;
    this.create();
    this.addPodCode();
  }

  create() {
    const forkPodTexture = getTextureFromResources('fork_ground_storage');
    this.pod = new PIXI.Sprite(forkPodTexture);
    this.pod.x = 0;
    this.pod.y = 0;
    this.pod.height = this.$height;
    this.pod.width = this.$width;
    this.pod.alpha = GlobalAlpha;
    this.pod.anchor.set(0.5);
    this.addChild(this.pod);
  }

  addPodCode() {
    this.idText = new BitText(this.code, 0, -this.$height * 0.35, 0xffffff, 100);
    this.idText.anchor.set(0.5);
    this.addChild(this.idText);
  }
}
