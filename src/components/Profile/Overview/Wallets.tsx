import { Transition } from "@headlessui/react";
import { LoadingText } from "ui/components/LoadingText";
import { API_MOCHI_URL } from "envs";
import { useGameState } from "stores/game";
import useSWR from "swr";

function Wallet({ chain, address }: { chain: string; address: string }) {
  return (
    <div className="text-white flex items-center">
      <div className="flex gap-x-1 items-center">
        <div
          className={`h-4 w-4 i-cryptocurrency-color-${chain} rounded-full`}
        />
        <span className="uppercase text-xs font-bold">{chain}</span>
      </div>
      <span className="ml-auto text-sm font-medium">
        {address.slice(0, 5)}...{address.slice(-5)}
      </span>
    </div>
  );
}

export const Wallets = () => {
  const { userDiscordId } = useGameState();
  const { isLoading, data } = useSWR(
    ["wallets", userDiscordId],
    async ([, userDiscordId]) => {
      const res = await fetch(
        `${API_MOCHI_URL}/users/${userDiscordId}/wallets?guild_id=882287783169896468`
      );
      return await res.json();
    }
  );

  const isFetching = isLoading && !data;

  return (
    <>
      <Transition
        as="div"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center"
        show={isFetching}
        appear
        enter="transition-opacity duration-100 ease-in-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-100 ease-in-out"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <LoadingText size="sm" />
      </Transition>

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
        className="flex flex-col flex-1 justify-start"
      >
        {data?.data.map((d: any, i: number) => {
          return (
            <Wallet key={`wallet-${i}`} chain={d.type} address={d.address} />
          );
        })}
      </Transition>
    </>
  );
};
