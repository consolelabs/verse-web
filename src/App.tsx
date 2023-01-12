import { useEffect, useMemo, useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { Game } from "ui/hud/Game";
import { Pod } from "ui/hud/Pod";
import { Menu } from "./components/Menu";
import { CharSelect } from "ui/hud/CharSelect";

const App = () => {
  const { activeSceneKey, game, init } = useGameState();
  const [fps, setFPS] = useState(0);

  const contentRender = useMemo(() => {
    switch (activeSceneKey) {
      case SceneKey.CHAR_SELECT: {
        return <CharSelect />;
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
      interval = setInterval(() => {
        setFPS(game?.loop.actualFps ?? -1);
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [game]);

  useEffect(() => {
    if (!game) {
      init();
    }
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full bg-black" id="game" />
      {game && (
        <div className="fixed top-0 left-0 w-12 h-8 flex items-center justify-center color-white text-xl font-bold bg-black/50">
          {Math.floor(fps)}
        </div>
      )}
      {contentRender}
      <Menu />
    </>
  );
};

export default App;
