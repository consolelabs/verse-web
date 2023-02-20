import { useEffect, useMemo } from "react";
import { useGameState } from "stores/game";
import { GradientContainer } from "../GradientContainer";
import { Menu as MenuKey } from "constants/game";
import { Leaderboard } from "./Leaderboard";
import { MainMenu } from "./MainMenu";
import { MinigameMenu } from "./MinigameMenu";
import clsx from "clsx";

export const Menu = () => {
  const { menu, closeMenu, getActiveScene } = useGameState();
  const isMenuOpen = Boolean(menu);

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

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 w-screen h-screen flex justify-center items-center",
        {
          "pointer-events-none": !isMenuOpen,
        }
      )}
    >
      <div
        onClick={closeMenu}
        className={clsx(
          "fixed w-full h-full transition-all duration-200 ease-in-out",
          {
            "bg-black/70 backdrop-blur-5": isMenuOpen,
          }
        )}
      />
      <GradientContainer
        className={clsx({
          "opacity-0": !isMenuOpen,
          "transition-all duration-200 ease-in-out opacity-100": isMenuOpen,
        })}
      >
        <div className="p-10">{menuRender}</div>
      </GradientContainer>
    </div>
  );
};
