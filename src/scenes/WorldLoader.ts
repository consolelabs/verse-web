import Phaser from "phaser";
import { CDN_PATH } from "../constants";
import { TitleBg } from "../objects/TitleBg";

export default class WorldLoader extends Phaser.Scene {
  constructor() {
    super({
      key: "world-loader",
      loader: {
        baseURL: CDN_PATH,
      },
    });
  }

  preload() {
    this.load.image("title-screen-bg", "/images/title-screen-bg.jpeg");
    this.load.tilemapTiledJSON("map", "/tiles/map.json");
    this.load.tilemapTiledJSON("pod", "/tiles/pod.json");

    // Still show title scene
    new TitleBg({ scene: this });
  }

  create() {
    this.load.once("complete", () => {
      // Fade out & prepare for scene transition
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.load.start();

    // Start scene transition when camera is fully fade out
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start("game");
      }
    );
  }
}
