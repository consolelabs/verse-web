import { useEffect } from "react";
import { SceneKey } from "../constants/scenes";
import { useGameContext } from "../contexts/game";
import { GradientContainer } from "./GradientContainer";
import { GridButtons } from "./GridButtons";

export const Menu = () => {
  const { state, dispatch, getActiveScene } = useGameContext();

  const closeMenu = () => {
    dispatch({ type: "setOpenMenu", payload: false });
  };

  useEffect(() => {
    function esc(e: KeyboardEvent) {
      if (!state.openMenu) return;
      if (e.key !== "Escape") return;
      closeMenu();
    }
    window.addEventListener("keyup", esc);

    return () => window.removeEventListener("keyup", esc);
  }, [state.openMenu]);

  if (!state.openMenu) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center">
      <div
        onClick={closeMenu}
        className="fixed w-full h-full bg-black opacity-70"
      />
      <GradientContainer>
        <div className="p-10">
          <GridButtons cols={3} rows={3} gap="md">
            {[
              { img: "character.png", text: "Character" },
              {
                img: "pod.png",
                text: "Pod",
                onClick: () => {
                  const activeScene = getActiveScene();

                  if (activeScene) {
                    // Fade out & prepare for scene transition
                    activeScene.cameras.main.fadeOut(500, 0, 0, 0);
                    activeScene.cameras.main.once(
                      Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
                      () => {
                        activeScene.scene.stop(SceneKey.GAME_INTERACTION);
                        activeScene.scene.stop(SceneKey.GAME_DIALOGUE);
                        activeScene.scene.start(SceneKey.POD, {
                          wallKey: "wall-1",
                          floorKey: "floor-1",
                        });
                        dispatch({
                          type: "setActiveSceneKey",
                          payload: SceneKey.POD,
                        });
                      }
                    );
                  }
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
                  <img
                    src={`/assets/images/${b.img}`}
                    className="h-80px w-80px"
                  />
                  <span className="">{b.text}</span>
                </GridButtons.Button>
              );
            })}
          </GridButtons>
        </div>
      </GradientContainer>
    </div>
  );
};
