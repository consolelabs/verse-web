import clsx from "clsx";
import { useState } from "react";
import { useGameState } from "stores/game";

type MailProps = {
  type: "announcement" | "reward" | "mail";
  title: string;
  description: string;
  selected?: boolean;
  onClick: () => void;
  read?: boolean;
};

function Mail({
  onClick,
  description,
  type,
  title,
  selected = false,
  read = false,
}: MailProps) {
  let icon;
  switch (type) {
    case "reward":
      icon = <div className="i-heroicons-gift-20-solid" />;
      break;
    case "mail":
      icon = <div className="i-heroicons-exclamation-circle-20-solid" />;
      break;
    case "announcement":
      icon = <div className="i-heroicons-megaphone-20-solid w-full h-full" />;
      break;
    default:
      break;
  }

  return (
    <li
      className={clsx(
        "items-top p-1.5 flex flex-col border border-black rounded-md bg-#3B3652 relative overflow-hidden",
        {
          "text-white": selected,
          "text-gray-400 hover:text-gray-300": !selected,
        }
      )}
      onClick={() => onClick()}
    >
      {read ? (
        <img
          className="absolute opacity-20 scale-200"
          src="/assets/images/approve.png"
        />
      ) : null}
      <div className="flex gap-x-1 max-w-full relative z-10">
        <div className="w-4 h-4 flex-shrink-0">{icon}</div>
        <p className="truncate text-sm max-w-full font-semibold">{title}</p>
      </div>
      <p className="truncate text-xs relative z-10">{description}</p>
    </li>
  );
}

export const Mails = () => {
  const { closeMenu } = useGameState();
  const [index, setIndex] = useState(0);

  return (
    <div
      style={{
        filter: "drop-shadow(0px -10px 10px rgba(73, 185, 249, 0.25))",
      }}
    >
      <img
        src="/assets/images/mail.png"
        className="mx-auto h-40 relative -mb-16"
      />
      <div
        className="relative border-2 border-black bg-#19162B rounded-2xl pb-1 overflow-hidden"
        style={{
          boxShadow: "0px 20px 20px rgba(73, 185, 249, 0.25)",
        }}
      >
        <div className="relative bg-#2D2D45 border-b-2 border-black rounded-b-2xl">
          <div className="p-3 flex flex-col gap-y-1">
            <div className="flex self-center gap-x-2 items-center">
              <img src="/assets/images/mails-text.png" className="h-7" />
            </div>
            <button className="absolute right-2 top-2" onClick={closeMenu}>
              <img src="/assets/images/cancel.png" className="w-6 h-6" />
            </button>
            <div className="mt-1 flex gap-x-1 h-400px w-600px">
              <div className="flex flex-col w-2/7 gap-y-1">
                <button className="text-gray-400 text-sm font-bold uppercase rounded px-2 border-1 border-#7183A1 bg-#1F1F42">
                  mark all as read
                </button>
                <ul className="flex-1 flex flex-col gap-y-1 overflow-auto p-1 bg-#1D1931 rounded-md border border-black shadow-xl shadow-inset">
                  <Mail
                    type="announcement"
                    title="Attention all citizen of Pod Town"
                    description="Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat."
                    selected={index === 0}
                    onClick={() => setIndex(0)}
                    read
                  />
                  <Mail
                    type="reward"
                    title="Compensation for all players"
                    description="Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur cupidatat."
                    selected={index === 1}
                    onClick={() => setIndex(1)}
                  />
                </ul>
              </div>
              <div className="flex flex-col text-gray-400 p-3 bg-#1D1931 rounded-md w-5/7 border border-black overflow-auto">
                <p>
                  Lorem ipsum dolor sit amet, officia excepteur ex fugiat
                  reprehenderit enim labore culpa sint ad nisi Lorem pariatur
                  mollit ex esse exercitation amet. Nisi anim cupidatat
                  excepteur officia. Reprehenderit nostrud nostrud ipsum Lorem
                  est aliquip amet voluptate voluptate dolor minim nulla est
                  proident. Nostrud officia pariatur ut officia. Sit irure elit
                  esse ea nulla sunt ex occaecat reprehenderit commodo officia
                  dolor Lorem duis laboris cupidatat officia voluptate. Culpa
                  proident adipisicing id nulla nisi laboris ex in Lorem sunt
                  duis officia eiusmod. Aliqua reprehenderit commodo ex non
                  excepteur duis sunt velit enim. Voluptate laboris sint
                  cupidatat ullamco ut ea consectetur et est culpa et culpa
                  duis.
                </p>
                <div className="flex-shrink-0 h-px bg-gray-600 w-full my-2" />
                <ul className="flex flex-wrap mx-auto w-4/5 gap-y-2 gap-x-5 justify-center">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => {
                      return (
                        <li
                          key={`reward-${i}`}
                          className="aspect-square flex flex-col items-center"
                        >
                          <div className="bg-black rounded-md flex justify-center items-center w-10 h-10">
                            <img
                              src="/assets/images/approve.png"
                              className="opacity-50 w-2/3 h-2/3"
                            />
                          </div>
                          <span className="mt-1 text-xs">Reward x1</span>
                        </li>
                      );
                    })}
                </ul>
                <button className="mx-auto mt-4 text-sm font-bold uppercase rounded px-2 border-1 border-#7183A1 bg-#1F1F42">
                  claim
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
