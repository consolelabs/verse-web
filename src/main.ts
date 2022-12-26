import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";

import Boot from "./scenes/Boot";
import Game from "./scenes/Game";
import Preloader from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "black",
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  // load map -> load assets in map -> game
  scene: [Boot, Preloader, Game],
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
