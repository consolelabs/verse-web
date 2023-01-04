import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";
import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";

import Boot from "./scenes/Boot";
import Game from "./scenes/Game";
import PodScene from "./scenes/Pod";
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
  scene: [Boot, WorldLoader, Game, PodScene],
  plugins: {
    scene: [
      {
        key: "SpinePlugin",
        plugin: window.SpinePlugin,
        mapping: "spine",
      },
      {
        key: "rexUI",
        plugin: RexUIPlugin,
        mapping: "rexUI",
      },
    ],
  },
};

export default new Phaser.Game(config);
