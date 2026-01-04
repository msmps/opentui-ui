import type { BorderStyle, Renderable, RenderContext } from "@opentui/core";

export type DialogId = string | number;

export type DialogSize = "small" | "medium" | "large" | "full";

export interface DialogStyle {
  backdropColor?: string;
  /** 0-1 (number) or "50%" (string). @default 0.59 */
  backdropOpacity?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: BorderStyle;
  border?: boolean;
  width?: number | string;
  maxWidth?: number;
  minWidth?: number;
  maxHeight?: number;
  padding?: number;
  paddingX?: number;
  paddingY?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
}

/** Factory function that creates dialog content from a RenderContext. */
export type DialogContentFactory = (ctx: RenderContext) => Renderable;

export type DialogBackdropMode = "per-dialog" | "top-only";

export interface Dialog {
  id: DialogId;
  content: DialogContentFactory;
  size?: DialogSize;
  style?: DialogStyle;
  unstyled?: boolean;
  backdropMode?: DialogBackdropMode;
  /** @default false */
  closeOnClickOutside?: boolean;
  /**
   * When true, the dialog is initially hidden until `reveal()` is called.
   * Used by framework adapters to prevent flicker when JSX content is
   * injected via portals after the dialog renderable is created.
   * @internal
   */
  deferred?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  onBackdropClick?: () => void;
}

export interface DialogToClose {
  id: DialogId;
  close: true;
}

export interface DialogShowOptions extends Omit<Dialog, "id"> {
  id?: DialogId;
}

export interface DialogOptions {
  style?: DialogStyle;
  unstyled?: boolean;
  backdropMode?: DialogBackdropMode;
}

export interface DialogContainerOptions {
  /** @default "medium" */
  size?: DialogSize;
  dialogOptions?: DialogOptions;
  sizePresets?: Partial<Record<DialogSize, number>>;
  /** @default true */
  closeOnEscape?: boolean;
  unstyled?: boolean;
  /** @default "top-only" */
  backdropMode?: DialogBackdropMode;
}

// =============================================================================
// Async Dialog Base Types
// =============================================================================
// These generic types reduce duplication between core and framework adapters.
// Framework adapters (React, Solid, etc.) extend these with their content types.

/**
 * Base options for async dialog methods (prompt, confirm, alert, choice).
 * Excludes `content` (replaced by context-specific content) and `id` (auto-generated).
 * Note: `onClose` is supported - it will be called before the Promise resolves.
 */
export interface AsyncDialogOptions
  extends Omit<DialogShowOptions, "content" | "id"> {}

/**
 * Generic base for prompt dialog options.
 * @template T The type of value the prompt resolves to.
 * @template TContent The content type (varies by adapter).
 */
export interface BasePromptOptions<T, TContent> extends AsyncDialogOptions {
  /** Content factory that receives the prompt context. */
  content: TContent;
  /** Fallback value when dialog is dismissed via ESC or backdrop click. */
  fallback?: T;
}

/**
 * Generic base for confirm dialog options.
 * @template TContent The content type (varies by adapter).
 */
export interface BaseConfirmOptions<TContent> extends AsyncDialogOptions {
  /** Content factory that receives the confirm context. */
  content: TContent;
}

/**
 * Generic base for alert dialog options.
 * @template TContent The content type (varies by adapter).
 */
export interface BaseAlertOptions<TContent> extends AsyncDialogOptions {
  /** Content factory that receives the alert context. */
  content: TContent;
}

/**
 * Generic base for choice dialog options.
 * @template TContent The content type (varies by adapter).
 */
export interface BaseChoiceOptions<TContent> extends AsyncDialogOptions {
  /** Content factory that receives the choice context. */
  content: TContent;
}

/**
 * Base interface for dialog actions returned by useDialog() hooks.
 * Contains the non-generic methods shared by all framework adapters.
 * Framework adapters extend this and add the generic prompt/confirm/alert/choice methods.
 * @template TShowOptions Options for show/replace methods.
 */
export interface BaseDialogActions<TShowOptions> {
  /** Show a new dialog and return its ID. */
  show: (options: TShowOptions) => DialogId;
  /** Close a specific dialog by ID, or the top-most dialog if no ID provided. */
  close: (id?: DialogId) => DialogId | undefined;
  /** Close all open dialogs. */
  closeAll: () => void;
  /** Close all dialogs and show a new one. */
  replace: (options: TShowOptions) => DialogId;
}

export function isDialogToClose(
  value: Dialog | DialogToClose,
): value is DialogToClose {
  return "close" in value && value.close === true;
}
