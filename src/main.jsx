import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/**
 * One-time cleanup: an earlier version of this app registered a service
 * worker (for offline support) that turned out to be broken and was removed.
 * Removing it from the source code does NOT remove it from browsers that
 * already installed it — service workers keep running across deploys until
 * something explicitly unregisters them. This runs on every load, costs
 * nothing if there's nothing to clean up, and permanently fixes any device
 * that got the old broken worker.
 */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  }).catch(() => {});
}
if ("caches" in window) {
  caches.keys().then((names) => {
    names.forEach((name) => caches.delete(name));
  }).catch(() => {});
}

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
