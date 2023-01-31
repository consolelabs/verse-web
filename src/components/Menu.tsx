import { useEffect, useMemo } from "react";
import { SceneKey } from "../constants/scenes";
import { useGameState } from "stores/game";
import { GradientContainer } from "./GradientContainer";
import { GridButtons } from "./GridButtons";
import { Minigame } from "constants/game";

const MinigameMenu = () => {
  const { closeMenu, startMinigame } = useGameState();

  return (
    <GridButtons cols={3} rows={1} gap="md">
      {[
        {
          img: "tripod.png",
          text: "Tripod",
          onClick: () => {
            startMinigame(Minigame.TRIPOD);
          },
        },
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
const MainMenu = () => {
  const { closeMenu, getActiveScene, stopScenes } = useGameState();

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
        { img: "leaderboard.png", text: "Leaderboard" },
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

export const Menu = () => {
  const { menu, closeMenu, getActiveScene } = useGameState();

  const close = () => {
    const activeScene = getActiveScene();
    activeScene?.sound.play("success-audio", { volume: 0.05 });
    closeMenu();
  };

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (!menu) return;
      if (e.key !== "Escape") return;
      close();
    }
    window.addEventListener("keyup", esc);

    return () => window.removeEventListener("keyup", esc);
  }, [menu]);

  const menuRender = useMemo(() => {
    switch (menu) {
      case "main": {
        return <MainMenu />;
      }
      case "minigame": {
        return <MinigameMenu />;
      }
      default: {
        return null;
      }
    }
  }, [menu]);

  if (!menu) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center">
      <div
        onClick={closeMenu}
        className="fixed w-full h-full bg-black opacity-70"
      />
      <GradientContainer>
        <div className="p-10">{menuRender}</div>
      </GradientContainer>
    </div>
  );
};
