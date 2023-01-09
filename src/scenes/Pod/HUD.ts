import Phaser from "phaser";
import {
  RoundRectangle,
  GridTable,
  Sizer,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { SceneKey } from "../../constants/scenes";
import { GridButtonGroup } from "../../objects/GridButtonGroup";
import PodMap from "./Map";

export interface Item {
  key: string;
  quantity: number;
}

const mockItems: Item[] = [
  { key: "bench-1", quantity: 1 },
  { key: "bench-2", quantity: 1 },
  { key: "bench-3", quantity: 1 },
  { key: "plant-1", quantity: 1 },
  { key: "plant-2", quantity: 1 },
  { key: "street-light", quantity: 1 },
  { key: "trash-bin", quantity: 1 },
  { key: "vending-machine", quantity: 1 },
  { key: "ice-cream-cart", quantity: 1 },
  { key: "flower-bed", quantity: 1 },
];

const createItem = (scene: Phaser.Scene, config: any = {}) => {
  const background = scene.add.existing(
    new RoundRectangle(scene, 0, 0, 20, 20, 0, 0xffffff).setStrokeStyle(
      2,
      0x000000
    )
  );

  const sprite = scene.add.image(0, 0, config.sprite);
  const ratio = sprite.displayWidth / sprite.displayHeight;
  if (sprite.displayHeight > sprite.displayWidth) {
    const width = 60 * ratio;
    sprite.setSize(width, 60);
    sprite.setDisplaySize(width, 60);
  } else {
    const height = 60 / ratio;
    sprite.setSize(60, height);
    sprite.setDisplaySize(60, height);
  }

  // A hack to center the sprite vertically
  const offsetTop = (60 - sprite.displayHeight) / 2 + 10;

  const item = new Sizer(scene, {
    width: 80,
    height: 80,
    // Align object top to bottom (aka. flex-col?)
    orientation: "y",
  })
    .addBackground(background)
    .add(
      sprite, // child
      0, // proportion, fixed width
      "center", // align horizontally
      {
        left: 10,
        right: 10,
        bottom: 10,
        top: offsetTop,
      }, // padding
      false, // expand horizontally
      "sprite" // map-key
    );

  return item;
};

export default class PodHUD extends Phaser.Scene {
  private bottomLeftHUD!: Phaser.GameObjects.Group;

  constructor(public mainScene: PodMap) {
    super({
      key: SceneKey.POD_HUD,
    });
  }

  create() {
    // Bottom right HUD
    new GridButtonGroup(this, 80, {
      anchor: {
        right: "right-25",
        bottom: "bottom-10",
      },
      x: window.innerWidth,
      y: window.innerHeight,
      buttons: [
        [
          this.add
            .image(0, 0, "pod-builder-icon")
            .setData({ text: "Toggle build mode", name: "build" }),
          this.add
            .image(0, 0, "world-icon")
            .setData({ text: "World", name: "world" }),
        ],
      ],
    }).onClick((container) => {
      switch (container.name) {
        case "build": {
          this.toggleBuildMode();

          break;
        }
        case "world": {
          container.disableInteractive();
          // Fade out & prepare for scene transition
          this.mainScene.cameras.main.fadeOut(500, 0, 0, 0);

          break;
        }
        default: {
          break;
        }
      }
    });

    // Start scene transition when camera is fully fade out
    this.mainScene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        this.mainScene.scene.stop(SceneKey.POD_HUD);
        this.mainScene.scene.start(SceneKey.GAME);
      }
    );
  }

  toggleBuildMode() {
    this.mainScene.toggleBuildMode();

    if (this.mainScene.mode === "build") {
      // Bottom left HUD
      this.bottomLeftHUD = this.mainScene.add.group();

      // Add RexUI table
      const table = new GridTable(this, {
        x: 260,
        y: window.innerHeight - 60,
        width: 500,
        height: 100,
        // Scroll horizontally
        scrollMode: 1,
        background: this.add.existing(
          new RoundRectangle(this, 0, 0, 20, 10, 10, 0xffffff)
        ),
        table: {
          cellWidth: 80,
          cellHeight: 80,
        },
        space: {
          left: 10,
          right: 10,
          top: 10,
          bottom: 10,
        },
        createCellContainerCallback: (cell) => {
          const scene = cell.scene;
          const item = cell.item;

          return createItem(scene, item);
        },
        items: mockItems.map((item, index) => {
          return {
            id: index,
            sprite: item.key,
          };
        }),
      })
        .layout()
        // @ts-ignore
        .on("cell.1tap", (_, index: number) => {
          this.mainScene.setItemToPlace(mockItems[index]);
        });

      this.bottomLeftHUD.add(table);
    } else {
      this.bottomLeftHUD.destroy(true, true);
    }
  }
}
