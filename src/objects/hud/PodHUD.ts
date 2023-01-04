import { Button } from "../Button";

export class PodHUD {
  private bottomRightHUD: Phaser.GameObjects.Group;
  private bottomLeftHUD!: Phaser.GameObjects.Group;

  constructor(public scene: Phaser.Scene) {
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
    // @ts-ignore
    this.scene.toggleBuildMode();

    // @ts-ignore
    if (this.scene.mode === "builder") {
      this.bottomLeftHUD = this.scene.add.group();

      // Bottom left HUD
      const graphics = this.scene.add.graphics({
        x: 0,
        y: window.innerHeight - 100,
      });
      graphics.fillStyle(0x302c2e, 1);
      graphics.fillRect(0, 0, 500, 100);
      graphics.setDepth(1000);
      graphics.setScrollFactor(0);

      this.bottomLeftHUD.add(graphics);
    } else {
      this.bottomLeftHUD.destroy(true, true);
    }
  }
}
