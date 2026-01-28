import type { AppShellConfiguration } from "./types";

/**
 * Context shared between AppShell and its child components
 */
export interface AppShellContext {
  config: AppShellConfiguration;
  padding: number;
  headerHeight: number;
  footerHeight: number;
  navbarWidth: number;
  asideWidth: number;
  isNavbarCollapsed: boolean;
  isAsideCollapsed: boolean;
  isHeaderCollapsed: boolean;
  isFooterCollapsed: boolean;
  zIndex: number;
}

let currentContext: AppShellContext | null = null;

/**
 * Set the current AppShell context
 */
export function setAppShellContext(context: AppShellContext | null): void {
  currentContext = context;
}

/**
 * Get the current AppShell context
 */
export function getAppShellContext(): AppShellContext | null {
  return currentContext;
}

/**
 * Check if AppShell context exists
 */
export function hasAppShellContext(): boolean {
  return currentContext !== null;
}
