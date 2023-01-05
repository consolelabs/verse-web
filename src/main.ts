import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";

import Boot from "./scenes/Boot";
import WorldLoader from "./scenes/WorldLoader";
import ConfigLoader from "./scenes/ConfigLoader";
import AssetLoader from "./scenes/AssetLoader";
import GameMap from "./scenes/Game/Map";
import GameHUD from "./scenes/Game/HUD";
import GameInteraction from "./scenes/Game/Interaction";
import GameDialogue from "./scenes/Game/Dialogue";
import PodMap from "./scenes/Pod/Map";
import PodHUD from "./scenes/Pod/HUD";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
  // Boot screen -> Load world & world assets -> Game
  scene: [
    Boot,
    ConfigLoader,
    AssetLoader,
    WorldLoader,
    GameMap,
    GameHUD,
    GameInteraction,
    GameDialogue,
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
