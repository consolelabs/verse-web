import { useGameContext } from "contexts/game";
import { useEffect } from "react";

export const Boot = () => {
  const { start } = useGameContext();

  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore
      document.querySelector("#start")?.click();
    });
  }, []);

  return (
    <div className="fixed w-full h-full flex">
      <button
        id="start"
        type="button"
        onClick={start}
        className="m-auto text-xl bg-white rounded"
      >
        Start Game
      </button>
    </div>
  );
};
