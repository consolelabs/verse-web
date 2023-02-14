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
    this.instance.setDisplaySize(window.innerWidth, window.innerHeight);
    this.instance.setScale(
      Math.max(
        cameraWidth / this.instance.width,
        cameraHeight / this.instance.height
      )
    );
  }
}
