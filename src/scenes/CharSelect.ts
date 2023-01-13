import { Player } from "characters/player";
import Phaser from "phaser";
import { useGameState } from "stores/game";
import { SceneKey } from "../constants/scenes";

export default class CharSelect extends Phaser.Scene {
  player?: Player;
  bg?: Phaser.GameObjects.Image;
  light?: Phaser.GameObjects.Image;

  constructor() {
    super({
      key: SceneKey.CHAR_SELECT,
      physics: {
        matter: {
          gravity: { y: 0 },
        },
      },
    });
  }

  preload() {
    this.load.image("char-select-bg", "/assets/images/char-select/bg.png");
    this.load.image(
      "char-select-light",
      "/assets/images/char-select/light.png"
    );
  }

  create() {
    this.player = new Player({
      scene: this,
      isPreview: true,
      spine: "Neko",
      id: 3,
      spineConfig: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 1.575,
        scale: 0.8,
      },
    });
    this.player.character?.loadPromise.then((instance) => {
      this.matter.add.gameObject(instance);
    });

    this.cameras.main.setBackgroundColor("#151321");
    this.light = this.add
      .image(
        window.innerWidth / 2,
        window.innerHeight / 1.5,
        "char-select-light"
      )
      .setScale(0.4);
    this.bg = this.add.image(0, 0, "char-select-bg").setOrigin(0);

    this.bg.setScale(
      Math.max(
        window.innerWidth / this.bg.width,
        window.innerHeight / this.bg.height
      )
    );
    this.bg.setX(0 - (this.bg.displayWidth - this.cameras.main.width) / 2);

    this.cameras.main
      .fadeIn(250)
      .once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () =>
        useGameState.setState({ activeSceneKey: SceneKey.CHAR_SELECT })
      );
  }

  update() {
    this.player?.update();
  }
}
