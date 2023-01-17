import { NFT } from "types/nfts";

export const CharStats = (props: NFT) => {
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-semibold mb-4">{props.name}</div>
      <div>
        <div className="hidden text-typo-secondary">Level</div>
        <div className="hidden items-center space-x-2 mb-6">
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
        <div className="hidden flex-col space-y-2 mb-12">
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
        <div className="text-typo-tertiary">{props.description}</div>
      </div>
    </div>
  );
};
