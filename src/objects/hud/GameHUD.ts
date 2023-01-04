import { Button } from "../Button";

export class GameHUD {
  constructor(public scene: Phaser.Scene) {
    const bottomRightHud = scene.add.graphics({
      x: window.innerWidth - 150,
      y: window.innerHeight - 100,
    });
    bottomRightHud.fillStyle(0x302c2e, 1);
    bottomRightHud.fillRect(0, 0, 500, 300);
    bottomRightHud.setDepth(1000);
    bottomRightHud.setScrollFactor(0);

    new Button({
      scene: scene,
      x: window.innerWidth - 75,
      y: window.innerHeight - 50,
      text: "Pod",
      onClick: () => {
        // Fade out & prepare for scene transition
        scene.cameras.main.fadeOut(500, 0, 0, 0);
      },
    });

    // Start scene transition when camera is fully fade out
    scene.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => {
        scene.scene.start("pod");
      }
    );
  }
}
