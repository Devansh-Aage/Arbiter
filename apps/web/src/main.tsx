import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { CDPHooksProvider } from "@coinbase/cdp-hooks";
import { type Config } from "@coinbase/cdp-core";

const config: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  ethereum: {
    createOnLogin: "smart",
  },
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CDPHooksProvider config={config}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </CDPHooksProvider>
  </StrictMode>
);
