import PodMap, { POD_TILE_SIZE } from "scenes/Pod/Map";
import { OFFWORLD_ORIGIN } from "./utils";

export class PodFloor {
  public scene: PodMap;
  public position: { x: number; y: number };
  public width = POD_TILE_SIZE;
  public height = POD_TILE_SIZE;

  private spriteKey: string;

  constructor({
    scene,
    position,
    type,
  }: {
    scene: PodMap;
    position: { x: number; y: number };
    type: string;
  }) {
    this.scene = scene;
    this.position = position;

    this.spriteKey = type;

    this.load();
  }

  load() {
    this.scene.floorTexture.draw(
      this.scene.floorSprites[this.spriteKey],
      -OFFWORLD_ORIGIN.x + this.position.x * POD_TILE_SIZE,
      -OFFWORLD_ORIGIN.y + (this.position.y - 1) * POD_TILE_SIZE
    );
  }
}
