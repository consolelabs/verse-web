import React, { useEffect, useMemo, useRef, useState } from "react";
import { Message } from "./Message";
import { clsx } from "clsx";
import { useGameState } from "stores/game";
import GameMap from "scenes/Game/Map";
import SimpleBar from "simplebar-react";
import { useAccount } from "wagmi";
import { useVirtualizer } from "@tanstack/react-virtual";
import { API_BASE_URL, CHAT_CHANNEL_ID } from "envs";
import { MessageItem } from "types/chat";
import debounce from "lodash.debounce";

const PAGE_SIZE = 20;

const topic = `chat:${CHAT_CHANNEL_ID}`;

function injectDates(data: Array<MessageItem>) {
  const insertIndex = new Map<number, string>();
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const nextD = data[i + 1];
    if (d?.isDivider || nextD?.isDivider || !nextD) continue;
    const { timestamp } = d;
    const { timestamp: nextTimestamp } = nextD;
    const localeTime = new Date(timestamp);
    const nextLocaleTime = new Date(nextTimestamp);
    if (localeTime.getDate() !== nextLocaleTime.getDate())
      insertIndex.set(
        i + 1,
        `${new Intl.DateTimeFormat("en-US", { month: "long" }).format(
          nextLocaleTime
        )} ${nextLocaleTime.getDate()} ${nextLocaleTime.getFullYear()}`
      );
  }

  const newData = [...data];
  insertIndex.forEach((text, idx) => {
    newData.splice(idx, 0, { isDivider: true, text });
  });

  return newData;
}

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
  const [lastMessage, setLastMessage] =
    useState<Extract<MessageItem, { isDivider: false }>>();
  const [hasLoadedAll, setHasLoadedAll] = useState(false);
  const [showLoadedAllButton, setShowLoadedAllButton] = useState(false);
  const [visibleMessageIds, setVisibleMessageIds] = useState<number[]>([]);

  const virtualRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: (messages || []).length,
    getScrollElement: () => virtualRef.current,
    estimateSize: () => 20,
  });

  const scrollToBottom = useMemo(
    () =>
      debounce(() => {
        virtualRef.current?.scrollTo({
          top: virtualRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 300),
    []
  );

  const toggleInputting = (newState: boolean) => {
    const activeScene = getActiveScene() as GameMap;

    if (!input.current || !activeScene) {
      return;
    }

    input.current.disabled = !newState;
    activeScene.player.idle = newState;
    setInputting(newState);
  };

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
      `${API_BASE_URL}/discord/channels/${CHAT_CHANNEL_ID}/messages?limit=${PAGE_SIZE}${before}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        if (res.ok) return res;
        throw new Error();
      })
      .then((res) => res.json())
      .then((data) => {
        // Mark end of the channel
        if (data.length < PAGE_SIZE) {
          setHasLoadedAll(true);
        }

        const dataWithDates = injectDates(data);

        setMessages((o) => [...dataWithDates, ...(o || [])]);
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
          channels[topic]?.push("chat:create_msg:verse", {
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

      toggleInputting(newState);
    }

    window.addEventListener("keyup", handleKeyUp);

    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [channels[topic]]);

  useEffect(() => {
    if (!isConnected) return;
    addChannel(
      topic,
      {
        channel_id: CHAT_CHANNEL_ID,
        msg_amount: PAGE_SIZE,
      },
      async (channel) => {
        channel.on("chat:new_msg", ({ message: newMessage }) => {
          setMessages((o) => [...(o || []), newMessage]);
          setVisibleMessageIds((o) => {
            return [...o, newMessage.id].slice(-20);
          });
        });
        channel.on("chat:edit_msg", ({ message: newMessage }) => {
          setMessages((o = []) => {
            return o.map((m) =>
              m.isDivider ? m : m.id === newMessage.id ? newMessage : m
            );
          });
        });
        channel.on("chat:delete_msg", ({ message: newMessage }) => {
          setMessages((o = []) => {
            return o.filter((m) => (m.isDivider ? m : m.id !== newMessage.id));
          });
        });

        return () => {
          setChannelConnected(true);
        };
      }
    );
  }, [isConnected]);

  useEffect(() => {
    messagesRef.current = messages;

    if (messages && messages?.length > 0) {
      // Scroll to bottom on receiving new messages
      if (!isLoadingMore) {
        scrollToBottom();
      } else if (lastMessage) {
        // Scroll to last message after loading more messages
        // FIXME: There's a slight flick here. Not sure if it's possible to fix it considering that we are rendering items
        // with virtualizer :thinking:
        virtualizer.scrollToIndex(
          messages.findIndex((m) => !m.isDivider && m.id === lastMessage?.id)
        );
        setIsLoadingMore(false);
      }
    }
  }, [JSON.stringify(messages)]);

  useEffect(() => {
    if (!inputting) {
      scrollToBottom();
    }
  }, [inputting]);

  useEffect(() => {
    let timeout: any;

    if (visibleMessageIds.length > 0) {
      timeout = setTimeout(() => {
        setVisibleMessageIds([]);
      }, 10000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [visibleMessageIds]);

  const items = virtualizer.getVirtualItems();

  const previewMessageRender = useMemo(() => {
    const visible = visibleMessageIds.length > 0 && !inputting;

    if (!visible) {
      return null;
    }

    return (
      <div className="absolute bottom-0 w-full max-h-full text-xs bg-#140F29/30 rounded-lg px-4 py-2 mt-auto overflow-auto flex flex-col-reverse">
        {visibleMessageIds.reverse().map((id) => {
          const msg = (messages || []).find((m) => !m.isDivider && m.id === id);

          if (!msg) {
            return null;
          }

          return (
            <div key={id} className="py-0.5">
              <Message {...msg} />
            </div>
          );
        })}
      </div>
    );
  }, [visibleMessageIds, inputting, messages]);

  if (error || !channelConnected) return null;

  return (
    <div className="fixed left-1/2 bottom-0 -translate-x-1/2 mb-4">
      {previewMessageRender}
      <div
        id="chat"
        className={clsx(
          "flex flex-col text-xs text-white/80 rounded-lg overflow-hidden transition-all duration-200",
          { "opacity-0": !inputting, "opacity-100": inputting }
        )}
      >
        <div className="w-full border-b border-solid border-#343354 bg-#140F29 relative">
          <div className="flex">
            <button
              type="button"
              className={clsx("px-4 py-2", { "bg-#343354": true })}
            >
              Town Hall
            </button>
          </div>
          <button
            type="button"
            className="absolute text-red-500 right-0 top-0 mt-1 mr-2"
            onClick={() => toggleInputting(false)}
          >
            <div className="i-heroicons-x-mark-20-solid w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col relative">
          <SimpleBar
            ref={chatFrame}
            className={clsx(
              "px-4 w-[30vw] h-[30vh] contain-strict bg-#140F29",
              { "pointer-events-none": !inputting }
            )}
            scrollableNodeProps={{
              ref: virtualRef,
            }}
            onScrollCapture={() => {
              if (
                !hasLoadedAll &&
                virtualRef.current &&
                virtualRef.current.scrollTop < 100
              ) {
                setShowLoadedAllButton(true);
              } else {
                setShowLoadedAllButton(false);
              }
            }}
          >
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
                      className="py-0.5"
                    >
                      <Message {...msg} />
                    </div>
                  );
                })}
              </div>
            </div>
          </SimpleBar>
          {showLoadedAllButton && !hasLoadedAll ? (
            <button
              className="text-sm bg-gray-600 mx-auto self-center rounded px-2 py-1 block my-4 absolute top-0"
              type="button"
              onClick={() =>
                setLastMessage(
                  messages?.find((m) => !m.isDivider) as Extract<
                    MessageItem,
                    { isDivider: false }
                  >
                )
              }
            >
              {isLoading ? "Loading..." : "Load more"}
            </button>
          ) : null}
        </div>
        <div
          className={clsx(
            "border-t border-solid border-#343354 bg-#140F29 transition-all duration-200",
            {
              "pointer-events-none h-0": !inputting,
              "h-32px": inputting,
            }
          )}
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
