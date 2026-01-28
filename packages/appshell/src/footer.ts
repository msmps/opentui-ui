import { BoxRenderable, type RenderContext } from "@opentui/core";
import { getAppShellContext } from "./context";
import type { AppShellFooterOptions } from "./types";

/**
 * AppShell.Footer - Footer component for AppShell
 *
 * Renders a footer section at the bottom of the AppShell layout.
 *
 * @example
 * ```ts
 * const footer = new AppShellFooter(renderer, {
 *   withBorder: true,
 *   backgroundColor: "#1a1b26",
 * });
 * shell.add(footer);
 * ```
 */
export class AppShellFooter extends BoxRenderable {
  constructor(ctx: RenderContext, options: AppShellFooterOptions = {}) {
    const context = getAppShellContext();

    if (context?.config.disabled || context?.isFooterCollapsed) {
      super(ctx, { ...options, height: 0 });
      return;
    }

    const { withBorder, zIndex, ...boxOptions } = options;
    const border =
      withBorder !== undefined
        ? withBorder
        : context?.config.withBorder || false;
    const height = context?.footerHeight || 2;
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
