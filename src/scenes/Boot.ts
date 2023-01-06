import Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: "boot",
    });
  }

  preload() {
    this.load.image(
      "title-screen-bg",
      "/public/assets/images/title-screen-bg.jpeg"
    );
  }

  create() {
    this.scene.start("config-loader");
  }
}
