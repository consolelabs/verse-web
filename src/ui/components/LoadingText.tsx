import clsx from "clsx";

type Props = {
  size?: "sm" | "md";
};

export const LoadingText = ({ size = "md" }: Props) => {
  return (
    <div className="flex flex-col items-center flex-shrink-0">
      <img
        src="/assets/images/paw.png"
        className={clsx("animate-bounce", {
          "h-8 w-8": size === "sm",
          "h-12 w-12": size === "md",
        })}
      />
      <span
        className={clsx("text-white uppercase font-bold", {
          "text-base": size === "sm",
          "text-xl": size === "md",
        })}
      >
        loading
      </span>
    </div>
  );
};
