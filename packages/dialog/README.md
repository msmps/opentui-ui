<div align="center">
  <img width="512" src="https://github.com/msmps/opentui-ui/raw/main/packages/dialog/assets/banner.png" />
</div>

<br />

<div align="center"><strong>A dialog/modal library for terminal UIs built on OpenTUI</strong></div>
<div align="center">
  <sub>Built by <a href="https://x.com/msmps_">Matt Simpson</a></sub>
</div>

<br />

## Features

- Configurable backdrop opacity and color
- Size presets (small, medium, large, full)
- Click-to-close backdrop (default: enabled)
- ESC key to close
- Dialog stack support (multiple dialogs)
- Focus management (saves/restores focus on open/close)
- React and Solid.js integrations

## Installation

```bash
bun add @opentui-ui/dialog
```

## Quick Start

```ts
import { DialogContainerRenderable, DialogManager } from "@opentui-ui/dialog";
import { TextRenderable } from "@opentui/core";

// 1. Create the manager and container
const manager = new DialogManager(renderer);
const container = new DialogContainerRenderable(renderer, { manager });
renderer.root.add(container);

// 2. Show dialogs from anywhere!
manager.show({
  content: (ctx) => new TextRenderable(ctx, { content: "Hello World!" }),
});
```

## Quick Reference

```ts
// Show dialogs
manager.show({ content: (ctx) => new TextRenderable(ctx, { content: "Hello" }) });
manager.show({ content: fn, size: "large" });        // With size preset
manager.show({ content: fn, id: "my-dialog" });      // With custom ID

// Close dialogs
manager.close();        // Close top-most
manager.close(id);      // Close specific
manager.closeAll();     // Close all
manager.replace({...}); // Close all and show new

// Query state
manager.isOpen();       // boolean
manager.getDialogs();   // readonly Dialog[]
manager.getTopDialog(); // Dialog | undefined
```

## API Reference

### `DialogManager`

```typescript
const manager = new DialogManager(renderer);

// Show a dialog - returns the dialog ID
const id = manager.show({
  content: (ctx) => new TextRenderable(ctx, { content: "Hello" }),
  size?: "small" | "medium" | "large" | "full",
  style?: DialogStyle,
  closeOnClickOutside?: boolean, // default: true
  onClose?: () => void,
  onOpen?: () => void,
  onBackdropClick?: () => void,
  id?: string | number, // optional custom ID
});

// Close dialogs
manager.close();        // Close top-most
manager.close(id);      // Close specific
manager.closeAll();     // Close all
manager.replace({...}); // Close all and show new

// Query state
manager.isOpen();       // boolean
manager.getDialogs();   // readonly Dialog[]
manager.getTopDialog(); // Dialog | undefined

// Subscribe to changes
const unsubscribe = manager.subscribe((data) => {
  // Called when dialogs change
});

// Cleanup
manager.destroy();
```

### `DialogContainerRenderable`

```typescript
const container = new DialogContainerRenderable(renderer, {
  manager, // Required: DialogManager instance
  size: "medium", // Default size preset
  dialogOptions: {
    // Default options for all dialogs
    style: DialogStyle,
  },
  sizePresets: {
    // Custom size presets (terminal columns)
    small: 40,
    medium: 60,
    large: 80,
  },
  closeOnEscape: true, // ESC key closes top dialog (default: true)
});

// Add to render tree
renderer.root.add(container);
```

### `DialogStyle`

```typescript
interface DialogStyle {
  // Backdrop
  backdropColor?: string; // Default: "#000000"
  backdropOpacity?: number | string; // 0-1, or "50%" (default: ~0.59)

  // Content panel
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  border?: boolean;

  // Sizing
  width?: number | string;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;

  // Padding
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}
```

## Size Presets

Default size presets (in terminal columns):

| Size   | Width              |
| ------ | ------------------ |
| small  | 40                 |
| medium | 60                 |
| large  | 80                 |
| full   | terminal width - 4 |

Override with `sizePresets` option:

```ts
const container = new DialogContainerRenderable(renderer, {
  manager,
  sizePresets: {
    small: 35,
    medium: 55,
    large: 75,
  },
});
```

## React & Solid

Both frameworks share the same API pattern with `DialogProvider`, `useDialog()`, and `useDialogState()`.

### Setup

```tsx
// React
import {
  DialogProvider,
  useDialog,
  useDialogState,
} from "@opentui-ui/dialog/react";

// Solid
import {
  DialogProvider,
  useDialog,
  useDialogState,
} from "@opentui-ui/dialog/solid";

function App() {
  return (
    <DialogProvider
      size="medium"
      dialogOptions={{ style: { backgroundColor: "#1a1a1a" } }}
    >
      <MyContent />
    </DialogProvider>
  );
}
```

### `useDialog()` Hook

Returns dialog actions for imperatively controlling dialogs.

```tsx
const dialog = useDialog();

// Show a dialog
dialog.show({
  content: <MyContent />,        // React: JSX directly
  content: () => <MyContent />,  // Solid: function returning JSX
  size: "medium",
  style: { backgroundColor: "#1a1a1a" },
  closeOnClickOutside: true,
  onClose: () => {},
  onOpen: () => {},
  id: "my-dialog",
});

// Close dialogs
dialog.close();        // Close top-most
dialog.close(id);      // Close specific
dialog.closeAll();     // Close all
dialog.replace({...}); // Close all and show new
```

### `useDialogState()` Hook

Subscribe to reactive dialog state using a selector.

```typescript
interface DialogState {
  isOpen: boolean; // Whether any dialog is open
  count: number; // Number of open dialogs
  dialogs: readonly Dialog[]; // All active dialogs (oldest first)
  topDialog: Dialog | undefined; // The top-most dialog
}

const isOpen = useDialogState((s) => s.isOpen);
const count = useDialogState((s) => s.count);
const topDialog = useDialogState((s) => s.topDialog);
```

> [!WARNING]  
> Always select primitives not new objects.

```ts
// ✅ Good - selects primitives
const isOpen = useDialogState((s) => s.isOpen);
const count = useDialogState((s) => s.count);

// ❌ Bad - creates new object every time, always re-renders
const state = useDialogState((s) => ({ isOpen: s.isOpen, count: s.count }));
```

**Key difference:** React returns values directly, Solid returns accessors you must call.

```tsx
// React - values directly
if (isOpen) {
  console.log(`${count} dialog(s) open`);
}

// Solid - call accessors
if (isOpen()) {
  console.log(`${count()} dialog(s) open`);
}
```

### Full Example

```tsx
// React
function MyContent() {
  const dialog = useDialog();
  const isOpen = useDialogState((s) => s.isOpen);

  return (
    <box>
      <text>{isOpen ? "Dialog open" : "No dialog"}</text>
      <box onMouseUp={() => dialog.show({ content: <text>Hello!</text> })}>
        <text>Open Dialog</text>
      </box>
    </box>
  );
}

// Solid - note: content is a function, accessors are called
function MyContent() {
  const dialog = useDialog();
  const isOpen = useDialogState((s) => s.isOpen);

  return (
    <box>
      <text>{isOpen() ? "Dialog open" : "No dialog"}</text>
      <box
        onMouseUp={() => dialog.show({ content: () => <text>Hello!</text> })}
      >
        <text>Open Dialog</text>
      </box>
    </box>
  );
}
```

## TypeScript

Full TypeScript support with exported types:

```ts
import type {
  Dialog,
  DialogContainerOptions,
  DialogContentFactory,
  DialogId,
  DialogOptions,
  DialogShowOptions,
  DialogSize,
  DialogStyle,
  DialogToClose,
} from "@opentui-ui/dialog";

// Type guard
import { isDialogToClose } from "@opentui-ui/dialog";
```

## License

MIT
