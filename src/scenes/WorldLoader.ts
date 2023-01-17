import { TitleBg } from "objects/TitleBg";
import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";

export default class WorldLoader extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.WORLD_LOADER,
    });
  }

  preload() {
    new TitleBg({ scene: this });

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
    this.scene.start(SceneKey.GAME);
  }
}
