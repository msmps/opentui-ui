import {
  BoxRenderable,
  hexToRgb,
  type RenderContext,
  RGBA,
} from "@opentui/core";
import {
  mergeStyles,
  normalizeOpacity,
  resolvePadding,
} from "@opentui-ui/utils";
import {
  DEFAULT_DIALOG_OPTIONS,
  DEFAULT_DIALOG_STYLE,
  DEFERRED_KEY,
} from "../constants";
import type { Dialog, DialogContainerOptions, DialogStyle } from "../types";
import { getDialogWidth } from "../utils";

interface DialogWithDeferred extends Dialog {
  [DEFERRED_KEY]?: boolean;
}

export interface DialogRenderableOptions {
  dialog: Dialog;
  containerOptions?: DialogContainerOptions;
  onRemove?: (dialog: Dialog) => void;
  onBackdropClick?: () => void;
}

export class DialogRenderable extends BoxRenderable {
  private _dialog: Dialog;
  private _computedStyle: DialogStyle;
  private _containerOptions?: DialogContainerOptions;
  private __contentBox: BoxRenderable;
  private _onRemove?: (dialog: Dialog) => void;
  private _onBackdropClick?: () => void;
  private _closed: boolean = false;
  private _revealed: boolean = false;

  constructor(ctx: RenderContext, options: DialogRenderableOptions) {
    const computedStyle = mergeStyles(
      DEFAULT_DIALOG_OPTIONS.style,
      options.containerOptions?.dialogOptions?.style,
      options.dialog.style,
    );

    const backdropColor = computedStyle.backdropColor
      ? hexToRgb(computedStyle.backdropColor)
      : RGBA.fromInts(0, 0, 0, 255);
    const backdropOpacity = normalizeOpacity(
      computedStyle.backdropOpacity,
      DEFAULT_DIALOG_STYLE.backdropOpacity,
      "@opentui-ui/dialog",
    );

    const isDeferred =
      (options.dialog as DialogWithDeferred)[DEFERRED_KEY] === true;

    super(ctx, {
      id: `dialog-${options.dialog.id}`,
      position: "absolute",
      left: 0,
      top: 0,
      width: ctx.width,
      height: ctx.height,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: RGBA.fromValues(
        backdropColor.r,
        backdropColor.g,
        backdropColor.b,
        backdropOpacity / 255,
      ),
      onMouseUp: () => this.handleBackdropClick(),
      visible: !isDeferred,
    });

    this._dialog = options.dialog;
    this._computedStyle = computedStyle;
    this._containerOptions = options.containerOptions;
    this._onRemove = options.onRemove;
    this._onBackdropClick = options.onBackdropClick;
    this._revealed = !isDeferred;

    this.__contentBox = this.createContentPanel();
    this.add(this.__contentBox);
    this.createContent();
  }

  private createContentPanel(): BoxRenderable {
    const style = this._computedStyle;
    const padding = resolvePadding(style, {
      top: 1,
      right: 2,
      bottom: 1,
      left: 2,
    });

    const dialogWidth = getDialogWidth(
      this._dialog.size,
      this._containerOptions,
      this._ctx.width,
    );

    const panelWidth =
      typeof style.width === "number" ? style.width : dialogWidth;

    const panel = new BoxRenderable(this.ctx, {
      id: `${this.id}-content`,
      width: panelWidth,
      maxWidth: style.maxWidth ?? this._ctx.width - 2,
      minWidth: style.minWidth,
      maxHeight: style.maxHeight,
      backgroundColor: style.backgroundColor,
      border: style.border,
      borderColor: style.borderColor,
      borderStyle: style.borderStyle,
      paddingTop: padding.top,
      paddingRight: padding.right,
      paddingBottom: padding.bottom,
      paddingLeft: padding.left,
      onMouseUp: (e) => e.stopPropagation(),
    });

    return panel;
  }

  private createContent(): void {
    try {
      const contentRenderable = this._dialog.content(this.ctx);
      this.__contentBox.add(contentRenderable);
    } catch (error) {
      const dialogId = this._dialog.id;
      const originalMessage =
        error instanceof Error ? error.message : String(error);
      const originalStack = error instanceof Error ? error.stack : undefined;

      const enhancedError = new Error(
        `[@opentui-ui/dialog] Failed to create content for dialog "${dialogId}".\n\n` +
          `Root cause: ${originalMessage}\n\n` +
          `This error occurred while executing the content factory function. ` +
          `Check that your content factory returns a valid Renderable and doesn't throw.\n\n` +
          `Example of a valid content factory:\n` +
          `  content: (ctx) => new TextRenderable(ctx, { content: "Hello" })`,
      );

      if (originalStack) {
        enhancedError.stack = `${enhancedError.message}\n\nOriginal stack trace:\n${originalStack}`;
      }

      throw enhancedError;
    }
  }

  private handleBackdropClick(): void {
    if (this._closed) return;

    this._dialog.onBackdropClick?.();

    if (this._dialog.closeOnClickOutside !== false) {
      this._onBackdropClick?.();
    }
  }

  public updateDimensions(width: number): void {
    this.width = width;

    const dialogWidth = getDialogWidth(
      this._dialog.size,
      this._containerOptions,
      width,
    );
    const panelWidth =
      typeof this._computedStyle.width === "number"
        ? this._computedStyle.width
        : dialogWidth;
    this.__contentBox.width = panelWidth;
    this.__contentBox.maxWidth = this._computedStyle.maxWidth ?? width - 2;

    this.requestRender();
  }

  public reveal(): void {
    if (this._revealed) return;
    this._revealed = true;
    this.visible = true;
    this.requestRender();
  }

  public close(): void {
    if (this._closed) return;
    this._closed = true;
    this._onRemove?.(this._dialog);
  }

  public get dialog(): Dialog {
    return this._dialog;
  }

  /** @internal For framework portal rendering */
  public get _contentBox(): BoxRenderable {
    return this.__contentBox;
  }

  public get isClosed(): boolean {
    return this._closed;
  }

  public override destroy(): void {
    this._closed = true;
    super.destroy();
  }
}
