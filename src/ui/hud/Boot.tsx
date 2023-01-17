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
      <div className="relative m-auto flex flex-col items-center justify-center space-y-4">
        <ConnectKitButton />
        <button
          type="button"
          disabled={!account.isConnected}
          className="text-xl bg-white rounded"
          onClick={startGame}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
