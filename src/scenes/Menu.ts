import Phaser from "phaser";
import { SceneKey } from "../constants/scenes";
import NinePatch2 from "phaser3-rex-plugins/plugins/ninepatch2";
import { Sizer } from "phaser3-rex-plugins/templates/ui/ui-components";
import { GridButtonGroup } from "../objects/GridButtonGroup";

const PADDING = 50;
const W = 380 + PADDING * 2;
const H = 440 + PADDING * 2;

export default class Menu extends Phaser.Scene {
  transition?: () => void;
  escKey!: Phaser.Input.Keyboard.Key;
  sizer!: Sizer;

  constructor() {
    super({
      key: SceneKey.MENU,
    });
  }

  preload() {
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.sizer = new Sizer(this, {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }

  exit() {
    this.scene.switch(SceneKey.GAME_HUD);
  }

  create() {
    this.add
      .rectangle(0, 0, window.innerWidth, window.innerHeight, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerup", () => {
        this.exit();
      });

    const x = window.innerWidth / 2 - W / 2;
    const y = window.innerHeight / 2 - H / 2;
    const container = this.add.container(x, y);
    container.setSize(W, H);

    const menuContainer = new NinePatch2(this, 0, 0, W, H, "container", {
      columns: [PADDING, undefined, PADDING, undefined, PADDING],
      rows: [PADDING, undefined, PADDING],
    })
      .setOrigin(0, 0)
      .setInteractive();

    container.add(menuContainer);

    const grid = new GridButtonGroup(this, 80, {
      x: PADDING,
      y: PADDING,
      hover: false,
      buttons: [
        [
          this.add
            .image(0, 0, "character-icon")
            .setData({ text: "Character", name: "character" }),
          this.add
            .image(0, 0, "pod-icon")
            .setData({ text: "Pod", name: "pod" }),
          this.add
            .image(0, 0, "mail-icon")
            .setData({ text: "Mail", name: "mail" }),
        ],
        [
          this.add
            .image(0, 0, "leaderboard-icon")
            .setData({ text: "Leaderboard", name: "leaderboard" }),
          this.add
            .image(0, 0, "quest-icon")
            .setData({ text: "Quests", name: "quest" }),
          this.add
            .image(0, 0, "achievement-icon")
            .setData({ text: "Achievements", name: "achievement" }),
        ],
        [
          this.add
            .image(0, 0, "market-icon")
            .setData({ text: "Market", name: "market" }),
          this.add
            .image(0, 0, "airdrop-icon")
            .setData({ text: "Airdrop", name: "airdrop" }),
          this.add
            .image(0, 0, "quit-icon")
            .setData({ text: "Save and quit", name: "quit" }),
        ],
      ],
    });

    grid.onClick((container) => {
      switch (container.name) {
        case "pod": {
          this.transition = () => {
            this.scene.stop(SceneKey.GAME);
            this.scene.stop(SceneKey.GAME_HUD);
            this.scene.stop(SceneKey.GAME_INTERACTION);
            this.scene.stop(SceneKey.GAME_DIALOGUE);
            this.scene.start(SceneKey.POD, {
              wallKey: "wall-1",
              floorKey: "floor-1",
            });
          };
          // Fade out & prepare for scene transition
          this.cameras.main.fadeOut(500, 0, 0, 0);

          break;
        }
      }
    });

    container.add(grid.gridButtons);

    this.add.existing(container);

    this.cameras.main.once(
      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
      () => this.transition?.()
    );
  }

  update() {
    if (this.escKey?.isDown) {
      this.exit();
    }
  }
}
