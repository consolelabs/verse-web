export const MinigameGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 2xl:grid-cols-3 gap-6 animate-pulse">
      {new Array(2).fill(0).map((_, index) => {
        return (
          <div className="grid-cols-1 rounded bg-white/10" key={index}>
            <div className="w-full aspect-16/9 bg-white/10" />
            <div className="p-2 2xl:p-4 flex flex-col space-y-2">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-white/10" />
                <div className="w-24 h-8 bg-white/10" />
              </div>
              <div className="h-16 bg-white/10" />
              <div className="bg-white/10 h-6 w-24" />
              <div className="flex justify-between gap-4">
                <div className="flex items-center gap-1 flex-1 overflow-hidden relative after:block after:content-none after:absolute ">
                  {new Array(3).fill(0).map((_, index) => {
                    return (
                      <span className="w-16 h-6 bg-white/10" key={index} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
