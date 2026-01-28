import { BoxRenderable, type RenderContext } from "@opentui/core";
import { getAppShellContext } from "./context";
import type { AppShellNavbarOptions } from "./types";

/**
 * AppShell.Navbar - Sidebar navigation component for AppShell
 *
 * Renders a left sidebar for navigation in the AppShell layout.
 *
 * @example
 * ```ts
 * const navbar = new AppShellNavbar(renderer, {
 *   withBorder: true,
 *   backgroundColor: "#16161e",
 * });
 * shell.add(navbar);
 * ```
 */
export class AppShellNavbar extends BoxRenderable {
  constructor(ctx: RenderContext, options: AppShellNavbarOptions = {}) {
    const context = getAppShellContext();

    if (context?.config.disabled || context?.isNavbarCollapsed) {
      super(ctx, { ...options, width: 0 });
      return;
    }

    const { withBorder, zIndex, ...boxOptions } = options;
    const border =
      withBorder !== undefined
        ? withBorder
        : context?.config.withBorder || false;
    const width = context?.navbarWidth || 20;
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
