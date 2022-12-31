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
      layer.objects.forEach((object) => {
        let body: MatterJS.BodyType | null = null;
        if (object.rectangle) {
          body = this.matter.add.rectangle(
            0,
            0,
            object.width ?? 0,
            object.height ?? 0,
            {
              isStatic: true,
            }
          );
        } else if (object.polygon) {
          body = this.matter.add.fromVertices(0, 0, object.polygon, {
            isStatic: true,
          });
        }
        if (body) {
          const x = object.x ?? 0;
          const y = object.y ?? 0;

          if (object.polygon) {
            // TODO: okay so the first point of the polygon when drawn in tiled will be the origin
            // so depending on where the origin is, we will have to set the proper align e.g TOP_LEFT, BOTTOM_RIGHT, etc...
            // which is ridiculously nonsense so I don't know what 🤷
          } else {
            // otherwise recangle origin is alwasy the top left so we're good
            this.matter.alignBody(body, x, y, Phaser.Display.Align.TOP_LEFT);
          }
        }
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
      // x: 0,
      // y: 0,
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
