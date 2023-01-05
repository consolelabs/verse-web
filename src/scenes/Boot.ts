import Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: "boot",
      loader: {
        baseURL: "/assets",
      },
    });
  }

  preload() {
    this.load.image("title-screen-bg", "/images/title-screen-bg.jpeg");
  }

  create() {
    this.scene.start("config-loader");
  }
}
