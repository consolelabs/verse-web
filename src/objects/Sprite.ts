import { TILE_SIZE } from "../constants";
import Game from "../scenes/Game/Map";

export class Sprite {
  static add({
    key,
    game,
    anchor,
    animated = false,
    duration = 1000,
    depthOffset = 1,
  }: {
    key: string;
    game: Game;
    anchor: { left: number; bottom: number };
    animated?: boolean;
    duration?: number;
    depthOffset?: number;
  }) {
    let spriteObject: any;

    if (animated) {
      spriteObject = game.matter.add.sprite(
        anchor.left * TILE_SIZE,
        (anchor.bottom + 1) * TILE_SIZE,
        key,
        undefined,
        {
          isStatic: true,
        }
      );
    } else {
      spriteObject = game.add.image(
        anchor.left * TILE_SIZE,
        (anchor.bottom + 1) * TILE_SIZE,
        key
      );
    }

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

    // By default, depth will be set to the anchor bottom
    // If the sprite has custom property depthOffset defined,
    // we'll adjust the depth based on that
    spriteObject.setDepth(
      anchor.bottom -
        (spriteObject.height - spriteObject.height * depthOffset) / TILE_SIZE
    );
  }
}
