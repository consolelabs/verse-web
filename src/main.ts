import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";

// import Boot from "./scenes/Boot";
import Game from "./scenes/Game";
import WorldLoader from "./scenes/WorldLoader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "black",
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  // Boot screen -> Load world & world assets -> Game
  scene: [
    // Boot,
    WorldLoader,
    Game,
  ],
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
