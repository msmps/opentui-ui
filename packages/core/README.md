# @opentui-ui/core

Framework-agnostic core renderables for terminal UI components built on [OpenTUI](https://github.com/anomalyco/opentui).

## Installation

```bash
npm install @opentui-ui/core
# or
pnpm add @opentui-ui/core
```

## Overview

This package provides the foundational component logic that framework bindings (React, Solid) wrap. Components are implemented as `Renderable` classes that can be styled using the companion `@opentui-ui/styles` package.

## Components

### Badge

A simple text badge component for displaying labels.

```ts
import { BadgeRenderable, type BadgeOptions } from "@opentui-ui/core/badge";

const badge = new BadgeRenderable(ctx, {
  label: "New",
  styles: {
    root: {
      backgroundColor: "#3B82F6",
      color: "#FFFFFF",
      paddingX: 2,
      paddingY: 0,
    },
  },
});
```

#### Badge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `""` | Text content of the badge |
| `styles` | `BadgeSlotStyles` | - | Static slot styles |
| `styleResolver` | `(state: BadgeState) => BadgeSlotStyles` | - | Dynamic style resolver |

#### Badge Slots

| Slot | Style Props | Description |
|------|-------------|-------------|
| `root` | `color`, `backgroundColor`, `paddingX`, `paddingY` | The badge container |

### Checkbox

An interactive checkbox with controlled and uncontrolled modes.

```ts
import { CheckboxRenderable, CHECKBOX_SYMBOLS } from "@opentui-ui/core/checkbox";

// Uncontrolled
const checkbox = new CheckboxRenderable(ctx, {
  label: "Accept terms",
  defaultChecked: false,
  symbols: CHECKBOX_SYMBOLS.BALLOT,
  onCheckedChange: (checked) => console.log("Checked:", checked),
});

// Controlled
const controlled = new CheckboxRenderable(ctx, {
  label: "Subscribe",
  checked: isSubscribed,
  onCheckedChange: setIsSubscribed,
});
```

#### Checkbox Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `""` | Text label next to the checkbox |
| `checked` | `boolean` | - | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Initial checked state (uncontrolled) |
| `disabled` | `boolean` | `false` | Whether the checkbox is disabled |
| `focused` | `boolean` | `false` | Whether the checkbox has focus |
| `symbols` | `CheckboxSymbolSet` | `CIRCLE` | Checked/unchecked symbols |
| `onCheckedChange` | `(checked: boolean) => void` | - | Called when checked state changes |
| `styles` | `CheckboxSlotStyles` | - | Static slot styles |
| `styleResolver` | `(state: CheckboxState) => CheckboxSlotStyles` | - | Dynamic style resolver |

#### Checkbox Slots

| Slot | Style Props | Description |
|------|-------------|-------------|
| `box` | `color`, `backgroundColor`, `gap` | The checkbox container |
| `mark` | `color` | The check/uncheck symbol |
| `label` | `color` | The label text |

#### Checkbox State

The checkbox exposes state for dynamic styling:

```ts
interface CheckboxState {
  checked: boolean;
  focused: boolean;
  disabled: boolean;
}
```

#### Built-in Symbol Sets

```ts
import { CHECKBOX_SYMBOLS } from "@opentui-ui/core/checkbox";

CHECKBOX_SYMBOLS.CIRCLE   // { checked: "◉", unchecked: "○" }
CHECKBOX_SYMBOLS.BALLOT   // { checked: "☑", unchecked: "☐" }
CHECKBOX_SYMBOLS.CHECK    // { checked: "✓", unchecked: "○" }
CHECKBOX_SYMBOLS.ASCII    // { checked: "[x]", unchecked: "[ ]" }
CHECKBOX_SYMBOLS.SQUARE   // { checked: "■", unchecked: "□" }
```

## Architecture

### Slot System

Components use a slot-based styling system where each visual part of a component is a named "slot":

- **Slots**: Named parts (e.g., `root`, `box`, `label`, `mark`)
- **SlotStyles**: Object mapping slot names to style properties
- **State**: Boolean keys for dynamic styling (e.g., `checked`, `focused`)

### StyledRenderable Base Class

All styled components extend `StyledRenderable`, which provides:

- Static styles via `styles` prop
- Dynamic styles via `styleResolver` prop
- State-based style resolution via `getState()` / `getResolvedStyles()`

### Component Metadata

Each component exports metadata (`*_META`) used by the `styled()` API for type inference:

```ts
import { CHECKBOX_META } from "@opentui-ui/core/checkbox";

CHECKBOX_META.slots      // ["box", "mark", "label"]
CHECKBOX_META.stateKeys  // ["checked", "focused", "disabled"]
```

## Exports

### Main Entry (`@opentui-ui/core`)

```ts
// Badge
export { BadgeRenderable, BADGE_META, BADGE_SLOTS, ... } from "./badge";

// Checkbox
export { CheckboxRenderable, CHECKBOX_META, CHECKBOX_SLOTS, CHECKBOX_SYMBOLS, ... } from "./checkbox";

// Base classes
export { StyledRenderable, type StyleResolver, type StyleState, type Styles } from "./styled-renderable";

// Layout props
export type { BadgeLayoutProps, CheckboxLayoutProps, ContainerLayoutProps } from "./types";
```

### Subpath Exports

```ts
import { BadgeRenderable } from "@opentui-ui/core/badge";
import { CheckboxRenderable } from "@opentui-ui/core/checkbox";
```

## Peer Dependencies

- `@opentui/core` - The core OpenTUI rendering engine

## Related Packages

- [`@opentui-ui/react`](../react) - React bindings
- [`@opentui-ui/solid`](../solid) - Solid bindings
- [`@opentui-ui/styles`](../styles) - Styling engine with variants

## License

MIT
