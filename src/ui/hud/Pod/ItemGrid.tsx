import clsx from "clsx";

export interface ItemProps {
  key: string;
  name: string;
  src: string;
  quantity?: number;
}

export const Item = ({
  name,
  src,
  quantity,
  isSelected,
  onClick,
}: ItemProps & {
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <div className="p-2 rounded" onClick={onClick}>
      <img
        src={src}
        className={clsx(
          "aspect-square w-full object-contain border-2 border-solid p-2",
          {
            "border-white": isSelected,
            "border-white/10": !isSelected,
          }
        )}
      />
      <div className="text-center p-2">
        {name}
        {quantity && ` (${quantity})`}
      </div>
    </div>
  );
};

interface Props {
  items: ItemProps[];
  selectedItem?: ItemProps;
  onSelect?: (item: ItemProps) => void;
}

export const ItemGrid = (props: Props) => {
  const { items = [], selectedItem, onSelect } = props;

  return (
    <div className="grid grid-cols-5 gap-2">
      {items.map((item) => {
        return (
          <Item
            {...item}
            isSelected={selectedItem?.key === item.key}
            onClick={() => onSelect?.(item)}
          />
        );
      })}
    </div>
  );
};
