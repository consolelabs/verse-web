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
        <div className="text-typo-tertiary">{props.description}</div>
      </div>
    </div>
  );
};
