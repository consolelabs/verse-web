import useSWR from "swr";
import { API_BASE_URL } from "envs";
import { useMemo } from "react";

const VISIBLE_ITEM_COUNT = 5;

export const Leaderboard = () => {
  const { data: leaderboard = [], isLoading } = useSWR<
    Array<{ point: number; address: string; game: string }>
  >(`${API_BASE_URL}/leaderboard`, (url) =>
    fetch(url).then((res) => {
      if (res.ok) return res.json();
      throw new Error();
    })
  );

  const data = useMemo(() => {
    if (leaderboard.length < VISIBLE_ITEM_COUNT) {
      return [
        ...leaderboard,
        ...new Array(VISIBLE_ITEM_COUNT - leaderboard.length)
          .fill(0)
          .map(() => {
            return {
              point: 0,
              address: "",
              game: "",
            };
          }),
      ];
    }

    return leaderboard;
  }, [leaderboard]);

  return (
    <div className="-m-8 -mt-5">
      <div className="mx-10 relative -top-12 flex items-center justify-center">
        <img
          className="absolute bottom-0 h-72 -translate-y-0"
          src="/assets/images/glow-effect.png"
        />
        <img
          className="absolute bottom-0 h-48 -translate-y-10"
          src="/assets/images/stand.png"
        />
        <img
          className="absolute bottom-0 h-28 -translate-y-24"
          src="/assets/images/crown.png"
        />
        <img
          className="absolute bottom-0 h-28 -translate-x-20 -translate-y-10 rotate-[-20deg]"
          src="/assets/images/badge-1.png"
        />
        <img
          className="absolute bottom-0 h-28 translate-x-20 -translate-y-10 rotate-[20deg]"
          src="/assets/images/badge-1.png"
        />
        <img
          src="/assets/images/leaderboard-ribbon.png"
          className="w-[500px] relative"
        />
      </div>
      <div className="overflow-auto rounded-md border border-purple-300 h-[284px]">
        {data.map((d, i) => {
          return (
            <div
              key={`leaderboard-${i}`}
              className="text-white flex items-center p-2 odd:bg-[#373756] even:bg-[#2D2D45]"
            >
              {i === 0 ? (
                <img src="/assets/images/crown.png" className="h-10 w-10" />
              ) : (
                <div className="relative flex justify-center items-center">
                  <img
                    className="h-10 w-10 p-1"
                    src="/assets/images/leaderboard-rank-background.png"
                  />
                  <p className="absolute font-bold text-sm">{i + 1}</p>
                </div>
              )}
              {isLoading ? (
                <>
                  <div className="ml-2 h-8 w-32 bg-white/50 animate-pulse rounded" />
                  <div className="ml-auto h-8 w-16 bg-white/50 animate-pulse rounded" />
                </>
              ) : (
                <>
                  <div className="ml-2">
                    <p>{`${d.address.slice(0, 5)}...${d.address.slice(-5)}`}</p>
                  </div>
                  {d.address && (
                    <div className="ml-auto flex items-center">
                      <div className="relative z-10 bg-black p-1.5 rounded-[10px]">
                        <img
                          className="w-6 h-6"
                          src="/assets/images/tripod.png"
                        />
                      </div>
                      <span className="-ml-1.5 px-2 py-0.5 rounded-r-md bg-black text-white font-medium">
                        {d.point}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
