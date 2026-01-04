import type { DialogContainerOptions, DialogStyle } from "./types";

export interface DialogTheme extends Omit<DialogContainerOptions, "manager"> {
  name: string;
  description: string;
}

export const DEFAULT_BACKDROP_OPACITY = 0.35;

export const DEFAULT_STYLE: DialogStyle = {
  backdropOpacity: DEFAULT_BACKDROP_OPACITY,
  backdropColor: "#000000",
  backgroundColor: "#262626",
  border: false,
  padding: 1,
};

export const DEFAULT_PADDING = { top: 1, right: 1, bottom: 1, left: 1 };

export const minimal: DialogTheme = {
  name: "Minimal",
  description: "Clean and unobtrusive, lighter backdrop, no borders (default)",
  backdropMode: "top-only",
  dialogOptions: {
    style: DEFAULT_STYLE,
  },
};

export const unstyled: DialogTheme = {
  name: "Unstyled",
  description: "No default styles - full control for custom implementations",
  unstyled: true,
  backdropMode: "top-only",
  dialogOptions: {
    unstyled: true,
    style: {
      backdropOpacity: 0,
      backgroundColor: undefined,
      border: false,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
    },
  },
};

export const themes = {
  minimal,
  unstyled,
} as const;
