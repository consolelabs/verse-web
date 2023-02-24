import Phaser from "phaser";

export class TitleBg {
  instance!: Phaser.GameObjects.Image;

  constructor(props: { scene: Phaser.Scene }) {
    const { scene } = props;

    const cameraWidth = scene.cameras.main?.width ?? 0;
    const cameraHeight = scene.cameras.main?.height ?? 0;

    this.instance = scene.add.image(
      window.innerWidth / 2,
      window.innerHeight / 2,
      "title-screen-bg"
    );

    this.instance.setScale(
      Math.max(
        cameraWidth / this.instance.width,
        cameraHeight / this.instance.height
      )
    );

    const logo = scene.add.image(0, 0, "logo");

    logo.setScale(
      Math.max(
        cameraWidth / this.instance.width,
        cameraHeight / this.instance.height
      ) * 0.85
    );

    logo.setPosition(window.innerWidth / 2, logo.height / 1.5);
  }
}
