import { utils } from "ethers";

type Props = {
  sender: string;
  children: React.ReactNode;
};

export const Message = ({ sender, children }: Props) => {
  return (
    <div className="text-xs flex items-start gap-x-1">
      <div className="flex flex-col max-w-full leading-3.5">
        <div className="flex gap-x-1 items-start">
          <span className="text-blue font-semibold">
            {utils.isAddress(sender)
              ? `${sender.slice(0, 5)}...${sender.slice(-5)}`
              : sender}
            :
          </span>
          {/* <span className="text-gray whitespace-pre text-11px"> */}
          {/*   [{timestamp.toString().slice(0, 4)}] */}
          {/* </span> */}
          <div className="flex flex-col min-w-0">
            <p className="text-white whitespace-pre-wrap break-words">
              {children}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
