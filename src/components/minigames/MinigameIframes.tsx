import { useGameState } from "stores/game";
import { GradientContainer } from "components/GradientContainer";
import { useMemo } from "react";

export const MinigameIframes = () => {
  const { minigame, stopMinigame } = useGameState();

  const src = useMemo(() => {
    switch (minigame) {
      case "tripod": {
        return "https://tripod-web.vercel.app/";
      }
      default: {
        return "";
      }
    }
  }, [minigame]);

  if (!src) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex bg-black/50">
      <GradientContainer
        className="w-90vw h-90vh m-auto"
        contentClassName="h-full flex flex-col"
      >
        <div className="h-12 flex justify-between items-center p-4">
          <span className="capitalize text-white">{minigame}</span>
          <button
            type="button"
            className="border-none outline-none p-0 bg-transparent text-white"
            onClick={stopMinigame}
          >
            Quit
          </button>
        </div>
        <iframe className="flex-1 bg-black/50 border-none" src={src} />
      </GradientContainer>
    </div>
  );
};
