import classNames from "classnames";
import { useGameContext } from "contexts/game";
import { useDisclosure } from "hooks/useDisclosure";
import { useEffect, useMemo, useState } from "react";
import PodMap from "scenes/Pod/Map";
import { Tabs } from "ui/components/Tabs";
import { ItemGrid, ItemProps } from "./ItemGrid";

const mockItems = {
  floors: [
    {
      key: "floor-1",
      name: "Floor 1",
      src: "/tiles/pod/floors/1.png",
    },
    {
      key: "floor-2",
      name: "Floor 2",
      src: "/tiles/pod/floors/2.png",
    },
    {
      key: "floor-3",
      name: "Floor 3",
      src: "/tiles/pod/floors/3.png",
    },
  ],
  walls: [
    {
      key: "wall-1",
      name: "Wall 1",
      src: "/tiles/pod/walls/1.png",
    },
    {
      key: "wall-2",
      name: "Wall 2",
      src: "/tiles/pod/walls/2.png",
    },
    {
      key: "wall-3",
      name: "Wall 3",
      src: "/tiles/pod/walls/3.png",
    },
  ],
  housewares: [
    {
      key: "bench-1",
      name: "bench-1",
      src: "/tiles/exterior/sprites/bench-1/bench-1.png",
      quantity: 1,
    },
    {
      key: "bench-2",
      name: "bench-2",
      src: "/tiles/exterior/sprites/bench-2/bench-2.png",
      quantity: 1,
    },
    {
      key: "bench-3",
      name: "bench-3",
      src: "/tiles/exterior/sprites/bench-3/bench-3.png",
      quantity: 1,
    },
    {
      key: "plant-1",
      name: "plant-1",
      src: "/tiles/exterior/sprites/plant-1/plant-1.png",
      quantity: 1,
    },
    {
      key: "plant-2",
      name: "plant-2",
      src: "/tiles/exterior/sprites/plant-2/plant-2.png",
      quantity: 1,
    },
    {
      key: "street-light",
      name: "street-light",
      src: "/tiles/exterior/sprites/street-light/street-light.png",
      quantity: 1,
    },
    {
      key: "trash-bin",
      name: "trash-bin",
      src: "/tiles/exterior/sprites/trash-bin/trash-bin.png",
      quantity: 1,
    },
    {
      key: "vending-machine",
      name: "vending-machine",
      src: "/tiles/exterior/sprites/vending-machine/vending-machine.png",
      quantity: 1,
    },
    {
      key: "ice-cream-cart",
      name: "ice-cream-cart",
      src: "/tiles/exterior/sprites/ice-cream-cart/ice-cream-cart.png",
      quantity: 1,
    },
    {
      key: "flower-bed",
      name: "flower-bed",
      src: "/tiles/exterior/sprites/flower-bed/flower-bed.png",
      quantity: 1,
    },
  ],
};

interface Props {
  isActive: boolean;
}

export const PodBuilderPanel = (props: Props) => {
  const { isActive } = props;

  const { activeSceneKey, getActiveScene } = useGameContext();

  const { isOpen, open, close } = useDisclosure();
  const [selectedFloor, setSelectedFloor] = useState(mockItems.floors[0]);
  const [selectedWall, setSelectedWall] = useState(mockItems.walls[0]);
  const [selectedHousewareItem, setSelectedHousewareItem] =
    useState<ItemProps>();

  const activeScene = useMemo(() => {
    return getActiveScene() as PodMap;
  }, [activeSceneKey]);

  const selectWall = (item: ItemProps) => {
    setSelectedWall(item);

    activeScene.setWall(item.key || "");
  };

  const selectFloor = (item: ItemProps) => {
    setSelectedFloor(item);

    activeScene.setFloor(item.key || "");
  };

  const selectHousewareItem = (item: ItemProps) => {
    setSelectedHousewareItem(item);

    activeScene.setItemToPlace(item.key);
  };

  useEffect(() => {
    if (isActive) {
      open();
    } else {
      close();
    }
  }, [isActive]);

  return (
    <div
      className={classNames(
        "fixed left-0 bottom-0 h-50vh w-50vw bg-background-primary translate-x-[-50vw] transition-all duration-500 rounded-tr-xl p-4",
        { "translate-x-0": isOpen }
      )}
    >
      <Tabs
        tabs={[
          {
            key: "floors",
            label: "Floors",
            content: (
              <ItemGrid
                items={mockItems.floors}
                selectedItem={selectedFloor}
                onSelect={selectFloor}
              />
            ),
          },
          {
            key: "walls",
            label: "Walls",
            content: (
              <ItemGrid
                items={mockItems.walls}
                selectedItem={selectedWall}
                onSelect={selectWall}
              />
            ),
          },
          {
            key: "housewares",
            label: "Housewares",
            content: (
              <ItemGrid
                items={mockItems.housewares}
                selectedItem={selectedHousewareItem}
                onSelect={selectHousewareItem}
              />
            ),
          },
        ]}
      />
    </div>
  );
};
