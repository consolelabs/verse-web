import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";

import Boot from "./scenes/Boot";
import WorldLoader from "./scenes/WorldLoader";
import ConfigLoader from "./scenes/ConfigLoader";
import GameMap from "./scenes/Game/Map";
import GameHUD from "./scenes/Game/HUD";
import GameInteraction from "./scenes/Game/Interaction";
import PodMap from "./scenes/Pod/Map";
import PodHUD from "./scenes/Pod/HUD";

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
    Boot,
    ConfigLoader,
    WorldLoader,
    GameMap,
    GameHUD,
    GameInteraction,
    PodMap,
    PodHUD,
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
