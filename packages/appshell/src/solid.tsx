/** @jsxImportSource @opentui/solid */

import { createElement, extend, spread } from "@opentui/solid";
import type { JSX } from "solid-js";
import { AppShell as AppShellRenderable } from "./appshell";
import { AppShellAside as AppShellAsideRenderable } from "./aside";
import { AppShellFooter as AppShellFooterRenderable } from "./footer";
import { AppShellHeader as AppShellHeaderRenderable } from "./header";
import { AppShellMain as AppShellMainRenderable } from "./main";
import { AppShellNavbar as AppShellNavbarRenderable } from "./navbar";
import type {
  AppShellAsideOptions,
  AppShellConfiguration,
  AppShellFooterOptions,
  AppShellHeaderOptions,
  AppShellMainOptions,
  AppShellNavbarOptions,
  AppShellOptions,
} from "./types";

// Add TypeScript support for OpenTUI Solid
declare module "@opentui/solid" {
  interface OpenTUIComponents {
    "app-shell": typeof AppShellRenderable;
    "app-shell-header": typeof AppShellHeaderRenderable;
    "app-shell-navbar": typeof AppShellNavbarRenderable;
    "app-shell-aside": typeof AppShellAsideRenderable;
    "app-shell-main": typeof AppShellMainRenderable;
    "app-shell-footer": typeof AppShellFooterRenderable;
  }
}

// Register all AppShell components with OpenTUI
extend({
  "app-shell": AppShellRenderable,
  "app-shell-header": AppShellHeaderRenderable,
  "app-shell-navbar": AppShellNavbarRenderable,
  "app-shell-aside": AppShellAsideRenderable,
  "app-shell-main": AppShellMainRenderable,
  "app-shell-footer": AppShellFooterRenderable,
});

// Re-export types
export type {
  AppShellAsideOptions,
  AppShellConfiguration,
  AppShellFooterOptions,
  AppShellHeaderOptions,
  AppShellMainOptions,
  AppShellNavbarOptions,
  AppShellOptions,
};

// ============================================================================
// Main AppShell Component
// ============================================================================

export interface AppShellProps extends Omit<AppShellOptions, "context"> {
  children?: JSX.Element;
}

/**
 * Main AppShell layout container for Solid.
 *
 * @example
 * ```tsx
 * <AppShell layout="default">
 *   <AppShell.Header>
 *     <text>Header</text>
 *   </AppShell.Header>
 *   <AppShell.Navbar>
 *     <text>Sidebar</text>
 *   </AppShell.Navbar>
 *   <AppShell.Main>
 *     <text>Main Content</text>
 *   </AppShell.Main>
 *   <AppShell.Footer>
 *     <text>Footer</text>
 *   </AppShell.Footer>
 * </AppShell>
 * ```
 */
export function AppShellComponent(props: AppShellProps) {
  const el = createElement("app-shell");
  spread(el, props);
  return el;
}

// ============================================================================
// Header Component
// ============================================================================

export interface HeaderProps extends Omit<AppShellHeaderOptions, "context"> {
  children?: JSX.Element;
}

/**
 * AppShell Header component for Solid.
 */
export function Header(props: HeaderProps) {
  const el = createElement("app-shell-header");
  spread(el, props);
  return el;
}

// ============================================================================
// Navbar Component
// ============================================================================

export interface NavbarProps extends Omit<AppShellNavbarOptions, "context"> {
  children?: JSX.Element;
}

/**
 * AppShell Navbar component for Solid.
 */
export function Navbar(props: NavbarProps) {
  const el = createElement("app-shell-navbar");
  spread(el, props);
  return el;
}

// ============================================================================
// Aside Component
// ============================================================================

export interface AsideProps extends Omit<AppShellAsideOptions, "context"> {
  children?: JSX.Element;
}

/**
 * AppShell Aside component for Solid.
 */
export function Aside(props: AsideProps) {
  const el = createElement("app-shell-aside");
  spread(el, props);
  return el;
}

// ============================================================================
// Main Component
// ============================================================================

export interface MainProps extends Omit<AppShellMainOptions, "context"> {
  children?: JSX.Element;
}

/**
 * AppShell Main content area component for Solid.
 */
export function Main(props: MainProps) {
  const el = createElement("app-shell-main");
  spread(el, props);
  return el;
}

// ============================================================================
// Footer Component
// ============================================================================

export interface FooterProps extends Omit<AppShellFooterOptions, "context"> {
  children?: JSX.Element;
}

/**
 * AppShell Footer component for Solid.
 */
export function Footer(props: FooterProps) {
  const el = createElement("app-shell-footer");
  spread(el, props);
  return el;
}

// ============================================================================
// Export with namespaced subcomponents
// ============================================================================

export const AppShell = Object.assign(AppShellComponent, {
  Header,
  Navbar,
  Aside,
  Main,
  Footer,
});
