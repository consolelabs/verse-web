import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";

import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "black",
  scale: {
    mode: Phaser.Scale.ENVELOP,
  },
  scene: [Preloader, Game],
  plugins: {
    scene: [
      {
        key: "SpinePlugin",
        plugin: window.SpinePlugin,
        mapping: "spine",
      },
    ],
  },
};

export default new Phaser.Game(config);
