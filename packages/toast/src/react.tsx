/** @jsxImportSource @opentui/react */

import { extend } from "@opentui/react";
import { useSyncExternalStore } from "react";
import { ToasterRenderable } from "./renderables";
import { ToastState } from "./state";
import type { ToasterOptions } from "./types";

// Add TypeScript support
declare module "@opentui/react" {
  interface OpenTUIComponents {
    toaster: typeof ToasterRenderable;
  }
}

// Register the toaster component
extend({ toaster: ToasterRenderable });

export function Toaster(props: ToasterOptions) {
  return <toaster {...props} />;
}

export function useToasts() {
  const toasts = useSyncExternalStore(
    ToastState.subscribe,
    ToastState.getActiveToasts,
    ToastState.getActiveToasts,
  );

  return {
    toasts,
  };
}

export { toast } from "./state";
