import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { NutriProvider } from "./context/NutriContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <NutriProvider>
        <App />
      </NutriProvider>
    </BrowserRouter>
  </React.StrictMode>
);
