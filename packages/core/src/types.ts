import type { Renderable, RenderableOptions } from "@opentui/core";

// ============================================================================
// Base Layout Props (shared building blocks)
// ============================================================================

// Base layout props that most leaf components need
type BaseLayoutProps = Pick<
  RenderableOptions<Renderable>,
  "width" | "height" | "visible" | "opacity" | "zIndex"
>;

// Position props for absolute/relative positioning
type PositionProps = Pick<
  RenderableOptions<Renderable>,
  "position" | "top" | "right" | "bottom" | "left"
>;

// Flex props for container components
type FlexProps = Pick<
  RenderableOptions<Renderable>,
  | "flexGrow"
  | "flexShrink"
  | "flexBasis"
  | "flexDirection"
  | "flexWrap"
  | "alignItems"
  | "justifyContent"
  | "alignSelf"
>;

// ============================================================================
// Per-Component Layout Props
// ============================================================================

// Badge layout props - leaf component, no flex needed
export type BadgeLayoutProps = BaseLayoutProps & PositionProps;

// Checkbox layout props - leaf component, no flex needed
export type CheckboxLayoutProps = BaseLayoutProps & PositionProps;

// For future container components that need flex
export type ContainerLayoutProps = BaseLayoutProps & PositionProps & FlexProps;
