import Phaser from "phaser";
import { TitleBg } from "../objects/TitleBg";
import { SceneKey } from "../constants/scenes";

export default class ConfigLoader extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.CONFIG_LOADER,
    });
  }

  init(params: Record<string, any>) {
    // Save the selected chars to global game object
    // @ts-ignore
    this.game.chars = params.chars;
  }

  preload() {
    new TitleBg({ scene: this });

    this.load.json("config", "./config.json");
    this.load.json("interaction", "./interaction.json");
    this.load.json("dialogue", "./dialogue.json");

    this.cameras.main.fadeOut(0);
  }

  create() {
    this.cameras.main
      .fadeIn(500)
      .once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.time.delayedCall(1000, () => {
          this.cameras.main
            .fadeOut(500)
            .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              this.scene.start(SceneKey.ASSET_LOADER);
            });
        });
      });
  }
}
