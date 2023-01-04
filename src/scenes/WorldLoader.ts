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
    this.load.json("config", "/tiles/config.json");
    this.load.tilemapTiledJSON("map", "/tiles/map.json");
    this.load.tilemapTiledJSON("pod", "/tiles/pod.json");

    // Still show title scene
    new TitleBg({ scene: this });
  }

  create() {
    const { shapes: shapeFiles = {} } = this.cache.json.get("config");

    Object.entries<string>(shapeFiles).forEach((sf) => {
      this.load.json(`${sf[0]}-shapes`, `/tiles/${sf[1]}`);
    });

    this.load.once("complete", () => {
      // Fade out & prepare for scene transition
      this.cameras.main.fadeOut(500, 0, 0, 0);
    });

    this.load.start();

    // Start scene transition when camera is fully fade out
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.scene.start("pod");
      }
    );
  }
}
