# packages/core

Framework-agnostic component logic. Exports Renderable classes that framework bindings (React/Solid) wrap.

## WHERE TO LOOK

| Task | File(s) | Notes |
|------|---------|-------|
| Add new component | `src/<name>/` | Create subfolder with 5 files (see structure below) |
| Base class for styled components | `src/styled-renderable.ts` | All components extend `StyledRenderable` |
| Component types | `src/<name>/types.ts` | Slots, state, options, style maps |
| Component metadata | `src/<name>/meta.ts` | `<NAME>_META` used by `styled()` API |
| Constants & defaults | `src/<name>/constants.ts` | `<NAME>_SLOTS`, `DEFAULT_<NAME>_OPTIONS` |
| Component logic | `src/<name>/<name>.ts` | The `<Name>Renderable` class |
| Barrel export | `src/<name>/index.ts` | Re-exports all public API |
| Root exports | `src/index.ts` | Must export new component here |
| Layout prop types | `src/types.ts` | Shared layout props for framework bindings |

## COMPONENT STRUCTURE

Each component folder contains:

```
src/<name>/
├── index.ts      # Barrel export
├── types.ts      # Slots, State, Options, SlotStyleMap interfaces
├── constants.ts  # SLOTS tuple, SLOT_STYLE_MAP, DEFAULT_OPTIONS
├── meta.ts       # <NAME>_META for styled() API inference
└── <name>.ts     # <Name>Renderable class
```

## SLOT SYSTEM

- **Slots**: Named parts of a component (e.g., `root`, `box`, `label`, `mark`)
- **SlotStyles**: Object mapping slot names to style properties
- **SlotStyleMap**: Type defining allowed style props per slot
- **State**: Object with boolean keys (e.g., `checked`, `focused`, `disabled`)
- **StyleResolver**: Function `(state) => SlotStyles` for dynamic styling

## ANTI-PATTERNS

- **DO NOT** add framework-specific code (React hooks, Solid signals)
- **DO NOT** skip creating `meta.ts` - it's required for `styled()` type inference
- **DO NOT** forget to add subpath export in `package.json` for new components
- **DO NOT** use `@opentui/core` types without explicit `type` import keyword
