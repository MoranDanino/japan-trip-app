import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * The app was originally built for Claude.ai's artifact `window.storage` API.
 * Outside of Claude.ai (e.g. here on Netlify) we polyfill the same interface
 * using the browser's own localStorage, so no code in App.jsx needs to change.
 * Data stays only on the device/browser it was entered on.
 */
window.storage = {
  async get(key) {
    const v = localStorage.getItem(key);
    return v !== null ? { key, value: v, shared: false } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { key, value, shared: false };
  },
  async delete(key) {
    const existed = localStorage.getItem(key) !== null;
    localStorage.removeItem(key);
    return { key, deleted: existed, shared: false };
  },
  async list(prefix = "") {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    return { keys, prefix, shared: false };
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
