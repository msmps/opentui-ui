import {
  BoxRenderable,
  parseColor,
  type RenderContext,
  type RGBA,
} from "@opentui/core";
import { normalizeOpacity } from "@opentui-ui/utils";
import { DEFAULT_BACKDROP_COLOR, DEFAULT_BACKDROP_OPACITY } from "../themes";
import type { DialogContainerOptions, InternalDialog } from "../types";
import {
  type ComputedDialogStyle,
  computeDialogStyle,
  getDialogWidth,
} from "../utils";

export interface DialogRenderableOptions {
  dialog: InternalDialog;
  containerOptions: DialogContainerOptions;
  onRemove?: (dialog: InternalDialog) => void;
}

export class DialogRenderable extends BoxRenderable {
  private _dialog: InternalDialog;
  private _computedStyle: ComputedDialogStyle;
  private _containerOptions: DialogContainerOptions;
  private _onRemove?: (dialog: InternalDialog) => void;
  private _backdrop: BoxRenderable;
  private _contentBox: BoxRenderable;
  private _closed: boolean = false;
  private _revealed: boolean = false;

  constructor(ctx: RenderContext, options: DialogRenderableOptions) {
    const { dialog, containerOptions, onRemove } = options;
    const isDeferred = dialog.deferred === true;

    // Full-screen transparent container for positioning
    super(ctx, {
      id: `dialog-${dialog.id}`,
      position: "absolute",
      left: 0,
      top: 0,
      width: ctx.width,
      height: ctx.height,
      alignItems: "center",
      justifyContent: "center",
      visible: !isDeferred,
    });

    this._dialog = dialog;
    this._containerOptions = containerOptions;
    this._onRemove = onRemove;
    this._revealed = !isDeferred;

    // 1. Create backdrop (full screen overlay)
    this._backdrop = new BoxRenderable(ctx, {
      id: `dialog-backdrop-${dialog.id}`,
      position: "absolute",
      left: 0,
      top: 0,
      width: ctx.width,
      height: ctx.height,
      backgroundColor: computeBackdropColor(dialog, containerOptions),
      visible: true,
      onMouseUp: () => this.handleBackdropClick(),
    });
    this.add(this._backdrop);

    // 2. Create content box (styled dialog box)
    this._computedStyle = computeDialogStyle({ dialog, containerOptions });
    const dialogWidth = getDialogWidth(
      dialog.size,
      containerOptions,
      ctx.width,
    );
    const padding = this._computedStyle.resolvedPadding;

    const panelWidth =
      typeof this._computedStyle.width === "number"
        ? this._computedStyle.width
        : dialogWidth;

    this._contentBox = new BoxRenderable(ctx, {
      id: `dialog-content-${dialog.id}`,
      position: "absolute",
      width: panelWidth,
      maxWidth: this._computedStyle.maxWidth ?? ctx.width - 2,
      minWidth: this._computedStyle.minWidth,
      maxHeight: this._computedStyle.maxHeight,
      backgroundColor: this._computedStyle.backgroundColor,
      border: this._computedStyle.border,
      borderColor: this._computedStyle.borderColor,
      borderStyle: this._computedStyle.borderStyle,
      paddingTop: padding.top,
      paddingRight: padding.right,
      paddingBottom: padding.bottom,
      paddingLeft: padding.left,
    });
    this.add(this._contentBox);

    // 3. Add user content to content box (unless deferred)
    if (!isDeferred) {
      this.createContent();
    }
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

  private handleBackdropClick(): void {
    this._dialog.onBackdropClick?.();

    const closeOnClickOutside =
      this._dialog.closeOnClickOutside ??
      this._containerOptions.closeOnClickOutside;
    if (closeOnClickOutside === true) {
      this.close();
    }
  }

  public updateDimensions(width: number, height?: number): void {
    const h = height ?? this.ctx.height;

    // Update dialog container
    this.width = width;
    this.height = h;

    // Update backdrop
    this._backdrop.width = width;
    this._backdrop.height = h;

    // Update content box
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
   * Reveal a deferred dialog (used by framework adapters).
   * Creates content if not already created.
   */
  public reveal(): void {
    if (this._revealed) return;
    this._revealed = true;
    this.visible = true;
    this.createContent();
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

  public get dialog(): InternalDialog {
    return this._dialog;
  }

  public get isClosed(): boolean {
    return this._closed;
  }

  /**
   * Get the content box for framework adapters (portal mounting).
   */
  public get contentBox(): BoxRenderable {
    return this._contentBox;
  }

  public override destroy(): void {
    this._closed = true;
    super.destroy();
  }
}

function computeBackdropColor(
  dialog: InternalDialog,
  containerOptions: DialogContainerOptions,
): RGBA {
  const color =
    dialog.backdropColor ??
    containerOptions.backdropColor ??
    DEFAULT_BACKDROP_COLOR;
  const opacity = normalizeOpacity(
    dialog.backdropOpacity ?? containerOptions.backdropOpacity,
    DEFAULT_BACKDROP_OPACITY,
    "@opentui-ui/dialog",
  );
  const rgba = parseColor(color);
  rgba.a = opacity / 255;
  return rgba;
}
