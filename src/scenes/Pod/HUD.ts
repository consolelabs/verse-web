import Phaser from "phaser";
import {
  RoundRectangle,
  GridTable,
  Sizer,
  Buttons,
  Label,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import PodMap from "./Map";

const createButton = (
  scene: Phaser.Scene,
  config: {
    text: string;
    name: string;
  }
) => {
  const { text, name } = config;

  return new Label(scene, {
    width: 60,
    height: 60,
    background: scene.add.existing(
      new RoundRectangle(scene, 0, 0, 0, 0, 20, 0xffffff)
    ),
    text: scene.add.text(0, 0, text, {
      fontSize: "24px",
      color: "#000000",
      padding: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 8,
      },
    }),
    space: {
      left: 10,
      right: 10,
    },
    align: "center",
    name,
  }).setOrigin(0.5, 1);
};

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
  private bottomRightHUD!: Phaser.GameObjects.Group;
  private bottomLeftHUD!: Phaser.GameObjects.Group;

  constructor(public mainScene: PodMap) {
    super({
      key: "pod-hud",
    });
  }

  create() {
    this.bottomRightHUD = this.add.group();

    // Bottom right HUD
    const buttons = new Buttons(this, {
      x: window.innerWidth - 120,
      y: window.innerHeight,
      orientation: "x",
      buttons: [
        createButton(this, { text: "Build", name: "build" }),
        createButton(this, { text: "World", name: "world" }),
      ],
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        item: 6,
      },
    })
      .setOrigin(0.5, 1)
      .layout()
      .setDepth(1001)
      .on("button.click", (button: Buttons) => {
        switch (button.name) {
          case "build": {
            this.toggleBuildMode();

            break;
          }
          case "world": {
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
        this.mainScene.scene.stop("pod-hud");
        this.mainScene.scene.start("game");
      }
    );

    this.bottomRightHUD.add(buttons);
  }

  toggleBuildMode() {
    this.mainScene.toggleBuildMode();

    if (this.mainScene.mode === "builder") {
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
        items: [
          "bench-1",
          "bench-2",
          "bench-3",
          "plant-1",
          "plant-2",
          "street-light",
          "trash-bin",
          "vending-machine",
          "ice-cream-cart",
          "flower-bed",
        ].map((key, index) => {
          return {
            id: index,
            sprite: key,
          };
        }),
      })
        .layout()
        // @ts-ignore
        .on("cell.1tap", (...props) => {
          console.log(props);
        });

      this.bottomLeftHUD.add(table);
    } else {
      this.bottomLeftHUD.destroy(true, true);
    }
  }
}
