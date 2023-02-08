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
import { API_BASE_URL, API_POD_BASE_URL } from "envs";
import { CharacterSpine } from "types/character";
import { toast } from "react-hot-toast";
import Minimap from "scenes/Game/Minimap";
import { Menu, Minigame } from "constants/game";
import { utils } from "ethers";

const DEFAULT_PLAYER = {
  id: 0,
  spine: "GhostNeko" as CharacterSpine,
  animSuffix: "",
};

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
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
    Minimap,
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
  token?: string;
  updateGamePoints: (d: { game: string; point: number }) => Promise<void>;
  getSession: () => Promise<void>;
  login: (signature: `0x${string}`, message: string) => Promise<void>;
  logout: () => Promise<boolean>;
  account?: `0x${string}`;

  nfts?: NFT[];
  getNFTs: () => Promise<void>;

  activeSceneKey: SceneKey;
  setActiveSceneKey: (key: SceneKey) => void;
  getActiveScene: () => Phaser.Scene | undefined;

  game?: Phaser.Game;
  init: () => void;

  player: {
    collection?: string;
    animSuffix: string;
    spine: CharacterSpine;
    id: number;
  };
  setPlayer: (p: {
    collection?: string;
    animSuffix: string;
    spine: CharacterSpine;
    id: number;
  }) => void;

  stopScenes: (...scenes: Array<SceneKey>) => void;

  menu?: Menu;
  openMenu: (menu: Menu) => void;
  closeMenu: () => void;

  minigame?: Minigame;
  startMinigame: (game: Minigame) => void;
  stopMinigame: () => void;

  showLoader?: boolean;
  setShowLoader: (v: boolean) => void;
}

export const useGameState = create<State>((set, get) => ({
  updateGamePoints: async (d) => {
    const token = get().token;
    if (token) {
      await fetch(`${API_BASE_URL}/game-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(d),
      });
    }
  },
  getSession: async () => {
    const sessionStr = localStorage.getItem("session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      set({ token: session.token, account: session.address });
    }
  },
  login: async (signature: `0x${string}`, message: string) => {
    const res = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signature,
        message,
        is_new: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      set({ token: data.token, account: utils.getAddress(data.user.wallet) });
      localStorage.setItem(
        "session",
        JSON.stringify({
          token: data.token,
          address: utils.getAddress(data.user.wallet),
          chainId: 1,
        })
      );
    }
  },
  logout: async () => {
    localStorage.removeItem("session");
    set({
      minigame: undefined,
      token: undefined,
      account: undefined,
      nfts: undefined,
      player: DEFAULT_PLAYER,
      activeSceneKey: SceneKey.BOOT,
    });
    return true;
  },
  account: undefined,

  nfts: undefined,
  getNFTs: async () => {
    const nfts = [];
    let page = 0;

    try {
      // Fetch till break
      while (true) {
        const data: FullResponse<NFT> = await fetch(
          `${API_POD_BASE_URL}/verse/nfts?user_address=${
            get().account
          }&page=${page}`
        ).then((res) => res.json());
        const nftThisBatch = data.data ?? [];

        nfts.push(...nftThisBatch);

        if (!nftThisBatch || nftThisBatch.length < data.size) {
          break;
        }

        page += 1;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message || "Could not fetch NFTs");
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
  player: DEFAULT_PLAYER,
  setPlayer: (player) => set({ player }),

  init: () => set(() => ({ game: new Phaser.Game(config) })),

  stopScenes: (...scenes) => {
    const { getActiveScene } = get();
    const activeScene = getActiveScene();
    if (!activeScene) return;

    scenes.forEach((s) => activeScene.scene.stop(s));
  },

  menu: undefined,
  openMenu: (m: Menu) => {
    set(() => ({ menu: m }));
  },
  closeMenu: () => {
    set(() => ({ menu: undefined }));
  },

  minigame: undefined,
  startMinigame: (minigame: Minigame) => {
    const game = get().game;

    if (game) {
      game.input.enabled = false;
    }

    set(() => ({ minigame }));
  },
  stopMinigame: () => {
    const game = get().game;

    if (game) {
      game.input.enabled = true;
    }

    set(() => ({ minigame: undefined }));
  },

  showLoader: false,
  setShowLoader: (showLoader: boolean) => set(() => ({ showLoader })),
}));
