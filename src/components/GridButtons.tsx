import React from "react";
import clsx from "clsx";

type Props = {
  cols: 1 | 2 | 3 | 4 | 5 | 6;
  rows: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  children: React.ReactNode;
};

const Button = ({
  children,
  ...rest
}: { children: React.ReactNode } & React.HTMLProps<HTMLButtonElement>) => {
  return (
    <button
      {...rest}
      type={rest.type as any}
      className="text-white text-lg font-medium hover:scale-110 hover:brightness-120 transition-all duration-75 ease-in bg-transparent border-none shadow-none flex flex-col items-center outline-none"
    >
      {children}
    </button>
  );
};

export const GridButtons = (props: Props) => {
  const { cols, rows, gap } = props;
  return (
    <div
      className={clsx(`grid grid-cols-${cols} grid-rows-${rows}`, {
        "gap-5": gap === "sm",
        "gap-10": gap === "md",
        "gap-16": gap === "lg",
      })}
    >
      {props.children}
    </div>
  );
};

GridButtons.Button = Button;
