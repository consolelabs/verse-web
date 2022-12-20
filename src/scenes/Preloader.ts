import Phaser from "phaser";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("BlackTile", "tiles/BlackTile.png");
    this.load.image("FenceCyber", "tiles/FenceCyber.png");
    this.load.tilemapTiledJSON("map", "tiles/map.json");

    this.load.atlas(
      "player",
      "characters/player.png",
      "characters/player.json"
    );
  }

  create() {
    this.scene.start("game");
  }
}
