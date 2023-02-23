import clsx from "clsx";
import React from "react";

type Props = {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export const GradientContainer = React.forwardRef<HTMLDivElement, Props>(
  (props, ref) => {
    return (
      <div
        ref={ref}
        className={clsx("relative p-1.5px rounded-lg", props.className)}
        style={{ background: "linear-gradient(45deg, #EF3EFF, #2FD4D6)" }}
      >
        <div className={clsx("bg-#140F29 rounded-lg", props.contentClassName)}>
          {props.children}
        </div>
      </div>
    );
  }
);
