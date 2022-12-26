import { TILE_SIZE } from "../constants";
import Game from "../scenes/Game";

export class BaseSprite {
  public spriteObject: Phaser.Physics.Matter.Sprite;

  constructor({
    key,
    game,
    anchor,
    animated = false,
    duration = 1000,
  }: {
    key: string;
    game: Game;
    anchor: { left: number; bottom: number };
    animated?: boolean;
    duration?: number;
  }) {
    const shapes = game.cache.json.get("shapes");

    const spriteObject = game.matter.add.sprite(
      anchor.left * TILE_SIZE,
      (anchor.bottom + 1) * TILE_SIZE,
      key,
      undefined,
      {
        isStatic: true,
        isSensor: true,
        // @ts-ignore
        shape: shapes[key],
      }
    );
    const bodyOriginOffset = {
      x: spriteObject.originX - 0.5,
      y: spriteObject.originY - 0.5,
    };

    // Offset calculation
    const offset = {
      width: spriteObject.width / 2 + bodyOriginOffset.x * spriteObject.width,
      height:
        spriteObject.height / 2 - bodyOriginOffset.y * spriteObject.height,
    };
    spriteObject.x = spriteObject.x + offset.width;
    spriteObject.y = spriteObject.y - offset.height;

    if (animated) {
      game.anims.create({
        key: `${key}-anims`,
        frames: game.anims.generateFrameNames(key),
        repeat: -1,
        duration: Number.isNaN(duration) ? 1000 : duration,
      });
      spriteObject.anims.play(`${key}-anims`);
    }

    spriteObject.setDepth(
      anchor.bottom -
        (shapes[key]
          ? (spriteObject.height - spriteObject.displayOriginY) / TILE_SIZE
          : 0)
    );

    this.spriteObject = spriteObject;
  }
}
