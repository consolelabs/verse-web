import { WagmiConfig, createClient, useAccount } from "wagmi";
import {
  useSIWE,
  ConnectKitProvider,
  getDefaultClient,
  SIWEProvider,
} from "connectkit";

import React, { useEffect, useMemo, useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { Menu } from "ui/components/Menu";
import { Boot } from "ui/hud/Boot";
import { Toaster } from "react-hot-toast";
import { MinigameIframes } from "ui/components/minigames/MinigameIframes";
import { SiweMessage } from "siwe";

import { PublicServerAnnouncement } from "ui/components/PublicServerAnnouncement";
import { LoadingText } from "ui/components/LoadingText";
import { Transition } from "@headlessui/react";
import clsx from "clsx";
import useSWR from "swr";

const CharSelect = React.lazy(() =>
  import("./ui/hud/CharSelect.js").then(({ CharSelect }) => ({
    default: CharSelect,
  }))
);
const Game = React.lazy(() =>
  import("./ui/hud/Game.js").then(({ Game }) => ({
    default: Game,
  }))
);
const Pod = React.lazy(() =>
  import("./ui/hud/Pod/index.js").then(({ Pod }) => ({
    default: Pod,
  }))
);

const Profile = React.lazy(() =>
  import("./components/Profile/index.js").then(({ Profile }) => ({
    default: Profile,
  }))
);

const siweConfig = {
  getNonce: async () => Date.now().toString(),
  createMessage: ({ address, chainId, nonce }: any) =>
    new SiweMessage({
      version: "1",
      domain: window.location.host,
      uri: window.location.origin,
      address,
      chainId,
      nonce,
      statement: "Welcome to Pod Town Metaverse! Please sign in to enter verse",
    }).prepareMessage(),
  verifyMessage: async ({ message, signature }: any) => {
    await useGameState.getState().login(signature, message);
    return true;
  },
  getSession: useGameState.getState().getSession,
  signOut: useGameState.getState().logout,
  signOutOnNetworkChange: false,
};

const client = createClient(
  getDefaultClient({
    appName: "Verse",
  })
);

const App = () => {
  const {
    addToPSAqueue,
    socket,
    transitionTo,
    activeSceneKey,
    game,
    showLoader,
    init,
    addChannel,
    hudVisible,
    logout,
    getSession,
    token,
  } = useGameState();

  const { signOut: signOutSIWE } = useSIWE();
  const { data: stillValid } = useSWR(["current-user", token], async () =>
    getSession()
  );

  const [fps] = useState(-1);
  const { isConnected } = useAccount();

  const contentRender = useMemo(() => {
    switch (activeSceneKey) {
      case SceneKey.BOOT: {
        return <Boot />;
      }
      case SceneKey.CHAR_SELECT: {
        return <CharSelect />;
      }
      case SceneKey.GAME: {
        return <Game />;
      }
      case SceneKey.POD: {
        return <Pod />;
      }
      case SceneKey.PROFILE:
        return <Profile />;
      default: {
        return null;
      }
    }
  }, [activeSceneKey]);

  // useEffect(() => {
  //   let interval: any;
  //
  //   if (game) {
  //     interval = setInterval(() => {
  //       setFPS(game?.loop.actualFps ?? -1);
  //     }, 1000);
  //   }
  //
  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [game]);

  useEffect(() => {
    if (!game) {
      init();
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (stillValid === null && token) {
      logout();
      signOutSIWE?.();
    }
  }, [stillValid]);

  useEffect(() => {
    if (!isConnected && activeSceneKey !== SceneKey.BOOT) {
      transitionTo(SceneKey.BOOT, [
        SceneKey.GAME_INTERACTION,
        SceneKey.GAME,
        SceneKey.MINIMAP,
      ]);
    }
  }, [isConnected]);

  useEffect(() => {
    function addLeaderboardToPSA(msg: any) {
      addToPSAqueue({
        id: "leaderboard",
        element: (
          <div className="flex space-x-3 mr-10 text-sm items-center">
            <span className="text-yellow">Games Leaderboard:</span>
            <div className="flex space-x-5">
              {msg?.leaderboard.map((p: any, i: number) => {
                return (
                  <div
                    key={`${p.user_address}_${p.game}`}
                    className="flex items-center"
                  >
                    {i === 0 ? (
                      <img
                        src="/assets/images/crown.png"
                        className="h-6 w-6 mr-1"
                      />
                    ) : (
                      <div className="relative flex justify-center items-center">
                        <img
                          className="h-6 w-6 p-1"
                          src="/assets/images/leaderboard-rank-background.png"
                        />
                        <p className="absolute font-bold text-xs">{i + 1}</p>
                      </div>
                    )}
                    <div>
                      <code>
                        {p.user_address.slice(0, 5)}...
                        {p.user_address.slice(-5)}
                      </code>{" "}
                      got {p.point} pts in {p.game.toUpperCase()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ),
      });
    }
    if (!isConnected) return;
    addChannel("leaderboard", {}, async (channel) => {
      channel.on("leaderboard:updated", addLeaderboardToPSA);
      return (data) => addLeaderboardToPSA(data);
    });
  }, [isConnected]);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-black" id="game" />
      {game && fps >= 0 && (
        <div className="fixed top-0 left-0 w-12 h-8 flex items-center justify-center color-white text-xl font-bold bg-black/50">
          {Math.floor(fps)}
        </div>
      )}
      <PublicServerAnnouncement />
      <Transition
        show={hudVisible}
        className={clsx("fixed top-0 left-0 w-full h-full", {
          "z-10": activeSceneKey === SceneKey.PROFILE,
        })}
        enter="transition-all duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-all duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <React.Suspense>{contentRender}</React.Suspense>
      </Transition>
      <Menu />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#151321",
            color: "#FFFFFF",
          },
        }}
      />
      {showLoader ? (
        <div className="absolute bottom-0 right-0 mr-8 mb-8">
          <LoadingText />
        </div>
      ) : null}
      <MinigameIframes />
    </>
  );
};

function AppWrapper() {
  return (
    <WagmiConfig client={client}>
      <SIWEProvider {...siweConfig}>
        <ConnectKitProvider>
          <App />
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
}

export default AppWrapper;
