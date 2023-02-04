import { useGameState } from "stores/game";
import { GradientContainer } from "components/GradientContainer";
import { useEffect, useMemo, useState } from "react";
import Postmate from "postmate";

export const MinigameIframes = () => {
  const [child, setChild] = useState<Postmate.ParentAPI>();
  const { minigame, stopMinigame } = useGameState();

  const src = useMemo(() => {
    switch (minigame) {
      case "tripod": {
        return "http://tripod-web.vercel.app";
      }
      default: {
        return "";
      }
    }
  }, [minigame]);

  useEffect(() => {
    if (src) {
      const hs = new Postmate({
        container: document.getElementById("minigame-frame"),
        url: src,
        name: minigame,
        classListArray: ["flex-1"],
      });

      hs.then((child) => {
        setChild(child);
      });
    } else {
      child?.destroy();
    }
  }, [src]);

  if (!src) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex bg-black/50">
      <GradientContainer
        className="w-90vw h-90vh m-auto"
        contentClassName="h-full flex flex-col overflow-hidden"
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
        <div className="flex-1 flex" id="minigame-frame"></div>
      </GradientContainer>
    </div>
  );
};
