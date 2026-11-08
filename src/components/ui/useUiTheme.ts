"use client";

import { useSyncExternalStore } from "react";

/** Theme 1–5 đang bật (đọc từ <html data-theme>, cập nhật khi bấm phím 1–5) */
function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}
const current = () => document.documentElement.dataset.theme ?? "1";
const server = () => "1";

export function useUiTheme() {
  return useSyncExternalStore(subscribe, current, server);
}
