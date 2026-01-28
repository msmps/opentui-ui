import type { BoxOptions } from "@opentui/core";

/**
 * Configuration for Navbar
 */
export interface AppShellNavbarConfiguration {
  /** Width of the navbar */
  width: number;
  /** Whether the navbar is collapsed */
  collapsed?: boolean;
}

/**
 * Configuration for Aside
 */
export interface AppShellAsideConfiguration {
  /** Width of the aside */
  width: number;
  /** Whether the aside is collapsed */
  collapsed?: boolean;
}

/**
 * Configuration for Header
 */
export interface AppShellHeaderConfiguration {
  /** Height of the header */
  height: number;
  /** Whether the header is collapsed */
  collapsed?: boolean;
  /** Controls whether AppShell.Main should be offset by this section */
  offset?: boolean;
}

/**
 * Configuration for Footer
 */
export interface AppShellFooterConfiguration {
  /** Height of the footer */
  height: number;
  /** Whether the footer is collapsed */
  collapsed?: boolean;
  /** Controls whether AppShell.Main should be offset by this section */
  offset?: boolean;
}

/**
 * Overall AppShell configuration
 */
export interface AppShellConfiguration {
  /** Navbar configuration */
  navbar?: AppShellNavbarConfiguration;
  /** Aside configuration */
  aside?: AppShellAsideConfiguration;
  /** Header configuration */
  header?: AppShellHeaderConfiguration;
  /** Footer configuration */
  footer?: AppShellFooterConfiguration;
  /** Whether to show borders on sections */
  withBorder?: boolean;
  /** Layout mode: 'default' or 'alt' */
  layout?: "default" | "alt";
  /** Whether the AppShell is disabled */
  disabled?: boolean;
  /** z-index of all sections */
  zIndex?: number;
}

/**
 * Options for the main AppShell component
 * Note: padding is inherited from BoxOptions
 */
export interface AppShellOptions extends BoxOptions, AppShellConfiguration {}

/**
 * Options for AppShell.Header
 */
export interface AppShellHeaderOptions extends BoxOptions {
  /** Whether to show border */
  withBorder?: boolean;
  /** z-index of the header */
  zIndex?: number;
}

/**
 * Options for AppShell.Navbar
 */
export interface AppShellNavbarOptions extends BoxOptions {
  /** Whether to show border */
  withBorder?: boolean;
  /** z-index of the navbar */
  zIndex?: number;
}

/**
 * Options for AppShell.Aside
 */
export interface AppShellAsideOptions extends BoxOptions {
  /** Whether to show border */
  withBorder?: boolean;
  /** z-index of the aside */
  zIndex?: number;
}

/**
 * Options for AppShell.Footer
 */
export interface AppShellFooterOptions extends BoxOptions {
  /** Whether to show border */
  withBorder?: boolean;
  /** z-index of the footer */
  zIndex?: number;
}

/**
 * Options for AppShell.Main
 */
export interface AppShellMainOptions extends BoxOptions {}
