export const CharSelectGridSkeleton = () => {
  return (
    <div className="flex flex-col items-start">
      <div className="h-8 bg-white/50 mb-4 animate-pulse rounded w-2/3" />
      <div className="flex flex-wrap gap-1">
        {new Array(10).fill(0).map((_, index) => {
          return (
            <div
              className="w-14 h-14 rounded bg-white/50 animate-pulse"
              key={index}
            />
          );
        })}
      </div>
    </div>
  );
};
