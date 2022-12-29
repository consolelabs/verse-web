import Phaser from "phaser";
import { Player } from "../characters/player";
import { TILE_SIZE } from "../constants";
import { BaseSprite } from "../objects/BaseSprite";

export default class Game extends Phaser.Scene {
  private player!: Player;

  constructor() {
    super({
      key: "game",
      physics: {
        matter: {
          debug: true,
          gravity: { y: 0 },
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

    const map = this.make.tilemap({
      key: "map",
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    const { layers = [], tilesets = [] } = map;

    tilesets.forEach((tileset) => map.addTilesetImage(tileset.name));

    layers.forEach((layer) => {
      const isStatic =
        // @ts-ignore
        layer.properties.find((p) => p.name === "static")?.value ?? false;
      const tilesets =
        // @ts-ignore
        layer.properties.find((p) => p.name === "tilesets")?.value ?? "";

      //
      if (isStatic) {
        const createdLayer = map.createLayer(
          layer.name,
          tilesets.split(","),
          0,
          0
        );
        createdLayer.setCollisionByProperty({ collides: true });
        this.matter.world.convertTilemapLayer(createdLayer);
      } else {
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

    this.player.loadCharacters(["tv-head", "neko", "fukuro", "ghost-neko"], {
      x: 200,
      y: 200,
      scale: 0.3,
    });
  }

  update() {
    if (!this.player) {
      return;
    }

    // Check player vs buildings overlap
    // FIXME: Should have some preliminary check to avoid performance struggle. We don't want
    // to check for overlap every round of render, on every building
    // this.sprites.forEach((sprite) => {
    //   // https://phaser.discourse.group/t/check-collision-overlap-between-sprites-without-physics/6696/4
    //   const playerBounds = new Phaser.Geom.Rectangle(
    //     this.player.instance.x,
    //     this.player.instance.y,
    //     this.player.instance.width,
    //     this.player.instance.height
    //   );

    //   try {
    //     const spriteBounds = sprite.getBounds();
    //     if (
    //       Phaser.Geom.Intersects.RectangleToRectangle(
    //         playerBounds,
    //         spriteBounds
    //       )
    //     ) {
    //       sprite.setAlpha(0.5);
    //     } else {
    //       sprite.setAlpha(1);
    //     }
    //   } catch {
    //     // Do nothing
    //   }
    // });

    this.player.update();
  }
}
