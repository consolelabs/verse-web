import { useEffect, useRef } from "react";
import QRCode from "qr-code-styling";
import { useEnsAvatar } from "wagmi";
import { useGameState } from "stores/game";
import { Watchlist } from "./Watchlist";
import { Wallets } from "./Wallets";
import { NFTs } from "./NFTs";
import clsx from "clsx";

const qrCode = new QRCode({
  dotsOptions: {
    type: "rounded",
    gradient: {
      type: "linear",
      rotation: 45,
      colorStops: [
        {
          color: "#EF3EFF",
          offset: 0,
        },
        {
          color: "#2FD4D6",
          offset: 1,
        },
      ],
    },
  },
  cornersSquareOptions: {
    type: "extra-rounded",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 5,
    imageSize: 0.6,
  },
  backgroundOptions: {
    color: "transparent",
  },
});

function NoDiscordIdFound({ showText = false }: { showText?: boolean }) {
  return (
    <div className="h-full flex flex-col justify-center items-center">
      <img className="scale-80" src="/assets/images/empty.png" alt="" />
      {showText ? (
        <span className="text-center px-5 text-sm">
          Join Pod Town discord server and connect wallet to update data
        </span>
      ) : null}
    </div>
  );
}

function Card({
  children,
  right,
  col = false,
}: {
  children: React.ReactNode;
  right: React.ReactNode;
  col?: boolean;
}) {
  return (
    <div
      className={clsx(
        "overflow-hidden relative p-2 flex bg-#251C4D rounded-lg",
        {
          "flex-col gap-y-2 w-300px": col,
          "gap-x-10": !col,
        }
      )}
    >
      <div
        className={clsx("flex flex-col p-2", {
          "w-1/3": !col,
        })}
      >
        {children}
      </div>
      <div
        className={clsx("relative rounded-lg bg-#33276B p-2", {
          "w-2/3": !col,
          "h-full": col,
        })}
      >
        {right}
      </div>
    </div>
  );
}

export default function Profile() {
  const { account, userDiscordId } = useGameState();
  const { data: ensAvatar } = useEnsAvatar({ address: account });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ensAvatar) {
      qrCode.update({
        image: ensAvatar,
        data: `https://wallet.pod.town/${account ?? ""}`,
      });
    }
    if (ref.current) {
      if (ref.current.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
      qrCode.update({
        width: ref.current.getBoundingClientRect().width,
        height: ref.current.getBoundingClientRect().height,
      });
      qrCode.append(ref.current ?? undefined);
    }
  }, []);

  return (
    <div className="mt-20 flex flex-col w-full">
      <div className="flex flex-col items-center">
        <div ref={ref} className="h-56 w-56" />
        <p className="flex-shrink-0 text-sm font-bold text-#E8E2FF">
          {account?.slice(0, 5)}...{account?.slice(-5)}
        </p>
      </div>
      {userDiscordId ? (
        <div className="flex gap-x-3 mt-10 justify-center">
          <div className="flex flex-col gap-y-3">
            <Card right={<Wallets />}>
              <img
                className="absolute h-32 opacity-20 -bottom-1/2 left-12"
                src="/assets/images/wallet.png"
                alt=""
              />
              <p className="relative text-white whitespace-nowrap font-semibold">
                Tracking Wallets
              </p>
              <p className="relative text-gray text-sm">
                See your favorite wallets here
              </p>
            </Card>
            <Card right={<NFTs />}>
              <img
                className="absolute h-32 opacity-20 -bottom-1/3 left-12 -scale-x-full"
                src="/assets/images/diamond.png"
                alt=""
              />
              <p className="relative text-white whitespace-nowrap font-semibold">
                NFTs
              </p>
              <p className="relative text-gray text-sm">Non-fungible Tokens</p>
            </Card>
          </div>
          <Card right={<Watchlist />} col>
            <img
              className="absolute h-32 opacity-20 top-0 right-0"
              src="/assets/images/chart-increase.png"
              alt=""
            />
            <p className="relative text-white whitespace-nowrap font-semibold">
              Watchlist
            </p>
            <p className="relative text-gray text-sm">
              Be updated on price changes
            </p>
          </Card>
        </div>
      ) : (
        <div className="text-white mt-32 w-300px mx-auto">
          <NoDiscordIdFound showText />
        </div>
      )}
    </div>
  );
}
