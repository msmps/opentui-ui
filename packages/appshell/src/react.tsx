/** @jsxImportSource @opentui/react */

import { extend } from "@opentui/react";
import type { ReactNode } from "react";
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

// Add TypeScript support for OpenTUI React
declare module "@opentui/react" {
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
  children?: ReactNode;
}

/**
 * Main AppShell layout container for React.
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
  const { children, ...options } = props;
  return <app-shell {...options}>{children}</app-shell>;
}

// ============================================================================
// Header Component
// ============================================================================

export interface HeaderProps extends Omit<AppShellHeaderOptions, "context"> {
  children?: ReactNode;
}

/**
 * AppShell Header component for React.
 */
export function Header(props: HeaderProps) {
  const { children, ...options } = props;
  return <app-shell-header {...options}>{children}</app-shell-header>;
}

// ============================================================================
// Navbar Component
// ============================================================================

export interface NavbarProps extends Omit<AppShellNavbarOptions, "context"> {
  children?: ReactNode;
}

/**
 * AppShell Navbar component for React.
 */
export function Navbar(props: NavbarProps) {
  const { children, ...options } = props;
  return <app-shell-navbar {...options}>{children}</app-shell-navbar>;
}

// ============================================================================
// Aside Component
// ============================================================================

export interface AsideProps extends Omit<AppShellAsideOptions, "context"> {
  children?: ReactNode;
}

/**
 * AppShell Aside component for React.
 */
export function Aside(props: AsideProps) {
  const { children, ...options } = props;
  return <app-shell-aside {...options}>{children}</app-shell-aside>;
}

// ============================================================================
// Main Component
// ============================================================================

export interface MainProps extends Omit<AppShellMainOptions, "context"> {
  children?: ReactNode;
}

/**
 * AppShell Main content area component for React.
 */
export function Main(props: MainProps) {
  const { children, ...options } = props;
  return <app-shell-main {...options}>{children}</app-shell-main>;
}

// ============================================================================
// Footer Component
// ============================================================================

export interface FooterProps extends Omit<AppShellFooterOptions, "context"> {
  children?: ReactNode;
}

/**
 * AppShell Footer component for React.
 */
export function Footer(props: FooterProps) {
  const { children, ...options } = props;
  return <app-shell-footer {...options}>{children}</app-shell-footer>;
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
