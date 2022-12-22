import Phaser from "phaser";
import { Player } from "../characters/player";

export default class Game extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super("game");
  }

  preload() {
    this.player = new Player("neko", this);
  }

  create() {
    const map = this.make.tilemap({
      key: "map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const blackTileset = map.addTilesetImage("BlackTile", "BlackTile");
    const fenceTileset = map.addTilesetImage("FenceCyber", "FenceCyber");

    map.createLayer("Ground", blackTileset, 0, 0);

    const wallsLayer = map.createLayer("Walls", fenceTileset, 0, 0);
    wallsLayer.setCollisionByProperty({ collides: true });

    const player = this.player.spawn({
      x: 200,
      y: 200,
      scale: 0.3,
    });
    this.physics.add.existing(player);

    this.physics.add.collider(player, wallsLayer);

    this.cameras.main.startFollow(player, true);

    // Test Building
    const building = this.add.sprite(600, 600, "erc", "frames/00.png");
    this.anims.create({
      key: "building-idle",
      frames: this.anims.generateFrameNames("erc", {
        prefix: "frames/",
        start: 0,
        end: 19,
        suffix: ".png",
        zeroPad: 2,
      }),
      repeat: -1,
      duration: 2000,
    });
    building.anims.play("building-idle");
    this.physics.add.existing(building, true);
    this.physics.add.collider(building, player);
  }

  update() {
    if (!this.player) {
      return;
    }
    this.player.update();
  }
}
