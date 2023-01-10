import Phaser from "phaser";
import { SceneKey } from "../../constants/scenes";
import { GridButtonGroup } from "../../objects/GridButtonGroup";
import GameMap from "./Map";

export default class GameHUD extends Phaser.Scene {
  transition?: () => void;

  constructor(public mainScene: GameMap) {
    super({
      key: SceneKey.GAME_HUD,
    });
  }

  create() {
    // Bottom right HUD
    new GridButtonGroup(this, 80, {
      anchor: {
        right: "right-10",
        bottom: "bottom-10",
      },
      x: window.innerWidth,
      y: window.innerHeight,
      buttons: [
        [
          this.add
            .image(0, 0, "inventory-icon")
            .setData({ text: "Inventory", name: "inventory" }),
          this.add
            .image(0, 0, "menu-icon")
            .setData({ text: "Menu", name: "menu" }),
        ],
      ],
    }).onClick((container: Phaser.GameObjects.Container) => {
      switch (container.name) {
        case "menu": {
          this.scene.pause(this);
          this.scene.run(SceneKey.MENU);
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
      () => this.transition?.()
    );
  }
}
