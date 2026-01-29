import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { CDPHooksProvider } from "@coinbase/cdp-hooks";
import { type Config } from "@coinbase/cdp-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext.tsx";

const config: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  ethereum: {
    createOnLogin: "smart",
  },
};

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CDPHooksProvider config={config}>
          <AuthProvider>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <App />
            </ThemeProvider>
          </AuthProvider>
        </CDPHooksProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
