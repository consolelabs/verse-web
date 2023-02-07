import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { NFT } from "types/nfts";
import { CharacterSpine } from "types/character";
import CharSelectScene from "scenes/CharSelect";
import { API_POD_BASE_URL, NEKO_COL, RABBY_COL } from "envs";
import { CharStats } from "components/char-select/CharStats";
import { CharSelectGridSkeleton } from "components/skeletons/CharSelectGridSkeleton";

const COLLECTION_TO_SPINE: Record<string, CharacterSpine> = {
  [NEKO_COL]: "Neko",
  [RABBY_COL]: "Rabby",
};

const isTheSame = (a: NFT, b: NFT) => {
  return a.token_address === b.token_address && a.token_id === b.token_id;
};

const ghostNekoItem: NFT = {
  token_id: "0",
  name: "Nez",
  type: "GhostNeko",
  image: "",
  amount: "",
  rarity: "",
  description:
    "Nez (Neko Soul) is the default character in the PodTown metaverse.",
  token_address: "",
  collection_name: "",
};

export const CharSelect = () => {
  const [playGame, setPlayGame] = useState(false);
  const {
    nfts,
    getActiveScene,
    setActiveSceneKey,
    player,
    setPlayer,
    setShowLoader,
  } = useGameState();
  const [previewChar, setPreviewChar] = useState<NFT>(ghostNekoItem);

  const loadCharacter = (item: NFT, animSuffix: string) => {
    const id = Number(item.token_id);
    const spine = item.type;
    const collection = item.token_address;

    setPlayer({
      animSuffix,
      id,
      spine,
      collection,
    });
    setPreviewChar(item);
    (getActiveScene() as CharSelectScene).loadPlayer(
      spine,
      id,
      animSuffix,
      collection
    );
  };

  const selectCharToPreview = (item: NFT) => {
    if (item.type === "GhostNeko") {
      loadCharacter(item, "");
    } else if (item.type === "TV-head") {
      loadCharacter(
        {
          ...item,
          name: "TV-Head",
          description:
            "Another default character of the Verse, but this time players get some degree of personalization with the NFT being the TV screen.",
        },
        ""
      );
    } else {
      fetch(
        `${API_POD_BASE_URL}/verse/nfts/${item.token_address}/${item.token_id}`
      )
        .then((res) => (res.ok ? res.json() : new Error()))
        .then((nftDetail) => {
          const { anim_type } = nftDetail;
          const animSuffix = anim_type ? `_${anim_type}` : "";

          loadCharacter(item, animSuffix);
        })
        .catch(() => null);
    }
  };

  const chars: Record<CharacterSpine, NFT[]> = useMemo(() => {
    if (!nfts) {
      return {} as any;
    }

    return nfts.reduce(
      (result, current) => {
        const next = { ...result };
        const type = COLLECTION_TO_SPINE[current.token_address] || "TV-head";

        // @ts-ignore
        next[type].push({
          ...current,
          type,
        });

        return next;
      },
      {
        Neko: [],
        Rabby: [],
        "TV-head": [],
      }
    );
  }, [nfts]);

  useEffect(() => {
    if (playGame && player) {
      const activeScene = getActiveScene();
      activeScene?.sound
        .add("start-game-audio", { volume: 0.5 })
        .once(Phaser.Sound.Events.COMPLETE, () => {
          activeScene?.cameras.main
            .once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              activeScene.scene.start(SceneKey.CONFIG_LOADER);
              setActiveSceneKey(SceneKey.BLANK);
            })
            .fadeOut(200);
        })
        .play();
    }
  }, [playGame]);

  // const isPreviewingATeamMember = Boolean(
  //   selectedChars.find((c) => previewChar && isTheSame(c, previewChar))
  // );

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-screen md:max-w-700px lg:max-w-1000px text-white flex flex-col">
      <div className="text-3xl font-bold py-12">Select Characters</div>
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full overflow-hidden">
          <div className="max-w-1/5 overflow-auto">
            <div className="mb-12">
              <p className="mb-2 font-semibold text-xl text-typo-secondary">
                Default Character
              </p>
              <button
                className={clsx(
                  "outline-none w-14 h-14 p-0 bg-transparent aspect-square rounded-md overflow-hidden border-solid border-2 border-transparent relative",
                  {
                    "border-white brightness-100":
                      previewChar.type === "GhostNeko",
                    "brightness-50": previewChar.type !== "GhostNeko",
                  }
                )}
                onClick={() => selectCharToPreview(ghostNekoItem)}
              >
                <img
                  src="/assets/images/default-char.png"
                  className="w-full h-full"
                />
              </button>
            </div>
            {!nfts ? (
              <CharSelectGridSkeleton />
            ) : (
              [
                {
                  title: "Cyber Neko",
                  icon: "/assets/images/char-select/icon-neko.png",
                  items: chars["Neko"] || [],
                },
                {
                  title: "Cyber Rabby",
                  icon: "/assets/images/char-select/icon-rabby.png",
                  items: chars["Rabby"] || [],
                },
                // {
                //   title: "Fukuro",
                //   icon: "/assets/images/char-select/icon-fukuro.png",
                //   items: fukuro,
                // },
                {
                  title: "Other",
                  icon: "/assets/images/char-select/icon-other.png",
                  items: chars["TV-head"] || [],
                },
              ]
                .filter((section) => section.items.length > 0)
                .map((section, index) => {
                  return (
                    <div className="mb-12" key={index}>
                      <div className="flex items-center space-x-2 mb-2">
                        <img src={section.icon} className="w-6 h-6" />
                        <div className="font-semibold text-xl text-typo-secondary">
                          {section.title} ({section.items.length})
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {section.items.map((item) => {
                          const isSelectedForPreviewing =
                            previewChar && isTheSame(item, previewChar);
                          // const isSelectedForTheTeam = selectedChars.find((c) =>
                          //   isTheSame(c, item)
                          // );

                          return (
                            <button
                              key={`${item.token_address}-${item.token_id}`}
                              className={clsx(
                                "outline-none p-0 bg-transparent w-14 h-14 aspect-square rounded-md overflow-hidden border-solid border-2 border-transparent relative",
                                {
                                  "border-white brightness-100":
                                    isSelectedForPreviewing,
                                  "brightness-50": !isSelectedForPreviewing,
                                }
                              )}
                              onClick={() => selectCharToPreview(item)}
                            >
                              {/* {isSelectedForTheTeam && (
                                <div className="absolute bottom-0 right-0 mr-1.5 mb-1.5 w-3 h-3 rounded-full bg-green" />
                              )} */}
                              <img src={item.image} className="w-full h-full" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
          <div className="w-3/5 flex-1 flex flex-col relative">
            <div className="absolute bottom-0 w-full flex flex-col items-center justify-center mb-12">
              {/* <button
                  type="button"
                  className="bg-white uppercase font-semibold rounded px-4 py-2 border-none mb-6"
                  onClick={() => {
                    if (isPreviewingATeamMember) {
                      setSelectedChars((o) =>
                        o.filter(
                          (o) => !previewChar || !isTheSame(o, previewChar)
                        )
                      );
                    } else {
                      if (previewChar) {
                        setSelectedChars((o) => [...o, previewChar]);
                      }
                    }
                  }}
                  // Max 5 members
                  disabled={
                    !isPreviewingATeamMember && selectedChars.length === 5
                  }
                >
                  {isPreviewingATeamMember ? "Remove From Team" : "Add To Team"}
                </button>
                <div className="text-typo-secondary mb-2">Team</div>
                <div className="grid grid-cols-5 gap-2 w-320px">
                  {new Array(5).fill(0).map((_, index) => {
                    return (
                      <div
                        className="border border-solid border-background-secondary aspect-square overflow-hidden"
                        key={index}
                      >
                        {selectedChars[index] && (
                          <img
                            src={selectedChars[index].image}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div> */}
              <div className="text-xl font-medium inline items-center text-teal-100 text-center">
                <span>TIP: try moving around with</span>
                <kbd className="kbc-button kbc-button-xxs ml-3">W</kbd>
                <kbd className="kbc-button kbc-button-xxs">A</kbd>
                <kbd className="kbc-button kbc-button-xxs">S</kbd>
                <kbd className="kbc-button kbc-button-xxs mr-3">D</kbd>
                <span>and hold</span>
                <kbd className="kbc-button kbc-button-xxs mx-3">Shift</kbd>
                <span>to run!</span>
              </div>
              <button
                type="button"
                className="btn btn-primary-blue btn-lg mt-6"
                onClick={() => {
                  setPlayGame(true);
                  setShowLoader(true);
                }}
              >
                Play Game
              </button>
            </div>
          </div>
          <div className="w-1/5">
            <CharStats {...previewChar} />
          </div>
        </div>
      </div>
    </div>
  );
};
