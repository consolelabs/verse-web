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
    <div className="text-xs flex items-start gap-x-2">
      <div className="flex gap-x-2">
        <span className="text-white whitespace-pre">
          [{timestamp.toString().slice(0, 4)}][{platform}]
        </span>
        <span className="text-blue">
          {mode === "raw"
            ? sender
            : sender.includes(".")
            ? sender
            : `${sender.slice(0, 5)}...${sender.slice(-5)}`}
          :
        </span>
        <p className="text-white flex flex-wrap">{children}</p>
      </div>
    </div>
  );
};
