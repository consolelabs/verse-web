import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@unocss/reset/normalize.css";
import "uno.css";
import "./index.css";
import { GameContextProvider } from "./contexts/game";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GameContextProvider>
      <App />
    </GameContextProvider>
  </React.StrictMode>
);
