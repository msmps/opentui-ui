#!/usr/bin/env bun
/**
 * Basic Toast Example
 *
 * Demonstrates the toast notification system with @opentui/core.
 * Run with: bun packages/toast/examples/basic-toast.ts
 */

import {
  BoxRenderable,
  type CliRenderer,
  createCliRenderer,
  type KeyEvent,
  TextRenderable,
} from "@opentui/core";

import {
  ASCII_ICONS,
  DEFAULT_ICONS,
  EMOJI_ICONS,
  MINIMAL_ICONS,
  ToasterRenderable,
  toast,
} from "../src/index";
import { minimal, monochrome, type ToasterTheme } from "../src/themes";

let renderer: CliRenderer | null = null;
let toaster: ToasterRenderable | null = null;
let statusText: TextRenderable | null = null;

// Track which icon set we're using
let iconSetIndex = 0;
const iconSets = [
  { name: "Default (Unicode)", icons: DEFAULT_ICONS },
  { name: "ASCII", icons: ASCII_ICONS },
  { name: "Minimal", icons: MINIMAL_ICONS },
  { name: "Emoji", icons: EMOJI_ICONS },
];

// Track position
let positionIndex = 3;
const positions = [
  "bottom-right",
  "bottom-center",
  "bottom-left",
  "top-right",
  "top-center",
  "top-left",
] as const;

// Track stacking mode
let stackingMode: "single" | "stack" = "stack";

// Track theme
let themeIndex = 0;
const themes: Array<{ name: string; theme: ToasterTheme | null }> = [
  { name: "Custom", theme: null },
  { name: "Minimal", theme: minimal },
  { name: "Monochrome", theme: monochrome },
];

function createUI(rendererInstance: CliRenderer): void {
  renderer = rendererInstance;
  renderer.setBackgroundColor("#1a1a2e");

  // Main container
  const mainContainer = new BoxRenderable(renderer, {
    id: "main",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    padding: 2,
    gap: 1,
  });

  // Title
  const title = new TextRenderable(renderer, {
    id: "title",
    content: "Toast Notification Demo",
    fg: "#e94560",
  });
  mainContainer.add(title);

  // Help text
  const helpText = new TextRenderable(renderer, {
    id: "help",
    content: getHelpText(),
    fg: "#a0a0a0",
    wrapMode: "word",
  });
  mainContainer.add(helpText);

  // Status text
  statusText = new TextRenderable(renderer, {
    id: "status",
    content: getStatusText(),
    fg: "#16c79a",
  });
  mainContainer.add(statusText);

  renderer.root.add(mainContainer);

  // Create toaster
  recreateToaster();

  // Set up keyboard handler
  renderer.keyInput.on("keypress", handleKeyPress);
}

function getHelpText(): string {
  return `
Keyboard Controls:
  1 - Success toast       2 - Error toast
  3 - Warning toast       4 - Info toast
  5 - Loading toast       6 - Default toast
  
  p - Promise toast (simulated async)
  u - Update last toast
  d - Dismiss all toasts
  c - Clean queue (remove queued toasts)
  l - Toggle limit (3 vs unlimited)
  
  t - Cycle themes (Custom -> Minimal -> Monochrome)
  i - Cycle icon sets (Default -> Emoji -> ASCII)
  o - Cycle positions
  m - Toggle stacking mode (single/stack)
  
  q / Ctrl+C - Quit
`.trim();
}

function getStatusText(): string {
  const pos = positions[positionIndex] ?? "bottom-right";
  const icons = iconSets[iconSetIndex]?.name ?? "Default";
  const themeName = themes[themeIndex]?.name ?? "Custom";
  return `Theme: ${themeName} | Position: ${pos} | Icons: ${icons} | Mode: ${stackingMode}`;
}

function updateStatus(): void {
  if (statusText) {
    statusText.content = getStatusText();
  }
}

function recreateToaster(): void {
  if (toaster && renderer) {
    renderer.root.remove(toaster.id);
    toaster.destroy();
  }

  if (renderer) {
    const currentTheme = themes[themeIndex]?.theme;
    const currentIcons = iconSets[iconSetIndex]?.icons ?? DEFAULT_ICONS;

    // If using a theme, spread it and override with current settings
    // If no theme (Custom), use our custom configuration
    if (currentTheme) {
      toaster = new ToasterRenderable(renderer, {
        ...currentTheme,
        position: positions[positionIndex],
        icons: currentIcons,
        stackingMode: stackingMode,
        visibleToasts: 3,
      });
    } else {
      toaster = new ToasterRenderable(renderer, {
        position: positions[positionIndex],
        icons: currentIcons,
        stackingMode: stackingMode,
        visibleToasts: 3,
        toastOptions: {
          // Base style for all toasts
          style: {
            backgroundColor: "#16213e",
            foregroundColor: "#ffffff",
            borderColor: "#0f3460",
            mutedColor: "#7f8c8d",
            paddingX: 1,
            paddingY: 0,
            minHeight: 3,
          },
          // Per-type style overrides
          success: { style: { borderColor: "#16c79a" } },
          error: { style: { borderColor: "#e94560" } },
          warning: { style: { borderColor: "#f39c12" } },
          info: { style: { borderColor: "#3498db" } },
          loading: { style: { borderColor: "#9b59b6" } },
        },
      });
    }
    renderer.root.add(toaster);
  }
}

let lastToastId: string | number | undefined;

function handleKeyPress(key: KeyEvent): void {
  switch (key.name) {
    case "1":
      lastToastId = toast.success("Operation completed successfully!", {
        description: "Your changes have been saved.",
      });
      break;

    case "2":
      lastToastId = toast.error("Something went wrong", {
        description: "Please try again later.",
      });
      break;

    case "3":
      lastToastId = toast.warning("Warning", {
        description: "This action cannot be undone.",
      });
      break;

    case "4":
      lastToastId = toast.info("Did you know?", {
        description: "You can press 'i' to change icons.",
      });
      break;

    case "5":
      lastToastId = toast.loading("Processing...", {
        description: "Please wait while we process your request.",
      });
      break;

    case "6":
      lastToastId = toast("Hello!", {
        description: "This is a default toast notification.",
      });
      break;

    case "p": {
      // Promise toast - simulates an async operation
      const fakePromise = new Promise<{ name: string }>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.3) {
            resolve({ name: "data.json" });
          } else {
            reject(new Error("Network error"));
          }
        }, 2000);
      });

      toast.promise(fakePromise, {
        loading: "Fetching data...",
        success: (data) => `Loaded ${data.name}`,
        error: "Failed to fetch data",
      });
      break;
    }

    case "u":
      // Update the last toast
      if (lastToastId !== undefined) {
        toast.success("Updated!", {
          id: lastToastId,
          description: "Toast has been updated.",
        });
      } else {
        toast.info("No toast to update", {
          description: "Create a toast first with keys 1-6.",
        });
      }
      break;

    case "d":
      toast.dismiss();
      break;

    case "t": {
      // Cycle themes
      themeIndex = (themeIndex + 1) % themes.length;
      recreateToaster();
      updateStatus();
      const themeName = themes[themeIndex]?.name ?? "Custom";
      toast.info(`Theme: ${themeName}`);
      break;
    }

    case "i": {
      // Cycle icon sets
      iconSetIndex = (iconSetIndex + 1) % iconSets.length;
      recreateToaster();
      updateStatus();
      const iconName = iconSets[iconSetIndex]?.name ?? "Default";
      toast.info(`Icons: ${iconName}`);
      break;
    }

    case "o": {
      // Cycle positions
      positionIndex = (positionIndex + 1) % positions.length;
      recreateToaster();
      updateStatus();
      const pos = positions[positionIndex] ?? "bottom-right";
      toast.info(`Position: ${pos}`);
      break;
    }

    case "m":
      // Toggle stacking mode
      stackingMode = stackingMode === "single" ? "stack" : "single";
      recreateToaster();
      updateStatus();
      toast.info(`Stacking: ${stackingMode}`);
      break;

    case "c":
      // Clean queue - remove queued (non-visible) toasts
      toast.cleanQueue();
      break;

    case "l": {
      // Toggle toast limit
      const currentLimit = toast.getLimit();
      const newLimit = currentLimit === 3 ? Infinity : 3;
      toast.setLimit(newLimit);
      toast.info(`Limit: ${newLimit === Infinity ? "unlimited" : newLimit}`);
      break;
    }

    case "q":
      renderer?.destroy();
      process.exit(0);
  }
}

// Main entry point
if (import.meta.main) {
  const rendererInstance = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
  });

  createUI(rendererInstance);
}
