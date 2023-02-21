import { WagmiConfig, createClient, useAccount } from "wagmi";
import { ConnectKitProvider, getDefaultClient, SIWEProvider } from "connectkit";

import { useEffect, useMemo, useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { Game } from "ui/hud/Game";
import { Pod } from "ui/hud/Pod";
import { Menu } from "./components/Menu";
import { CharSelect } from "ui/hud/CharSelect";
import { Boot } from "ui/hud/Boot";
import { Toaster } from "react-hot-toast";
import { MinigameIframes } from "components/minigames/MinigameIframes";
import { SiweMessage } from "siwe";
import clsx from "clsx";

import { PublicServerAnnouncement } from "components/PublicServerAnnouncement";
import { Inventory } from "components/Inventory";

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
  getSession: async () => {
    const sessionStr = localStorage.getItem("session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      useGameState.setState({ token: session.token });
      return session;
    }
    return null;
  },
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
    getSession,
    addChannel,
  } = useGameState();

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
      case SceneKey.INVENTORY:
        return <Inventory />;
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
      getSession();
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

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
              {msg.leaderboard.map((p: any, i: number) => {
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
    <WagmiConfig client={client}>
      <SIWEProvider {...siweConfig}>
        <ConnectKitProvider>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black"
            id="game"
          />
          {game && fps >= 0 && (
            <div className="fixed top-0 left-0 w-12 h-8 flex items-center justify-center color-white text-xl font-bold bg-black/50">
              {Math.floor(fps)}
            </div>
          )}
          <PublicServerAnnouncement />
          {contentRender}
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
          <div
            className={clsx(
              "absolute bottom-0 right-0 mr-8 mb-8 i-svg-spinners-tadpole w-12 h-12 text-white transition-opacity",
              {
                "opacity-100": showLoader,
                "opacity-0 pointer-events-none": !showLoader,
              }
            )}
          />
          <MinigameIframes />
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
};

export default App;
