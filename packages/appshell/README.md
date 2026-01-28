<div align="center"><strong>A layout shell component for terminal UIs built on OpenTUI</strong></div>
<div align="center">
  <sub>Built by <a href="https://x.com/msmps_">Matt Simpson</a> | Inspired by <a href="https://mantine.dev/core/app-shell/">Mantine AppShell</a></sub>
</div>

<br />

## Installation

```bash
bun add @opentui-ui/appshell
```

## Features

- Structured layout with header, navbar, main content, aside, and footer sections
- Flexible styling with borders, padding, and custom styling per section
- Multiple layout modes ('default' and 'alt')
- Collapsible navbar and aside sections
- Context-aware child components that automatically adapt to shell configuration

## Quick Start

```ts
import { createCliRenderer, TextRenderable } from "@opentui/core";
import { AppShell } from "@opentui-ui/appshell";

const renderer = await createCliRenderer();
renderer.start();

// Create the shell with header and navbar
const shell = new AppShell(renderer, {
  header: { height: 3 },
  navbar: { width: 20, collapsed: false },
  padding: 1,
  withBorder: true,
});
renderer.root.add(shell);

// Add header
const header = new AppShell.Header(renderer, {
  backgroundColor: "#1a1b26",
  padding: 1,
});
shell.add(header);

const headerText = new TextRenderable(renderer, {
  content: "My Terminal App",
  fg: "#7aa2f7",
  attributes: 1, // Bold
});
header.add(headerText);

// Add navbar
const navbar = new AppShell.Navbar(renderer, {
  backgroundColor: "#16161e",
  padding: 1,
});
shell.add(navbar);

// Add main content
const main = new AppShell.Main(renderer, {
  backgroundColor: "#1a1b26",
});
shell.add(main);
```

## Full Layout

```ts
// Create shell with all sections
const shell = new AppShell(renderer, {
  header: { height: 3 },
  navbar: { width: 20, collapsed: false },
  aside: { width: 25, collapsed: false },
  footer: { height: 2 },
  padding: 1,
  withBorder: true,
  layout: "default", // or "alt"
});
```

## Components

### AppShell

Main container component that manages the layout.

**Options:**

- `header` - Header configuration
  - `height: number` - Height of the header
  - `collapsed?: boolean` - Whether the header is collapsed
  - `offset?: boolean` - Controls whether AppShell.Main should be offset by this section (default: true)
- `navbar` - Navbar configuration
  - `width: number` - Width of the navbar
  - `breakpoint?: string | number` - Breakpoint at which navbar switches to mobile mode
  - `collapsed?: boolean | { desktop?: boolean, mobile?: boolean }` - Whether the navbar is collapsed
- `aside` - Aside configuration
  - `width: number` - Width of the aside
  - `breakpoint?: string | number` - Breakpoint at which aside switches to mobile mode
  - `collapsed?: boolean | { desktop?: boolean, mobile?: boolean }` - Whether the aside is collapsed
- `footer` - Footer configuration
  - `height: number` - Height of the footer
  - `collapsed?: boolean` - Whether the footer is collapsed
  - `offset?: boolean` - Controls whether AppShell.Main should be offset by this section (default: true)
- `padding` - Padding for the main content area (number or string)
- `withBorder` - Whether to show borders on sections (boolean, default: false)
- `layout` - Layout mode: 'default' or 'alt' (default: 'default')
- `disabled` - Whether the AppShell is disabled (boolean)
- `zIndex` - z-index of all sections (number, default: 100)
- `transitionDuration` - Duration of all transitions in ms (number)
- `transitionTimingFunction` - Timing function of all transitions (string)

### AppShell.Header

Header section at the top of the layout.

**Options:**
- `withBorder?: boolean` - Whether to show border (overrides AppShell setting)
- `zIndex?: number` - z-index of the header (overrides AppShell setting)
- All BoxRenderable options (backgroundColor, padding, etc.)

### AppShell.Navbar

Left sidebar for navigation.

**Options:**
- `withBorder?: boolean` - Whether to show border (overrides AppShell setting)
- `zIndex?: number` - z-index of the navbar (overrides AppShell setting)
- All BoxRenderable options (backgroundColor, padding, etc.)

### AppShell.Aside

Right sidebar for additional content.

**Options:**
- `withBorder?: boolean` - Whether to show border (overrides AppShell setting)
- `zIndex?: number` - z-index of the aside (overrides AppShell setting)
- All BoxRenderable options (backgroundColor, padding, etc.)

### AppShell.Footer

Footer section at the bottom of the layout.

**Options:**
- `withBorder?: boolean` - Whether to show border (overrides AppShell setting)
- `zIndex?: number` - z-index of the footer (overrides AppShell setting)
- All BoxRenderable options (backgroundColor, padding, etc.)

### AppShell.Main

Main content area that automatically adjusts to available space.

**Options:**
- All BoxRenderable options (backgroundColor, padding, etc.)

## Layout Modes

### Default Layout

In 'default' layout, the navbar and aside sit between the header and footer:

```text
┌────────────────────────────────┐
│          Header                │
├────────┬──────────────┬────────┤
│ Navbar │     Main     │  Aside │
│        │              │        │
├────────┴──────────────┴────────┤
│          Footer                │
└────────────────────────────────┘
```

### Alt Layout

In 'alt' layout, the navbar and aside extend the full height:

```text
┌────────┬──────────────┬────────┐
│        │   Header     │        │
│ Navbar ├──────────────┤  Aside │
│        │     Main     │        │
│        ├──────────────┤        │
│        │   Footer     │        │
└────────┴──────────────┴────────┘
```

## Examples

See the `examples/` directory for complete examples:

- `basic.ts` - Simple layout with header, navbar, and main content
- `full-layout.ts` - Complete layout with all sections
- `react-basic.tsx` - React wrapper example
- `solid-basic.tsx` - Solid wrapper example

## React and Solid Support

AppShell includes first-class support for React and Solid through dedicated exports:

### React

```tsx
/** @jsxImportSource @opentui/react */

import { App } from "@opentui/react";
import { AppShell } from "@opentui-ui/appshell/react";

function MyApp() {
  return (
    <AppShell layout="default">
      <AppShell.Header>
        <text>Header Content</text>
      </AppShell.Header>

      <AppShell.Navbar>
        <text>Navigation</text>
      </AppShell.Navbar>

      <AppShell.Main>
        <text>Main Content</text>
      </AppShell.Main>

      <AppShell.Footer>
        <text>Footer</text>
      </AppShell.Footer>
    </AppShell>
  );
}

const app = new App();
app.renderToScreen(() => <MyApp />);
```

### Solid

```tsx
/** @jsxImportSource @opentui/solid */

import { App } from "@opentui/solid";
import { AppShell } from "@opentui-ui/appshell/solid";

function MyApp() {
  return (
    <AppShell layout="default">
      <AppShell.Header>
        <text>Header Content</text>
      </AppShell.Header>

      <AppShell.Navbar>
        <text>Navigation</text>
      </AppShell.Navbar>

      <AppShell.Main>
        <text>Main Content</text>
      </AppShell.Main>

      <AppShell.Aside>
        <text>Aside Content</text>
      </AppShell.Aside>

      <AppShell.Footer>
        <text>Footer</text>
      </AppShell.Footer>
    </AppShell>
  );
}

const app = new App();
app.renderToScreen(() => <MyApp />);
```

## License

MIT
