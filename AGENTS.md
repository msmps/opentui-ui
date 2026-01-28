# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-28
**Commit:** d926097
**Branch:** main

## OVERVIEW

Terminal UI component library for OpenTUI. Monorepo with framework-agnostic core + React/Solid bindings. Stitches-inspired styling engine with type-safe variants.

## STRUCTURE

```
opentui-ui/
├── packages/
│   ├── core/         # Framework-agnostic component logic (Badge, Checkbox)
│   ├── styles/       # Styling engine (styled(), variants, slots)
│   ├── react/        # React bindings
│   ├── solid/        # SolidJS bindings
│   ├── dialog/       # Dialog/modal system with async prompt/confirm/alert/choice
│   ├── toast/        # Sonner-inspired toast notifications with theming
│   └── utils/        # Shared utilities (padding resolution, etc.)
├── examples/         # Example apps (mostly empty)
├── benchmarks/       # Performance benchmarks
└── scripts/          # Package scaffolding
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new component | `packages/core/src/` | Create subfolder with types, constants, meta, component |
| React binding | `packages/react/src/` | Mirrors core structure |
| Solid binding | `packages/solid/src/` | Mirrors core structure |
| Styling API | `packages/styles/src/` | `styled.ts` is the factory |
| State resolution | `packages/styles/src/resolve.ts` | Variant + state style resolution |
| Style merging | `packages/styles/src/merge.ts` | Slot style composition |
| New package | `./scripts/create-package.sh` | Scaffolds package structure |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `createStyled` | Function | `packages/styles/src/styled.ts` | Factory for styled component definitions |
| `createStyleResolver` | Function | `packages/styles/src/resolve.ts` | Resolves styles from config + state |
| `processStyledConfig` | Function | `packages/styles/src/resolve.ts` | Pre-processes config for performance |
| `StyledRenderable` | Class | `packages/core/src/styled-renderable.ts` | Base class for styled components |
| `BadgeRenderable` | Class | `packages/core/src/badge/badge.ts` | Badge component logic |
| `CheckboxRenderable` | Class | `packages/core/src/checkbox/checkbox.ts` | Checkbox component logic |
| `splitVariantProps` | Function | `packages/styles/src/styled.ts` | Separates variant props from rest |
| `toast` | Object | `packages/toast/src/state.ts` | Global toast API (toast.success, toast.error, etc.) |
| `ToasterRenderable` | Class | `packages/toast/src/renderables/toaster.ts` | Container that manages toast notifications |
| `DialogManager` | Class | `packages/dialog/src/manager.ts` | Manages dialog state with prompt/confirm/alert/choice |
| `DialogContainerRenderable` | Class | `packages/dialog/src/renderables/dialog-container.ts` | Container that renders dialogs with backdrop |

## CONVENTIONS

- **pnpm workspace** - Use `pnpm -r` for recursive commands
- **ES Modules** - All packages use `"type": "module"`
- **Biome** - Linting/formatting (spaces, double quotes)
- **tsdown** - Bundler for all packages
- **Changesets** - Versioning (core/react/solid/styles linked)
- **Catalog deps** - Peer deps use `"catalog:"` in package.json
- **Source-first exports** - Dev uses `./src/`, publishConfig has `./dist/`
- **verbatimModuleSyntax** - Explicit `type` imports required
- **noUncheckedIndexedAccess** - Index returns `T | undefined`

## ANTI-PATTERNS (THIS PROJECT)

- **DO NOT** use tabs (project uses 2-space indent)
- **DO NOT** skip `type` keyword for type-only imports
- **DO NOT** expect tests (no test framework configured)
- **DO NOT** ignore biome-ignore comments without justification

## UNIQUE STYLES

- **Slot-based styling** - Components expose slots (e.g., `root`, `indicator`, `label`)
- **State selectors** - Styles can target states like `$hover`, `$focus`, `$checked`
- **Component meta** - Components carry metadata via `$$OtuiComponentMeta` symbol
- **Renderable pattern** - Core components extend `StyledRenderable` base class

## COMMANDS

```bash
pnpm build           # Build all packages
pnpm typecheck       # Type-check all packages
pnpm lint            # Lint with Biome
pnpm format          # Format with Biome
pnpm changeset       # Create a changeset
pnpm release         # Build + publish
pnpm create <name>   # Scaffold new package
```

## NOTES

- **No tests**: Project lacks test framework - relies on TypeScript for validation
- **Linked versioning**: core, react, solid, styles version together
- **OpenTUI peer deps**: Uses pnpm catalog for `@opentui/core`, `@opentui/react`, `@opentui/solid`
