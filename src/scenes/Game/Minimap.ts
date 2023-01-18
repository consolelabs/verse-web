import { Player } from "characters/player";
import { SceneKey } from "constants/scenes";
import Phaser from "phaser";

const SCALE = 0.05;
const ZOOM = 0.8;
const PADDING = 20;

export default class Minimap extends Phaser.Scene {
  renderTexture?: Phaser.GameObjects.RenderTexture;
  map = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  mapFrame = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  charShape?: Phaser.GameObjects.Graphics;
  player?: Player;

  constructor() {
    super({
      key: SceneKey.MINIMAP,
    });
  }

  create({
    layers,
    w,
    h,
    player,
  }: {
    player: Player;
    w: number;
    h: number;
    layers: Array<Phaser.Tilemaps.TilemapLayer>;
  }) {
    this.player = player;
    this.cameras.main.setBackgroundColor(0x000000);
    const mapFrameSize = (w * SCALE) / 2;
    this.mapFrame = {
      x: mapFrameSize / 2 + PADDING,
      y: window.innerHeight - (mapFrameSize / 2 + PADDING),
      w: mapFrameSize,
      h: mapFrameSize,
    };
    this.map = {
      ...this.map,
      y: window.innerHeight - mapFrameSize * 2,
      h,
      w,
    };

    const shape = this.make.graphics({});
    shape.fillStyle(0xffffff);
    shape.arc(
      this.mapFrame.x,
      this.mapFrame.y,
      this.mapFrame.h / 2,
      Phaser.Math.DegToRad(0),
      Phaser.Math.DegToRad(360)
    );
    shape.fillPath();
    const mask = shape.createGeometryMask();

    this.renderTexture = this.add.renderTexture(0, 0, this.map.w, this.map.h);
    this.renderTexture.setScale(SCALE);

    this.renderTexture.draw(layers);

    // decorations
    const ring1 = this.add.graphics();
    ring1.lineStyle(3, 0x03ffcf);
    ring1.strokeCircle(
      this.mapFrame.x - PADDING,
      this.mapFrame.h / 2,
      this.mapFrame.h / 2 + PADDING - 1.5
    );
    ring1.setScrollFactor(0);

    const ring2 = this.add.graphics();
    ring2.lineStyle(5, 0x77777f);
    ring2.strokeCircle(
      this.mapFrame.x - PADDING,
      this.mapFrame.h / 2,
      this.mapFrame.h / 2 + PADDING - 6
    );
    ring2.setScrollFactor(0);

    // camera
    this.cameras.main.setMask(mask);
    this.cameras.main.setZoom(ZOOM);
    this.cameras.main.setViewport(
      PADDING,
      window.innerHeight - (mapFrameSize + PADDING),
      mapFrameSize,
      mapFrameSize
    );

    this.charShape = this.add.graphics({});
    this.charShape.fillStyle(0xff0000);
    this.charShape.fillRoundedRect(0, 0, 5, 5, 2);
    this.charShape.setDepth(9999);

    this.cameras.main.startFollow(this.charShape);
  }

  update() {
    if (this.player?.character?.instance) {
      const { x, y } = this.player.character.instance;
      const scaleX = x * SCALE;
      const scaleY = y * SCALE;
      this.charShape?.setPosition(scaleX, scaleY);
    }
  }
}
