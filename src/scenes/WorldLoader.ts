import Phaser from "phaser";
import { CDN_PATH, TILE_SIZE } from "../constants";
import { TitleBg } from "../objects/TitleBg";

export default class WorldLoader extends Phaser.Scene {
  constructor() {
    super({
      key: "world-loader",
      loader: {
        baseURL: `${CDN_PATH}/tiles`,
      },
    });
  }

  preload() {
    this.load.json("shapes", "/shapes.json");
    this.load.tilemapTiledJSON("map", "/map.json");

    // Still show title scene
    new TitleBg({ scene: this });

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  create() {
    // Now load assets
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
    // console.log(map);
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
