import { SceneKey } from "../../constants/scenes";
import { useGameState } from "stores/game";
import { GridButtons } from "../GridButtons";
import { Menu as MenuKey } from "constants/game";

export const MainMenu = () => {
  const { closeMenu, getActiveScene, stopScenes, openMenu } = useGameState();

  return (
    <GridButtons cols={3} rows={3} gap="md">
      {[
        {
          img: "character.png",
          text: "Character",
          onClick: () => {
            const activeScene = getActiveScene();

            if (activeScene) {
              // Fade out & prepare for scene transition
              activeScene.cameras.main.fadeOut(500, 0, 0, 0);
              activeScene.cameras.main.once(
                Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                () => {
                  stopScenes(
                    SceneKey.GAME_INTERACTION,
                    SceneKey.GAME,
                    SceneKey.MINIMAP
                  );
                  activeScene.scene.start(SceneKey.CHAR_SELECT);
                }
              );
            }
          },
        },
        {
          img: "pod.png",
          text: "Pod",
          onClick: () => {
            // const activeScene = getActiveScene();
            //
            // if (activeScene) {
            //   // Fade out & prepare for scene transition
            //   activeScene.cameras.main.fadeOut(500, 0, 0, 0);
            //   activeScene.cameras.main.once(
            //     Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
            //     () => {
            //       activeScene.scene.stop(SceneKey.GAME_INTERACTION);
            //       activeScene.scene.stop(SceneKey.GAME_DIALOGUE);
            //       activeScene.scene.start(SceneKey.POD);
            //       setActiveSceneKey(SceneKey.POD);
            //     }
            //   );
            // }
          },
        },
        { img: "mail.png", text: "Mail" },
        {
          img: "leaderboard.png",
          text: "Leaderboard",
          onClick: () => {
            openMenu(MenuKey.LEADERBOARD);
          },
        },
        { img: "quest.png", text: "Quest" },
        { img: "achievement.png", text: "Achievement" },
        { img: "market.png", text: "Market" },
        { img: "airdrop.png", text: "Airdrop" },
        { img: "quit.png", text: "Save & quit" },
      ].map((b) => {
        return (
          <GridButtons.Button
            key={b.img}
            onClick={() => {
              closeMenu();
              b.onClick?.();
            }}
          >
            <img src={`/assets/images/${b.img}`} className="h-80px w-80px" />
            <span className="">{b.text}</span>
          </GridButtons.Button>
        );
      })}
    </GridButtons>
  );
};
