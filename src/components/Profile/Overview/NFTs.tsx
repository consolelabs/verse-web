import { Transition } from "@headlessui/react";
import { LoadingText } from "ui/components/LoadingText";
import { API_INDEXER_URL } from "envs";
import { useGameState } from "stores/game";
import useSWR from "swr";
import groupBy from "lodash.groupby";
import SimpleBar from "simplebar-react";

function NFTCollection({ name, qty }: { name: string; qty: number }) {
  return (
    <div className="flex gap-x-1 items-center text-white">
      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-gray" />
      <span className="text-sm">{name}</span>
      <span className="ml-auto text-sm">{qty}</span>
    </div>
  );
}

export const NFTs = () => {
  const { account } = useGameState();
  const { isLoading, data } = useSWR(["nfts", account], async ([, account]) => {
    const res = await fetch(`${API_INDEXER_URL}/${account}/nft`);
    return await res.json();
  });

  const isFetching = isLoading || !data;

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
        <LoadingText size="sm" />
      </Transition>
      <SimpleBar className="h-full max-h-full">
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
          className="grid grid-gap-y-1 grid-gap-x-10 grid-cols-1 grid-row-auto"
        >
          {Object.entries(
            groupBy(data?.data ?? [], (nft) => nft.collection_address)
          ).map((e, i) => {
            return (
              <NFTCollection
                key={`nftcollection-${i}`}
                qty={e[1].length}
                name={`${e[0].slice(0, 5)}...${e[0].slice(-5)}`}
              />
            );
          })}
        </Transition>
      </SimpleBar>
    </>
  );
};
