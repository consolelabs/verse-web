import PodMap from "scenes/Pod/Map";
import {
  Buttons,
  Sizer,
  Label,
  RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components.js";

const createButton = (scene: Phaser.Scene, text: string) => {
  return new Sizer(scene, {
    orientation: 0,
  })
    .add(
      new Label(scene, {
        background: scene.add
          .existing(new RoundRectangle(scene, 0, 0, 1, 1, 5, 0xffffff))
          .setStrokeStyle(2, 0x000000),
        text: scene.add.text(0, 0, text, {
          fontSize: "1.125rem",
          color: "black",
        }),
        space: {
          top: 7,
          left: 10,
          right: 10,
          bottom: 7,
        },
      })
    )
    .layout();
};

export class PodPlacedItem {
  public id: number;
  public scene: Phaser.Scene;
  public instance: Phaser.GameObjects.Image;
  public key: string;

  private editButtons?: Buttons;
  public onRemove: () => void;
  public onMove: () => void;

  constructor({
    id,
    scene,
    object,
    key,
    onClick,
    onRemove,
    onMove,
  }: {
    id: number;
    scene: PodMap;
    object: Phaser.GameObjects.Image;
    key: string;
    onClick: () => void;
    onRemove: () => void;
    onMove: () => void;
  }) {
    this.id = id;
    this.scene = scene;
    this.key = key;

    this.instance = scene.matter.add.gameObject(object, {
      isStatic: true,
    }) as Phaser.GameObjects.Image;
    object.setAlpha(1);
    this.instance.on("pointerup", onClick);
    this.instance.setInteractive();

    this.onRemove = onRemove;
    this.onMove = onMove;
  }

  destroy() {
    this.instance.destroy();
    this.stopEditing();
  }

  startEditing() {
    // Place this set of edit buttons top right with some horizontal padding
    this.editButtons = new Buttons(this.scene, {
      x: this.instance.x + this.instance.width / 2 + 10,
      y: this.instance.y - this.instance.height / 2,
      orientation: 1,
      buttons: [
        createButton(this.scene, "Move"),
        createButton(this.scene, "Remove"),
        createButton(this.scene, "Cancel"),
      ],
      space: {
        item: 10,
      },
    })
      .setOrigin(0, 0)
      .layout()
      .on("button.click", (_: any, index: number) => {
        switch (index) {
          // Move
          case 0: {
            this.onMove();

            break;
          }
          // Remove
          case 1: {
            this.onRemove();

            break;
          }
          // Cancel
          case 2: {
            this.stopEditing();

            break;
          }
          default: {
            break;
          }
        }
      });
  }

  stopEditing() {
    this.editButtons?.destroy();
  }
}
