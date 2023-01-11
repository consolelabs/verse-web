import { SceneKey } from "constants/scenes";
import { useGameContext } from "contexts/game";
import { useMemo, useState } from "react";
import clsx from "clsx";

const mockData = [
  {
    id: 1,
    src: "/assets/images/char-select/mock/neko/1.png",
    type: "neko",
  },
  {
    id: 2,
    src: "/assets/images/char-select/mock/neko/2.png",
    type: "neko",
  },
  {
    id: 3,
    src: "/assets/images/char-select/mock/neko/3.png",
    type: "neko",
  },
  {
    id: 1,
    src: "/assets/images/char-select/mock/rabby/1.png",
    type: "rabby",
  },
  {
    id: 2,
    src: "/assets/images/char-select/mock/rabby/2.png",
    type: "rabby",
  },
  {
    id: 1,
    src: "/assets/images/char-select/mock/fukuro/1.png",
    type: "fukuro",
  },
  {
    id: 1,
    src: "/assets/images/char-select/mock/other/1.png",
    type: "other",
  },
];

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
        <div className="flex flex-col space-y-2">
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
      </div>
    </div>
  );
};

export const CharSelect = () => {
  const { getActiveScene, dispatch } = useGameContext();
  const [selectedChars, setSelectedChars] = useState([mockData[0]]);
  const [previewChar, setPreviewChar] = useState(mockData[0]);

  const { neko, rabby, fukuro, other } = useMemo(() => {
    return mockData.reduce(
      (result, current) => {
        const next: any = { ...result };
        // @ts-ignore
        next[current.type].push(current);

        return next;
      },
      {
        neko: [] as any[],
        rabby: [] as any[],
        fukuro: [] as any[],
        other: [] as any[],
      }
    );
  }, []);

  const isPreviewingATeamMember = Boolean(
    selectedChars.find(
      (c) => c.type === previewChar.type && c.id === previewChar.id
    )
  );

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-background-primary">
      <img
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/assets/images/char-select/bg.png"
      />
      <div className="absolute top-0 left-0 w-full h-full px-36 text-white flex flex-col">
        <div className="text-3xl font-bold py-12">Select Characters</div>
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full overflow-hidden">
            <div className="w-20vw overflow-auto">
              {[
                {
                  title: "Cyber Neko",
                  icon: "/assets/images/char-select/icon-neko.png",
                  items: neko,
                },
                {
                  title: "Cyber Rabby",
                  icon: "/assets/images/char-select/icon-rabby.png",
                  items: rabby,
                },
                {
                  title: "Fukuro",
                  icon: "/assets/images/char-select/icon-fukuro.png",
                  items: fukuro,
                },
                {
                  title: "Other",
                  icon: "/assets/images/char-select/icon-other.png",
                  items: other,
                },
              ].map((section, index) => {
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
                          previewChar.id === item.id &&
                          previewChar.type === item.type;
                        const isSelectedForTheTeam = selectedChars.find(
                          (c) => c.type === item.type && c.id === item.id
                        );

                        return (
                          <div
                            key={item.id}
                            className={clsx(
                              "aspect-square rounded-md overflow-hidden border-solid border-2 border-transparent relative",
                              {
                                "border-white brightness-100":
                                  isSelectedForPreviewing,
                                "brightness-50": !isSelectedForPreviewing,
                              }
                            )}
                            onClick={() => setPreviewChar(item)}
                          >
                            {isSelectedForTheTeam && (
                              <div className="absolute bottom-0 right-0 mr-1.5 mb-1.5 w-3 h-3 rounded-full bg-green" />
                            )}
                            <img src={item.src} className="w-full h-full" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex-1 flex flex-col relative">
              <img
                src="/assets/images/char-select/grid.png"
                className="w-4/5 absolute top-1/3 left-1/2 -translate-1/2"
              />
              <img
                src="/assets/images/char-select/light.png"
                className="w-4/5 absolute top-3/5 left-1/2 -translate-1/2"
              />
              <img
                src={previewChar.src}
                className="w-256px absolute top-1/3 left-1/2 -translate-1/2 aspect-square"
              />
              <div className="absolute bottom-0 w-full flex flex-col items-center justify-center mb-12">
                <button
                  type="button"
                  className="bg-white uppercase font-semibold rounded px-4 py-2 border-none mb-6"
                  onClick={() => {
                    if (isPreviewingATeamMember) {
                      setSelectedChars((o) =>
                        o.filter(
                          (o) =>
                            o.type !== previewChar.type ||
                            o.id !== previewChar.id
                        )
                      );
                    } else {
                      setSelectedChars((o) => [...o, previewChar]);
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
                            src={selectedChars[index].src}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="bg-#19A8F5 uppercase text-2xl font-semibold rounded px-8 py-2 text-white border-none mt-6"
                  onClick={() => {
                    const activeScene = getActiveScene();
                    // Mock: Only send the char type for now
                    activeScene?.scene.start(SceneKey.CONFIG_LOADER, {
                      chars: selectedChars.map((c) => c.type),
                    });
                    dispatch({
                      type: "setActiveSceneKey",
                      payload: SceneKey.GAME,
                    });
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
