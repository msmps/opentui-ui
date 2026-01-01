import type { Renderable, RenderContext } from "@opentui/core";
import type {
  Dialog,
  DialogId,
  DialogShowOptions,
  DialogToClose,
} from "./types";

type DialogSubscriber = (data: Dialog | DialogToClose) => void;

/**
 * Manages dialog state and lifecycle for a DialogContainerRenderable.
 *
 * @example
 * ```ts
 * const manager = new DialogManager(renderer);
 * const container = new DialogContainerRenderable(renderer, { manager });
 *
 * manager.show({
 *   content: (ctx) => new TextRenderable(ctx, { content: "Hello" }),
 * });
 * ```
 */
export class DialogManager {
  private dialogs: Dialog[] = [];
  private subscribers = new Set<DialogSubscriber>();
  private idCounter = 1;
  private savedFocus: Renderable | null = null;
  private ctx: RenderContext;
  private focusRestoreTimeout?: ReturnType<typeof setTimeout>;
  private destroyed = false;
  private _version = 0;

  constructor(ctx: RenderContext) {
    this.ctx = ctx;
  }

  private saveFocus(): void {
    this.savedFocus = this.ctx.currentFocusedRenderable;
    this.savedFocus?.blur();
  }

  private restoreFocus(): void {
    if (this.savedFocus && !this.savedFocus.isDestroyed) {
      // Defer to next tick to ensure dialog is fully removed from render tree
      this.focusRestoreTimeout = setTimeout(() => {
        if (
          !this.destroyed &&
          this.savedFocus &&
          !this.savedFocus.isDestroyed
        ) {
          this.savedFocus.focus();
        }
        this.savedFocus = null;
        this.focusRestoreTimeout = undefined;
      }, 1);
    } else {
      this.savedFocus = null;
    }
  }

  /** Subscribe to dialog state changes. Returns an unsubscribe function. */
  subscribe(subscriber: DialogSubscriber): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private publish(data: Dialog | DialogToClose): void {
    this._version++;
    for (const subscriber of this.subscribers) {
      try {
        subscriber(data);
      } catch (error) {
        console.error("[@opentui-ui/dialog] Subscriber threw an error:", error);
      }
    }
  }

  /**
   * Get the current state version. Increments on every state change.
   * Useful for external store integrations (e.g., React's useSyncExternalStore).
   */
  get version(): number {
    return this._version;
  }

  private addDialog(data: Dialog): void {
    this.dialogs = [...this.dialogs, data];
    this.publish(data);
  }

  /**
   * Show a new dialog.
   *
   * @example
   * ```ts
   * manager.show({
   *   content: (ctx) => new TextRenderable(ctx, { content: "Hello" }),
   *   size: "medium",
   * });
   * ```
   */
  show(options: DialogShowOptions): DialogId {
    if (this.destroyed) {
      throw new Error(
        "[@opentui-ui/dialog] Cannot show dialog: DialogManager has been destroyed.",
      );
    }

    if (options.content === undefined || options.content === null) {
      throw new Error(
        `[@opentui-ui/dialog] Missing required 'content' property.\n\n` +
          `The 'content' property must be a factory function that returns a Renderable:\n\n` +
          `  manager.show({\n` +
          `    content: (ctx) => new TextRenderable(ctx, { content: "Hello" }),\n` +
          `  });\n\n` +
          `For React, use: import { useDialog } from '@opentui-ui/dialog/react'\n` +
          `For Solid, use: import { useDialog } from '@opentui-ui/dialog/solid'`,
      );
    }

    if (typeof options.content !== "function") {
      throw new Error(
        `[@opentui-ui/dialog] Invalid 'content' type: expected function, got ${typeof options.content}.\n\n` +
          `The 'content' property must be a factory function that receives a RenderContext\n` +
          `and returns a Renderable:\n\n` +
          `  manager.show({\n` +
          `    content: (ctx) => new TextRenderable(ctx, { content: "Hello" }),\n` +
          `  });\n\n` +
          `If you're using React or Solid, make sure you're importing from\n` +
          `the correct entry point:\n` +
          `  - React: import { useDialog } from '@opentui-ui/dialog/react'\n` +
          `  - Solid: import { useDialog } from '@opentui-ui/dialog/solid'`,
      );
    }

    const id =
      options.id !== undefined && options.id !== null
        ? options.id
        : this.idCounter++;

    const existingIndex = this.dialogs.findIndex((d) => d.id === id);

    if (existingIndex !== -1) {
      const existing = this.dialogs[existingIndex];
      if (existing) {
        const updated: Dialog = { ...existing, ...options, id };
        this.dialogs = [
          ...this.dialogs.slice(0, existingIndex),
          updated,
          ...this.dialogs.slice(existingIndex + 1),
        ];
        this.publish(updated);
      }
    } else {
      if (this.dialogs.length === 0) {
        this.saveFocus();
      }

      const dialog: Dialog = {
        ...options,
        id,
        closeOnClickOutside: options.closeOnClickOutside ?? true,
      };
      this.addDialog(dialog);
      dialog.onOpen?.();
    }

    return id;
  }

  /** Close a dialog by ID, or the top-most dialog if no ID provided. */
  close(id?: DialogId): DialogId | undefined {
    let targetId: DialogId | undefined;

    if (id !== undefined) {
      targetId = id;
    } else {
      const topDialog = this.dialogs[this.dialogs.length - 1];
      targetId = topDialog?.id;
    }

    if (targetId === undefined) {
      return undefined;
    }

    const dialogIndex = this.dialogs.findIndex((d) => d.id === targetId);
    if (dialogIndex === -1) {
      return undefined;
    }

    const dialog = this.dialogs[dialogIndex];

    // Update dialogs before publishing to keep state in sync
    this.dialogs = [
      ...this.dialogs.slice(0, dialogIndex),
      ...this.dialogs.slice(dialogIndex + 1),
    ];

    this.publish({ id: targetId, close: true });

    dialog?.onClose?.();

    if (this.dialogs.length === 0) {
      this.restoreFocus();
    }

    return targetId;
  }

  /** Close all open dialogs. */
  closeAll(): void {
    const dialogsToClose = [...this.dialogs].reverse();
    for (const d of dialogsToClose) {
      this.close(d.id);
    }
  }

  /** Close all dialogs and show a new one. */
  replace(options: DialogShowOptions): DialogId {
    this.closeAll();
    return this.show(options);
  }

  /**
   * Get all active dialogs (oldest first).
   *
   * Returns a stable reference that only changes when dialogs are
   * added/removed/updated.
   */
  getDialogs(): readonly Dialog[] {
    return this.dialogs;
  }

  /** Get the top-most active dialog. */
  getTopDialog(): Dialog | undefined {
    if (this.dialogs.length === 0) {
      return undefined;
    }
    return this.dialogs[this.dialogs.length - 1];
  }

  /** Check if any dialogs are open. */
  isOpen(): boolean {
    return this.dialogs.length > 0;
  }

  /** Destroy the manager and clean up resources. */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.focusRestoreTimeout) {
      clearTimeout(this.focusRestoreTimeout);
      this.focusRestoreTimeout = undefined;
    }

    this.savedFocus = null;
    this.subscribers.clear();
    this.dialogs = [];
  }

  get isDestroyed(): boolean {
    return this.destroyed;
  }
}
