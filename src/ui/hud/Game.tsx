import { Chat } from "components/Chat";
import { GridButtons } from "components/GridButtons";
import { Menu } from "constants/game";
import { SceneKey } from "constants/scenes";
import { useEffect } from "react";
import { useGameState } from "stores/game";

export const Game = () => {
  const { openMenu, getActiveScene, setShowLoader, setActiveSceneKey } =
    useGameState();

  const open = (menu: Menu) => {
    const activeScene = getActiveScene();
    activeScene?.sound.play("success-audio", { volume: 0.05 });
    openMenu(menu);
  };

  useEffect(() => {
    setShowLoader(false);
  }, []);

  return (
    <>
      <Chat />
      <div className="fixed bottom-0 right-0 mb-4 mr-8 flex">
        <GridButtons rows={1} cols={3} gap="sm">
          <GridButtons.Button onClick={() => open(Menu.MINIGAME)}>
            <img src="/assets/images/flag.png" className="w-80px h-80px" />
            <span className="-mt-2">Games</span>
          </GridButtons.Button>
          <GridButtons.Button
            onClick={() => setActiveSceneKey(SceneKey.INVENTORY)}
          >
            <img src="/assets/images/inventory.png" className="w-80px h-80px" />
            <span className="-mt-2">Inventory</span>
          </GridButtons.Button>
          <GridButtons.Button onClick={() => open(Menu.MAIN)}>
            <img src="/assets/images/menu.png" className="w-80px h-80px" />
            <span className="-mt-2">Menu</span>
          </GridButtons.Button>
        </GridButtons>
      </div>
    </>
  );
};
