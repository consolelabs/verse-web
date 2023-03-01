import React, { useEffect, useMemo, useState } from "react";
import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { Transition } from "@headlessui/react";
import clsx from "clsx";

const Overview = React.lazy(() => import("./Overview/index.js"));
const Inventory = React.lazy(() => import("./Inventory.js"));

export const Profile = () => {
  const { activeSceneKey, setActiveSceneKey } = useGameState();
  const [close, setClose] = useState(false);
  const [viewKey, setViewKey] = useState<"overview" | "inventory">("overview");

  const view = useMemo(() => {
    switch (viewKey) {
      case "overview":
        return <Overview />;
      case "inventory":
        return <Inventory />;
      default:
        return null;
    }
  }, [viewKey]);

  useEffect(() => {
    if (close) {
      setViewKey("overview");
      setTimeout(() => {
        setActiveSceneKey(SceneKey.GAME);
      }, 150);
    }
  }, [close]);

  return (
    <Transition
      show={activeSceneKey === SceneKey.PROFILE && !close}
      appear
      enter="transition-all duration-150"
      enterFrom="opacity-0 scale-104"
      enterTo="opacity-100 scale-100"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-104"
      as={React.Fragment}
    >
      <div className="flex flex-col relative w-screen min-h-screen h-full bg-#151321 px-5 pb-20 items-center overflow-auto">
        <div className="pointer-events-none fixed h-screen w-screen -left-1/2 rotate-45 -bottom-1/2">
          <div className="w-full h-full bg-#171524 flex-shrink-0" />
        </div>
        <div
          style={{
            transform: `perspective(50px) rotateX(-2deg) translateY(-20px)`,
            transformStyle: "preserve-3d",
            background: "linear-gradient(45deg, #EF3EFF, #2FD4D6)",
          }}
          className="p-3px rounded-2xl sticky top-0 h-100px w-70vw z-20 flex-shrink-0 shadow-xl"
        >
          <div className="flex rounded-xl bg-#1B1A21 h-full w-full">
            <div
              style={{
                transform: `perspective(50px) rotateX(2deg)`,
              }}
              className="text-white -mt-16 pt-20 px-12 text-xl flex-1 flex justify-evenly items-center"
            >
              <button
                onClick={() => setClose(true)}
                className="flex flex-col items-center flex-1 opacity-30 hover:opacity-100 transition-opacity duration-75 ease-in-out"
              >
                <div className="i-heroicons-arrow-left-circle-solid" />
                <span className="text-base font-semibold">Back</span>
              </button>
              {[
                {
                  id: "overview",
                  img: "/assets/images/star.png",
                  text: "Overview",
                },
                {
                  id: "inventory",
                  img: "/assets/images/inventory.png",
                  text: "Inventory",
                },
              ].map((b) => {
                return (
                  <React.Fragment key={`profile-${b.id}`}>
                    <div className="w-1px bg-gray h-1/2" />
                    <button
                      onClick={() => setViewKey(b.id as any)}
                      className={clsx(
                        "flex flex-col items-center flex-1 transition-opacity duration-75 ease-in-out",
                        {
                          "opacity-30 hover:opacity-100": b.id !== viewKey,
                          "opacity-100": b.id === viewKey,
                        }
                      )}
                    >
                      <img className="w-6" src={b.img} alt="" />
                      <span className="text-base font-semibold">{b.text}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
        <div className="relative flex-1 self-stretch flex justify-center">
          {view}
        </div>
      </div>
    </Transition>
  );
};
