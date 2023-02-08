import { useEffect, useMemo } from "react";
import { useGameState } from "stores/game";
import { GradientContainer } from "../GradientContainer";
import { Menu as MenuKey } from "constants/game";
import { Leaderboard } from "./Leaderboard";
import { MainMenu } from "./MainMenu";
import { MinigameMenu } from "./MinigameMenu";

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
