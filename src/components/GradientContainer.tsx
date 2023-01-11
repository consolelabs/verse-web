import React from "react";

type Props = {
  children: React.ReactNode;
};

export const GradientContainer = (props: Props) => {
  return (
    <div
      className="relative p-1.5px rounded-lg overflow-hidden"
      style={{ background: "linear-gradient(45deg, #EF3EFF, #2FD4D6)" }}
    >
      <div className="bg-#140F29 rounded-lg">{props.children}</div>
    </div>
  );
};
