import { BoxRenderable, type RenderContext } from "@opentui/core";
import { getAppShellContext } from "./context";
import type { AppShellMainOptions } from "./types";

/**
 * AppShell.Main - Main content area component for AppShell
 *
 * Renders the main content area that automatically adjusts to the space
 * available after accounting for header, footer, navbar, and aside.
 *
 * @example
 * ```ts
 * const main = new AppShellMain(renderer, {
 *   padding: 1,
 * });
 * shell.add(main);
 * ```
 */
export class AppShellMain extends BoxRenderable {
  constructor(ctx: RenderContext, options: AppShellMainOptions = {}) {
    const context = getAppShellContext();

    if (context?.config.disabled) {
      super(ctx, options);
      return;
    }

    const padding = context?.padding || 0;

    super(ctx, {
      flexGrow: 1,
      flexShrink: 1,
      padding: typeof padding === "number" ? padding : 0,
      flexDirection: "column",
      ...options,
    });
  }
}
