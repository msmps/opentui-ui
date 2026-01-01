#!/usr/bin/env bun

/** @jsxImportSource @opentui/react */

/**
 * React Dialog Example
 *
 * Demonstrates the dialog system with @opentui/react.
 * Run with: bun packages/dialog/examples/react.tsx
 */

import { createCliRenderer } from "@opentui/core";
import { createRoot, useKeyboard, useRenderer } from "@opentui/react";
import { useEffect, useState } from "react";
import { DialogProvider, useDialog, useDialogState } from "../src/react";

function DialogContent({ title, message }: { title: string; message: string }) {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCount) => prevCount + 1);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <box flexDirection="column" gap={1}>
      <text fg="#e94560">{title}</text>
      <text fg="#a0a0a0">{message}</text>
      <text fg="#a0a0a0">Counter: {counter}</text>
      <text fg="#7f8c8d">Press ESC to close</text>
    </box>
  );
}

/**
 * Status bar component that reactively displays dialog state.
 * Demonstrates useDialogState() for reactive updates.
 */
function StatusBar() {
  const isOpen = useDialogState((s) => s.isOpen);
  const count = useDialogState((s) => s.count);
  const topDialogId = useDialogState((s) => s.topDialog?.id);

  return (
    <box flexDirection="row" gap={2}>
      <text fg="#7f8c8d">
        Status: {isOpen ? `${count} dialog(s) open` : "No dialogs"}
      </text>
      {topDialogId !== undefined && (
        <text fg="#7f8c8d">| Top: {String(topDialogId)}</text>
      )}
    </box>
  );
}

function App() {
  const renderer = useRenderer();
  const dialog = useDialog();

  useKeyboard((key) => {
    switch (key.name) {
      case "1":
        dialog.show({
          content: (
            <DialogContent
              title="Simple Dialog"
              message="This is a simple dialog with React JSX content!"
            />
          ),
          size: "medium",
        });
        break;

      case "2":
        dialog.show({
          content: (
            <box flexDirection="column" gap={1}>
              <text fg="#3498db">Long Content Dialog</text>
              <text fg="#ffffff" wrapMode="word">
                This dialog demonstrates longer content with word wrapping. The
                dialog will expand to fit the content while respecting the
                maximum width.
              </text>
              <text fg="#7f8c8d">Press ESC to close</text>
            </box>
          ),
          size: "large",
        });
        break;

      case "3":
        // Show first dialog
        dialog.show({
          content: (
            <box flexDirection="column" gap={1}>
              <text fg="#16c79a">First Dialog</text>
              <text fg="#ffffff">Press 3 again to stack another dialog</text>
            </box>
          ),
          size: "medium",
          style: { backdropOpacity: 0.4 },
        });
        // Show second dialog after small delay
        setTimeout(() => {
          dialog.show({
            content: (
              <box flexDirection="column" gap={1}>
                <text fg="#f39c12">Second Dialog (Stacked)</text>
                <text fg="#ffffff">ESC closes this one first</text>
              </box>
            ),
            size: "small",
            style: { backdropOpacity: 0.3 },
          });
        }, 100);
        break;

      case "4":
        dialog.show({
          content: (
            <box flexDirection="column" gap={1}>
              <text fg="#9b59b6">Custom Styled Dialog</text>
              <text fg="#ffffff">
                Purple border with higher opacity backdrop
              </text>
            </box>
          ),
          size: "medium",
          style: {
            backdropOpacity: 0.8,
            backdropColor: "#1a0a2e",
            backgroundColor: "#2d1b4e",
            border: true,
            borderColor: "#9b59b6",
          },
        });
        break;

      case "d":
        dialog.closeAll();
        break;

      case "q":
        renderer.destroy();
        break;
    }
  });

  return (
    <box flexDirection="column" padding={2} gap={1}>
      <text fg="#e94560">React Dialog Demo</text>

      {/* Reactive status bar - updates automatically when dialogs change */}
      <StatusBar />

      <text fg="#a0a0a0" wrapMode="word">
        Keyboard Controls:{"\n"}
        {"  "}1 - Simple dialog{"\n"}
        {"  "}2 - Long content dialog{"\n"}
        {"  "}3 - Stacked dialogs{"\n"}
        {"  "}4 - Custom styled dialog{"\n"}
        {"  "}d - Close all dialogs{"\n"}
        {"  "}q - Quit
      </text>
    </box>
  );
}

function Root() {
  return (
    <DialogProvider
      size="medium"
      dialogOptions={{
        style: {
          backdropOpacity: 0.59,
          backgroundColor: "#16213e",
          paddingTop: 1,
          paddingBottom: 1,
          paddingLeft: 2,
          paddingRight: 2,
        },
      }}
    >
      <App />
    </DialogProvider>
  );
}

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
  targetFps: 30,
});

renderer.setBackgroundColor("#1a1a2e");
createRoot(renderer).render(<Root />);
