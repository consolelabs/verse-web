import { useGameState } from "stores/game";
import { ConnectKitButton } from "connectkit";
import { useAccount, useSignMessage } from "wagmi";
import { useEffect } from "react";
import { SceneKey } from "constants/scenes";

export const Boot = () => {
  const { getNFTs, login, getActiveScene, setActiveSceneKey, token } =
    useGameState();
  const account = useAccount();
  const { signMessageAsync } = useSignMessage();

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
      const message = `${Date.now().toString()}\nSigning this message proves you are the owner of this wallet address`;
      signMessageAsync({ message }).then((sig) => {
        if (!account.address) return;
        login(account.address, sig, message);
      });
    }
  }, [account.isConnected]);

  return (
    <div className="fixed w-screen h-screen flex flex-col items-center justify-center space-y-4">
      <ConnectKitButton />
      <button
        type="button"
        disabled={!account.isConnected || !token}
        className="disabled:opacity-40 text-xl bg-white rounded border border-black px-2 py-0.5"
        onClick={startGame}
      >
        {!account.isConnected
          ? "Connect first☝️"
          : !token
          ? "Sign Message"
          : "Start Game"}
      </button>
    </div>
  );
};
