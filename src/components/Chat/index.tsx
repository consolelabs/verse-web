import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import { clsx } from "clsx";
import { useGameState } from "stores/game";
import GameMap from "scenes/Game/Map";
import SimpleBar from "simplebar-react";

const addr = "0x6497b5580A58f2B890B3AD66bC459341312AcC23";

export const Chat = () => {
  const input = useRef<HTMLInputElement>(null);
  const chatFrame = useRef<any>(null);

  const { getActiveScene } = useGameState();
  const [inputting, setInputting] = useState(false);

  const [messages, setMessages] = useState<Array<React.ReactNode>>([]);

  const scrollToBottom = useCallback(() => {
    const scrollEle = chatFrame.current.getScrollElement();
    scrollEle?.scrollTo({
      top: scrollEle?.scrollHeight - scrollEle?.offsetHeight,
      left: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    function handleEnter(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!["enter", "escape"].includes(key) || !input.current) return;
      const activeScene = getActiveScene() as GameMap;
      if (!activeScene?.player) return;
      const newState = key === "escape" ? false : input.current.disabled;

      if (newState) {
        // weird workaround because of phaser
        setTimeout(() => {
          input.current?.focus();
        }, 0);
      } else {
        const value = input.current.value;
        if (key === "enter" && value) {
          setMessages((m) => [
            ...m,
            <Message mode="address" timestamp={Date.now()} sender={addr}>
              {value}
            </Message>,
          ]);
        }

        setTimeout(() => {
          if (input.current) {
            input.current.value = "";
          }

          scrollToBottom();
        }, 0);
      }

      if (!newState && key === "enter") return;

      input.current.disabled = !newState;
      activeScene.player.idle = newState;
      setInputting(newState);
    }

    window.addEventListener("keyup", handleEnter);

    scrollToBottom();

    return () => window.removeEventListener("keyup", handleEnter);
  }, []);

  return (
    <div className="flex flex-col">
      <div
        className={clsx("w-full h-3.5 rounded-t", {
          "bg-transparent": !inputting,
          "bg-sky-700": inputting,
        })}
      />
      <div
        className={clsx({
          "bg-black/45": !inputting,
          "bg-black/70": inputting,
        })}
      >
        <SimpleBar
          ref={chatFrame}
          className="p-1.5 w-[25vw] bg-transparent max-h-250px"
        >
          <div className="flex flex-col gap-y-1">
            <Message mode="address" timestamp={Date.now()} sender={addr}>
              Testing chat message
            </Message>
            <Message mode="address" timestamp={Date.now()} sender={addr}>
              hello from discord
            </Message>
            <Message mode="address" timestamp={Date.now()} sender={addr}>
              Lorem ipsum dolor sit amet, qui minim labore adipisicing minim
              sint cillum sint consectetur cupidatat.
            </Message>
            <Message mode="address" timestamp={Date.now()} sender={addr}>
              Lorem ipsum dolor sit amet, officia excepteur ex fugiat
              reprehenderit enim labore culpa sint ad nisi Lorem pariatur mollit
              ex esse exercitation amet. Nisi anim cupidatat excepteur officia.
              Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet
              voluptate voluptate dolor minim nulla est proident. Nostrud
              officia pariatur ut officia. Sit irure elit esse ea nulla sunt ex
              occaecat reprehenderit commodo officia dolor Lorem duis laboris
              cupidatat officia voluptate. Culpa proident adipisicing id nulla
              nisi laboris ex in Lorem sunt duis officia eiusmod. Aliqua
              reprehenderit commodo ex non excepteur duis sunt velit enim.
              Voluptate laboris sint cupidatat ullamco ut ea consectetur et est
              culpa et culpa duis.
            </Message>
            {...messages}
          </div>
        </SimpleBar>
      </div>
      <input
        ref={input}
        disabled={!inputting}
        className={clsx("rounded-b p-1.5 text-sm outline-none", {
          "w-full bg-black/85 text-white": inputting,
          "invisible pointer-events-none": !inputting,
        })}
      />
    </div>
  );
};
