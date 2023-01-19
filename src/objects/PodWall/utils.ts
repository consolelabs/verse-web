import { POD_TILE_SIZE } from "scenes/Pod/Map";
import { capitalizeFirstLetter } from "utils/string";

export const WALL_ORIGINAL_TILE_SIZE = 128;
export const OFFWORLD_ORIGIN = { x: 10000, y: 10000 };

const getTopWall = (scene: Phaser.Scene) => {
  const scale = POD_TILE_SIZE / WALL_ORIGINAL_TILE_SIZE;
  const group = scene.add.group();

  new Array(2).fill(0).map((_, index) => {
    const topEdge = scene.add.image(
      OFFWORLD_ORIGIN.x + index * POD_TILE_SIZE,
      OFFWORLD_ORIGIN.y,
      `cyber-neko/top-mid`
    );
    topEdge.setScale(scale);
    topEdge.setOrigin(0, 0);
    group.add(topEdge);
  });

  new Array(1).fill(0).map((_, index) => {
    const wall = scene.add.image(
      OFFWORLD_ORIGIN.x,
      OFFWORLD_ORIGIN.y + POD_TILE_SIZE * (2 * index + 1),
      `cyber-neko/wall`
    );
    wall.setScale(scale);
    wall.setOrigin(0, 0);
    group.add(wall);
  });

  return group;
};
const getSideWall = (
  scene: Phaser.Scene,
  side: "left" | "right",
  // Whether this wall stops at the top or at the bottom
  end: "top" | "bottom" | "" = "",
  // Whether this wall is a corner piece
  corner: "top" | "bottom" | "" = ""
) => {
  const scale = POD_TILE_SIZE / WALL_ORIGINAL_TILE_SIZE;
  const group = scene.add.group();

  const isTopCorner = corner === "top";
  const isBottomCorner = corner === "bottom";

  let topKey = `cyber-neko/${side}-mid`;
  if (end === "top") {
    topKey = `cyber-neko/${side}-top`;
  } else if (isTopCorner) {
    topKey = `cyber-neko/corner-${corner}-${side}`;
  }
  const top = scene.add.image(OFFWORLD_ORIGIN.x, OFFWORLD_ORIGIN.y, topKey);
  top.setScale(scale);
  top.setOrigin(0, 0);
  if (isTopCorner && side === "right") {
    top.displayOriginX += POD_TILE_SIZE / scale;
  }

  let bottomKey = `cyber-neko/${side}-mid`;
  if (end === "bottom") {
    bottomKey = `cyber-neko/${side}-bottom`;
  } else if (isBottomCorner) {
    bottomKey = `cyber-neko/corner-${corner}-${side}`;
  }
  const bottom = scene.add.image(
    OFFWORLD_ORIGIN.x,
    OFFWORLD_ORIGIN.y +
      POD_TILE_SIZE * (isTopCorner ? 2 : 1) +
      (isBottomCorner ? POD_TILE_SIZE / 2 : 0),
    bottomKey
  );
  bottom.setScale(scale);
  bottom.setOrigin(0, 0);
  if (isBottomCorner && side === "right") {
    bottom.displayOriginX += POD_TILE_SIZE / scale;
  }

  // We have only been creating the roof edge of the wall,
  // now we need to add another two piece of wall as the foot/base
  const bases = new Array(3).fill(0).map((_, index) => {
    const base = scene.add.image(
      OFFWORLD_ORIGIN.x,
      OFFWORLD_ORIGIN.y +
        (bottom.y - OFFWORLD_ORIGIN.y) +
        POD_TILE_SIZE * (index + 1),
      `cyber-neko/${side}-${
        index === 0 ? "top" : index === 1 ? "mid" : "bottom"
      }`
    );
    base.setScale(scale);
    base.setOrigin(0, 0);

    return base;
  });

  group.add(top);
  bases.forEach((base) => {
    group.add(base);
  });
  group.add(bottom);

  return group;
};

const getBottomWall = (scene: Phaser.Scene) => {
  const scale = POD_TILE_SIZE / WALL_ORIGINAL_TILE_SIZE;
  const group = scene.add.group();

  new Array(2).fill(0).map((_, index) => {
    const topEdge = scene.add.image(
      OFFWORLD_ORIGIN.x + index * POD_TILE_SIZE,
      OFFWORLD_ORIGIN.y + POD_TILE_SIZE / 2,
      `cyber-neko/bottom-mid`
    );
    topEdge.setScale(scale);
    topEdge.setOrigin(0, 0);
    group.add(topEdge);
  });

  new Array(1).fill(0).map(() => {
    const wall = scene.add.image(
      OFFWORLD_ORIGIN.x,
      OFFWORLD_ORIGIN.y + POD_TILE_SIZE,
      `cyber-neko/wall`
    );
    wall.setScale(scale);
    wall.setOrigin(0, 0);
    group.add(wall);
  });

  return group;
};

export const initWallAndFloorSprites = (scene: Phaser.Scene) => {
  const top = getTopWall(scene);

  const bottom = getBottomWall(scene);

  const left = getSideWall(scene, "left");
  const leftEndTop = getSideWall(scene, "left", "top");
  const leftEndBottom = getSideWall(scene, "left", "bottom");
  const leftCornerTop = getSideWall(scene, "left", "", "top");
  const leftCornerBottom = getSideWall(scene, "left", "", "bottom");

  const right = getSideWall(scene, "right");
  const rightEndTop = getSideWall(scene, "right", "top");
  const rightEndBottom = getSideWall(scene, "right", "bottom");
  const rightCornerTop = getSideWall(scene, "right", "", "top");
  const rightCornerBottom = getSideWall(scene, "right", "", "bottom");

  return {
    top,
    bottom,
    left,
    leftEndTop,
    leftEndBottom,
    leftCornerTop,
    leftCornerBottom,
    right,
    rightEndTop,
    rightEndBottom,
    rightCornerTop,
    rightCornerBottom,
  };
};

export const getSpriteKey = (
  type: "top" | "bottom" | "left" | "right",
  end: "top" | "bottom" | "" = "",
  corner: "top" | "bottom" | "" = ""
) => {
  if (type === "left" || type === "right") {
    let key: string = type;

    if (end) {
      key = `${key}End${capitalizeFirstLetter(end)}`;
    } else if (corner) {
      key = `${key}Corner${capitalizeFirstLetter(corner)}`;
    }

    return key;
  }

  return type;
};
