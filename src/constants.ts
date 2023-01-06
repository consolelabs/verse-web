// TODO: get this from api
export const CDN_PATH = "http://localhost:3000";

export const TILE_SIZE = 16;

export const PROD = process.env.NODE_ENV === "production";

export const COLLISION_CATEGORY = {
  PLAYER: 0b0001,
  MEMBER: 0b0010,
  NPC: 0b0011,
  INTERACTION_POINT: 0b0110,
};
