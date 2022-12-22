import Game from "../scenes/Game";

export class Building {
  public staticTilesets: Phaser.Tilemaps.Tileset[] = [];
  public sprites: Phaser.GameObjects.Sprite[] = [];

  constructor({
    game,
    map,
    key,
  }: {
    game: Game;
    map: Phaser.Tilemaps.Tilemap;
    key: string;
  }) {
    // FIXME: We are assuming that Buildings - 0 is the floor of the building,
    // which contains the sprite key that points to the animated part of the building
    // We'll have to detect those tiles & work out the correct coord & size of the sprite
    // that we want to generate
    //
    // We'll probably also want to move this loop & detect logic up elsewhere, because running it for multiple buildings
    // is not performant
    const bounding = { top: 999, left: 999, bottom: 0, right: 0 };
    const buildingsLayer01 = map.getLayer("Buildings - 0");
    buildingsLayer01.data.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.properties.sprite === key) {
          bounding.top = Math.min(bounding.top, y);
          bounding.bottom = Math.max(bounding.bottom, y);
          bounding.left = Math.min(bounding.left, x);
          bounding.right = Math.max(bounding.left, x);
        }
      });
    });

    // FIXME: Get this from constant somewhere else
    const baseTileSize = 16;

    // In Phaser 3 when we add a sprite, the coord will correspond to the center
    // of the sprite, so as for where we should put the sprite, it'll be the
    // middle point of the bottom edge
    const building = game.add.sprite(
      (baseTileSize * (bounding.left + bounding.right)) / 2,
      baseTileSize * bounding.bottom,
      key,
      "frames/00.png"
    );

    // However, we cannot just add the sprite there.
    // 1. We should not use the default sprite size, but have to re-calculate it based on the bounding instead
    // 2. We have to calculate for the vertical offset because the marking in the tilemap
    //    is only for the SUPPOSED FLOOR part of the animated component
    const trueWidth = baseTileSize * (bounding.right - bounding.left);
    const trueHeight = (building.height * trueWidth) / building.width;
    building.setScale(trueWidth / building.width, trueHeight / building.height);
    building.width = trueWidth;
    building.height = trueHeight;

    const verticalOffset = building.height / 2;
    building.y = building.y - verticalOffset;

    game.anims.create({
      key: `building-${key}-idle`,
      frames: game.anims.generateFrameNames(key, {
        prefix: "frames/",
        start: 0,
        end: 19,
        suffix: ".png",
        zeroPad: 2,
      }),
      repeat: -1,
      duration: 3000,
    });
    building.anims.play(`building-${key}-idle`);
    building.setDepth(bounding.bottom);

    this.staticTilesets.push(
      map.addTilesetImage(`${key}-static`, `${key}-static`)
    );
    this.sprites.push(building);

    const render = game.add.graphics();
    render.lineStyle(3, 0xffff37);
    render.strokeRectShape(building.getBounds());
  }
}
