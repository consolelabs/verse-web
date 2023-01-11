import { SceneKey } from "constants/scenes";
import { useGameContext } from "contexts/game";

export const Game = () => {
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
