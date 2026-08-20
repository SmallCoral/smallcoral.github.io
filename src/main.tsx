import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

const rootElement = document.querySelector<HTMLElement>("#root");

if (!rootElement) {
  throw new Error("Missing #root mount point");
}

createRoot(rootElement).render(
  <StrictMode>
    <App articleSlug={rootElement.dataset.article} />
  </StrictMode>,
);
