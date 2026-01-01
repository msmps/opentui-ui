import { BoxRenderable, type RenderContext } from "@opentui/core";

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

    this._ctx.keyInput.on("keypress", (key) => this.handleKeyboard(key));

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
  private handleKeyboard(evt: DialogKeyboardEvent): boolean {
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
      onBackdropClick: () => this._manager.close(dialog.id),
    });

    this._dialogRenderables.set(dialog.id, dialogRenderable);
    this.add(dialogRenderable);
    this.requestRender();
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
      this.requestRender();
    }
  }

  public updateDimensions(width: number): void {
    for (const [, renderable] of this._dialogRenderables) {
      renderable.updateDimensions(width);
    }
  }

  public set size(value: DialogSize) {
    this._options.size = value;
  }

  public set dialogOptions(value: DialogOptions) {
    this._options.dialogOptions = value;
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

    this._ctx.keyInput.off("keypress", (key) => this.handleKeyboard(key));

    for (const [, renderable] of this._dialogRenderables) {
      renderable.destroy();
    }
    this._dialogRenderables.clear();

    super.destroy();
  }
}
