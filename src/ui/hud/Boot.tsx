import { useGameState } from "stores/game";
import { useAccount } from "wagmi";
import { SceneKey } from "constants/scenes";
import { ConnectButton } from "ui/components/ConnectButton";
import { useModal } from "connectkit";

function PhantomWalletButton() {
  return (
    <button
      className="flex-1 flex justify-center gap-x-2 items-center bg-#5122E0 rounded px-5 py-0"
      disabled
    >
      <img
        className="w-5"
        src="/assets/images/phantom-ghost-white.png"
        alt=""
      />
      <img
        className="w-22"
        src="/assets/images/phantom-text-white.png"
        alt=""
      />
      <span className="text-#481EC7 px-2 font-semibold bg-white rounded-full text-10px leading-none py-0.5">
        Coming Soon
      </span>
    </button>
  );
}

export const Boot = () => {
  const { transitionTo, getNFTs, token } = useGameState();
  const { setOpen } = useModal();
  const account = useAccount();

  const startGame = () => {
    getNFTs();
    transitionTo(SceneKey.INTRO);

    // Debug for POD, do not delete
    // activeScene?.cameras.main
    //   .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    //     activeScene.scene.start(SceneKey.CONFIG_LOADER);
    //     setActiveSceneKey(SceneKey.POD);
    //   })
    //   .fadeOut(200);
  };

  return (
    <div className="flex fixed flex-col justify-start items-center space-y-4 w-screen h-screen">
      <div className="flex flex-col gap-2 mt-32vh">
        <div className="flex flex-1 gap-2">
          <ConnectButton />
          <PhantomWalletButton />
        </div>
        <button
          type="button"
          disabled={!account.isConnected}
          className="justify-center btn btn-primary-blue btn-md"
          onClick={!token ? () => setOpen(true) : startGame}
        >
          {!account.isConnected ? (
            <>Please connect Wallet to Start Game</>
          ) : !token ? (
            <>
              <div className="mr-2 text-white i-heroicons-pencil-solid" />
              Please Sign in with Ethereum to Start Game
            </>
          ) : (
            <>
              <div className="mr-2 text-white i-heroicons-play-solid" />
              start game
            </>
          )}
        </button>
      </div>
    </div>
  );
};
