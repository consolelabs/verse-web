import React from "react";

export const MessageSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-1">
      {/* medium length */}
      <div className="text-xs flex items-start gap-x-1 leading-tight">
        <div className="flex gap-x-1 flex-1">
          <div className="flex flex-col w-20%">
            <span className="bg-gray-400/50 w-30% whitespace-pre">&#8203;</span>
            <span className="bg-gray-400/80 w-100% text-blue font-semibold rounded-sm">
              &#8203;
            </span>
          </div>
          <div className="flex flex-col w-80%">
            <span>&#8203;</span>
            <div className="bg-gray-500 rounded-sm">
              <span>&#8203;</span>
            </div>
          </div>
        </div>
      </div>

      {/* long length */}
      <div className="text-xs flex items-start gap-x-1 leading-tight">
        <div className="flex gap-x-1 flex-1">
          <div className="flex flex-col w-20%">
            <span className="bg-gray-400/50 w-30% whitespace-pre">&#8203;</span>
            <span className="bg-gray-400/80 w-70% text-blue font-semibold rounded-sm">
              &#8203;
            </span>
          </div>
          <div className="flex flex-col w-80%">
            <span>&#8203;</span>
            <div className="bg-gray-500 rounded">
              {Array(10)
                .fill(0)
                .map((_, i) => (
                  <React.Fragment key={`long-message-skeleton-${i}`}>
                    <span>&#8203;</span>
                    <br />
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* short length */}
      <div className="text-xs flex items-start gap-x-1 leading-tight">
        <div className="flex gap-x-1 flex-1">
          <div className="flex flex-col w-20%">
            <span className="bg-gray-400/50 w-30% whitespace-pre">&#8203;</span>
            <span className="bg-gray-400/80 w-85% text-blue font-semibold rounded-sm">
              &#8203;
            </span>
          </div>
          <div className="flex flex-col w-80%">
            <span>&#8203;</span>
            <div className="bg-gray-500 rounded">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <React.Fragment key={`short-message-skeleton-${i}`}>
                    <span>&#8203;</span>
                    <br />
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
