import { useGameState } from "stores/game";
import { GradientContainer } from "../GradientContainer";
import { Minigame } from "types/games";
import { Fragment, useMemo, useState } from "react";

const CACHE_KEY = "pod-minigame-cache";

const mockData: Minigame[] = [
  {
    thumbnailSrc: "/assets/images/title-screen-bg.jpeg",
    logoSrc: "/minigames/tripod.png",
    name: "Tripod",
    description:
      "A match-3 game where players progress by combining 3 pieces of the same type to get the next piece, all the way to the top!",
    id: "tripod",
    src: "https://tripod-web.vercel.app/",
    type: "browser",
    tags: ["puzzle", "strategy"],
  },
  {
    thumbnailSrc: "/assets/images/title-screen-bg.jpeg",
    logoSrc: "/minigames/hunger-game.webp",
    name: "Hunger Game",
    description:
      "Collect points while racing to find the portal before your opponents. Just watch out for explosions!",
    id: "hunger-game",
    src: "https://the-hunger-game.vercel.app/",
    type: "browser",
    tags: ["puzzle", "team"],
  },
];

export const MinigameMenu = () => {
  const { closeMenu, startMinigame, getActiveScene } = useGameState();
  const [searchQuery, setSearchQuery] = useState("");

  const updateCache = (game: Minigame) => {
    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
    if (Array.isArray(cache.recentlyPlayedGames)) {
      cache.recentlyPlayedGames.push(game.id);
    } else {
      cache.recentlyPlayedGames = [game.id];
    }

    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  };

  const play = (game: Minigame) => {
    updateCache(game);
    startMinigame(game);
    closeMenu();
    getActiveScene()?.sound.play("success-audio", {
      volume: 0.05,
    });
  };

  const renderGameCard = (game: Minigame) => {
    return (
      <div className="grid-cols-1 transition-all rounded border border-#1f1f42 hover:(shadow-md shadow-#2FD4D6/30 border-#2FD4D6/30 -translate-y-[0.2rem]) overflow-hidden">
        <img src={game.thumbnailSrc} className="aspect-16/9" />
        <div className="p-2 2xl:p-4 flex flex-col space-y-2">
          <div className="flex gap-2 items-center">
            <img src={game.logoSrc} className="w-8 h-8" />
            <div className="text-base font-bold">{game.name}</div>
          </div>
          <div
            className="text-sm overflow-hidden h-16"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {game.description}
          </div>
          <div className="text-xs text-opacity-80 text-white">
            Play on browser
          </div>
          <div className="flex justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded text-black bg-white uppercase font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary-blue btn-sm text-xs 2xl:text-sm"
              onClick={() => {
                play(game);
              }}
            >
              Play Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  const { allGames, recentlyPlayedGames } = useMemo(() => {
    const filteredGames = mockData.filter((game) =>
      game.name.match(searchQuery)
    );

    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
    const recentlyPlayedGames = filteredGames.filter(
      (game) =>
        Array.isArray(cache.recentlyPlayedGames) &&
        cache.recentlyPlayedGames.includes(game.id)
    );

    return {
      allGames: filteredGames,
      recentlyPlayedGames,
    };
  }, [searchQuery]);

  return (
    <div className="lg:w-800px 2xl:w-1200px text-white flex flex-col h-80vh overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col">
          <div className="text-2xl font-bold">Game Store</div>
          <div>No Game No Life! Play together and have have fun!</div>
        </div>
        <GradientContainer className="overflow-hidden">
          <input
            id="search"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="bg-black/30 px-4 py-2 !border-none !outline-none"
          />
        </GradientContainer>
      </div>
      <div className="flex-1 overflow-auto">
        {recentlyPlayedGames.length > 0 && (
          <div className="mb-8">
            <div className="font-bold mb-4 uppercase text-white text-opacity-50">
              Recently Played Games
            </div>
            <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6">
              {recentlyPlayedGames.map((game) => {
                return (
                  <Fragment key={game.id}>{renderGameCard(game)}</Fragment>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <div className="font-bold mb-4 uppercase text-white text-opacity-50">
            All Games
          </div>
          <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6">
            {allGames.map((game) => {
              return <Fragment key={game.id}>{renderGameCard(game)}</Fragment>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
