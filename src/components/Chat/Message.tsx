type Props = {
  timestamp: number;
  platform: string;
  sender: string;
  children: React.ReactNode;
  // address mode will auto truncate the sender if not already
  mode?: "raw" | "address";
};

export const Message = ({
  timestamp,
  platform,
  mode = "raw",
  sender,
  children,
}: Props) => {
  return (
    <div className="text-xs flex items-start gap-x-1">
      <div className="flex gap-x-1">
        <div className="flex flex-col">
          <span className="text-white whitespace-pre text-11px">
            [{timestamp.toString().slice(0, 4)}][{platform}]
          </span>
          <span className="text-blue font-semibold">
            {mode === "raw"
              ? sender
              : sender.includes(".")
              ? sender
              : `${sender.slice(0, 5)}...${sender.slice(-5)}`}
            :
          </span>
        </div>
        <div className="flex flex-col">
          <span>&#8203;</span>
          <p className="text-white flex flex-wrap">{children}</p>
        </div>
      </div>
    </div>
  );
};
