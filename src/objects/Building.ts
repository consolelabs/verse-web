import Game from "../scenes/Game";

export const buildings = [
  {
    key: "airport",
    sprites: [
      {
        key: "building",
        frameCount: 1,
      },
      {
        key: "plane",
        frameCount: 1,
      },
      {
        key: "sign",
        frameCount: 8,
        duration: 1000,
        depthOffset: 2,
      },
      {
        key: "board",
        frameCount: 1,
      },
    ],
  },
  // {
  //   key: "bg",
  // },
  // {
  //   key: "brc",
  // },
  // {
  //   key: "ch",
  // },
  // {
  //   key: "drc",
  // },
  // {
  //   key: "erc",
  // },
  // {
  //   key: "src",
  // },
];

export class Building {
  public tilesets: Phaser.Tilemaps.Tileset[] = [];
  public sprites: Phaser.GameObjects.Sprite[] = [];

  constructor({
    game,
    map,
    key,
    sprites,
  }: {
    game: Game;
    map: Phaser.Tilemaps.Tilemap;
  } & typeof buildings[0]) {
    const spriteDict: Record<
      string,
      {
        anchor: {
          bottom: number;
          left: number;
        };
      }
    > = {};

    sprites.forEach((sprite) => {
      spriteDict[sprite.key] = {
        anchor: {
          bottom: 0,
          left: 0,
        },
      };
    });

    // FIXME: We are assuming that Buildings - Floor is the floor of the building,
    // which contains the sprite key that points to the part of the building
    // that should be rendered as sprite objects. We'll have to detect those tiles
    // & work out the correct coord & size of the sprite that we want to generate.
    //
    // We'll probably also want to move this loop & detect logic up elsewhere, because running it for multiple buildings
    // is not performant.
    const buildingsLayerFloor = map.getLayer("Buildings - Floor");
    buildingsLayerFloor.data.forEach((row, y) => {
      row.forEach((tile, x) => {
        const spriteKey = tile.properties.sprite;

        if (spriteKey && spriteDict[spriteKey]) {
          spriteDict[spriteKey].anchor = {
            bottom: y,
            left: x,
          };
        }
      });
    });

    console.log(spriteDict);

    sprites.forEach((sprite) => {
      // FIXME: Get this from constant somewhere else
      const baseTileSize = 16;
      const anchor = spriteDict[sprite.key].anchor;
      const combinedKey = `${key}-${sprite.key}`;

      // In Phaser 3 when we add a sprite, the coord will correspond to the center
      // of the sprite, so as for where we should put the sprite,
      // we should calculate it against the anchor (bottom left)
      const spriteObject = game.matter.add.sprite(
        (anchor.left + 1) * baseTileSize,
        (anchor.bottom + 1) * baseTileSize,
        `${combinedKey}-sprite`,
        "frames (1).png",
        { isStatic: true, isSensor: true }
      );

      const offset = {
        width: spriteObject.width / 2,
        height: spriteObject.height / 2,
      };
      spriteObject.x = spriteObject.x + offset.width;
      spriteObject.y = spriteObject.y - offset.height;

      if (sprite.frameCount > 1) {
        game.anims.create({
          key: `${combinedKey}-anims`,
          frames: game.anims.generateFrameNames(`${combinedKey}-sprite`, {
            prefix: "frame (",
            start: 1,
            end: sprite.frameCount,
            suffix: ").png",
          }),
          repeat: -1,
          duration: sprite.duration || 3000,
        });
        spriteObject.anims.play(`${combinedKey}-anims`);
      }

      spriteObject.setDepth(anchor.bottom + (sprite.depthOffset || 0));
      this.sprites.push(spriteObject);
    });

    this.tilesets.push(map.addTilesetImage(`${key}-tiled`, `${key}-tiled`));
  }
}
