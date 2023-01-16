import { create } from "zustand";
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
import Intro from "scenes/Intro";
import { FullResponse } from "types/apis";
import { NFT } from "types/nfts";
import { API_BASE_URL } from "envs";
import { CharacterSpine } from "types/character";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
  },
  // Boot screen -> Load world & world assets -> Game
  scene: [
    Boot,
    Intro,
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

interface State {
  account?: `0x${string}`;
  setAccount: (account: `0x${string}`) => void;

  nfts?: NFT[];
  getNFTs: () => Promise<void>;

  activeSceneKey: SceneKey;
  setActiveSceneKey: (key: SceneKey) => void;
  getActiveScene: () => Phaser.Scene | undefined;

  game?: Phaser.Game;
  openMenu: boolean;
  setOpenMenu: (o: boolean) => void;
  init: () => void;

  player: {
    animSuffix: string;
    spine: CharacterSpine;
    id: number;
  };

  setPlayer: (p: {
    animSuffix: string;
    spine: CharacterSpine;
    id: number;
  }) => void;
}

export const useGameState = create<State>((set, get) => ({
  account: undefined,
  setAccount: (account: `0x${string}`) =>
    set(() => ({
      account,
    })),

  nfts: undefined,
  getNFTs: async () => {
    const nfts = [];
    let page = 0;

    try {
      // Fetch till break
      while (true) {
        const data: FullResponse<NFT> = await fetch(
          `${API_BASE_URL}/verse/nfts?user_address=${
            get().account
          }&page=${page}`
        ).then((res) => res.json());
        const nftThisBatch = data.data;

        nfts.push(...nftThisBatch);

        if (!nftThisBatch || nftThisBatch.length < data.size) {
          break;
        }

        page += 1;
      }
    } catch (error) {
      console.log(error);
    }

    set({ nfts });
  },

  activeSceneKey: SceneKey.BOOT,
  setActiveSceneKey: (key: SceneKey) => set(() => ({ activeSceneKey: key })),
  // We need to get the active scene with a method to make sure
  // we get the latest data.
  getActiveScene: () => {
    const { activeSceneKey, game } = get();
    if (!activeSceneKey || !game) return;
    return game.scene.keys[activeSceneKey];
  },

  // default char
  player: {
    id: 0,
    spine: "GhostNeko",
    animSuffix: "",
  },
  setPlayer: (player) => set({ player }),

  openMenu: false,
  setOpenMenu: (openMenu) => set(() => ({ openMenu })),
  init: () => set(() => ({ game: new Phaser.Game(config) })),
}));
