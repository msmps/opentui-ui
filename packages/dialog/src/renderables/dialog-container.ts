import { BoxRenderable, type RenderContext } from "@opentui/core";
import { mergeStyles } from "@opentui-ui/utils";
import { DIALOG_Z_INDEX } from "../constants";
import type { DialogManager } from "../manager";
import type {
  Dialog,
  DialogContainerOptions,
  DialogId,
  DialogOptions,
  DialogSize,
} from "../types";
import { isDialogToClose } from "../types";
import { BackdropRenderable } from "./backdrop";
import { DialogRenderable } from "./dialog";

export interface DialogContainerRenderableOptions
  extends DialogContainerOptions {
  manager: DialogManager;
}

export interface DialogKeyboardEvent {
  name?: string;
  preventDefault?: () => void;
}

/**
 * Container that renders dialogs from a DialogManager.
 *
 * @example
 * ```ts
 * const manager = new DialogManager(renderer);
 * const container = new DialogContainerRenderable(ctx, { manager });
 * ctx.root.add(container);
 *
 * manager.show({ content: (ctx) => new TextRenderable(ctx, { content: "Hi" }) });
 * ```
 */
export class DialogContainerRenderable extends BoxRenderable {
  private _manager: DialogManager;
  private _options: DialogContainerOptions;
  private _dialogRenderables: Map<DialogId, DialogRenderable> = new Map();
  private _backdrop: BackdropRenderable;
  private _unsubscribe: (() => void) | null = null;
  private _destroyed: boolean = false;

  constructor(ctx: RenderContext, options: DialogContainerRenderableOptions) {
    super(ctx, {
      id: "dialog-container",
      position: "absolute",
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      zIndex: DIALOG_Z_INDEX,
    });

    this._manager = options.manager;
    const { manager: _, ...containerOptions } = options;
    this._options = containerOptions;

    // Create the single container-level backdrop
    this._backdrop = new BackdropRenderable(ctx, {
      style: this._options.dialogOptions?.style,
      visible: false,
      onClick: () => this.handleBackdropClick(),
    });
    this.add(this._backdrop);

    this._ctx.keyInput.on("keypress", this.handleKeyboard);

    this.subscribe();
  }

  private subscribe(): void {
    this._unsubscribe?.();

    this._unsubscribe = this._manager.subscribe((data) => {
      if (this._destroyed) return;

      if (isDialogToClose(data)) {
        this.removeDialog(data.id);
      } else {
        this.addOrUpdateDialog(data);
      }
    });
  }

  /**
   * Handle keyboard events. Returns true if handled (e.g., ESC closed a dialog).
   */
  private handleKeyboard = (evt: DialogKeyboardEvent): boolean => {
    if (this._options.closeOnEscape === false) {
      return false;
    }

    const key = evt.name;
    if (key === "escape" && this._dialogRenderables.size > 0) {
      const topDialog = this.getTopDialogRenderable();
      if (topDialog) {
        evt.preventDefault?.();
        this._manager.close(topDialog.dialog.id);
        return true;
      }
    }

    return false;
  };

  private handleBackdropClick(): void {
    const topDialog = this.getTopDialogRenderable();
    if (!topDialog) return;

    // Call the dialog's onBackdropClick handler if present
    topDialog.dialog.onBackdropClick?.();

    // Close if closeOnClickOutside is enabled
    if (topDialog.dialog.closeOnClickOutside === true) {
      this._manager.close(topDialog.dialog.id);
    }
  }

  private getTopDialogRenderable(): DialogRenderable | undefined {
    if (this._dialogRenderables.size === 0) {
      return undefined;
    }

    const ids = Array.from(this._dialogRenderables.keys());
    const topId = ids[ids.length - 1];
    return topId !== undefined ? this._dialogRenderables.get(topId) : undefined;
  }

  public getDialogRenderable(id: DialogId): DialogRenderable | undefined {
    return this._dialogRenderables.get(id);
  }

  public getDialogRenderables(): Map<DialogId, DialogRenderable> {
    return this._dialogRenderables;
  }

  private addOrUpdateDialog(dialog: Dialog): void {
    const existing = this._dialogRenderables.get(dialog.id);

    if (existing) {
      // TODO: Support updating existing dialogs in-place
      this.removeDialog(dialog.id);
    }

    const dialogRenderable = new DialogRenderable(this.ctx, {
      dialog,
      containerOptions: this._options,
      onRemove: (d) => this.handleDialogRemoved(d),
    });

    this._dialogRenderables.set(dialog.id, dialogRenderable);
    this.add(dialogRenderable);

    this.updateBackdrop();
    this.requestRender();
  }

  /**
   * Update the container backdrop visibility and style.
   * Backdrop is visible when any dialog is open.
   * Style is determined by topmost dialog's style, falling back to container defaults.
   */
  private updateBackdrop(): void {
    const dialogs = this._manager.getDialogs();
    const hasDialogs = dialogs.length > 0;

    this._backdrop.visible = hasDialogs;

    if (hasDialogs) {
      const topDialog = dialogs[dialogs.length - 1];

      // Dialog style takes priority, falls back to container defaults
      const style = mergeStyles(
        this._options.dialogOptions?.style,
        topDialog?.style,
      );

      this._backdrop.updateStyle(style);
    }

    this._backdrop.requestRender();
  }

  private removeDialog(id: DialogId): void {
    const dialog = this._dialogRenderables.get(id);
    if (dialog) {
      dialog.close();
    }
  }

  private handleDialogRemoved(dialog: Dialog): void {
    const renderable = this._dialogRenderables.get(dialog.id);
    if (renderable) {
      this._dialogRenderables.delete(dialog.id);
      this.remove(renderable.id);
      renderable.destroy();
      this.updateBackdrop();
      this.requestRender();
    }
  }

  public updateDimensions(width: number, height?: number): void {
    // Update backdrop dimensions
    this._backdrop.updateDimensions(width, height ?? this._ctx.height);

    // Update dialog dimensions
    for (const [, renderable] of this._dialogRenderables) {
      renderable.updateDimensions(width);
    }
  }

  public set size(value: DialogSize) {
    this._options.size = value;
  }

  public set dialogOptions(value: DialogOptions) {
    this._options.dialogOptions = value;
    // Update backdrop style when options change
    this.updateBackdrop();
  }

  public set sizePresets(value: Partial<Record<DialogSize, number>>) {
    this._options.sizePresets = value;
  }

  public set closeOnEscape(value: boolean) {
    this._options.closeOnEscape = value;
  }

  public override destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    this._unsubscribe?.();
    this._unsubscribe = null;

    this._ctx.keyInput.off("keypress", this.handleKeyboard);

    this._backdrop.destroy();

    for (const [, renderable] of this._dialogRenderables) {
      renderable.destroy();
    }
    this._dialogRenderables.clear();

    super.destroy();
  }
}
