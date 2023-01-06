import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.BOOT,
    });
  }

  preload() {
    this.load.image(
      "title-screen-bg",
      "/public/assets/images/title-screen-bg.jpeg"
    );
  }

  create() {
    this.scene.start(SceneKey.CONFIG_LOADER);
  }
}
