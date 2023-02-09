import ReactDOM from "react-dom/client";
import App from "./App";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "./index.css";
import "@fontsource/chakra-petch/400.css";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { SENRY_DSN } from "envs";

Sentry.init({
  dsn: SENRY_DSN,
  integrations: [new BrowserTracing()],
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
