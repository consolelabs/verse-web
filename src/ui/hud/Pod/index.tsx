import { useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import PodMap from "scenes/Pod/Map";
import { PodBuilderPanel } from "./PodBuilderPanel";
import { GridButtons } from "ui/components/GridButtons";

export const Pod = () => {
  const { getActiveScene, setActiveSceneKey } = useGameState();

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
      {getActiveScene() && <PodBuilderPanel isActive={isBuildModeEnabled} />}

      <div className="fixed bottom-0 right-0 mb-4 mr-8 flex space-x-4">
        <GridButtons rows={1} cols={2}>
          <GridButtons.Button onClick={onToggleBuildMode}>
            <img
              src="/assets/images/pod-builder.png"
              className="w-80px h-80px"
            />
            <span className="-mt-1">Build</span>
          </GridButtons.Button>
          <GridButtons.Button
            onClick={onNavigateToWorld}
            disabled={isBuildModeEnabled}
          >
            <img src="/assets/images/world.png" className="w-80px h-80px" />
            <span className="-mt-1">World</span>
          </GridButtons.Button>
        </GridButtons>
      </div>
    </>
  );
};
