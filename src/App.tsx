import { useEffect, useMemo, useState } from "react";
import { SceneKey } from "./constants/scenes";
import { useGameContext } from "./contexts/game";
import PodMap from "./scenes/Pod/Map";

const Boot = () => {
  const { start } = useGameContext();

  return (
    <div className="fixed w-full h-full flex">
      <button
        type="button"
        onClick={start}
        className="m-auto text-xl bg-white rounded"
      >
        Start Game
      </button>
    </div>
  );
};

const Game = () => {
  const { getActiveScene, setActiveSceneKey } = useGameContext();

  const onNavigateToPod = () => {
    const activeScene = getActiveScene();

    if (activeScene) {
      // Fade out & prepare for scene transition
      activeScene.cameras.main.fadeOut(500, 0, 0, 0);
      activeScene.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          activeScene.scene.stop(SceneKey.GAME_INTERACTION);
          activeScene.scene.stop(SceneKey.GAME_DIALOGUE);
          activeScene.scene.start(SceneKey.POD);
          setActiveSceneKey(SceneKey.POD);
        }
      );
    }
  };

  return (
    <div className="fixed bottom-0 right-0 mb-8 mr-8 flex space-x-4">
      <button type="button" onClick={onNavigateToPod}>
        Pod
      </button>
      <button type="button">Inventory</button>
    </div>
  );
};

const Pod = () => {
  const { getActiveScene, setActiveSceneKey } = useGameContext();

  const [isBuildModeEnabled, setIsBuildModeEnabled] = useState(false);

  const onNavigateToWorld = () => {
    const activeScene = getActiveScene();

    if (activeScene) {
      // Fade out & prepare for scene transition
      activeScene.cameras.main.fadeOut(500, 0, 0, 0);
      activeScene.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          activeScene.scene.start(SceneKey.GAME);
          setActiveSceneKey(SceneKey.GAME);
        }
      );
    }
  };

  const onToggleBuildMode = () => {
    const activeScene = getActiveScene() as PodMap;
    activeScene?.toggleBuildMode();
    setIsBuildModeEnabled((o) => !o);
  };

  return (
    <>
      {isBuildModeEnabled && (
        <div className="fixed bottom-0 left-0 mb-8 ml-8 w-[500px] bg-white rounded">
          <div className="overflow-auto flex p-2 space-x-2">
            {[
              "bench-1",
              "bench-2",
              "bench-3",
              "plant-1",
              "plant-2",
              "street-light",
              "trash-bin",
              "vending-machine",
              "ice-cream-cart",
              "flower-bed",
            ].map((key) => {
              return (
                <img
                  src={`/tiles/exterior/sprites/${key}/${key}.png`}
                  className="w-20 h-20 object-contain flex-shrink-0 p-2 border-solid border-2 border-transparent hover:border-black rounded"
                  onClick={() => {
                    const activeScene = getActiveScene() as PodMap;
                    activeScene.setItemToPlace({
                      key,
                      quantity: 1,
                    });
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 right-0 mb-8 mr-8 flex space-x-4">
        <button type="button" onClick={onToggleBuildMode}>
          Build
        </button>
        <button type="button" onClick={onNavigateToWorld}>
          World
        </button>
      </div>
    </>
  );
};

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
