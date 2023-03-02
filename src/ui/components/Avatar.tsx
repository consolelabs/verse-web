import { renderToStaticMarkup } from "react-dom/server";
import { Types } from "connectkit";
import BoringAvatar from "boring-avatars";

const colors = ["#5E9FA3", "#DCD1B4", "#FAB87F", "#F87E7B", "#B05574"];

const Avatar = ({
  address,
  ensImage,
  ensName,
  size,
  radius,
}: Types.CustomAvatarProps) => {
  return (
    <div
      className="overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
      }}
    >
      {ensImage ? (
        <img
          src={ensImage}
          alt={ensName ?? address}
          width="100%"
          height="100%"
        />
      ) : (
        <BoringAvatar
          size={size}
          name={ensName ?? address}
          variant="beam"
          colors={colors}
        />
      )}
    </div>
  );
};

export function getAvatarString(id: string) {
  const svgString = renderToStaticMarkup(
    <BoringAvatar size={60} name={id} variant="beam" colors={colors} square />
  );
  if (window.btoa) return `data:image/svg+xml;base64,${window.btoa(svgString)}`;
  return undefined;
}

export default Avatar;
