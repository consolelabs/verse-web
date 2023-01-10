import Phaser from "phaser";
import {
  GridButtons,
  Label,
  RoundRectangle,
} from "phaser3-rex-plugins/templates/ui/ui-components";

function setDisplaySize(size: number) {
  return function (image: Phaser.GameObjects.Image) {
    image.setDisplaySize(size, size);
    return image;
  };
}

function setSize(size: number) {
  return function (container: Phaser.GameObjects.Container) {
    container.setSize(size, size);
    container.setInteractive();
    return container;
  };
}

function addTooltip(hover: boolean) {
  return function (image: Phaser.GameObjects.Image) {
    const scene = image.scene;
    const container = image.scene.add.container(0, 0);
    const tooltip = scene.add
      .existing(
        new Label(scene, {
          x: 0,
          y: 0,
          space: {
            left: 10,
            top: 7,
            right: 10,
            bottom: 7,
            icon: 10,
          },
          background: scene.add.existing(
            new RoundRectangle(scene, 0, 0, 1, 1, 5, 0x150f2b)
          ),
          text: scene.add.text(0, 0, image.data.get("text"), {
            align: "center",
            wordWrap: {
              width: 80,
              useAdvancedWrap: false,
            },
            fontSize: hover ? "0.875rem" : "1rem",
            color: "white",
          }),
        })
      )
      .setAlpha(hover ? 0 : 1)
      .layout();

    if (hover) {
      tooltip.y = -image.displayHeight / 1.5;
    } else {
      tooltip.y = image.displayHeight / 1.5;
    }
    container.add([image, tooltip]);

    const enlarge = scene.tweens.create({
      targets: container,
      ease: Phaser.Math.Easing.Quadratic.In,
      duration: 125,
      props: {
        scale: 1.15,
      },
    });

    const shrink = scene.tweens.create({
      targets: container,
      ease: Phaser.Math.Easing.Quadratic.Out,
      duration: 125,
      props: {
        scale: 1,
      },
    });

    container.on(Phaser.Input.Events.POINTER_OVER, function () {
      enlarge.play();
      if (hover) {
        tooltip.fadeIn(100, 1);
      }
    });

    container.on(Phaser.Input.Events.POINTER_OUT, function () {
      shrink.play();
      if (hover) {
        tooltip.fadeOut(100);
      }
    });

    container.setName(image.data.get("name"));
    return container;
  };
}

export class GridButtonGroup {
  gridButtons!: GridButtons;

  constructor(
    scene: Phaser.Scene,
    size: number,
    config: GridButtons.IConfig & { hover?: boolean }
  ) {
    const hover = config.hover ?? true;
    this.gridButtons = new GridButtons(scene, {
      ...config,
      buttons: config.buttons?.map((row) => {
        return (row as Array<Phaser.GameObjects.Image>)
          .map(setDisplaySize(size))
          .map(addTooltip(hover))
          .map(setSize(size));
      }),
      space: {
        column: hover ? 10 : 70,
        row: hover ? 0 : 70,
      },
    })
      .setOrigin(0, 0)
      .layout()
      .setDepth(1001);
  }

  onClick(handler: (c: Phaser.GameObjects.Container) => void) {
    this.gridButtons?.on("button.click", handler);
  }
}
