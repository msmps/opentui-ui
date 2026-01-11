import type { BorderStyle, Renderable, RenderContext } from "@opentui/core";
import { JSX_CONTENT_KEY } from "./constants";

export type DialogId = string | number;

export type DialogSize = "small" | "medium" | "large" | "full";

export interface DialogStyle {
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

export interface Dialog {
  id: DialogId;
  content: DialogContentFactory;
  size?: DialogSize;
  style?: DialogStyle;
  unstyled?: boolean;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default false */
  closeOnClickOutside?: boolean;
  /** Per-dialog backdrop color override. */
  backdropColor?: string;
  /** Per-dialog backdrop opacity override. 0-1 (number) or "50%" (string). */
  backdropOpacity?: number | string;
  onClose?: () => void;
  onOpen?: () => void;
  onBackdropClick?: () => void;
}

/**
 * Internal dialog type with adapter-specific properties.
 * Used by React for deferred visibility.
 * @internal
 */
export interface InternalDialog extends Dialog {
  /** @internal Used by React/Solid bindings to store JSX portal content. */
  [JSX_CONTENT_KEY]?: unknown;
  /**
   * When true, the dialog is initially hidden until visibility is updated.
   * Used by adapter(s) to prevent flicker when JSX content is
   * injected via portals after the dialog renderable is created.
   */
  deferred?: boolean;
}

export interface DialogToClose {
  id: DialogId;
  close: true;
}

export interface DialogShowOptions extends Omit<Dialog, "id"> {
  id?: DialogId;
}

export interface InternalDialogShowOptions extends Omit<InternalDialog, "id"> {
  id?: DialogId;
}

export interface DialogOptions {
  style?: DialogStyle;
}

export interface DialogContainerOptions {
  /** @default "medium" */
  size?: DialogSize;
  dialogOptions?: DialogOptions;
  sizePresets?: Partial<Record<DialogSize, number>>;
  /** @default true */
  closeOnEscape?: boolean;
  /** @default false */
  closeOnClickOutside?: boolean;
  /** @default "#000000" */
  backdropColor?: string;
  /** 0-1 (number) or "50%" (string). @default 0.35 */
  backdropOpacity?: number | string;
  unstyled?: boolean;
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
  /** Fallback value when dialog is dismissed via ESC or backdrop click. @default false */
  fallback?: boolean;
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
 * @template K The type of keys for the available choices.
 */
export interface BaseChoiceOptions<TContent, K = unknown>
  extends AsyncDialogOptions {
  /** Content factory that receives the choice context. */
  content: TContent;
  /** Fallback value when dialog is dismissed via ESC or backdrop click. @default undefined */
  fallback?: K;
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
  value: Dialog | DialogToClose | DialogUpdated,
): value is DialogToClose {
  return "close" in value && value.close === true;
}

// =============================================================================
// Context Dialog Types
// =============================================================================
// Context dialogs are pre-registered dialog templates that can be opened by name.

/**
 * Props passed to context dialog content factories.
 * @template T The type of innerProps passed when opening the dialog.
 */
export interface ContextDialogProps<T = Record<string, unknown>> {
  /** Custom props passed when opening this context dialog. */
  innerProps: T;
  /** The dialog ID for this dialog. */
  dialogId: DialogId;
  /** Close this dialog. */
  close: () => void;
}

/**
 * Factory function for creating context dialog content.
 * @template T The type of innerProps passed when opening the dialog.
 */
export type ContextDialogFactory<T = Record<string, unknown>> = (
  ctx: RenderContext,
  props: ContextDialogProps<T>,
) => Renderable;

/**
 * Options for opening a context dialog.
 * @template T The type of innerProps for the context dialog.
 */
export interface OpenContextDialogOptions<T = Record<string, unknown>>
  extends AsyncDialogOptions {
  /** Custom props to pass to the context dialog. */
  innerProps: T;
}

/**
 * Payload for updating an existing dialog's props.
 */
export interface DialogUpdatePayload extends Partial<DialogShowOptions> {
  /** ID of the dialog to update. */
  id: DialogId;
}

/**
 * Event published when a dialog is updated.
 */
export interface DialogUpdated {
  id: DialogId;
  updated: true;
}

export function isDialogUpdated(
  value: Dialog | DialogToClose | DialogUpdated,
): value is DialogUpdated {
  return "updated" in value && value.updated === true;
}
