import { API_BASE_URL } from "envs";
import { TitleBg } from "objects/TitleBg";
import Phaser from "phaser";
import { Ad } from "types/ads";
import { FullResponse } from "types/apis";
import { SceneKey } from "../constants/scenes";
import { useGameState } from "stores/game";

export default class WorldLoader extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.WORLD_LOADER,
    });
  }

  preload() {
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.scene.start(SceneKey.GAME);
      // this.scene.start(SceneKey.POD);
    });

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

    (async () => {
      const data: FullResponse<Ad> = (await fetch(
        `${API_BASE_URL}/ads?map_id=${0}`
      ).then((res) => res.json())) as any;
      const ads = data?.data || [];
      useGameState.getState().setAds(ads);

      ads.forEach((ad) => {
        this.load.image(`ads_${ad.code}`, ad.image_url);
      });
    })();
  }

  create() {
    this.load.start();
  }
}
