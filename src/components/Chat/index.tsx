import React, { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { clsx } from "clsx";
import { useGameState } from "stores/game";
import GameMap from "scenes/Game/Map";
import SimpleBar from "simplebar-react";
import { useAccount } from "wagmi";
import { useVirtualizer } from "@tanstack/react-virtual";
import useSWRInfinite from "swr/infinite";
import { API_BASE_URL } from "envs";

const PAGE_SIZE = 50;

const channel_id = "1076195173454843934";

export const Chat = () => {
  const input = useRef<HTMLTextAreaElement>(null);
  const chatFrame = useRef<any>(null);

  const { getActiveScene, addChannel, token, channels } = useGameState();
  const [inputting, setInputting] = useState(false);
  const [channelConnected, setChannelConnected] = useState(false);

  const { isConnected } = useAccount();

  const { data, error, mutate, isLoading, isValidating, size, setSize } =
    useSWRInfinite<
      Array<{
        id: number;
        author: {
          address: string;
          bot: boolean;
          username: string;
        };
        content: string;
      }>
    >(
      (_, previousPageData) => {
        let before = "";
        if (Array.isArray(previousPageData) && previousPageData.length) {
          before = `&before=${previousPageData[0].id}`;
        }
        return `${API_BASE_URL}/discord/channels/${channel_id}/messages?limit=${PAGE_SIZE}${before}`;
      },
      (url) =>
        fetch(url, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json())
    );

  const isEmpty = data?.[0].length === 0;
  const allData = data ? [...data].reverse().flat() : [];

  const virtualRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: allData.length,
    getScrollElement: () => virtualRef.current,
    estimateSize: () => 30,
  });

  useEffect(() => {
    function handleEnter(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (
        !["enter", "escape"].includes(key) ||
        !input.current ||
        (key === "enter" && e.shiftKey)
      )
        return;
      const activeScene = getActiveScene() as GameMap;
      if (!activeScene?.player) return;
      const newState = key === "escape" ? false : input.current.disabled;

      if (newState) {
        // weird workaround because of phaser
        setTimeout(() => {
          input.current?.focus();
        }, 0);
      } else {
        const value = input.current.value.trim();
        if (key === "enter" && value) {
          channels.chat?.push("chat:create_msg:verse", { content: value });
        }

        setTimeout(() => {
          if (input.current) {
            input.current.value = "";
          }
        }, 0);

        if (!newState && key === "enter" && value) return;
      }

      input.current.disabled = !newState;
      activeScene.player.idle = newState;
      setInputting(newState);
    }

    window.addEventListener("keyup", handleEnter);

    return () => window.removeEventListener("keyup", handleEnter);
  }, [channels.chat]);

  useEffect(() => {
    if (isConnected) {
      addChannel("chat", { channel_id, msg_amount: 50 }, (channel) => {
        channel.on("chat:new_msg", ({ message: newMessage }) => {
          mutate(
            async (pages = []) => {
              return [[newMessage], ...pages];
            },
            {
              revalidate: false,
            }
          ).then(() => {
            virtualizer.scrollElement?.scrollTo({
              top: virtualizer.scrollElement.scrollHeight,
              behavior: "smooth",
            });
          });
        });
        channel.on("chat:edit_msg", ({ message: newMessage }) => {
          mutate(
            async (pages = []) => {
              return pages.map((p) =>
                p.some((m) => m.id === newMessage.id)
                  ? p.map((m) => (m.id === newMessage.id ? newMessage : m))
                  : p
              );
            },
            {
              revalidate: false,
            }
          );
        });
        channel.on("chat:delete_msg", ({ message: newMessage }) => {
          mutate(
            async (pages = []) => {
              return pages.map((p) =>
                p.some((m) => m.id === newMessage.id)
                  ? p.filter((m) => m.id !== newMessage.id)
                  : p
              );
            },
            {
              revalidate: false,
            }
          );
        });
        channel.join().receive("ok", () => {
          setChannelConnected(true);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (
      channelConnected &&
      virtualizer.scrollElement &&
      virtualizer.scrollOffset === 0
    ) {
      virtualizer.scrollElement?.scrollTo({
        top: virtualizer.scrollElement.scrollHeight,
        behavior: "auto",
      });
    }
  }, [channelConnected, virtualizer.scrollElement]);

  const items = virtualizer.getVirtualItems();

  if (error || !channelConnected) return null;

  return (
    <div className="flex flex-col">
      <div
        className={clsx("w-full h-3.5 rounded-t", {
          "bg-transparent": !inputting,
          "bg-sky-700": inputting,
        })}
      />
      <div
        className={clsx("flex flex-col", {
          "bg-black/45": !inputting,
          "bg-black/70": inputting,
        })}
      >
        {!isEmpty ? (
          <button
            className="text-white/80 text-sm bg-gray-600 mx-auto self-center rounded-b px-1 sticky top-0"
            type="button"
            onClick={() => setSize(size + 1)}
          >
            {isValidating || isLoading ? "Loading..." : "Load more"}
          </button>
        ) : null}
        <SimpleBar
          ref={chatFrame}
          className="px-1.5 w-[25vw] bg-transparent max-h-250px h-full"
          scrollableNodeProps={{ ref: virtualRef }}
        >
          {/* <MessageSkeleton /> */}
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
            className="w-full relative"
          >
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(${
                  (items[0]?.start ?? 0) - virtualizer.options.scrollMargin
                }px)`,
              }}
            >
              {items.map((vrow) => {
                const msg = allData[vrow.index];

                return (
                  <div
                    key={vrow.key}
                    data-index={vrow.index}
                    ref={virtualizer.measureElement}
                    className="my-1.5"
                  >
                    <Message
                      sender={
                        msg.author.bot
                          ? `${msg.author.address.slice(
                              0,
                              4
                            )}...${msg.author.address.slice(-4)}`
                          : msg.author.username
                      }
                    >
                      {msg.content}
                    </Message>
                  </div>
                );
              })}
            </div>
          </div>
        </SimpleBar>
      </div>
      <textarea
        ref={input}
        disabled={!inputting}
        className={clsx(
          "min-h-[1.75rem] max-h-[2.75rem] resize-y rounded-b p-1.5 text-xs outline-none",
          {
            "w-full bg-black/85 text-white": inputting,
            "invisible pointer-events-none": !inputting,
          }
        )}
      />
    </div>
  );
};
