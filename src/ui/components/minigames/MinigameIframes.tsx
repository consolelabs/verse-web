import { useGameState } from "stores/game";
import { GradientContainer } from "ui/components/GradientContainer";
import { useEffect, useState } from "react";
import Postmate from "postmate";

export const MinigameIframes = () => {
  const [child, setChild] = useState<Postmate.ParentAPI>();
  const { minigame, getActiveScene, stopMinigame, updateGamePoints } =
    useGameState();

  useEffect(() => {
    if (minigame) {
      const hs = new Postmate({
        container: document.getElementById("minigame-frame"),
        url: minigame.src,
        name: minigame.name,
        classListArray: ["flex-1"],
      });

      hs.then((child) => {
        setChild(child);

        child.on("game-point", updateGamePoints);

        const iframe = document.querySelector<HTMLIFrameElement>(
          "#minigame-frame iframe"
        );
        iframe?.focus();
      });
    } else {
      child?.destroy();
    }
  }, [minigame]);

  if (!minigame) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex bg-black/50">
      <GradientContainer
        className="w-90vw h-90vh m-auto"
        contentClassName="h-full flex flex-col overflow-hidden"
      >
        <div className="h-12 flex justify-between items-center p-4">
          <div className="flex space-x-2">
            <img src={minigame.logoSrc} className="w-6 h-6" />
            <span className="capitalize text-white">{minigame.name}</span>
          </div>
          <button
            type="button"
            className="border-none outline-none p-0 bg-transparent text-white"
            onClick={() => {
              getActiveScene()?.sound.play("success-audio", { volume: 0.05 });
              stopMinigame();
            }}
          >
            Quit
          </button>
        </div>
        <div className="flex-1 flex" id="minigame-frame"></div>
      </GradientContainer>
    </div>
  );
};
