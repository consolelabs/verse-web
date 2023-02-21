import React, { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { clsx } from "clsx";
import { useGameState } from "stores/game";
import GameMap from "scenes/Game/Map";
import SimpleBar from "simplebar-react";
import { useAccount } from "wagmi";
import { useVirtualizer } from "@tanstack/react-virtual";
import { API_BASE_URL } from "envs";
import { MessageItem } from "types/chat";

const PAGE_SIZE = 20;

const channel_id = "1076195173454843934";

export const Chat = () => {
  const input = useRef<HTMLInputElement>(null);
  const chatFrame = useRef<any>(null);

  const { getActiveScene, addChannel, token, channels } = useGameState();
  const [inputting, setInputting] = useState(false);
  const [channelConnected, setChannelConnected] = useState(false);

  const { isConnected } = useAccount();

  const initialLoad = useRef(true);
  const [messages, setMessages] = useState<MessageItem[]>();
  const messagesRef = useRef(messages);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageItem>();
  const [hasLoadedAll, setHasLoadedAll] = useState(false);

  const virtualRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: (messages || []).length,
    getScrollElement: () => virtualRef.current,
    estimateSize: () => 30,
  });

  useEffect(() => {
    if (!lastMessage && !initialLoad.current) {
      return;
    }

    setIsLoading(true);
    if (!initialLoad.current) {
      setIsLoadingMore(true);
    }

    let before = "";
    if (lastMessage) {
      before = `&before=${lastMessage.id}`;
    }

    fetch(
      `${API_BASE_URL}/discord/channels/${channel_id}/messages?limit=${PAGE_SIZE}${before}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        // Mark end of the channel
        if (data.length < PAGE_SIZE) {
          setHasLoadedAll(true);
        }

        setMessages((o) => [...data, ...(o || [])]);
      })
      .catch((error) => {
        setError(error);
      })
      .finally(() => {
        setIsLoading(false);

        if (initialLoad.current) {
          initialLoad.current = false;
        }
      });
  }, [lastMessage?.id]);

  useEffect(() => {
    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!["enter", "escape"].includes(key) || (key === "enter" && e.shiftKey))
        return;

      // Scroll to bottom on Enter/Escape
      virtualRef.current?.scrollTo({
        top: virtualRef.current.scrollHeight,
        behavior: "smooth",
      });

      if (!input.current) {
        return;
      }

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
          channels[`chat:${channel_id}`]?.push("chat:create_msg:verse", {
            content: value,
          });
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

    window.addEventListener("keyup", handleKeyUp);

    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [channels[`chat:${channel_id}`]]);

  useEffect(() => {
    if (isConnected) {
      addChannel(
        `chat:${channel_id}`,
        { channel_id, msg_amount: PAGE_SIZE },
        (channel) => {
          channel.on("chat:new_msg", ({ message: newMessage }) => {
            setMessages((o) => [...(o || []), newMessage]);
          });
          channel.on("chat:edit_msg", ({ message: newMessage }) => {
            setMessages((o = []) => {
              return o.map((m) => (m.id === newMessage.id ? newMessage : m));
            });
          });
          channel.on("chat:delete_msg", ({ message: newMessage }) => {
            setMessages((o = []) => {
              return o.filter((m) => m.id !== newMessage.id);
            });
          });
          channel.join().receive("ok", () => {
            setChannelConnected(true);
          });
        }
      );
    }
  }, [isConnected]);

  useEffect(() => {
    messagesRef.current = messages;

    if (messages && messages?.length > 0) {
      // Scroll to bottom on receiving new messages
      if (!isLoadingMore) {
        virtualRef.current?.scrollTo({
          top: virtualRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else if (lastMessage) {
        // Scroll to last message after loading more messages
        // FIXME: There's a slight flick here. Not sure if it's possible to fix it considering that we are rendering items
        // with virtualizer :thinking:
        virtualizer.scrollToIndex(
          messages.findIndex((m) => m.id === lastMessage?.id)
        );
        setIsLoadingMore(false);
      }
    }
  }, [JSON.stringify(messages)]);

  const items = virtualizer.getVirtualItems();

  if (error || !channelConnected) return null;

  return (
    <div className="fixed left-0 bottom-0 ml-[20vw] mb-4">
      <div
        id="chat"
        className={clsx(
          "flex flex-col text-sm text-white/80 bg-#140F29 rounded-lg border border-solid border-#343354 overflow-hidden",
          {
            "bg-opacity-20 border-transparent": !inputting,
            "bg-opacity-100": inputting,
          }
        )}
      >
        <div
          className={clsx("w-full border-b border-solid border-#343354", {
            "opacity-0": !inputting,
            "opacity-100": inputting,
          })}
        >
          <div className="flex">
            <button
              type="button"
              className={clsx("px-4 py-2", { "bg-#343354": true })}
            >
              Town Hall
            </button>
          </div>
        </div>
        <div className="flex flex-col">
          <SimpleBar
            ref={chatFrame}
            className={clsx(
              "px-4 w-[20vw] bg-transparent h-[calc(20vw-100px)] contain-strict",
              { "pointer-events-none": !inputting }
            )}
            scrollableNodeProps={{
              ref: virtualRef,
            }}
            color="white"
          >
            {!hasLoadedAll ? (
              <button
                className="text-sm bg-gray-600 mx-auto self-center rounded px-2 py-1 block my-4"
                type="button"
                onClick={() => setLastMessage(messages?.[0])}
              >
                {isLoading ? "Loading..." : "Load more"}
              </button>
            ) : null}
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
              }}
              className="w-full relative"
            >
              <div
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${items[0]?.start || 0}px)`,
                }}
              >
                {items.map((item) => {
                  const msg = (messages || [])[item.index];

                  return (
                    <div
                      key={item.key}
                      data-index={item.index}
                      ref={virtualizer.measureElement}
                      className="py-1"
                    >
                      <Message
                        sender={
                          msg.author?.bot
                            ? `${msg.author.address.slice(
                                0,
                                4
                              )}...${msg.author.address.slice(-4)}`
                            : msg.author.username
                        }
                        content={msg.content}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </SimpleBar>
        </div>
        <div
          className={clsx("border-t border-solid border-#343354", {
            "opacity-0 pointer-events-none": !inputting,
            "opacity-100": inputting,
          })}
        >
          <input
            ref={input}
            type="text"
            disabled={!inputting}
            className="w-full px-4 py-2 bg-#A6DAF726 outline-none"
            placeholder="Enter a message..."
          />
        </div>
      </div>
    </div>
  );
};
