/** @jsxImportSource @opentui/solid */

import { BoxRenderable, type RenderContext } from "@opentui/core";
import {
  createComponent,
  Portal,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/solid";
import {
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  type ParentProps,
  useContext,
} from "solid-js";
import { JSX_CONTENT_KEY } from "./constants";
import { DialogManager } from "./manager";
import { DialogContainerRenderable } from "./renderables";
import type {
  Dialog,
  DialogContainerOptions,
  DialogId,
  DialogShowOptions,
  DialogToClose,
} from "./types";

/** Function returning JSX. Required because Solid JSX is eagerly evaluated. */
export type ContentAccessor = () => JSX.Element;

interface DialogWithJsx extends Dialog {
  [JSX_CONTENT_KEY]?: ContentAccessor;
}

interface PortalItem {
  id: string | number;
  contentAccessor: ContentAccessor;
  mount: BoxRenderable;
}

export interface SolidDialogShowOptions
  extends Omit<DialogShowOptions, "content"> {
  /** Must be a function returning JSX: `() => <text>Hi</text>` */
  content: ContentAccessor;
}

/**
 * Dialog state available via useDialogState selector.
 */
export interface DialogState {
  /** Whether any dialog is currently open. */
  isOpen: boolean;
  /** Array of all active dialogs (oldest first). */
  dialogs: readonly Dialog[];
  /** The top-most (most recent) dialog, or undefined if none. */
  topDialog: Dialog | undefined;
  /** Number of currently open dialogs. */
  count: number;
}

/**
 * Dialog actions for showing, closing, and managing dialogs.
 */
export interface DialogActions {
  /** Show a new dialog and return its ID. */
  show: (options: SolidDialogShowOptions) => DialogId;
  /** Close a specific dialog by ID, or the top-most dialog if no ID provided. */
  close: (id?: DialogId) => DialogId | undefined;
  /** Close all open dialogs. */
  closeAll: () => void;
  /** Close all dialogs and show a new one. */
  replace: (options: SolidDialogShowOptions) => DialogId;
}

interface DialogContextValue {
  manager: DialogManager;
  dialogs: Accessor<readonly Dialog[]>;
}

const DialogContext = createContext<DialogContextValue>();

const createPlaceholderContent = () => (ctx: RenderContext) =>
  new BoxRenderable(ctx, { id: "~jsx-placeholder" });

function validateContentAccessor(
  content: unknown,
): asserts content is ContentAccessor {
  if (typeof content !== "function") {
    throw new Error(
      `[@opentui-ui/dialog/solid] Invalid content type: expected a function returning JSX, but received ${typeof content}.\n\n` +
        `Solid.js JSX is eagerly evaluated, so you must wrap content in a function:\n\n` +
        `  // CORRECT\n` +
        `  dialog.show({ content: () => <text>Hello</text> })\n\n` +
        `  // WRONG - JSX evaluated immediately, before dialog context exists\n` +
        `  dialog.show({ content: <text>Hello</text> })\n\n` +
        `See: https://github.com/msmps/opentui-ui for more information.`,
    );
  }
}

function useDialogContext(): DialogContextValue {
  const ctx = useContext(DialogContext);

  if (!ctx) {
    throw new Error(
      "useDialog/useDialogState must be used within a DialogProvider.\n\n" +
        "Wrap your app with <DialogProvider>:\n\n" +
        "  import { DialogProvider } from '@opentui-ui/dialog/solid';\n\n" +
        "  function App() {\n" +
        "    return (\n" +
        "      <DialogProvider>\n" +
        "        <YourContent />\n" +
        "      </DialogProvider>\n" +
        "    );\n" +
        "  }",
    );
  }

  return ctx;
}

/**
 * Access dialog actions within a DialogProvider.
 *
 * For reactive state, use `useDialogState()` instead.
 *
 * @example
 * ```tsx
 * const dialog = useDialog();
 *
 * // Show a dialog (content must be a function returning JSX)
 * dialog.show({ content: () => <text>Hello</text> });
 *
 * // Close the top dialog
 * dialog.close();
 *
 * // Close a specific dialog
 * dialog.close(dialogId);
 *
 * // Close all dialogs
 * dialog.closeAll();
 * ```
 */
export function useDialog(): DialogActions {
  const { manager } = useDialogContext();

  return {
    show: (options: SolidDialogShowOptions) => {
      const { content, ...rest } = options;
      validateContentAccessor(content);

      return manager.show({
        ...rest,
        content: createPlaceholderContent(),
        [JSX_CONTENT_KEY]: content,
      } as Dialog);
    },

    close: (id?: DialogId) => manager.close(id),
    closeAll: () => manager.closeAll(),

    replace: (options: SolidDialogShowOptions) => {
      const { content, ...rest } = options;
      validateContentAccessor(content);

      return manager.replace({
        ...rest,
        content: createPlaceholderContent(),
        [JSX_CONTENT_KEY]: content,
      } as Dialog);
    },
  };
}

/**
 * Subscribe to reactive dialog state with a selector.
 *
 * Returns an accessor that tracks in effects/memos. The selector
 * is called inside a memo, so only the selected value is tracked.
 *
 * @example
 * ```tsx
 * // Subscribe to specific state - returns an accessor
 * const isOpen = useDialogState(s => s.isOpen);
 * const count = useDialogState(s => s.count);
 * const topDialog = useDialogState(s => s.topDialog);
 * const dialogs = useDialogState(s => s.dialogs);
 *
 * // Use in effects - tracks automatically
 * createEffect(() => {
 *   if (isOpen()) {
 *     console.log(`${count()} dialog(s) open`);
 *   }
 * });
 *
 * // Use in JSX - tracks automatically
 * <Show when={isOpen()}>
 *   <text>{count()} dialogs open</text>
 * </Show>
 * ```
 */
export function useDialogState<T>(
  selector: (state: DialogState) => T,
): Accessor<T> {
  const { dialogs } = useDialogContext();

  return createMemo(() => {
    const d = dialogs();
    const state: DialogState = {
      isOpen: d.length > 0,
      dialogs: d,
      topDialog: d.length > 0 ? d[d.length - 1] : undefined,
      count: d.length,
    };
    return selector(state);
  });
}

export interface DialogProviderProps extends DialogContainerOptions {}

/**
 * Provides dialog functionality to children via useDialog() and useDialogState() hooks.
 *
 * @example
 * ```tsx
 * <DialogProvider size="medium">
 *   <App />
 * </DialogProvider>
 * ```
 */
export function DialogProvider(props: ParentProps<DialogProviderProps>) {
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();

  const manager = new DialogManager(renderer);

  const container = new DialogContainerRenderable(renderer, {
    manager,
    size: props.size,
    dialogOptions: props.dialogOptions,
    sizePresets: props.sizePresets,
    closeOnEscape: props.closeOnEscape,
  });
  renderer.root.add(container);

  // Reactive signal for dialog state - drives both useDialogState() reactivity and portal rendering
  const [dialogs, setDialogs] = createSignal<readonly Dialog[]>([]);

  let disposed = false;

  // Cache maintains stable references for <For> to preserve component state
  const portalItemCache = new Map<string | number, PortalItem>();

  // Bridge renderable layer to Solid's reactive system
  const unsubscribe = manager.subscribe((_data: Dialog | DialogToClose) => {
    queueMicrotask(() => {
      if (!disposed) {
        setDialogs(manager.getDialogs());
      }
    });
  });

  onCleanup(() => {
    disposed = true;
    unsubscribe();
    portalItemCache.clear();
    container.destroy();
    renderer.root.remove(container.id);
    manager.destroy();
  });

  createEffect(() => {
    const dims = dimensions();
    container.updateDimensions(dims.width);
  });

  const portalItems = createMemo((): PortalItem[] => {
    // Track dialogs signal to update when dialogs change
    dialogs();

    const items: PortalItem[] = [];
    const dialogRenderables = container.getDialogRenderables();

    for (const [id, dialogRenderable] of dialogRenderables) {
      const dialogWithJsx = dialogRenderable.dialog as DialogWithJsx;
      const contentAccessor = dialogWithJsx[JSX_CONTENT_KEY];

      if (contentAccessor !== undefined) {
        const cached = portalItemCache.get(id);
        const shouldUpdateCachedItem =
          !cached || cached.mount !== dialogRenderable._contentBox;

        const item: PortalItem = shouldUpdateCachedItem
          ? { id, contentAccessor, mount: dialogRenderable._contentBox }
          : cached;

        if (shouldUpdateCachedItem) {
          portalItemCache.set(id, item);
        }

        items.push(item);
      }
    }

    return items;
  });

  createEffect(() => {
    // Track dialogs signal to clean cache when dialogs close
    dialogs();

    const dialogRenderables = container.getDialogRenderables();
    const activeIds = new Set(dialogRenderables.keys());

    for (const id of portalItemCache.keys()) {
      if (!activeIds.has(id)) {
        portalItemCache.delete(id);
      }
    }
  });

  // Context value includes both manager and reactive dialogs signal
  const contextValue: DialogContextValue = { manager, dialogs };

  // TODO! Refactor to JSX once @opentui/solid 'jsx' exports are fixed!
  return createComponent(DialogContext.Provider, {
    value: contextValue,
    get children() {
      return [
        // original {props.children}
        props.children,

        createComponent(For, {
          get each() {
            return portalItems();
          },
          children: (item: PortalItem) =>
            createComponent(Portal, {
              mount: item.mount,
              get children() {
                return item.contentAccessor();
              },
            }),
        }),
      ];
    },
  });
}

export { DialogManager } from "./manager";
export type {
  Dialog,
  DialogContainerOptions,
  DialogContentFactory,
  DialogId,
  DialogShowOptions,
  DialogSize,
  DialogStyle,
  DialogToClose,
} from "./types";
