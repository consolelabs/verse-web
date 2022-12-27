import Phaser from "phaser";

export class TitleBg {
  constructor(props: { scene: Phaser.Scene }) {
    const { scene } = props;

    const cameraWidth = scene.cameras.main.width;
    const cameraHeight = scene.cameras.main.height;

    const bg = scene.add.image(
      window.innerWidth / 2,
      window.innerHeight / 2,
      "title-screen-bg"
    );
    bg.setDisplaySize(window.innerWidth, window.innerHeight);
    bg.setScale(Math.max(cameraWidth / bg.width, cameraHeight / bg.height));
  }
}
