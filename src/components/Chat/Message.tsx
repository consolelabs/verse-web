import clsx from "clsx";
import { utils } from "ethers";
import React, { useMemo } from "react";

const DISCORD_CDN = "https://cdn.discordapp.com";

type Props = {
  sender: string;
  content: string;
};

export const Message = ({ sender, content }: Props) => {
  const contentRender = useMemo(() => {
    let tempContent = content;
    const fragments: any[] = [];

    // Match all emoji groups
    content.match(/<([^@].*?)>/gi)?.forEach((emoji) => {
      const index = tempContent.indexOf(emoji);
      const textFrag = tempContent.slice(0, index);

      tempContent = tempContent.replace(textFrag, "");
      tempContent = tempContent.replace(emoji, "");

      fragments.push(textFrag);

      const emojiId = emoji.match(/[^:](\d*?)(?=>)/gi)?.[0];
      if (emojiId) {
        let animated = false;

        // If animated
        if (emoji.startsWith("<a")) {
          animated = true;
        }

        fragments.push({
          type: "emoji",
          id: emojiId,
          animated,
        });
      }
    });

    // Fallback when content has no emoji/tag
    if (fragments.length === 0) {
      fragments.push(content);
    }

    let emojiSize = "small";
    if (
      fragments.every(
        (f) => f.type === "emoji" || (typeof f === "string" && f.trim() === "")
      )
    ) {
      emojiSize = "large";
    }

    return fragments.map((f) => {
      if (f.type === "emoji") {
        return (
          <img
            src={`${DISCORD_CDN}/emojis/${f.id}.${
              f.animated ? "gif" : "webp"
            }?size=96&quality=lossless`}
            className={clsx("inline-block", {
              "w-6 h-6": emojiSize === "small",
              "w-12 h-12": emojiSize === "large",
            })}
          />
        );
      }

      return f;
    });
  }, [content]);

  return (
    <div className="flex items-start gap-x-1">
      <div className="flex flex-col max-w-full leading-normal">
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
              {contentRender.map((f, index) => (
                <React.Fragment key={index}>{f}</React.Fragment>
              ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
