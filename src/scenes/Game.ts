import Phaser from "phaser";
import { Player } from "../characters/player";
import { TILE_SIZE } from "../constants";
import { BaseSprite } from "../objects/BaseSprite";
import Stats from "stats.js";

// FPS Counter
const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

export default class Game extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super({
      key: "game",
      physics: {
        matter: {
          gravity: { y: 0 },
          debug: true,
          // @ts-ignore
          debugShowBody: true,
          debugBodyColor: 0x0000ff,
        },
      },
    });
  }

  preload() {
    this.player = new Player(this);
  }

  create() {
    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Load the map & the sprites
    const map = this.make.tilemap({
      key: "map",
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const { objects = [], layers = [], tilesets = [] } = map;

    objects.forEach((layer) => {
      const gameObjects = map.createFromObjects(layer.name, {});
      gameObjects.forEach((_go) => {
        // add the game object to the matter physics world and set the collide group to be the same with the player's (default is 0)
      });
    });

    tilesets.forEach((tileset) => map.addTilesetImage(tileset.name));

    layers.forEach((layer) => {
      const isStatic =
        // @ts-ignore
        layer.properties.find((p) => p.name === "static")?.value ?? false;

      const tilesets =
        // @ts-ignore
        layer.properties.find((p) => p.name === "tilesets")?.value ?? "";

      map.createLayer(layer.name, tilesets.split(","), 0, 0);

      if (!isStatic) {
        layer.data.forEach((row, y) => {
          row.forEach((tile, x) => {
            const spriteJSON = tile.properties.spriteJSON ?? "";
            const spriteKey = spriteJSON.split("/").pop()?.slice(0, -5);
            if (spriteJSON) {
              const atlas = this.textures.get(spriteKey);
              // phaser auto add a "BASE" frame so we need to subtract 1 more
              const animated = atlas.frameTotal - 1 > 1;
              new BaseSprite({
                game: this,
                key: spriteKey,
                anchor: { left: x, bottom: y },
                animated,
                duration: Number(tile.properties.duration),
              });
            }
          });
        });
      }
    });

    // Load characters
    this.player.loadCharacters(["tv-head", "neko", "fukuro", "ghost-neko"], {
      x: 5000,
      y: 5600,
      scale: 0.4,
    });
  }

  update() {
    stats.begin();

    if (!this.player) {
      return;
    }

    this.player.update();

    stats.end();
  }
}
