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
  private _contentBox: BoxRenderable;
  private _onRemove?: (dialog: Dialog) => void;
  private _closed: boolean = false;
  private _revealed: boolean = false;

  constructor(ctx: RenderContext, options: DialogRenderableOptions) {
    const computedStyle = computeDialogStyle({
      dialog: options.dialog,
      containerOptions: options.containerOptions,
    });

    const isDeferred = options.dialog.deferred === true;

    super(ctx, {
      id: `dialog-${options.dialog.id}`,
      position: "absolute",
      left: 0,
      top: 0,
      width: ctx.width,
      height: ctx.height,
      alignItems: "center",
      justifyContent: "center",
      visible: !isDeferred,
    });

    this._dialog = options.dialog;
    this._computedStyle = computedStyle;
    this._containerOptions = options.containerOptions;
    this._onRemove = options.onRemove;
    this._revealed = !isDeferred;

    this._contentBox = this.createContentPanel();
    this.add(this._contentBox);
    this.createContent();
  }

  private createContentPanel(): BoxRenderable {
    const style = this._computedStyle;
    const padding = style.resolvedPadding;

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
      this._contentBox.add(contentRenderable);
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
    this._contentBox.width = panelWidth;
    this._contentBox.maxWidth = this._computedStyle.maxWidth ?? width - 2;

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

  /** @internal For framework portal rendering */
  public get contentBox(): BoxRenderable {
    return this._contentBox;
  }

  public get isClosed(): boolean {
    return this._closed;
  }

  public override destroy(): void {
    this._closed = true;
    super.destroy();
  }
}
