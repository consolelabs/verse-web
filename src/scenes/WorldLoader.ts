import { API_BASE_URL } from "envs";
import { TitleBg } from "objects/TitleBg";
import Phaser from "phaser";
import { Ad } from "types/ads";
import { SceneKey } from "../constants/scenes";
import { useGameState } from "stores/game";

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

    Object.entries<string>(config.maps).forEach((entry) => {
      this.load.tilemapTiledJSON(entry[0], entry[1]);
    });

    this.load.json("ads", `${API_BASE_URL}/ads?map_id=${0}`);
  }

  create() {
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.cache.json.remove("ads");
      this.scene.start(SceneKey.GAME);
      // this.scene.start(SceneKey.POD);
    });
    const { data: ads } = this.cache.json.get("ads");

    useGameState.getState().setAds(ads);

    ads.forEach((ad: Ad) => {
      this.load.image(`ads_${ad.code}`, ad.image_url);
    });
    this.load.start();
  }
}
