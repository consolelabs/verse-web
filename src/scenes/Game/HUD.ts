import Phaser from "phaser";
import { SceneKey } from "../../constants/scenes";
import { GridButtonGroup } from "../../objects/GridButtonGroup";
import PodMap from "./Map";

export default class GameHUD extends Phaser.Scene {
  constructor(public mainScene: PodMap) {
    super({
      key: SceneKey.GAME_HUD,
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
            .setData({ text: "Pod Builder", name: "pod-builder" }),
          this.add
            .image(0, 0, "inventory-icon")
            .setData({ text: "Inventory", name: "inventory" }),
        ],
      ],
    }).onClick((container: Phaser.GameObjects.Container) => {
      switch (container.name) {
        case "pod-builder": {
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
        this.mainScene.scene.stop(SceneKey.GAME_HUD);
        this.mainScene.scene.stop(SceneKey.GAME_INTERACTION);
        this.mainScene.scene.stop(SceneKey.GAME_DIALOGUE);
        this.mainScene.scene.start(SceneKey.POD);
      }
    );
  }
}
