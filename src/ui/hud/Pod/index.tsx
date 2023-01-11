import { useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameContext } from "contexts/game";
import PodMap from "scenes/Pod/Map";
import { PodBuilderPanel } from "./PodBuilderPanel";

export const Pod = () => {
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
      <PodBuilderPanel isActive={isBuildModeEnabled} />
      <div className="fixed bottom-0 right-0 mb-8 mr-8 flex space-x-2">
        <button
          type="button"
          onClick={onToggleBuildMode}
          className="btn-control"
        >
          <img src="/assets/images/pod-builder.png" />
        </button>
        <button
          type="button"
          onClick={onNavigateToWorld}
          className="btn-control"
          disabled={isBuildModeEnabled}
        >
          <img src="/assets/images/world.png" />
        </button>
      </div>
    </>
  );
};
