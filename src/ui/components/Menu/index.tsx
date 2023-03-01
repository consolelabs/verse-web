import React, { useEffect, useMemo } from "react";
import { useGameState } from "stores/game";
import { GradientContainer } from "../GradientContainer";
import { Menu as MenuKey } from "constants/game";
import { Leaderboard } from "./Leaderboard";
import { MainMenu } from "./MainMenu";
import { MinigameMenu } from "./MinigameMenu";
import clsx from "clsx";
import { Dialog, Transition } from "@headlessui/react";

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
    <Transition appear show={isMenuOpen} as={React.Fragment}>
      <Dialog
        open={isMenuOpen}
        onClose={closeMenu}
        as="div"
        className={clsx(
          "fixed top-0 left-0 w-screen h-screen flex justify-center items-center",
          {
            "pointer-events-none": !isMenuOpen,
          }
        )}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-in-out duration-200"
          enterFrom="bg-transparent backdrop-blur-0"
          enterTo="bg-black/70 backdrop-blur-5"
          leave="ease-in-out duration-200"
          leaveFrom="bg-black/70 backdrop-blur-5"
          leaveTo="bg-transparent backdrop-blur-0"
        >
          <div onClick={closeMenu} className="fixed w-full h-full" />
        </Transition.Child>
        <Transition.Child
          as="div"
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Panel as={GradientContainer}>
            <div className={menu === MenuKey.PROFILE ? "p-5" : "p-10"}>
              {menuRender}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};
