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
    const activeScene = getActiveScene();
    getNFTs();
    activeScene?.cameras.main
      .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        activeScene.scene.start(SceneKey.INTRO);
        setActiveSceneKey(SceneKey.INTRO);
      })
      .fadeOut(200);

    // Debug for POD, do not delete
    // activeScene?.cameras.main
    //   .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    //     activeScene.scene.start(SceneKey.CONFIG_LOADER);
    //     setActiveSceneKey(SceneKey.POD);
    //   })
    //   .fadeOut(200);
  };

  useEffect(() => {
    if (account.isConnected && account.address) {
      setAccount(account.address);
    }
  }, [account.isConnected]);

  return (
    <div className="fixed w-screen h-screen flex flex-col items-center justify-center space-y-4">
      <ConnectKitButton />
      <button
        type="button"
        disabled={!account.isConnected}
        className="disabled:opacity-20 text-xl bg-white rounded border border-black px-2 py-0.5"
        onClick={startGame}
      >
        Start Game
      </button>
    </div>
  );
};
