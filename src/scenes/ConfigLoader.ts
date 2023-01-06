import Phaser from "phaser";
import { CDN_PATH } from "../constants";
import { TitleBg } from "../objects/TitleBg";

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
    new TitleBg({ scene: this });

    this.load.json("config", "./config.json");
    this.load.json("interaction", "./interaction.json");
    this.load.json("dialogue", "./dialogue.json");
  }

  create() {
    this.scene.start("asset-loader");
  }
}
