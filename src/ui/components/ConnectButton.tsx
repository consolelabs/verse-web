import { ConnectKitButton } from "connectkit";

export const ConnectButton = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, truncatedAddress, show, ensName }) => {
        return (
          <button
            onClick={show}
            type="button"
            className="flex-1 justify-center btn btn-primary-pink btn-md"
          >
            {isConnected ? ensName ?? truncatedAddress : "connect wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
