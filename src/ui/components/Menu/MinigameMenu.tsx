import { useGameState } from "stores/game";
import { GradientContainer } from "../GradientContainer";
import { Minigame } from "types/games";
import { Fragment, useMemo, useState } from "react";
import useSWR from "swr";
import Tippy from "@tippyjs/react";
import { Pagination } from "../Pagination";
import { MinigameGridSkeleton } from "../skeletons/MinigameGridSkeleton";
import "tippy.js/dist/tippy.css";

const CACHE_KEY = "pod-minigame-cache";
const PAGE_SIZE = 12;

export const MinigameMenu = () => {
  const { closeMenu, startMinigame, getActiveScene, getMinigames } =
    useGameState();
  const [filter, setFilter] = useState({
    page: 1,
    size: PAGE_SIZE,
    query: "",
  });

  const { data, isLoading } = useSWR(["minigames", filter], () =>
    getMinigames(filter)
  );
  const minigames = data?.data ?? [];
  const isLastPage = minigames.length < PAGE_SIZE;

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

  const renderTags = (tags: string[]) => {
    return tags.map((tag) => {
      return (
        <span
          key={tag}
          className="text-[10px] px-1.5 py-0.5 rounded text-black bg-white uppercase font-bold flex-shrink-0"
        >
          {tag}
        </span>
      );
    });
  };

  const renderGameCard = (game: Minigame) => {
    return (
      <div className="grid-cols-1 transition-all rounded border border-#1f1f42 hover:(shadow-md shadow-#2FD4D6/30 border-#2FD4D6/30) overflow-hidden">
        <img src={game.thumbnail} className="aspect-16/9 bg-white/30 w-full" />
        <div className="p-2 2xl:p-4 flex flex-col space-y-2">
          <div className="flex gap-2 items-center">
            <img src={game.icon} className="w-8 h-8" />
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
            <Tippy
              placement="bottom"
              content={
                <div className="flex flex-wrap items-center gap-1 flex-1 max-w-96 py-1">
                  {renderTags(game.tags)}
                </div>
              }
            >
              <div className="flex items-center gap-1 flex-1 overflow-hidden relative after:block after:content-none after:absolute after:(w-16 h-full right-0 top-0 bg-gradient-linear bg-gradient-from-transparent bg-gradient-to-#140F29 bg-gradient-to-r)">
                {renderTags(game.tags)}
              </div>
            </Tippy>
            <button
              type="button"
              className="btn btn-primary-blue btn-sm text-xs 2xl:text-sm flex-shrink-0"
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
    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}");
    const recentlyPlayedGames = minigames.filter(
      (game) =>
        Array.isArray(cache.recentlyPlayedGames) &&
        cache.recentlyPlayedGames.includes(game.id)
    );

    return {
      allGames: minigames,
      recentlyPlayedGames,
    };
  }, [minigames]);

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
            onChange={(e) =>
              setFilter((o) => ({ ...o, query: e.target.value, page: 1 }))
            }
            placeholder="Search..."
            className="bg-black/30 px-4 py-2 !border-none !outline-none"
          />
        </GradientContainer>
      </div>
      <div className="flex-1 overflow-auto flex flex-col">
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
          {isLoading ? (
            <MinigameGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6">
              {allGames.map((game) => {
                return (
                  <Fragment key={game.id}>{renderGameCard(game)}</Fragment>
                );
              })}
            </div>
          )}
        </div>
        <Pagination
          className="mt-auto"
          page={filter.page}
          onChange={(v) => setFilter((o) => ({ ...o, page: v }))}
          hideOnSinglePage
          isLastPage={isLastPage}
        />
      </div>
    </div>
  );
};
