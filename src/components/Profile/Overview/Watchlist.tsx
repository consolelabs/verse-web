import { Sparklines, SparklinesCurve } from "react-sparklines";
import SimpleBar from "simplebar-react";
import useSWR from "swr";
import { LoadingText } from "ui/components/LoadingText";
import { useGameState } from "stores/game";
import { Transition } from "@headlessui/react";
import { API_MOCHI_URL } from "envs";
import clsx from "clsx";

function Watcher({
  image,
  symbol,
  current_price,
  price_change_percentage_7d_in_currency,
  data,
}: {
  image: string;
  symbol: string;
  current_price: number;
  price_change_percentage_7d_in_currency: number;
  data: number[];
}) {
  return (
    <div className="text-white bg-#0E0B1D rounded-md px-3 py-2 flex gap-x-5 overflow-hidden items-center">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-1">
          <img src={image} alt="" className="w-4 h-4" />
          <span className="text-sm font-bold uppercase">{symbol}</span>
        </div>
        <div className="text-xs flex flex-col gap-x-1">
          <span>${current_price.toFixed(2)}</span>
          <span
            className={clsx({
              "text-#56c9ac": price_change_percentage_7d_in_currency >= 0,
              "text-#ed5565": price_change_percentage_7d_in_currency < 0,
            })}
          >
            {price_change_percentage_7d_in_currency.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="flex-1">
        <Sparklines data={data}>
          <SparklinesCurve
            color={
              price_change_percentage_7d_in_currency >= 0
                ? "#56c9ac"
                : "#ed5565"
            }
            style={{ fill: "none", strokeWidth: 2 }}
          />
        </Sparklines>
      </div>
    </div>
  );
}

export const Watchlist = () => {
  const { userDiscordId } = useGameState();
  const { isLoading, data } = useSWR(
    ["watchlist", userDiscordId],
    async ([, userDiscordId]) => {
      const res = await fetch(
        `${API_MOCHI_URL}/defi/watchlist?user_id=${userDiscordId}`
      );
      return await res.json();
    }
  );

  const isFetching = isLoading && !data;

  return (
    <>
      <Transition
        as="div"
        className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
        show={isFetching}
        appear
        enter="transition-opacity duration-100 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <LoadingText />
      </Transition>
      <SimpleBar className="max-h-400px">
        <Transition
          as="div"
          show={!isFetching}
          appear
          enter="transition-opacity duration-100 ease-in-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100 ease-in-out"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          className="flex flex-col gap-y-1"
        >
          {data?.data.data.map((d: any, i: number) => {
            return (
              <Watcher
                key={`watcher-${i}`}
                {...d}
                data={d.sparkline_in_7d.price}
              />
            );
          })}
        </Transition>
      </SimpleBar>
    </>
  );
};
