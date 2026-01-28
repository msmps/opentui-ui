import { BoxRenderable, type RenderContext } from "@opentui/core";
import { getAppShellContext } from "./context";
import type { AppShellAsideOptions } from "./types";

/**
 * AppShell.Aside - Right sidebar component for AppShell
 *
 * Renders a right sidebar in the AppShell layout.
 *
 * @example
 * ```ts
 * const aside = new AppShellAside(renderer, {
 *   withBorder: true,
 *   backgroundColor: "#16161e",
 * });
 * shell.add(aside);
 * ```
 */
export class AppShellAside extends BoxRenderable {
  constructor(ctx: RenderContext, options: AppShellAsideOptions = {}) {
    const context = getAppShellContext();

    if (context?.config.disabled || context?.isAsideCollapsed) {
      super(ctx, { ...options, width: 0 });
      return;
    }

    const { withBorder, zIndex, ...boxOptions } = options;
    const border =
      withBorder !== undefined
        ? withBorder
        : context?.config.withBorder || false;
    const width = context?.asideWidth || 20;
    const zIndexValue = zIndex ?? context?.zIndex ?? 100;

    const layout = context?.config.layout || "default";

    super(ctx, {
      width,
      height: layout === "alt" ? "100%" : undefined,
      flexGrow: 0,
      flexShrink: 0,
      border,
      borderStyle: "single",
      flexDirection: "column",
      zIndex: zIndexValue,
      ...boxOptions,
    });
  }
}
