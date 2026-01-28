# @opentui-ui/react

React bindings for [OpenTUI UI](https://github.com/msmps/opentui-ui) terminal components.

## Installation

```bash
npm install @opentui-ui/react @opentui-ui/core @opentui-ui/styles
# or
pnpm add @opentui-ui/react @opentui-ui/core @opentui-ui/styles
```

## Quick Start

```tsx
import { Badge, Checkbox } from "@opentui-ui/react";

function App() {
  const [checked, setChecked] = useState(false);

  return (
    <>
      <Badge label="Status" styles={{ root: { backgroundColor: "#22C55E" } }} />
      <Checkbox
        label="Accept terms"
        checked={checked}
        onCheckedChange={setChecked}
      />
    </>
  );
}
```

## Components

### Badge

A text badge for displaying labels.

```tsx
import { Badge } from "@opentui-ui/react/badge";

<Badge
  label="New"
  styles={{
    root: {
      backgroundColor: "#3B82F6",
      color: "#FFFFFF",
      paddingX: 2,
    },
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `""` | Badge text content |
| `styles` | `BadgeSlotStyles` | - | Static styles per slot |
| `styleResolver` | `(state) => BadgeSlotStyles` | - | Dynamic style function |
| `width` | `number` | auto | Component width |
| `height` | `number` | auto | Component height |
| `visible` | `boolean` | `true` | Visibility |
| `opacity` | `number` | `1` | Opacity (0-1) |

### Checkbox

An interactive checkbox with controlled/uncontrolled modes.

```tsx
import { Checkbox } from "@opentui-ui/react/checkbox";

// Uncontrolled
<Checkbox
  label="Enable notifications"
  defaultChecked={false}
  onCheckedChange={(checked) => console.log(checked)}
/>

// Controlled
<Checkbox
  label="Subscribe"
  checked={isSubscribed}
  onCheckedChange={setIsSubscribed}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | `""` | Label text |
| `checked` | `boolean` | - | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Initial state (uncontrolled) |
| `disabled` | `boolean` | `false` | Disabled state |
| `focused` | `boolean` | `false` | Focus state |
| `symbols` | `{ checked, unchecked }` | `CIRCLE` | Custom symbols |
| `onCheckedChange` | `(checked: boolean) => void` | - | Change handler |
| `styles` | `CheckboxSlotStyles` | - | Static styles per slot |
| `styleResolver` | `(state) => CheckboxSlotStyles` | - | Dynamic style function |

## Styling with `styled()`

Create styled variants using the Stitches-inspired `styled()` API:

```tsx
import { styled } from "@opentui-ui/react/styled";
import { Checkbox } from "@opentui-ui/react/checkbox";

const StyledCheckbox = styled(Checkbox, {
  // Base styles applied to all variants
  base: {
    box: { backgroundColor: "transparent" },
    mark: { color: "#A3A3A3" },
    label: { color: "#E5E5E5" },
  },

  // Variant definitions
  variants: {
    intent: {
      default: {
        mark: { color: "#A3A3A3" },
      },
      success: {
        mark: {
          color: "#22C55E",
          _checked: { color: "#16A34A" },
        },
      },
      danger: {
        mark: {
          color: "#EF4444",
          _checked: { color: "#DC2626" },
        },
      },
    },
    size: {
      sm: { label: { color: "#737373" } },
      md: { label: { color: "#A3A3A3" } },
      lg: { label: { color: "#E5E5E5" } },
    },
  },

  // Compound variants for combined conditions
  compoundVariants: [
    {
      intent: "danger",
      size: "lg",
      styles: {
        label: { color: "#FCA5A5" },
      },
    },
  ],

  // Default variant values
  defaultVariants: {
    intent: "default",
    size: "md",
  },
});

// Usage - variant props are fully typed
<StyledCheckbox intent="success" size="lg" label="Enable feature" />
```

### State Selectors

Use `_` prefixed selectors for state-based styling:

```tsx
const DynamicCheckbox = styled(Checkbox, {
  base: {
    mark: {
      color: "#A3A3A3",
      _checked: { color: "#22C55E" },    // When checked
      _focused: { color: "#3B82F6" },    // When focused
      _disabled: { color: "#525252" },   // When disabled
    },
    label: {
      color: "#E5E5E5",
      _disabled: { color: "#525252" },
    },
  },
});
```

### Inline Style Overrides

Override styled component styles per-instance:

```tsx
<StyledCheckbox
  intent="success"
  styles={{
    mark: {
      color: "#F59E0B",
      _checked: { color: "#D97706" },
    },
  }}
/>
```

For optimal performance, memoize inline styles:

```tsx
const styles = useMemo(() => ({
  mark: { color: dynamicColor },
}), [dynamicColor]);

<StyledCheckbox intent="success" styles={styles} />
```

## Exports

### Main Entry (`@opentui-ui/react`)

```ts
// Components
export { Badge } from "./badge";
export { Checkbox } from "./checkbox";

// Slot constants (re-exported from core)
export { BADGE_SLOTS, type BadgeSlotStyleMap } from "@opentui-ui/core/badge";
export { CHECKBOX_SLOTS, type CheckboxSlotStyleMap } from "@opentui-ui/core/checkbox";
```

### Subpath Exports

```ts
import { Badge } from "@opentui-ui/react/badge";
import { Checkbox } from "@opentui-ui/react/checkbox";
import { styled } from "@opentui-ui/react/styled";
```

## Peer Dependencies

- `react` >= 18.0.0
- `@opentui/core`
- `@opentui/react`

## Related Packages

- [`@opentui-ui/core`](../core) - Framework-agnostic renderables
- [`@opentui-ui/solid`](../solid) - Solid bindings
- [`@opentui-ui/styles`](../styles) - Styling engine

## License

MIT
