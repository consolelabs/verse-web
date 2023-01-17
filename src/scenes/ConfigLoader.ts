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
    this.load.json("config", "./config.json");
    this.load.json("interaction", "./interaction.json");
    this.load.json("dialogue", "./dialogue.json");
  }

  create() {
    this.cameras.main
      .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        new TitleBg({ scene: this });
        this.cameras.main
          .once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            this.scene.start(SceneKey.ASSET_LOADER);
          })
          .fadeIn(200);
      })
      .fadeOut(200);
  }
}
