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
import { API_BASE_URL, API_POD_BASE_URL, API_WEBSOCKET_URL } from "envs";
import { CharacterSpine } from "types/character";
import { toast } from "react-hot-toast";
import Minimap from "scenes/Game/Minimap";
import { Menu } from "constants/game";
import { utils } from "ethers";
import * as Sentry from "@sentry/react";
import unionBy from "lodash.unionby";
import { Socket, Channel } from "phoenix";
import { Ad } from "types/ads";
import produce from "immer";
import { Minigame } from "types/games";

export const DEFAULT_PLAYER = {
  name: "Nez",
  token_id: 0,
  type: "GhostNeko" as CharacterSpine,
  animSuffix: "",
  description:
    "Nez (Neko Soul) is the default character in the PodTown metaverse.",
  urls: {
    atlasURL: "/characters/ghost-neko/char.atlas",
    textureURL: "",
  },
  image: "/assets/images/default-char.png",
  token_address: "ghost_neko",
} as NFT;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    autoRound: true,
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

type ChannelName = "leaderboard" | string;

interface State {
  psaQueue: Array<{ id: string; element: React.ReactNode }>;
  addToPSAqueue: (
    ...element: Array<{ id: string; element: React.ReactNode }>
  ) => void;
  removeFromPSAqueue: (id: string) => void;
  clearPSA: () => void;
  channels: {
    [c in ChannelName]?: Channel;
  };
  addChannel: (
    cn: ChannelName,
    params: Record<string, string | number>,
    cb: (channel: Channel) => Promise<(data?: any) => void> | Promise<void>
  ) => Promise<void>;
  socket?: Socket;
  token?: string;
  userDiscordId?: string;
  updateGamePoints: (d: { game: string; point: number }) => Promise<void>;
  getSession: () => Promise<any>;
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

  previewChar: NFT;
  setPreviewChar: (c: NFT) => void;

  players: Array<NFT>;
  setPlayers: (l: Array<NFT>) => void;

  stopScenes: (...scenes: Array<SceneKey>) => void;

  menu?: Menu;
  openMenu: (menu: Menu) => void;
  closeMenu: () => void;

  minigame?: Minigame;
  startMinigame: (game: Minigame) => void;
  stopMinigame: () => void;

  showLoader?: boolean;
  setShowLoader: (v: boolean) => void;

  transitionTo: (
    key: SceneKey,
    scenesToStop?: Array<SceneKey>
  ) => Promise<void>;

  playSound: (
    soundKey: string,
    config?: Phaser.Types.Sound.SoundConfig
  ) => void;

  ads?: Ad[];
  setAds: (ads: Ad[]) => void;

  hudVisible?: boolean;
  toggleHud: (value?: boolean) => void;
}

export const useGameState = create<State>((set, get) => ({
  channels: {},
  addChannel: async (cn, params, cb) => {
    const { socket, token, channels } = get();
    let channel: Channel | undefined;
    let onJoin;
    if (socket && token && !channels[cn]) {
      channel = socket.channel(cn, { ...params, token });
      set(
        produce<State>((state) => {
          state.channels[cn] = channel;
        })
      );
      onJoin = await cb(channel);
      if (!onJoin) {
        onJoin = () => {
          return;
        };
      }
      channel.join().receive("ok", onJoin);
      return;
    }
    channel = channels[cn];
    if (channel) {
      onJoin = await cb(channel);
      if (!onJoin) {
        onJoin = () => {
          return;
        };
      }
      onJoin();
    }
  },
  psaQueue: [],
  addToPSAqueue: (...ele) => {
    set((s) => ({
      psaQueue: unionBy(ele, s.psaQueue, (e) => e.id),
    }));
  },
  removeFromPSAqueue: (id) => {
    set((s) => ({
      psaQueue: s.psaQueue.filter((e) => e.id !== id),
    }));
  },
  clearPSA: () => set({ psaQueue: [] }),
  playSound: (soundKey, config) => {
    const { getActiveScene } = get();
    const activeScene = getActiveScene();
    const sound = activeScene?.game.sound.get(soundKey);
    if (sound?.isPlaying) return;
    activeScene?.sound.add(soundKey, config).play();
  },
  transitionTo: (scene, scenesToStop = []) => {
    const { getActiveScene, stopScenes, setActiveSceneKey } = get();
    const activeScene = getActiveScene();
    if (activeScene) {
      return new Promise((r) => {
        // Fade out & prepare for scene transition
        activeScene.cameras.main
          .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            stopScenes(...scenesToStop);
            activeScene.scene.start(scene);
            setActiveSceneKey(scene);
            r();
          })
          .fadeOut(500, 0, 0, 0);
      });
    }
    return Promise.resolve();
  },
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
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      if (res.ok) {
        const currentUser = await res.json();
        const { wallet, discord_id } = currentUser;
        const socket = new Socket(API_WEBSOCKET_URL);
        socket.connect();
        set({
          token: session.token,
          account: wallet,
          userDiscordId: discord_id,
          socket,
        });
        Sentry.setUser({ id: session.address });
        return session;
      }
    }
    return null;
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
      const address = utils.getAddress(data.user.wallet);
      const socket = new Socket(API_WEBSOCKET_URL);
      socket.connect();
      set({
        token: data.token,
        account: address,
        userDiscordId: data.user.discord_id,
        socket,
      });
      localStorage.setItem(
        "session",
        JSON.stringify({
          token: data.token,
          address,
          user_discord_id: data.user.discord_id,
          chainId: 1,
        })
      );
      Sentry.setUser({ id: address });
    }
  },
  logout: async () => {
    Sentry.setUser(null);
    const { transitionTo } = get();
    localStorage.removeItem("session");
    transitionTo(SceneKey.BOOT, [
      SceneKey.GAME_INTERACTION,
      SceneKey.GAME,
      SceneKey.MINIMAP,
    ]).then(() =>
      set({
        minigame: undefined,
        token: undefined,
        userDiscordId: undefined,
        account: undefined,
        nfts: undefined,
        previewChar: DEFAULT_PLAYER,
        players: [],
        activeSceneKey: SceneKey.BOOT,
        psaQueue: [],
        channels: {},
      })
    );
    return true;
  },
  userDiscordId: undefined,
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

  previewChar: DEFAULT_PLAYER,
  setPreviewChar: (p) => set({ previewChar: p }),

  players: [],
  setPlayers: (players) => set({ players }),

  init: () => set(() => ({ game: new Phaser.Game(config) })),

  stopScenes: (...scenes) => {
    const { getActiveScene } = get();
    const activeScene = getActiveScene();
    if (!activeScene) return;

    scenes.forEach((s) => activeScene.scene.stop(s));
  },

  menu: undefined,
  openMenu: (m: Menu) => {
    const game = get().game;

    if (game) {
      game.input.enabled = false;
      game.input.keyboard.enabled = false;
    }

    set(() => ({ menu: m }));
  },
  closeMenu: () => {
    const game = get().game;

    if (game) {
      game.input.enabled = true;
      game.input.keyboard.enabled = true;
    }

    set(() => ({ menu: undefined }));
  },

  minigame: undefined,
  startMinigame: (minigame: Minigame) => {
    const game = get().game;

    if (game) {
      game.input.enabled = false;
      game.input.keyboard.enabled = false;
    }

    set(() => ({ minigame }));
  },
  stopMinigame: () => {
    const game = get().game;

    if (game) {
      game.input.enabled = true;
      game.input.keyboard.enabled = true;
    }

    set(() => ({ minigame: undefined }));
  },

  showLoader: false,
  setShowLoader: (showLoader: boolean) => set(() => ({ showLoader })),

  ads: [],
  setAds: (ads) => set(() => ({ ads })),

  hudVisible: true,
  toggleHud: (value?: boolean) => {
    if (value !== undefined) {
      set(() => ({ hudVisible: value }));
    } else {
      set(() => ({ hudVisible: !get().hudVisible }));
    }
  },
}));
