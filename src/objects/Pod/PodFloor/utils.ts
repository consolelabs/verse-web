import { POD_TILE_SIZE } from "scenes/Pod/Map";

export const ORIGINAL_TILE_SIZE = 128;
export const OFFWORLD_ORIGIN = { x: 10000, y: 10000 };

export const initGroundSprites = (scene: Phaser.Scene) => {
  const scale = POD_TILE_SIZE / ORIGINAL_TILE_SIZE;
  const group = scene.add.group();

  const ground = scene.add.image(
    OFFWORLD_ORIGIN.x,
    OFFWORLD_ORIGIN.y,
    `cyber/ground`
  );
  ground.setScale(scale);
  ground.setOrigin(0, 0);
  group.add(ground);

  return { ground: group };
};
