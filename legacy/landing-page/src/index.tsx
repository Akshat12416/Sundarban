import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ElementLight } from "./screens/ElementLight/ElementLight";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <ElementLight />
    </BrowserRouter>
  </StrictMode>,
);
