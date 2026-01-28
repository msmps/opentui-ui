import { BoxRenderable, type RenderContext } from "@opentui/core";
import { getAppShellContext } from "./context";
import type { AppShellHeaderOptions } from "./types";

/**
 * AppShell.Header - Header component for AppShell
 *
 * Renders a header section at the top of the AppShell layout.
 *
 * @example
 * ```ts
 * const header = new AppShellHeader(renderer, {
 *   withBorder: true,
 *   backgroundColor: "#1a1b26",
 * });
 * shell.add(header);
 * ```
 */
export class AppShellHeader extends BoxRenderable {
  constructor(ctx: RenderContext, options: AppShellHeaderOptions = {}) {
    const context = getAppShellContext();

    if (context?.config.disabled || context?.isHeaderCollapsed) {
      super(ctx, { ...options, height: 0 });
      return;
    }

    const { withBorder, zIndex, ...boxOptions } = options;
    const border =
      withBorder !== undefined
        ? withBorder
        : context?.config.withBorder || false;
    const height = context?.headerHeight || 3;
    const zIndexValue = zIndex ?? context?.zIndex ?? 100;

    super(ctx, {
      height,
      width: "100%",
      border,
      borderStyle: "single",
      flexShrink: 0,
      zIndex: zIndexValue,
      ...boxOptions,
    });
  }
}
