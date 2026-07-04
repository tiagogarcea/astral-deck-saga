import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { sfx } from "./game/sfx";

sfx.initGlobalClickSfx();
createRoot(document.getElementById("root")!).render(<App />);
