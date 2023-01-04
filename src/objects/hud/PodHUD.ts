import PodScene from "../../scenes/Pod";
import { Button } from "../Button";

const createItem = (scene: PodScene, config: any = {}) => {
  const background = scene.rexUI.add
    .roundRectangle(0, 0, 20, 20, 0)
    .setStrokeStyle(2, 0x000000);

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

  const item = scene.rexUI.add
    .sizer({
      width: 80,
      height: 80,
      // Align object top to bottom (aka. flex-col?)
      orientation: 1,
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

  item.setDepth(1001);
  item.setScrollFactor(0);

  return item;
};
export class PodHUD {
  private bottomRightHUD: Phaser.GameObjects.Group;
  private bottomLeftHUD!: Phaser.GameObjects.Group;

  constructor(public scene: PodScene) {
    this.bottomRightHUD = scene.add.group();

    // Bottom right HUD
    const graphics = scene.add.graphics({
      x: window.innerWidth - 300,
      y: window.innerHeight - 100,
    });
    graphics.fillStyle(0x302c2e, 1);
    graphics.fillRect(0, 0, 300, 100);
    graphics.setDepth(1000);
    graphics.setScrollFactor(0);

    // Back to Map button
    const backToMapButton = new Button({
      scene: scene,
      x: window.innerWidth - 75,
      y: window.innerHeight - 50,
      text: "Map",
      onClick: () => {
        // Fade out & prepare for scene transition
        scene.cameras.main.fadeOut(500, 0, 0, 0);
      },
    });

    // Start scene transition when camera is fully fade out
    scene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        scene.scene.start("game");
      }
    );

    // Toggle pod builder mode button
    const toggleBuildModeButton = new Button({
      scene: scene,
      x: window.innerWidth - 225,
      y: window.innerHeight - 50,
      text: "Build",
      onClick: () => {
        // Toggle build mode
        this.toggleBuildMode();
      },
    });

    this.bottomRightHUD.add(graphics);
    this.bottomRightHUD.add(backToMapButton);
    this.bottomRightHUD.add(toggleBuildModeButton);
  }

  toggleBuildMode() {
    this.scene.toggleBuildMode();

    if (this.scene.mode === "builder") {
      // Bottom left HUD
      this.bottomLeftHUD = this.scene.add.group();

      // Add RexUI table
      const table = this.scene.rexUI.add
        .gridTable({
          x: 250,
          y: window.innerHeight - 50,
          width: 500,
          height: 100,
          // Scroll horizontally
          scrollMode: 1,
          background: this.scene.rexUI.add.roundRectangle(
            0,
            0,
            20,
            10,
            10,
            0xffffff
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
          createCellContainerCallback: (cell: any) => {
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
        .layout();

      table.setScrollFactor(0);
      table.setDepth(1001);

      this.bottomLeftHUD.add(table);
    } else {
      this.bottomLeftHUD.destroy(true, true);
    }
  }
}
