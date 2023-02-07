import { WagmiConfig, createClient } from "wagmi";
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
  const { activeSceneKey, game, showLoader, init, getSession } = useGameState();
  const [fps, setFPS] = useState(0);

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
      case SceneKey.BLANK:
      default: {
        return null;
      }
    }
  }, [activeSceneKey]);

  useEffect(() => {
    let interval: any;

    if (game) {
      interval = setInterval(() => {
        setFPS(game?.loop.actualFps ?? -1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [game]);

  useEffect(() => {
    if (!game) {
      init();
      getSession();
    }
  }, []);

  return (
    <WagmiConfig client={client}>
      <SIWEProvider {...siweConfig}>
        <ConnectKitProvider>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black"
            id="game"
          />
          {game && (
            <div className="fixed top-0 left-0 w-12 h-8 flex items-center justify-center color-white text-xl font-bold bg-black/50">
              {Math.floor(fps)}
            </div>
          )}
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
              { "opacity-100": showLoader, "opacity-0": !showLoader }
            )}
          />
          <MinigameIframes />
        </ConnectKitProvider>
      </SIWEProvider>
    </WagmiConfig>
  );
};

export default App;
