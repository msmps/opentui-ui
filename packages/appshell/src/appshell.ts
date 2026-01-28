import { BoxRenderable, type RenderContext } from "@opentui/core";
import { AppShellAside } from "./aside";
import { type AppShellContext, setAppShellContext } from "./context";
import { AppShellFooter } from "./footer";
import { AppShellHeader } from "./header";
import { AppShellMain } from "./main";
import { AppShellNavbar } from "./navbar";
import type { AppShellOptions } from "./types";

/**
 * AppShell - A layout component for terminal UIs
 *
 * Provides a structured layout with optional header, footer, navbar, aside, and main content areas.
 * Inspired by Mantine's AppShell component but adapted for terminal UIs.
 *
 * @example
 * ```ts
 * const shell = new AppShell(renderer, {
 *   header: { height: 3 },
 *   navbar: { width: 20, collapsed: false },
 *   footer: { height: 2 },
 *   padding: 1,
 *   withBorder: true,
 * });
 * ```
 */
export class AppShell extends BoxRenderable {
  private context: AppShellContext;
  private contentRow: BoxRenderable | null = null;

  static Header = AppShellHeader;
  static Navbar = AppShellNavbar;
  static Aside = AppShellAside;
  static Footer = AppShellFooter;
  static Main = AppShellMain;

  constructor(ctx: RenderContext, options: AppShellOptions = {}) {
    const {
      navbar,
      aside,
      header,
      footer,
      padding = 0,
      withBorder = false,
      layout = "default",
      disabled = false,
      zIndex = 100,
      ...boxOptions
    } = options;

    super(ctx, {
      width: "100%",
      height: "100%",
      flexDirection: layout === "alt" ? "row" : "column",
      ...boxOptions,
    });

    // Calculate dimensions based on offset property
    const headerHeight =
      header && !header.collapsed && header.offset !== false
        ? header.height
        : 0;
    const footerHeight =
      footer && !footer.collapsed && footer.offset !== false
        ? footer.height
        : 0;

    const isNavbarCollapsed = navbar?.collapsed ?? true;

    const isAsideCollapsed = aside?.collapsed ?? true;

    const navbarWidth = navbar && !isNavbarCollapsed ? navbar.width : 0;
    const asideWidth = aside && !isAsideCollapsed ? aside.width : 0;

    // Create context
    this.context = {
      config: {
        navbar,
        aside,
        header,
        footer,
        withBorder,
        layout,
        disabled,
        zIndex,
      },
      padding: typeof padding === "number" ? padding : 0,
      headerHeight,
      footerHeight,
      navbarWidth,
      asideWidth,
      isNavbarCollapsed,
      isAsideCollapsed,
      isHeaderCollapsed: header?.collapsed || false,
      isFooterCollapsed: footer?.collapsed || false,
      zIndex,
    };

    // Set global context for child components
    setAppShellContext(this.context);

    // Create content row for default layout (navbar, main, aside in a row)
    // This must be done after setting context so child components can access it
    if (layout === "default") {
      this.contentRow = new BoxRenderable(ctx, {
        flexDirection: "row",
        flexGrow: 1,
        flexShrink: 1,
        width: "100%",
      });
    }
  }

  /**
   * Override add to handle layout structure
   */
  override add(child: BoxRenderable, index?: number): number {
    // In default layout, route children based on type
    if (this.context.config.layout === "default") {
      // Header and Footer go directly to shell
      if (child instanceof AppShellHeader || child instanceof AppShellFooter) {
        return super.add(child, index);
      }

      // Navbar, Main, and Aside go into contentRow
      if (
        child instanceof AppShellNavbar ||
        child instanceof AppShellMain ||
        child instanceof AppShellAside
      ) {
        // Ensure contentRow is added to shell first
        if (this.contentRow && !this.contentRow.parent) {
          // Add contentRow after header (if exists) but before footer
          const children = this.getChildren();
          let insertIndex = 0;

          for (let i = 0; i < children.length; i++) {
            if (children[i] instanceof AppShellHeader) {
              insertIndex = i + 1;
              break;
            }
          }

          super.add(this.contentRow, insertIndex);
        }

        if (this.contentRow) {
          return this.contentRow.add(child, index);
        }
      }
    }

    return super.add(child, index);
  }

  /**
   * Get the current context
   */
  getContext(): AppShellContext {
    return this.context;
  }

  /**
   * Update configuration and recalculate layout
   */
  updateConfiguration(config: Partial<AppShellOptions>): void {
    Object.assign(this.context.config, config);

    // Recalculate dimensions
    if (config.header !== undefined) {
      this.context.headerHeight =
        config.header && !config.header.collapsed ? config.header.height : 0;
      this.context.isHeaderCollapsed = config.header?.collapsed || false;

      // Update existing header component
      const header = this.findChildByType(AppShellHeader);
      if (header) {
        header.height = this.context.headerHeight;
      }
    }

    if (config.footer !== undefined) {
      this.context.footerHeight =
        config.footer && !config.footer.collapsed ? config.footer.height : 0;
      this.context.isFooterCollapsed = config.footer?.collapsed || false;

      // Update existing footer component
      const footer = this.findChildByType(AppShellFooter);
      if (footer) {
        footer.height = this.context.footerHeight;
      }
    }

    if (config.navbar !== undefined) {
      const isCollapsed = config.navbar.collapsed ?? false;
      this.context.navbarWidth = !isCollapsed ? config.navbar.width : 0;
      this.context.isNavbarCollapsed = isCollapsed;

      // Update existing navbar component
      const navbar = this.findChildByType(AppShellNavbar);
      if (navbar) {
        navbar.width = this.context.navbarWidth;
      }
    }

    if (config.aside !== undefined) {
      const isCollapsed = config.aside.collapsed ?? false;
      this.context.asideWidth = !isCollapsed ? config.aside.width : 0;
      this.context.isAsideCollapsed = isCollapsed;

      // Update existing aside component
      const aside = this.findChildByType(AppShellAside);
      if (aside) {
        aside.width = this.context.asideWidth;
      }
    }

    setAppShellContext(this.context);
    this.requestRender();
  }

  /**
   * Find a child component by its type
   */
  private findChildByType<T>(
    // biome-ignore lint/suspicious/noExplicitAny: Constructor type requires any for flexibility
    type: new (...args: any[]) => T,
  ): T | null {
    // biome-ignore lint/suspicious/noExplicitAny: Recursive function needs flexible type
    const findInChildren = (renderable: any): T | null => {
      if (renderable instanceof type) {
        return renderable as T;
      }

      const children = renderable.getChildren?.() || [];
      for (const child of children) {
        const found = findInChildren(child);
        if (found) return found;
      }

      return null;
    };

    return findInChildren(this);
  }

  override destroy(): void {
    setAppShellContext(null);
    super.destroy();
  }
}
