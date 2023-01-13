import { SceneKey } from "constants/scenes";
import { useGameState } from "stores/game";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { NFT } from "types/nfts";
import { CharacterSpine } from "types/character";
import CharSelectScene from "scenes/CharSelect";

const COLLECTION_TO_SPINE: Record<string, CharacterSpine> = {
  "0x7D1070fdbF0eF8752a9627a79b00221b53F231fA": "Neko",
  "": "TV-head",
};

const isTheSame = (a: NFT, b: NFT) => {
  return a.token_address === b.token_address && a.token_id === b.token_id;
};

export const CharStats = () => {
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-semibold mb-4">Cyber Neko 55</div>
      <div>
        <div className="text-typo-secondary">Level</div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-1 rounded-2px bg-background-tertiary flex-1 relative overflow-hidden">
            <div
              className=" absolute top-0 left-0 h-1 bg-#00FFEA"
              style={{ width: "75%" }}
            />
          </div>
          <div className="text-typo-tertiary text-xs">
            <span className="text-typo-secondary">1500</span>
            /2000
          </div>
        </div>
        <div className="flex flex-col space-y-2 mb-12">
          {[
            [
              "XP",
              <div className="flex items-center space-x-2">
                <span>1500</span>
                <img src="/assets/images/stats/star.png" className="w-5 h-5" />
              </div>,
            ],
            [
              "Cookie",
              <div className="flex items-center space-x-2">
                <span>123</span>
                <img
                  src="/assets/images/stats/cookie.png"
                  className="w-5 h-5"
                />
              </div>,
            ],
            [
              "Elemental",
              <div className="flex items-center space-x-2">
                <span>Water</span>
                <img
                  src="/assets/images/stats/element-water.png"
                  className="w-5 h-5"
                />
              </div>,
            ],
            [
              "Aspect",
              <div className="flex items-center space-x-2">
                <span>Yin</span>
                <img
                  src="/assets/images/stats/yin-yang.png"
                  className="w-5 h-5"
                />
              </div>,
            ],
            [
              "Blood Type",
              <div className="flex items-center space-x-2">
                <span>O</span>
                <img src="/assets/images/stats/blood.png" className="w-5 h-5" />
              </div>,
            ],
            [
              "Rarity",
              <div className="flex items-center justify-center px-2 py-1 bg-#00FFEA59 rounded-md text-sm">
                Uncommon
              </div>,
            ],
          ].map((item, index) => {
            return (
              <div className="flex justify-between space-x-2" key={index}>
                <div className="text-typo-secondary">{item[0]}</div>
                {item[1]}
              </div>
            );
          })}
        </div>
        <div className="text-typo-tertiary">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </div>
      </div>
    </div>
  );
};

export const CharSelect = () => {
  const { nfts, getActiveScene, setActiveSceneKey } = useGameState();
  // const [selectedChars, setSelectedChars] = useState<NFT[]>([]);
  const [previewChar, setPreviewChar] = useState<NFT>();

  const selectCharToPreview = (item: NFT) => {
    setPreviewChar(item);
    (getActiveScene() as CharSelectScene).loadPlayer(item.type, item.token_id);
  };

  const chars: Record<CharacterSpine, NFT[]> = useMemo(() => {
    if (!nfts) {
      return {} as any;
    }

    return nfts.reduce(
      (result, current) => {
        const next = { ...result };
        const type = COLLECTION_TO_SPINE[current.token_address];

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
    if (Array.isArray(nfts) && nfts.length > 1 && !previewChar) {
      setPreviewChar(nfts[0]);
    }
  }, [nfts]);

  // const isPreviewingATeamMember = Boolean(
  //   selectedChars.find((c) => previewChar && isTheSame(c, previewChar))
  // );

  return (
    <div className="fixed top-0 left-0 w-full h-full">
      <div className="absolute top-0 left-0 w-full h-full px-36 text-white flex flex-col">
        <div className="text-3xl font-bold py-12">Select Characters</div>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <div className="w-20vw overflow-auto">
              {[
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
                        <div className="font-semibold text-2xl text-typo-secondary">
                          {section.title} ({section.items.length})
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {section.items.map((item) => {
                          const isSelectedForPreviewing =
                            previewChar && isTheSame(item, previewChar);
                          // const isSelectedForTheTeam = selectedChars.find((c) =>
                          //   isTheSame(c, item)
                          // );

                          return (
                            <div
                              key={`${item.token_address}-${item.token_id}`}
                              className={clsx(
                                "aspect-square rounded-md overflow-hidden border-solid border-2 border-transparent relative",
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
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex-1 flex flex-col relative">
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
                  className="bg-#19A8F5 uppercase text-2xl font-semibold rounded px-8 py-2 text-white border-none mt-6"
                  onClick={() => {
                    const activeScene = getActiveScene();
                    // Mock: Only send the char type for now
                    activeScene?.scene.start(SceneKey.CONFIG_LOADER, {
                      chars: [previewChar],
                    });
                    setActiveSceneKey(SceneKey.GAME);
                  }}
                >
                  Play Game
                </button>
              </div>
            </div>
            <div className="w-20vw">
              <CharStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
