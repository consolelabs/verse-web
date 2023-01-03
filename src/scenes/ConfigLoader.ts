import Phaser from "phaser";
import { CDN_PATH } from "../constants";

export default class ConfigLoader extends Phaser.Scene {
  constructor() {
    super({
      key: "config-loader",
      loader: {
        baseURL: CDN_PATH,
      },
    });
  }

  preload() {
    this.load.json("config", "./config.json");
    this.load.json("interaction", "./interaction.json");
  }

  create() {
    this.scene.start("world-loader");
  }
}
