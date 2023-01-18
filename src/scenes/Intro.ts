import { SceneKey } from "constants/scenes";
import Phaser from "phaser";

export default class Intro extends Phaser.Scene {
  container!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: SceneKey.INTRO });
  }

  preload() {
    const logo = this.make
      .image({
        key: "consolelabslogo",
        x: 0,
        y: 0,
      })
      .setOrigin(0, 0)
      .setDisplaySize(60, 60);

    const productBy = this.make
      .text({
        x: logo.displayWidth + 5,
        y: 0,
        text: "a product by",
        style: {
          color: "white",
          fontFamily: "PT Sans",
          fontSize: "1rem",
        },
      })
      .setOrigin(0, 0);
    productBy.setY(-productBy.displayHeight + 5);

    const consolelabs = this.make
      .text({
        x: logo.displayWidth,
        y: productBy.displayHeight / 2,
        text: "Console Labs",
        style: {
          fontFamily: "PT Mono",
          color: "#44f1a6",
          fontSize: "3rem",
        },
      })
      .setOrigin(0, 0);

    const consoleso = this.make.text({
      x: consolelabs.displayWidth - logo.displayWidth / 2,
      y: consolelabs.displayHeight + 5,
      text: "console.so",
      style: {
        fontFamily: "PT Mono",
        color: "#d8fcec",
        fontSize: "0.875rem",
      },
    });

    this.container = this.add.container(
      window.innerWidth / 2 - consolelabs.displayWidth / 2,
      window.innerHeight / 2 - consolelabs.displayHeight / 2,
      [logo, productBy, consolelabs, consoleso]
    );

    this.cameras.main.fadeOut(0);
  }

  create() {
    this.time.delayedCall(1000, () => {
      this.cameras.main
        .fadeIn(500)
        .once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
          this.time.delayedCall(1500, () => {
            this.cameras.main
              .fadeOut(500)
              .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start(SceneKey.CHAR_SELECT);
              });
          });
        });
    });
  }
}
