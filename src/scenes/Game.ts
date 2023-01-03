import Phaser from "phaser";
import { Player } from "../characters/player";
import { PROD, TILE_SIZE } from "../constants";
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
          debug: !PROD,
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
        const x = object.x ?? 0;
        const y = object.y ?? 0;
        const w = object.width ?? 0;
        const h = object.height ?? 0;

        if (object.rectangle) {
          const body = this.matter.add.rectangle(0, 0, w, h, {
            isStatic: true,
          });

          this.matter.alignBody(body, x, y, Phaser.Display.Align.TOP_LEFT);
        } else if (object.polygon) {
          // When converting Tiled polygon objects to game objects with MatterJS.Bodies.fromVertices method,
          // Phaser will recalculate the vertices' positions based on the object position. That means,
          // the final vertices' positions will no longer be the same as they are when we draw them in Tiled.
          // This demands a custom logic to translate them back to their original position.

          // Assuming that the polygon objects exported from Tiled is correct,
          // the polygon points' positions will be relative to the polygon object's position.
          // First, we need to get the original (absolute) coordinates of all vertices.
          const vertices = object.polygon.map((point) => {
            const pX = point.x ?? 0;
            const pY = point.y ?? 0;

            return {
              x: pX + x,
              y: pY + y,
            };
          });

          // Now calculate the original bounds of the object
          const originalBounds = {
            max: {
              x: Math.max(...vertices.map((point) => point.x)),
              y: Math.max(...vertices.map((point) => point.y)),
            },
            min: {
              x: Math.min(...vertices.map((point) => point.x)),
              y: Math.min(...vertices.map((point) => point.y)),
            },
          };

          // Create the body
          const body = this.matter.add.fromVertices(x, y, object.polygon, {
            isStatic: true,
          });

          // Now calculate the offset between the created body & the original bounds
          const offset = {
            x: body.bounds.min.x - originalBounds.min.x,
            y: body.bounds.min.y - originalBounds.min.y,
          };

          this.matter.body.setPosition(body, {
            x: body.position.x - offset.x,
            y: body.position.y - offset.y,
          });
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
