import {
  createContext,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import Phaser from "phaser";
import "phaser/plugins/spine/dist/SpinePlugin";
import Boot from "../scenes/Boot";
import WorldLoader from "../scenes/WorldLoader";
import ConfigLoader from "../scenes/ConfigLoader";
import AssetLoader from "../scenes/AssetLoader";
import GameMap from "../scenes/Game/Map";
import GameInteraction from "../scenes/Game/Interaction";
import GameDialogue from "../scenes/Game/Dialogue";
import PodMap from "../scenes/Pod/Map";
import { SceneKey } from "../constants/scenes";
import CharSelect from "scenes/CharSelect";

interface State {
  activeSceneKey: SceneKey;
  game?: Phaser.Game;
  openMenu: boolean;
}

type Action = {
  type: "setActiveSceneKey" | "setOpenMenu" | "setGame";
  payload: any;
};

type Reducer = (s: State, a: Action) => State;

interface Props {
  start: () => void;
  getActiveScene: () => Phaser.Scene | undefined;
  state: State;
  dispatch: (a: Action) => void;
}

// @ts-ignore
const Context = createContext<Props>({});

export const GameContextProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer<Reducer>(
    (state, action) => {
      switch (action.type) {
        case "setActiveSceneKey":
          return {
            ...state,
            activeSceneKey: action.payload,
          };
        case "setGame":
          return {
            ...state,
            game: action.payload,
          };
        case "setOpenMenu":
          return {
            ...state,
            openMenu: action.payload,
          };
        default:
          throw new Error("[GameContext] No type found in reducer");
      }
    },
    {
      activeSceneKey: SceneKey.BOOT,
      openMenu: false,
    }
  );

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
        CharSelect,
        ConfigLoader,
        AssetLoader,
        WorldLoader,
        GameMap,
        GameInteraction,
        GameDialogue,
        PodMap,
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

    dispatch({ type: "setGame", payload: new Phaser.Game(config) });
    dispatch({ type: "setActiveSceneKey", payload: SceneKey.CHAR_SELECT });
  };

  const getActiveScene = () => state.game?.scene.keys[state.activeSceneKey];

  return (
    <Context.Provider
      value={{
        state,
        getActiveScene,
        start,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useGameContext = () => {
  return useContext(Context);
};
