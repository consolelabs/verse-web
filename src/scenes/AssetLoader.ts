import { SceneKey } from "constants/scenes";
import Phaser from "phaser";

export default class AssetLoader extends Phaser.Scene {
  constructor() {
    super({
      key: SceneKey.ASSET_LOADER,
    });
  }

  preload() {
    this.load.image("pod-builder-icon", "/assets/images/pod-builder.png");
    this.load.image("world-icon", "/assets/images/world.png");
    this.load.image("inventory-icon", "/assets/images/inventory.png");
    this.load.image("menu-icon", "/assets/images/menu.png");
    this.load.image("pod-icon", "/assets/images/pod.png");
    this.load.image("character-icon", "/assets/images/character.png");
    this.load.image("mail-icon", "/assets/images/mail.png");
    this.load.image("market-icon", "/assets/images/market.png");
    this.load.image("leaderboard-icon", "/assets/images/leaderboard.png");
    this.load.image("achievement-icon", "/assets/images/achievement.png");
    this.load.image("airdrop-icon", "/assets/images/airdrop.png");
    this.load.image("quest-icon", "/assets/images/quest.png");
    this.load.image("quit-icon", "/assets/images/quit.png");
    this.load.image("container", "/assets/images/container.png");

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
    this.scene.start(SceneKey.WORLD_LOADER);
  }
}
