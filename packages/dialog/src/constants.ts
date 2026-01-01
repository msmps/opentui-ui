import type { DialogOptions, DialogSize, DialogStyle } from "./types";

export const DEFAULT_SIZE: DialogSize = "medium";

export const DEFAULT_SIZES: Record<DialogSize, number> = {
  small: 40,
  medium: 60,
  large: 80,
  full: -1, // signals to use terminal width minus offset
};

export const FULL_SIZE_OFFSET = 4;

export const DIALOG_Z_INDEX = 9998;

export const DEFAULT_DIALOG_STYLE = {
  backdropOpacity: 0.59,
  backdropColor: "#000000",
  backgroundColor: "#1a1a1a",
} satisfies DialogStyle;

export const DEFAULT_DIALOG_OPTIONS: DialogOptions = {
  style: DEFAULT_DIALOG_STYLE,
};

/** @internal Used by React/Solid bindings for JSX portals */
export const JSX_CONTENT_KEY = Symbol("dialog-jsx-content");

/** @internal Used to prevent flicker when JSX content is injected via portals */
export const DEFERRED_KEY = Symbol("dialog-deferred");
