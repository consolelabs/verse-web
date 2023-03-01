import clsx from "clsx";
import React, { useMemo } from "react";
import { MessageItem } from "types/chat";

const DISCORD_CDN = "https://cdn.discordapp.com";

function Divider({ text }: Extract<MessageItem, { isDivider: true }>) {
  return (
    <div className="flex items-center relative pt-5 pb-4">
      <div className="rounded h-1px w-full bg-gray-600" />
      <span className="px-1 bg-#140F29 text-11px absolute left-1/2 -translate-x-1/2 text-gray-400 font-semibold">
        {text}
      </span>
    </div>
  );
}

export const Message = (messageItem: MessageItem) => {
  if (messageItem.isDivider) return <Divider {...messageItem} />;
  const { author, content, timestamp } = messageItem;
  const localeTime = new Date(timestamp);

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
              "w-10 h-10": emojiSize === "large",
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
        <div className="flex flex-wrap gap-x-1 items-start">
          <span className="text-white whitespace-pre-wrap break-words max-w-full">
            <span className="text-gray whitespace-pre text-11px">
              [{String(localeTime.getHours()).padStart(2, "0")}:
              {String(localeTime.getMinutes()).padStart(2, "0")}]{" "}
            </span>
            <span className="flex-shrink-0 text-blue font-semibold">
              {author.bot && author.address
                ? `${author.address.slice(0, 4)}...${author.address.slice(-4)}`
                : author.username
                ? author.username
                : `Unknown`}
              :{" "}
            </span>
            {contentRender.map((f, index) => (
              <React.Fragment key={index}>{f}</React.Fragment>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};
