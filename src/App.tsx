import { useEffect, useMemo, useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameContext } from "contexts/game";
import { Boot } from "ui/hud/Boot";
import { Game } from "ui/hud/Game";
import { Pod } from "ui/hud/Pod";

const App = () => {
  const { game, activeSceneKey } = useGameContext();
  const [fps, setFPS] = useState(0);

  const contentRender = useMemo(() => {
    switch (activeSceneKey) {
      case SceneKey.BOOT: {
        return <Boot />;
      }
      case SceneKey.GAME: {
        return <Game />;
      }
      case SceneKey.POD: {
        return <Pod />;
      }
      default: {
        return null;
      }
    }
  }, [activeSceneKey]);

  useEffect(() => {
    let interval: any;

    if (game) {
      setInterval(() => {
        setFPS(game.loop.actualFps);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [game]);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-black" id="game" />

      {game && (
        <div className="fixed top-0 left-0 w-12 h-8 flex items-center justify-center color-white text-xl font-bold bg-black/50">
          {Math.floor(fps)}
        </div>
      )}
      {contentRender}
    </>
  );
};

export default App;
