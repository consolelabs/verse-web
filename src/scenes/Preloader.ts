import Phaser from "phaser";

export const buildings = ["erc"];

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    this.load.image("BlackTile", "tiles/BlackTile.png");
    this.load.image("FenceCyber", "tiles/FenceCyber.png");
    this.load.tilemapTiledJSON("map", "tiles/map.json");

    buildings.forEach((building) => {
      this.load.atlas(
        building,
        `tiles/buildings/${building}/${building}.png`,
        `tiles/buildings/${building}/${building}.json`
      );
      this.load.image(
        `${building}-static`,
        `tiles/buildings/${building}/${building}-static.png`
      );
    });
  }

  create() {
    this.scene.start("game");
  }
}
