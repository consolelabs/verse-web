import React from "react";
import Marquee from "react-fast-marquee";
import { useGameState } from "stores/game";

export const PublicServerAnnouncement = () => {
  const { psaQueue } = useGameState();

  return (
    <div className="top-0 w-screen fixed z-10 bg-black/80 py-1 text-white text-lg">
      <Marquee
        speed={50}
        gradientColor={[0, 0, 0]}
        gradientWidth={100}
        delay={0.5}
      >
        <span>&#8203;</span>
        {psaQueue.map((e) => (
          <React.Fragment key={`marquee_${e.id}`}>{e.element}</React.Fragment>
        ))}
      </Marquee>
    </div>
  );
};
