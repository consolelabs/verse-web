import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class WorldLoader extends Phaser.Scene {
  private proceed = false;

  constructor() {
    super({
      key: SceneKey.WORLD_LOADER,
    });
  }

  preload() {
    const config = this.cache.json.get("config");
    if (
      !config ||
      !config.maps ||
      Object.keys(config.maps).length === 0 ||
      !config.main ||
      !config.maps[config.main]
    )
      return;

    this.load.tilemapTiledJSON("pod", "/tiles/pod.json");
    Object.entries<string>(config.maps).forEach((entry) => {
      this.load.tilemapTiledJSON(entry[0], entry[1]);
    });
  }

  create() {
    this.load.once("complete", () => {
      this.proceed = true;
      this.cameras.main.fadeOut(100, 0, 0, 0);
    });

    // Start scene transition when camera is fully fade out
    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        if (this.proceed) {
          this.scene.start(SceneKey.GAME);
        } else {
          // TODO: maybe show error scene
        }
      }
    );

    this.load.start();
  }
}
