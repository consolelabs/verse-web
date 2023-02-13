import { Player } from "characters/player";
import { SceneKey } from "constants/scenes";
import Phaser from "phaser";

const SCALE = 0.1;
const PADDING = -8;
const MAP_FRAME_SIZE = 200;

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
  mask?: Phaser.Display.Masks.GeometryMask;
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

    this.mapFrame = {
      x: PADDING,
      y: window.innerHeight - (MAP_FRAME_SIZE + PADDING),
      w: MAP_FRAME_SIZE,
      h: MAP_FRAME_SIZE,
    };
    this.map = {
      ...this.map,
      y: window.innerHeight - MAP_FRAME_SIZE * 2,
      h,
      w,
    };

    this.renderTexture = this.add.renderTexture(0, 0, this.map.w, this.map.h);
    this.renderTexture.setScale(SCALE);
    this.renderTexture.draw(layers);

    // Create a new mask instance
    this.mask = this.createMask();

    // camera
    this.cameras.main.setMask(this.mask);
    this.cameras.main.setViewport(
      PADDING,
      window.innerHeight - (MAP_FRAME_SIZE + PADDING),
      MAP_FRAME_SIZE,
      MAP_FRAME_SIZE
    );

    this.charShape = this.add.graphics({});
    this.charShape.fillStyle(0xff0000);
    this.charShape.fillRoundedRect(0, 0, 4, 4, 2);
    this.charShape.setDepth(9999);

    this.cameras.main.startFollow(this.charShape);
    this.cameras.main.roundPixels = true;

    // Handlers for on-resize
    window.addEventListener("resize", () => {
      // Destroy previous mask instance
      this.mask?.destroy();

      // Update the new frame/map position
      this.mapFrame.y = window.innerHeight - (MAP_FRAME_SIZE + PADDING);
      this.map.y = window.innerHeight - MAP_FRAME_SIZE * 2;

      // Create a new mask instance
      this.mask = this.createMask();

      // Update the camera mask & viewport
      this.cameras.main?.setMask(this.mask);
      this.cameras.main.setViewport(
        PADDING,
        window.innerHeight - (MAP_FRAME_SIZE + PADDING),
        MAP_FRAME_SIZE,
        MAP_FRAME_SIZE
      );
    });
  }

  createMask() {
    const shape = this.make.graphics({});
    shape.fillStyle(0xffffff);
    shape.fillRoundedRect(
      this.mapFrame.x,
      this.mapFrame.y,
      this.mapFrame.w,
      this.mapFrame.h,
      8
    );
    // shape.arc(
    //   this.mapFrame.x,
    //   this.mapFrame.y,
    //   this.mapFrame.h / 2,
    //   Phaser.Math.DegToRad(0),
    //   Phaser.Math.DegToRad(360)
    // );
    // shape.fillPath();
    const mask = shape.createGeometryMask();

    // decorations
    const border1 = this.add.graphics();
    border1.lineStyle(6, 0x02c9a3);
    border1.strokeRoundedRect(
      this.mapFrame.x - PADDING + 1,
      1,
      this.mapFrame.w - 2,
      this.mapFrame.h - 2,
      8
    );
    border1.setScrollFactor(0);

    const border2 = this.add.graphics();
    border2.lineStyle(3, 0x77777f);
    border2.strokeRoundedRect(
      this.mapFrame.x - PADDING + 4.5,
      4.5,
      this.mapFrame.w - 9,
      this.mapFrame.h - 9,
      6
    );
    border2.setScrollFactor(0);

    return mask;
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
