/** @jsxImportSource @opentui/solid */

import { createElement, extend, spread } from "@opentui/solid";
import { createSignal, onCleanup } from "solid-js";
import { ToasterRenderable } from "./renderables";
import { ToastState } from "./state";
import type { Toast, ToasterOptions } from "./types";

// Add TypeScript support
declare module "@opentui/solid" {
  interface OpenTUIComponents {
    toaster: typeof ToasterRenderable;
  }
}

// Register the toaster component
extend({ toaster: ToasterRenderable });

export function Toaster(props: ToasterOptions) {
  const el = createElement("toaster");
  spread(el, props);
  return el;
}

export function useToasts() {
  const [toasts, setToasts] = createSignal<Toast[]>(
    ToastState.getActiveToasts(),
  );

  const unsubscribe = ToastState.subscribe(() => {
    setToasts(ToastState.getActiveToasts());
  });

  onCleanup(unsubscribe);

  return toasts;
}

export { toast } from "./state";
