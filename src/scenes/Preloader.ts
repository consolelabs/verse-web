import Phaser from "phaser";
import { CDN_PATH, TILE_SIZE } from "../constants";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super({
      key: "preloader",
      loader: {
        baseURL: `${CDN_PATH}/tiles`,
      },
    });
  }

  preload() {
    const tilesetSource = Object.fromEntries(
      this.cache.tilemap
        .get("map")
        ?.data.tilesets.map((ts: any) => [ts.name, ts.image]) ?? []
    );
    const map = this.make.tilemap({
      key: "map",
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    console.log(map);
    const { layers = [], tilesets = [] } = map;

    // load tiled tilesets
    tilesets.forEach((tileset) => {
      this.load.image(tileset.name, tilesetSource[tileset.name]);
    });

    // load the sprite in each layer
    layers.forEach((layer) => {
      layer.data.forEach((row) => {
        row.forEach((tile) => {
          const spriteImage = tile.properties.spriteImage;
          const spriteJSON = tile.properties.spriteJSON ?? "";
          const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
          const isMultiAtlas = tile.properties.multiatlas ?? false;
          if (spriteKey && spriteJSON) {
            if (isMultiAtlas) {
              const path = spriteJSON.split("/");
              path.pop();
              this.load.multiatlas(spriteKey, spriteJSON, path.join("/"));
            } else {
              this.load.atlas(spriteKey, spriteImage, spriteJSON);
            }
          }
        });
      });
    });
  }

  create() {
    this.scene.start("game");
  }
}
