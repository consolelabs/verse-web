import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { GridButtons } from "../GridButtons";
import { Menu as MenuKey } from "constants/game";
import useSWR from "swr";

export const MainMenu = () => {
  const { closeMenu, transitionTo, openMenu, getActiveScene } = useGameState();

  const { data: mails } = useSWR(["/mails"], async () => {
    return [
      {
        title: "Something",
        description:
          "Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim nulla est proident. Nostrud officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex occaecat reprehenderit commodo officia dolor Lorem duis laboris cupidatat officia voluptate. Culpa proident adipisicing id nulla nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua reprehenderit commodo ex non excepteur duis sunt velit enim. Voluptate laboris sint cupidatat ullamco ut ea consectetur et est culpa et culpa duis.",
        rewards: [],
      },
    ];
  });

  const hasUnreadMail = Boolean(mails?.length);

  return (
    <GridButtons cols={3} rows={3} gap="md">
      {[
        {
          img: "character.png",
          text: "Character",
          onClick: () =>
            transitionTo(SceneKey.CHAR_SELECT, [
              SceneKey.GAME_INTERACTION,
              SceneKey.GAME,
              SceneKey.MINIMAP,
            ]),
        },
        {
          img: "pod.png",
          text: "Pod",
          // onClick: () => {
          // const activeScene = getActiveScene();
          //
          // if (activeScene) {
          //   // Fade out & prepare for scene transition
          //   activeScene.cameras.main.fadeOut(500, 0, 0, 0);
          //   activeScene.cameras.main.once(
          //     Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
          //     () => {
          //       activeScene.scene.stop(SceneKey.GAME_INTERACTION);
          //       activeScene.scene.stop(SceneKey.GAME_DIALOGUE);
          //       activeScene.scene.start(SceneKey.POD);
          //       setActiveSceneKey(SceneKey.POD);
          //     }
          //   );
          // }
          // },
        },
        {
          img: "mail.png",
          text: (
            <div className="flex items-top gap-x-1">
              <span>Mail</span>
              {hasUnreadMail ? (
                <div className="inline-block h-1.5 w-1.5 bg-red-500 rounded-full" />
              ) : null}
            </div>
          ),
          onClick: () => {
            openMenu(MenuKey.MAILS);
          },
        },
        {
          img: "leaderboard.png",
          text: "Leaderboard",
          onClick: () => {
            openMenu(MenuKey.LEADERBOARD);
          },
        },
        { img: "quest.png", text: "Quest" },
        { img: "achievement.png", text: "Achievement" },
        { img: "market.png", text: "Market" },
        { img: "airdrop.png", text: "Airdrop" },
        {
          img: "quit.png",
          text: "Quit",
          onClick: () =>
            transitionTo(SceneKey.BOOT, [
              SceneKey.GAME_INTERACTION,
              SceneKey.GAME,
              SceneKey.MINIMAP,
            ]),
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
            disabled={!b.onClick}
          >
            {typeof b.img === "string" ? (
              <img src={`/assets/images/${b.img}`} className="h-80px w-80px" />
            ) : (
              b.img
            )}

            <span>{b.text}</span>
          </GridButtons.Button>
        );
      })}
    </GridButtons>
  );
};
