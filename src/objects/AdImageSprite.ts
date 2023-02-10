import { Ad } from "types/ads";
import { TILE_SIZE } from "../constants";

export class AdImageSprite {
  image!: Phaser.GameObjects.Image;

  constructor(
    public scene: Phaser.Scene,
    public ad: Ad,
    public object: Omit<
      Phaser.Types.Tilemaps.TiledObject,
      "x" | "y" | "width" | "height"
    > &
      Required<
        Pick<Phaser.Types.Tilemaps.TiledObject, "x" | "y" | "height" | "width">
      >
  ) {
    const x = object.x ?? 0;
    const y = object.y ?? 0;

    const vertices = object.polygon!.map((point) => {
      const pX = point.x ?? 0;
      const pY = point.y ?? 0;

      return {
        x: pX + x,
        y: pY + y,
      };
    });

    // Now calculate the original bounds of the ad object
    const originalBounds = {
      max: {
        x: Math.max(...vertices.map((point) => point.x)),
        y: Math.max(...vertices.map((point) => point.y)),
      },
      min: {
        x: Math.min(...vertices.map((point) => point.x)),
        y: Math.min(...vertices.map((point) => point.y)),
      },
    };

    // Calculate the ad object's original size
    this.object.width = originalBounds.max.x - originalBounds.min.x;
    this.object.height = originalBounds.max.y - originalBounds.min.y;

    // Create a temporary body so we can find the offset between original origin & real game origin
    const body = scene.matter.add.fromVertices(x, y, object.polygon!, {
      isStatic: true,
    });

    // Now calculate the offset between the created body & the original bounds
    const offset = {
      x: body.bounds.min.x - originalBounds.min.x,
      y: body.bounds.min.y - originalBounds.min.y,
    };

    // Move the body to the correct position
    scene.matter.body.setPosition(body, {
      x: body.position.x - offset.x,
      y: body.position.y - offset.y,
    });

    /**
     * Now create the image object with the TOP_LEFT anchor as the TOP_LEFT anchor of the body,
     * plus (object.width|height / 2) because the origin point should be [0.5, 0.5].
     *
     * Unfortunately we cannot reuse body.position here. I'm not sure why, but it seems like
     * the body's origin is not [0.5, 0.5], so using body.position for the image object will
     * result in incorrect result.
     *
     * TODO: Would love to come back and give this some more tries.
     *  */
    this.image = scene.add.image(
      body.bounds.min.x + object.width / 2,
      body.bounds.min.y + object.height / 2,
      `ads_${ad.code}`
    );
    // Scale & maintain ratio to fit the ad object's width and height
    this.image.setScale(
      Math.max(
        object.width / this.image.width,
        object.height / this.image.height
      )
    );
    // // image.frame.cutY = 0;
    // // image.frame.cutWidth = width;
    // // image.frame.cutHeight = height;
    this.image.setDepth((this.image.y + object.height / 2) / TILE_SIZE + 1);

    // Create a mask based on the ad object's points
    const mask = this.createMask(vertices);
    this.image.setMask(mask);

    // Remove the temporary body
    scene.matter.world.remove(body);
  }

  createMask(points: any[]) {
    const shape = this.scene.make.graphics({});

    shape.fillStyle(0xffffff);
    shape.fillPoints(points, true, true);

    const mask = shape.createGeometryMask();

    return mask;
  }
}
