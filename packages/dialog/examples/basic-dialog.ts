#!/usr/bin/env bun
/**
 * Basic Dialog Example
 *
 * Demonstrates the dialog system with @opentui/core.
 * Run with: bun packages/dialog/examples/basic-dialog.ts
 */

import {
  BoxRenderable,
  type CliRenderer,
  createCliRenderer,
  type KeyEvent,
  TextRenderable,
} from "@opentui/core";

import { DialogContainerRenderable, DialogManager } from "../src/index";

let renderer: CliRenderer | null = null;
let dialogContainer: DialogContainerRenderable | null = null;
let dialogManager: DialogManager | null = null;
let statusText: TextRenderable | null = null;

// Track settings
let sizeIndex = 1; // Start with medium
const sizes = ["small", "medium", "large", "full"] as const;

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
    content: "Dialog Demo",
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

  // Create dialog manager and container
  dialogManager = new DialogManager(renderer);
  dialogContainer = new DialogContainerRenderable(renderer, {
    manager: dialogManager,
    size: sizes[sizeIndex],
  });
  renderer.root.add(dialogContainer);

  // Set up keyboard handler
  renderer.keyInput.on("keypress", handleKeyPress);
}

function getHelpText(): string {
  return `
Keyboard Controls:
  1 - Simple dialog          2 - Dialog with long content
  3 - Stacked dialogs        4 - Custom styled dialog
  5 - MS-DOS style dialog
  
  s - Cycle sizes (small -> medium -> large -> full)
  
  Escape - Close top dialog
  d - Close all dialogs
  
  q / Ctrl+C - Quit
`.trim();
}

function getStatusText(): string {
  const size = sizes[sizeIndex] ?? "medium";
  const openCount = dialogContainer?.getDialogRenderables().size ?? 0;
  return `Size: ${size} | Open dialogs: ${openCount}`;
}

function updateStatus(): void {
  if (statusText) {
    statusText.content = getStatusText();
  }
}

function handleKeyPress(key: KeyEvent): void {
  if (!renderer || !dialogContainer || !dialogManager) return;

  switch (key.name) {
    case "1":
      // Simple dialog
      dialogManager.show({
        content: (ctx) => {
          const box = new BoxRenderable(ctx, {
            id: "simple-dialog-content",
            flexDirection: "column",
            gap: 1,
          });

          const titleText = new TextRenderable(ctx, {
            id: "simple-title",
            content: "Hello!",
            fg: "#e94560",
          });
          box.add(titleText);

          const bodyText = new TextRenderable(ctx, {
            id: "simple-body",
            content: "This is a simple dialog.\nPress ESC to close.",
            fg: "#ffffff",
            wrapMode: "word",
          });
          box.add(bodyText);

          return box;
        },
        size: sizes[sizeIndex],
        onClose: () => updateStatus(),
      });
      updateStatus();
      break;

    case "2":
      // Dialog with long content
      dialogManager.show({
        content: (ctx) => {
          const box = new BoxRenderable(ctx, {
            id: "long-dialog-content",
            flexDirection: "column",
            gap: 1,
          });

          const titleText = new TextRenderable(ctx, {
            id: "long-title",
            content: "Long Content Dialog",
            fg: "#3498db",
          });
          box.add(titleText);

          const bodyText = new TextRenderable(ctx, {
            id: "long-body",
            content: `This dialog contains more content to demonstrate how the dialog handles longer text. The content panel will expand to accommodate the text while respecting the maximum width constraint.

Features demonstrated:
- Text wrapping within the dialog
- Multiple paragraphs
- Configurable backdrop opacity
- Size presets (small, medium, large, full)

Press ESC to close this dialog.`,
            fg: "#a0a0a0",
            wrapMode: "word",
          });
          box.add(bodyText);

          return box;
        },
        size: sizes[sizeIndex],
        onClose: () => updateStatus(),
      });
      updateStatus();
      break;

    case "3":
      // Stacked dialogs
      dialogManager.show({
        content: (ctx) => {
          const box = new BoxRenderable(ctx, {
            id: "stack-1-content",
            flexDirection: "column",
            gap: 1,
          });

          const titleText = new TextRenderable(ctx, {
            id: "stack-1-title",
            content: "First Dialog",
            fg: "#16c79a",
          });
          box.add(titleText);

          const bodyText = new TextRenderable(ctx, {
            id: "stack-1-body",
            content:
              "This is the first dialog.\nPress 3 again to open another on top.",
            fg: "#ffffff",
            wrapMode: "word",
          });
          box.add(bodyText);

          return box;
        },
        size: "medium",
        style: {
          backdropOpacity: 0.4, // 40% opacity
        },
        onClose: () => updateStatus(),
      });

      // Show second dialog after a short delay
      setTimeout(() => {
        dialogManager?.show({
          content: (ctx) => {
            const box = new BoxRenderable(ctx, {
              id: "stack-2-content",
              flexDirection: "column",
              gap: 1,
            });

            const titleText = new TextRenderable(ctx, {
              id: "stack-2-title",
              content: "Second Dialog (Stacked)",
              fg: "#f39c12",
            });
            box.add(titleText);

            const bodyText = new TextRenderable(ctx, {
              id: "stack-2-body",
              content:
                "This dialog is stacked on top!\nESC closes this one first.",
              fg: "#ffffff",
              wrapMode: "word",
            });
            box.add(bodyText);

            return box;
          },
          size: "small",
          style: {
            backdropOpacity: 0.3, // 30% opacity
          },
          onClose: () => updateStatus(),
        });
        updateStatus();
      }, 100);
      updateStatus();
      break;

    case "4":
      // Custom styled dialog
      dialogManager.show({
        content: (ctx) => {
          const box = new BoxRenderable(ctx, {
            id: "custom-dialog-content",
            flexDirection: "column",
            gap: 1,
          });

          const titleText = new TextRenderable(ctx, {
            id: "custom-title",
            content: "Custom Styled",
            fg: "#9b59b6",
          });
          box.add(titleText);

          const bodyText = new TextRenderable(ctx, {
            id: "custom-body",
            content: `This dialog has custom styling:
- Purple border
- Higher opacity backdrop
- Bordered content panel

Press ESC to close.`,
            fg: "#ffffff",
            wrapMode: "word",
          });
          box.add(bodyText);

          return box;
        },
        size: sizes[sizeIndex],
        style: {
          backdropOpacity: 0.8, // 80% opacity
          backdropColor: "#1a0a2e",
          backgroundColor: "#2d1b4e",
          border: true,
          borderColor: "#9b59b6",
          borderStyle: "single",
        },
        onClose: () => updateStatus(),
      });
      updateStatus();
      break;

    case "5":
      // MS-DOS style dialog
      dialogManager.show({
        content: (ctx) => {
          const box = new BoxRenderable(ctx, {
            id: "dos-dialog-content",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          });

          const titleText = new TextRenderable(ctx, {
            id: "dos-title",
            content: "Welcome to the MS-DOS Editor",
            fg: "#000000",
          });
          box.add(titleText);

          const copyrightBox = new BoxRenderable(ctx, {
            id: "copyright-box",
            flexDirection: "column",
            alignItems: "center",
          });

          const copyright1 = new TextRenderable(ctx, {
            id: "copyright-1",
            content: "Copyright (C) Microsoft Corporation, 1987-1991.",
            fg: "#000000",
          });
          copyrightBox.add(copyright1);

          const copyright2 = new TextRenderable(ctx, {
            id: "copyright-2",
            content: "All rights reserved.",
            fg: "#000000",
          });
          copyrightBox.add(copyright2);

          box.add(copyrightBox);

          const button1 = new TextRenderable(ctx, {
            id: "button-1",
            content: "< Press Enter to see the Survival Guide >",
            fg: "#000000",
          });
          box.add(button1);

          const button2 = new TextRenderable(ctx, {
            id: "button-2",
            content: "< Press ESC to clear this dialog box >",
            fg: "#000000",
          });
          box.add(button2);

          return box;
        },
        size: "large",
        style: {
          backdropOpacity: 1,
          backdropColor: "#0000AA", // DOS blue
          backgroundColor: "#AAAAAA", // DOS gray
          border: true,
          borderColor: "#000000",
          borderStyle: "single",
          padding: 2,
        },
        onClose: () => updateStatus(),
      });
      updateStatus();
      break;

    case "s": {
      // Cycle sizes - note: size changes only affect NEW dialogs now
      sizeIndex = (sizeIndex + 1) % sizes.length;
      updateStatus();
      break;
    }

    case "d":
      dialogManager.closeAll();
      updateStatus();
      break;

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
