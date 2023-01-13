import { useGameState } from "stores/game";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { SceneKey } from "constants/scenes";

export const Boot = () => {
  const { getNFTs, setAccount, getActiveScene, setActiveSceneKey } =
    useGameState();
  const account = useAccount();

  const startGame = () => {
    getNFTs();
    getActiveScene()?.scene.start(SceneKey.INTRO);
    setActiveSceneKey(SceneKey.INTRO);
  };

  useEffect(() => {
    if (account.isConnected && account.address) {
      setAccount(account.address);
    }
  }, [account.isConnected]);

  return (
    <div className="fixed w-full h-full flex">
      <img
        className="absolute w-full h-full object-cover top-0 left-0"
        src="/assets/images/title-screen-bg.jpeg"
      />
      <ConnectKitButton.Custom>
        {({ show, isConnected }) => {
          return (
            <button
              id="start"
              type="button"
              onClick={isConnected ? startGame : show}
              className="relative m-auto text-xl bg-white rounded"
            >
              {isConnected ? "Start Game" : "Connect Wallet"}
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    </div>
  );
};
