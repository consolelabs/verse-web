import { useEffect, useMemo } from "react";
import { SceneKey } from "../constants/scenes";
import { useGameState } from "stores/game";
import { GradientContainer } from "./GradientContainer";
import { GridButtons } from "./GridButtons";
import { Minigame, Menu as MenuKey } from "constants/game";
import useSWR from "swr";
import { API_BASE_URL } from "envs";

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

const Leaderboard = () => {
  const { data: leaderboard } = useSWR<
    Array<{ point: number; address: string; game: string }>
  >(`${API_BASE_URL}/leaderboard`, (url) =>
    fetch(url).then((res) => {
      if (res.ok) return res.json();
      throw new Error();
    })
  );
  return (
    <div className="-m-8 -mt-5">
      <div className="mx-10 relative -top-12 flex items-center justify-center">
        <img
          className="absolute bottom-0 h-72 -translate-y-0"
          src="/assets/images/glow-effect.png"
        />
        <img
          className="absolute bottom-0 h-48 -translate-y-10"
          src="/assets/images/stand.png"
        />
        <img
          className="absolute bottom-0 h-28 -translate-y-24"
          src="/assets/images/crown.png"
        />
        <img
          className="absolute bottom-0 h-28 -translate-x-20 -translate-y-10 rotate-[-20deg]"
          src="/assets/images/badge-1.png"
        />
        <img
          className="absolute bottom-0 h-28 translate-x-20 -translate-y-10 rotate-[20deg]"
          src="/assets/images/badge-1.png"
        />
        <img
          src="/assets/images/leaderboard-ribbon.png"
          className="w-[500px] relative"
        />
      </div>
      <div className="overflow-auto rounded-md border border-purple-300 max-h-[300px]">
        {leaderboard?.map((d, i) => {
          return (
            <div
              key={`leaderboard-${i}`}
              className="text-white flex items-center p-2 odd:bg-[#373756] even:bg-[#2D2D45]"
            >
              {i === 0 ? (
                <img src="/assets/images/crown.png" className="h-10" />
              ) : (
                <div className="relative flex justify-center items-center">
                  <img
                    className="h-10 p-1"
                    src="/assets/images/leaderboard-rank-background.png"
                  />
                  <p className="absolute font-bold text-sm">{i + 1}</p>
                </div>
              )}
              <div className="ml-2">
                <p>{`${d.address.slice(0, 5)}...${d.address.slice(-5)}`}</p>
              </div>
              <div className="ml-auto flex items-center">
                <div className="relative z-10 bg-black p-1.5 rounded-[10px]">
                  <img className="w-6 h-6" src="/assets/images/tripod.png" />
                </div>
                <span className="-ml-1.5 px-2 py-0.5 rounded-r-md bg-black text-white font-medium">
                  {d.point}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
      case MenuKey.MAIN: {
        return <MainMenu />;
      }
      case MenuKey.MINIGAME: {
        return <MinigameMenu />;
      }
      case MenuKey.LEADERBOARD:
        return <Leaderboard />;
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
