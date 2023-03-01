export const LoadingText = () => {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <img src="/assets/images/paw.png" className="h-12 w-12 animate-bounce" />
      <span className="text-white uppercase font-bold text-xl">loading</span>
    </div>
  );
};
