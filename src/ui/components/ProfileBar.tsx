import { useGameState } from "stores/game";
import { Avatar } from "connectkit";
import { Menu } from "constants/game";

export const ProfileBar = () => {
  const { account, openMenu } = useGameState();

  return (
    <>
      <div
        style={{
          background: "linear-gradient(to bottom, #100E20, transparent)",
        }}
        className="fixed h-110px w-screen top-0"
      />
      <div className="fixed top-12 left-5 flex items-center">
        <div className="relative flex items-center">
          <button
            onClick={() => openMenu(Menu.PROFILE)}
            type="button"
            className="relative z-10 outline-none"
            tabIndex={-1}
          >
            <img src="/assets/images/avatar-frame.png" alt="" />
            <div className="h-43px w-43px absolute top-1.8 left-1.8 w-full h-full">
              <Avatar address={account} size={43} />
            </div>
          </button>
          <div
            style={{
              background:
                "linear-gradient(to bottom, #B0B0B0, #858485, #717071, #494949)",
            }}
            className="flex items-center shadow-xl rounded-r-md relative border-1.5 border-#424343 w-100px h-20px -ml-1 pl-1"
          >
            <div
              style={{
                background:
                  "linear-gradient(to bottom, #D8C2FD, #9656FF, #8049D9, #563093)",
              }}
              className="absolute top-0 h-full left-0 w-2/3"
            />
            <img
              src="/assets/images/xp.png"
              className="z-10 absolute -left-3 h-8 top-1/3"
              alt=""
            />
          </div>
        </div>
        <div className="ml-10 flex">
          <img
            style={{
              filter: "drop-shadow(3px 0px 0px #000)",
            }}
            src="/assets/images/wallet.png"
            className="h-10"
          />
          <div className="text-sm border border-#C9650A/40 bg-#C9650A/60 rounded-r shadow-xl px-5 self-center pl-8 -ml-4 text-white">
            5
          </div>
        </div>
        <div className="ml-5 flex">
          <img
            style={{
              filter: "drop-shadow(3px 0px 0px #000)",
            }}
            src="/assets/images/coin.png"
            className="h-10"
          />
          <div className="text-sm border border-#BDBD00/40 bg-#BDBD00/60 rounded-r shadow-xl px-5 self-center pl-8 -ml-4 text-white">
            $159,278
          </div>
        </div>
        <div className="ml-5 flex">
          <img
            style={{
              filter: "drop-shadow(3px 0px 0px #000)",
            }}
            src="/assets/images/star.png"
            className="h-10"
          />
          <div className="text-sm border border-#D6379F/40 bg-#D6379F/60 rounded-r shadow-xl px-5 self-center pl-8 -ml-4 text-white">
            300
          </div>
        </div>
      </div>
    </>
  );
};
