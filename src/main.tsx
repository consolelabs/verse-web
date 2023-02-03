import ReactDOM from "react-dom/client";
import App from "./App";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "./index.css";
import "@fontsource/chakra-petch/400.css";
import "@fontsource/chakra-petch/500.css";
import "@fontsource/chakra-petch/600.css";
import "@fontsource/chakra-petch/700.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
