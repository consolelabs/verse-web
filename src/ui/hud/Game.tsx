import { GridButtons } from "components/GridButtons";
import { useGameContext } from "contexts/game";

export const Game = () => {
  const { dispatch } = useGameContext();

  const openMenu = () => dispatch({ type: "setOpenMenu", payload: true });

  return (
    <div className="fixed bottom-0 right-0 mb-4 mr-8 flex space-x-4">
      <GridButtons rows={1} cols={2}>
        <GridButtons.Button>
          <img src="/assets/images/inventory.png" className="w-80px h-80px" />
          <span className="-mt-2">Inventory</span>
        </GridButtons.Button>
        <GridButtons.Button onClick={openMenu}>
          <img src="/assets/images/menu.png" className="w-80px h-80px" />
          <span className="-mt-2">Menu</span>
        </GridButtons.Button>
      </GridButtons>
    </div>
  );
};
