import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from "react";
import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";
import Boot from "../scenes/Boot";
import WorldLoader from "../scenes/WorldLoader";
import ConfigLoader from "../scenes/ConfigLoader";
import AssetLoader from "../scenes/AssetLoader";
import GameMap from "../scenes/Game/Map";
import GameHUD from "../scenes/Game/HUD";
import GameInteraction from "../scenes/Game/Interaction";
import GameDialogue from "../scenes/Game/Dialogue";
import PodMap from "../scenes/Pod/Map";
import PodHUD from "../scenes/Pod/HUD";
import { SceneKey } from "../constants/scenes";

interface Props {
  activeSceneKey: SceneKey;
  game: Phaser.Game;
  start: () => void;
  setActiveSceneKey: Dispatch<SetStateAction<SceneKey>>;
  getActiveScene: () => Phaser.Scene | undefined;
}

// @ts-ignore
const Context = createContext<Props>({});

export const GameContextProvider = ({ children }: PropsWithChildren) => {
  const [activeSceneKey, setActiveSceneKey] = useState<SceneKey>(SceneKey.BOOT);
  const [game, setGame] = useState<Phaser.Game>();

  const start = () => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: "game",
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

    setGame(new Phaser.Game(config));
    setActiveSceneKey(SceneKey.GAME);
  };

  const getActiveScene = () => game?.scene.keys[activeSceneKey];

  return (
    <Context.Provider
      value={{
        activeSceneKey,
        // @ts-ignore
        game,
        getActiveScene,
        start,
        setActiveSceneKey,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useGameContext = () => {
  return useContext(Context);
};
