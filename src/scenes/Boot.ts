import Phaser from "phaser";
import { CDN_PATH } from "../constants";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: "boot",
      loader: {
        baseURL: `${CDN_PATH}/tiles`,
      },
    });
  }

  preload() {
    this.load.tilemapTiledJSON("map", "/map.json");
    this.load.json("shapes", "/shapes.json");
  }

  create() {
    this.scene.start("preloader");
  }
}
