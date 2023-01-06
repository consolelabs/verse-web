import Phaser from "phaser";
import {
  RoundRectangle,
  Buttons,
  Label,
} from "phaser3-rex-plugins/templates/ui/ui-components";
import { SceneKey } from "../../constants/scenes";
import PodMap from "./Map";

const createButton = (
  scene: Phaser.Scene,
  config: {
    text: string;
    name: string;
  }
) => {
  const { text, name } = config;

  return new Label(scene, {
    width: 60,
    height: 60,
    background: scene.add.existing(
      new RoundRectangle(scene, 0, 0, 0, 0, 20, 0xffffff)
    ),
    text: scene.add.text(0, 0, text, {
      fontSize: "24px",
      color: "#000000",
      padding: {
        top: 5,
        left: 5,
        right: 5,
        bottom: 8,
      },
    }),
    space: {
      left: 10,
      right: 10,
    },
    align: "center",
    name,
  }).setOrigin(0.5, 1);
};

export default class GameHUD extends Phaser.Scene {
  constructor(public mainScene: PodMap) {
    super({
      key: SceneKey.GAME_HUD,
    });
  }

  create() {
    // Bottom right HUD
    new Buttons(this, {
      x: window.innerWidth - 50,
      y: window.innerHeight,
      orientation: "x",
      buttons: [createButton(this, { text: "Pod", name: "pod" })],
      space: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
        item: 6,
      },
    })
      .setOrigin(0.5, 1)
      .layout()
      .setDepth(1001)
      .on("button.click", (button: Buttons) => {
        switch (button.name) {
          case "pod": {
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
        this.mainScene.scene.start(SceneKey.POD);
      }
    );
  }
}
