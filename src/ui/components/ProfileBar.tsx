import { useGameState } from "stores/game";
import { Avatar } from "connectkit";
import { SceneKey } from "constants/scenes";

export const ProfileBar = () => {
  const { account, setActiveSceneKey } = useGameState();

  return (
    <>
      <div
        style={{
          background: "linear-gradient(to bottom, #100E20, transparent)",
        }}
        className="fixed h-110px w-screen top-0"
      />
      <div className="fixed top-12 left-5 flex items-center">
        <div className="relative flex items-center">
          <button
            onClick={() => setActiveSceneKey(SceneKey.PROFILE)}
            type="button"
            className="relative z-10 outline-none"
            tabIndex={-1}
          >
            <img src="/assets/images/avatar-frame.png" alt="" />
            <div className="h-43px w-43px absolute top-1.8 left-1.8 w-full h-full">
              <Avatar address={account} size={43} />
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
