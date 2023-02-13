import { useGameState } from "stores/game";
import { GridButtons } from "../GridButtons";
import { Minigame } from "constants/game";

export const MinigameMenu = () => {
  const { closeMenu, startMinigame, getActiveScene } = useGameState();

  return (
    <GridButtons cols={3} rows={1} gap="md">
      {[
        {
          img: "tripod.png",
          text: "Tripod",
          onClick: () => {
            startMinigame(Minigame.TRIPOD);
          },
        },
      ].map((b) => {
        return (
          <GridButtons.Button
            key={b.img}
            onClick={() => {
              closeMenu();
              b.onClick?.();
              getActiveScene()?.sound.play("success-audio", { volume: 0.05 });
            }}
          >
            <img src={`/assets/images/${b.img}`} className="h-80px w-80px" />
            <span className="">{b.text}</span>
          </GridButtons.Button>
        );
      })}
    </GridButtons>
  );
};
