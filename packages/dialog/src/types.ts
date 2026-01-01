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

export interface Dialog {
  id: DialogId;
  content: DialogContentFactory;
  size?: DialogSize;
  style?: DialogStyle;
  /** @default true */
  closeOnClickOutside?: boolean;
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
}

export interface DialogContainerOptions {
  /** @default "medium" */
  size?: DialogSize;
  dialogOptions?: DialogOptions;
  sizePresets?: Partial<Record<DialogSize, number>>;
  /** @default true */
  closeOnEscape?: boolean;
}

export function isDialogToClose(
  value: Dialog | DialogToClose,
): value is DialogToClose {
  return "close" in value && value.close === true;
}
