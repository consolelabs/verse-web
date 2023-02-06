import { useGameState } from "stores/game";
import { useAccount } from "wagmi";
import { SceneKey } from "constants/scenes";
import { ConnectButton } from "ui/components/ConnectButton";
import { useModal } from "connectkit";

export const Boot = () => {
  const { getNFTs, getActiveScene, setActiveSceneKey, token } = useGameState();
  const { setOpen } = useModal();
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

  return (
    <div className="fixed w-screen h-screen flex flex-col items-center justify-start space-y-4">
      <div className="flex items-center mt-35vh gap-2">
        <ConnectButton />
        <button
          type="button"
          disabled={!account.isConnected}
          className="btn btn-primary-blue btn-md"
          onClick={!token ? () => setOpen(true) : startGame}
        >
          {!account.isConnected ? (
            <>Please connect Wallet to Start Game</>
          ) : !token ? (
            <>
              <div className="i-heroicons-pencil-solid text-white mr-2" />
              Please Sign in with Ethereum to Start Game
            </>
          ) : (
            <>
              <div className="i-heroicons-play-solid text-white mr-2" />
              start game
            </>
          )}
        </button>
      </div>
    </div>
  );
};
