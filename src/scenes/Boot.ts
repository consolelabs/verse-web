import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.BOOT,
    });
  }

  preload() {
    this.load.image("title-screen-bg", "/assets/images/title-screen-bg.jpeg");
    this.load.image("consolelabslogo", "/assets/images/consolelabslogo.png");
  }

  create() {
    this.scene.start(SceneKey.INTRO);
  }
}
