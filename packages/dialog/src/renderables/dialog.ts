import { BoxRenderable, type RenderContext } from "@opentui/core";
import type { Dialog, DialogContainerOptions } from "../types";
import {
  type ComputedDialogStyle,
  computeDialogStyle,
  getDialogWidth,
} from "../utils";

export interface DialogRenderableOptions {
  dialog: Dialog;
  containerOptions?: DialogContainerOptions;
  onRemove?: (dialog: Dialog) => void;
}

export class DialogRenderable extends BoxRenderable {
  private _dialog: Dialog;
  private _computedStyle: ComputedDialogStyle;
  private _containerOptions?: DialogContainerOptions;
  private _onRemove?: (dialog: Dialog) => void;
  private _closed: boolean = false;
  private _revealed: boolean = false;

  constructor(ctx: RenderContext, options: DialogRenderableOptions) {
    const computedStyle = computeDialogStyle({
      dialog: options.dialog,
      containerOptions: options.containerOptions,
    });

    const isDeferred = options.dialog.deferred === true;
    const padding = computedStyle.resolvedPadding;

    const dialogWidth = getDialogWidth(
      options.dialog.size,
      options.containerOptions,
      ctx.width,
    );

    const panelWidth =
      typeof computedStyle.width === "number"
        ? computedStyle.width
        : dialogWidth;

    super(ctx, {
      id: `dialog-${options.dialog.id}`,
      position: "absolute",
      width: panelWidth,
      maxWidth: computedStyle.maxWidth ?? ctx.width - 2,
      minWidth: computedStyle.minWidth,
      maxHeight: computedStyle.maxHeight,
      backgroundColor: computedStyle.backgroundColor,
      border: computedStyle.border,
      borderColor: computedStyle.borderColor,
      borderStyle: computedStyle.borderStyle,
      paddingTop: padding.top,
      paddingRight: padding.right,
      paddingBottom: padding.bottom,
      paddingLeft: padding.left,
      visible: !isDeferred,
    });

    this._dialog = options.dialog;
    this._computedStyle = computedStyle;
    this._containerOptions = options.containerOptions;
    this._onRemove = options.onRemove;
    this._revealed = !isDeferred;

    this.createContent();
  }

  private createContent(): void {
    try {
      const contentRenderable = this._dialog.content(this.ctx);
      this.add(contentRenderable);
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

  public updateDimensions(width: number): void {
    const dialogWidth = getDialogWidth(
      this._dialog.size,
      this._containerOptions,
      width,
    );
    const panelWidth =
      typeof this._computedStyle.width === "number"
        ? this._computedStyle.width
        : dialogWidth;

    this.width = panelWidth;
    this.maxWidth = this._computedStyle.maxWidth ?? width - 2;
    this.requestRender();
  }

  /**
   * @internal Exposed for React adapter to reveal deferred dialogs
   */
  public reveal(): void {
    if (this._revealed) return;
    this._revealed = true;
    this.visible = true;
    this.requestRender();
  }

  public get isRevealed(): boolean {
    return this._revealed;
  }

  public close(): void {
    if (this._closed) return;
    this._closed = true;
    this._onRemove?.(this._dialog);
  }

  public get dialog(): Dialog {
    return this._dialog;
  }

  public get isClosed(): boolean {
    return this._closed;
  }

  public override destroy(): void {
    this._closed = true;
    super.destroy();
  }
}
