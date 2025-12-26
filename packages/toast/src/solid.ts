/** @jsxImportSource @opentui/solid */

import { createElement, extend, spread } from "@opentui/solid";
import { ToasterRenderable } from "./renderables";
import type { ToasterOptions } from "./types";

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

export { toast } from "./state";
