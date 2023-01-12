import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";

export const Boot = () => {
  const { setActiveSceneKey } = useGameState();

  return (
    <div className="fixed w-full h-full flex">
      <img
        className="absolute w-full h-full object-cover top-0 left-0"
        src="/assets/images/title-screen-bg.jpeg"
      />
      <button
        id="start"
        type="button"
        onClick={() => setActiveSceneKey(SceneKey.CHAR_SELECT)}
        className="relative m-auto text-xl bg-white rounded"
      >
        Start Game
      </button>
    </div>
  );
};
