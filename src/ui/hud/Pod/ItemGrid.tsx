import classNames from "classnames";

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
    <div
      className={classNames("p-2 rounded border-2 border-solid", {
        "border-white": isSelected,
        "border-white/10": !isSelected,
      })}
      onClick={onClick}
    >
      <img src={src} className="aspect-square w-full object-contain" />
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
