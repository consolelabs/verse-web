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
      <img
        className="absolute w-full h-full object-cover top-0 left-0"
        src="/assets/images/title-screen-bg.jpeg"
      />
      <button
        id="start"
        type="button"
        onClick={start}
        className="relative m-auto text-xl bg-white rounded"
      >
        Start Game
      </button>
    </div>
  );
};
