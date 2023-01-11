import classNames from "classnames";
import { useState } from "react";

interface Props {
  tabs: {
    key: string;
    label: React.ReactNode;
    content: React.ReactNode;
  }[];
}

export const Tabs = (props: Props) => {
  const { tabs = [] } = props;
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.key);

  return (
    <div className="flex flex-col items-start text-white h-full">
      <div className="inline-flex rounded-t-md overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTabKey === tab.key;

          return (
            <div
              className={classNames("px-4 py-2", {
                "bg-background-tertiary font-bold": isActive,
                "bg-background-secondary": !isActive,
              })}
              key={tab.key}
              onClick={() => setActiveTabKey(tab.key)}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
      <div className="rounded-b-md rounded-tr-md bg-background-tertiary p-4 flex-1 w-full overflow-auto">
        {tabs.find((tab) => tab.key === activeTabKey)?.content}
      </div>
    </div>
  );
};
