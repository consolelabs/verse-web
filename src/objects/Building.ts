import Game from "../scenes/Game";

// FIXME: Get this from constant somewhere else
const baseTileSize = 16;

export const buildings: Array<{
  key: string;
  sprites: Array<{
    key: string;
    count?: number;
    frameCount: number;
    duration?: number;
    depthOffset?: number;
  }>;
}> = [
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
  {
    key: "strategy-research-center",
    sprites: [
      {
        key: "building",
        count: 2,
        frameCount: 5,
        duration: 1000,
      },
      {
        key: "panel",
        frameCount: 1,
      },
    ],
  },
  {
    key: "botanical-research-center",
    sprites: [
      {
        key: "building",
        frameCount: 1,
      },
      {
        key: "tree",
        frameCount: 1,
      },
      {
        key: "glitteroot",
        frameCount: 1,
      },
    ],
  },
  {
    key: "energy-research-center",
    sprites: [
      {
        key: "building",
        count: 5,
        frameCount: 20,
        duration: 2000,
      },
      {
        key: "board",
        frameCount: 1,
      },
      {
        key: "crystal",
        frameCount: 1,
      },
    ],
  },
  // {
  //   key: "bg",
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
      Array<{
        anchor: {
          bottom: number;
          left: number;
        };
      }>
    > = {};

    sprites.forEach((sprite) => {
      spriteDict[`${key}-${sprite.key}`] = [];
    });

    // FIXME: We are assuming that Buildings - Floor is the floor of the building,
    // which contains the sprite key that points to the part of the building
    // that should be rendered as sprite objects. We'll have to detect those tiles
    // & work out the correct coord & size of the sprite that we want to generate.
    //
    // We'll probably also want to move this loop & detect logic up elsewhere, because running it for multiple buildings
    // is not performant.
    const buildingsLayerFloor = map.getLayer("Anchors");
    buildingsLayerFloor.data.forEach((row, y) => {
      row.forEach((tile, x) => {
        const spriteKey = tile.properties.sprite;

        if (spriteKey && spriteDict[spriteKey]) {
          spriteDict[spriteKey].push({
            anchor: {
              bottom: y,
              left: x,
            },
          });
        }
      });
    });

    sprites.forEach((sprite) => {
      const anchors = spriteDict[`${key}-${sprite.key}`];
      anchors.forEach(({ anchor }) => {
        const combinedKey = `${key}-${sprite.key}`;

        // In Phaser 3 when we add a sprite, the coord will correspond to the center
        // of the sprite, so as for where we should put the sprite,
        // we should calculate it against the anchor (bottom left)
        const spriteObject = game.matter.add.sprite(
          anchor.left * baseTileSize,
          (anchor.bottom + 1) * baseTileSize,
          `${combinedKey}-sprite`,
          "frame (1).png",
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
    });

    this.tilesets.push(map.addTilesetImage(`${key}-tiled`, `${key}-tiled`));
  }
}
