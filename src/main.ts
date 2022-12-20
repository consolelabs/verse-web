import Phaser from "phaser";

import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: 416,
  height: 400,
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 },
    },
  },
  scale: {
    zoom: 2,
  },
  scene: [Preloader, Game],
};

export default new Phaser.Game(config);
