import { TitleBg } from "objects/TitleBg";
import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.BOOT,
    });
  }

  preload() {
    this.load.audio("background-audio", "/assets/audio/street-food.mp3");
    this.load.audio("start-game-audio", "/assets/audio/start-game.mp3");
    this.load.image("title-screen-bg", "/assets/images/title-screen-bg.jpeg");
    this.load.image("logo", "/assets/images/logo.png");
    this.load.image("consolelabslogo", "/assets/images/consolelabslogo.png");
  }

  create() {
    new TitleBg({ scene: this });
  }
}
