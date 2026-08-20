import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FrequencyLookupPage } from "./FrequencyLookupPage";
import "./styles.css";

const rootElement = document.querySelector<HTMLElement>("#root");

if (!rootElement) {
  throw new Error("Missing #root mount point");
}

createRoot(rootElement).render(
  <StrictMode>
    <FrequencyLookupPage />
  </StrictMode>,
);
