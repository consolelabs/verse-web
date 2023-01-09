import Phaser from "phaser";

export default class AssetLoader extends Phaser.Scene {
  constructor() {
    super({
      key: "asset-loader",
    });
  }

  preload() {
    this.load.image("pod-builder-icon", "/assets/images/pod-builder.png");
    this.load.image("world-icon", "/assets/images/world.png");
    this.load.image("inventory-icon", "/assets/images/inventory.png");

    ["fukuro", "ghost-neko", "neko", "tv-head", "rabby"].forEach((char) => {
      this.load.spine(
        `${char}-character`,
        `/characters/${char}/char.json`,
        `/characters/${char}/char.atlas`
      );
    });

    this.load.spritesheet("j-control", "/controls/j.png", {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1,
    });

    const emotions = {
      1: {
        normal: "normal.png",
        sad: "sad.png",
        happy: "happy.png",
        angry: "angry.png",
      },
    };

    Object.entries(emotions).forEach((e) => {
      Object.entries(e[1]).forEach((c) => {
        this.load.image(`${e[0]}-${c[0]}`, `/emotions/${e[0]}/${c[1]}`);
      });
    });
  }

  create() {
    this.scene.start("world-loader");
  }
}
