import PodMap, { POD_TILE_SIZE } from "scenes/Pod/Map";
import { getSpriteKey, OFFWORLD_ORIGIN } from "./utils";

export class PodWall {
  public scene: PodMap;
  public type: "top" | "bottom" | "left" | "right";
  public collection: string;
  public position: { x: number; y: number };
  public collides?: boolean;
  public width = 0;
  public height = 0;

  private spriteKey: string;

  constructor({
    scene,
    type,
    collection = "cyber-neko",
    position,
    collides = true,
  }: {
    scene: PodMap;
    type: "top" | "bottom" | "left" | "right";
    collection?: string;
    position: { x: number; y: number };
    collides?: boolean;
  }) {
    this.scene = scene;
    this.type = type;
    this.collection = collection;
    this.position = position;
    this.collides = collides;

    this.spriteKey = type;

    switch (type) {
      case "top": {
        this.width = POD_TILE_SIZE * 2;
        this.height = POD_TILE_SIZE * 3;

        break;
      }
      case "left":
      case "right": {
        this.width = POD_TILE_SIZE;
        this.height = POD_TILE_SIZE * 4;

        // Evaluate based on the spatial map
        // to see if we need custom piece of side wall (endless, corner, etc.)

        // Is top corner piece if there's a top wall piece next to it
        // Note that we need to scout the y - 2 row because:
        // 1. The wall has 2 tile underneath (the base - thus why it has a height of 4 unit)
        // So to check if its top edge can align into a corner piece, we need to + 2 to calculate for the base
        if (
          (this.scene.spatialMap[this.position.y - 2]?.[
            this.position.x + 1
          ]?.find((t) => t.type === "top") ||
            this.scene.spatialMap[this.position.y - 2]?.[
              this.position.x - 2
            ]?.find((t) => t.type === "top")) &&
          true
          // (this.position.y - 2 < 0 ||
          //   this.scene.spatialMap[this.position.y - 2]?.[this.position.x]
          //     ?.length === 0)
        ) {
          this.height += POD_TILE_SIZE;
          this.spriteKey = getSpriteKey(type, "", "top");
        }

        // Is bottom corner piece if there's a bottom wall piece next to it
        // Note that we need to scout the y + 1 row because:
        // 1. The side wall will also be expanded by another row to allocate the corner piece
        if (
          this.scene.spatialMap[this.position.y + 1]?.[
            this.position.x + 1
          ]?.find((t) => t.type === "bottom") ||
          this.scene.spatialMap[this.position.y + 1]?.[
            this.position.x - 2
          ]?.find((t) => t.type === "bottom")
        ) {
          this.height += POD_TILE_SIZE;
          this.position.y += 1;
          this.spriteKey = getSpriteKey(type, "", "bottom");
        }

        break;
      }
      case "bottom": {
        this.width = POD_TILE_SIZE * 2;
        this.height = POD_TILE_SIZE * 3;

        break;
      }
      default: {
        break;
      }
    }

    this.loadWall();
  }

  loadWall() {
    const texture = this.scene.add.renderTexture(0, 0, this.width, this.height);

    texture.draw(
      this.scene.wallSprites[this.spriteKey],
      -OFFWORLD_ORIGIN.x,
      -OFFWORLD_ORIGIN.y
    );
    texture.setPosition(
      this.position.x * POD_TILE_SIZE,
      this.position.y * POD_TILE_SIZE
    );

    if (this.collides) {
      this.scene.matter.add.gameObject(texture, { isStatic: true });

      // Offset origin to bottom left
      texture.setPosition(
        texture.x + texture.width / 2,
        texture.y - texture.height / 2
      );
    } else {
      texture.setOrigin(0, 1);
    }
  }
}

export * from "./utils";
