import Phaser from "phaser";
import { Button } from "../objects/Button";
import { TitleBg } from "../objects/TitleBg";

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
    // Show title bg
    new TitleBg({ scene: this });

    // Show start game button
    new Button({
      scene: this,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      text: "START GAME",
      onClick: () => {
        // Fade out & prepare for scene transition
        this.cameras.main.fadeOut(500, 0, 0, 0);
      },
    });

    // Start scene transition when camera is fully fade out
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start("world-loader");
      }
    );
  }
}
