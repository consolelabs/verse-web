import Phaser from "phaser";

export default class Boot extends Phaser.Scene {
  constructor() {
    super({
      key: "boot",
      loader: {
        baseURL: "/assets",
      },
    });
  }

  preload() {
    this.load.image("title-screen-bg", "/images/title-screen-bg.jpeg");
  }

  create() {
    // // Show title bg
    // new TitleBg({ scene: this });
    //
    // // Show start game button
    // new Button({
    //   scene: this,
    //   x: window.innerWidth / 2,
    //   y: window.innerHeight / 2,
    //   text: "START GAME",
    //   onClick: () => {
    //   },
    // });

    this.scene.start("world-loader");
  }
}
