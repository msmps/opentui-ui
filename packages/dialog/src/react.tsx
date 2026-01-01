/** @jsxImportSource @opentui/react */

import { BoxRenderable, type RenderContext } from "@opentui/core";
import {
  createPortal,
  useRenderer,
  useTerminalDimensions,
} from "@opentui/react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { DEFERRED_KEY, JSX_CONTENT_KEY } from "./constants";
import { DialogManager } from "./manager";
import {
  DialogContainerRenderable,
  type DialogRenderable,
} from "./renderables";
import type {
  Dialog,
  DialogContainerOptions,
  DialogId,
  DialogShowOptions,
} from "./types";

interface DialogWithJsx extends Dialog {
  [JSX_CONTENT_KEY]?: ReactNode;
  [DEFERRED_KEY]?: boolean;
}

export interface ReactDialogShowOptions
  extends Omit<DialogShowOptions, "content"> {
  content: ReactNode;
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
  show: (options: ReactDialogShowOptions) => DialogId;
  /** Close a specific dialog by ID, or the top-most dialog if no ID provided. */
  close: (id?: DialogId) => DialogId | undefined;
  /** Close all open dialogs. */
  closeAll: () => void;
  /** Close all dialogs and show a new one. */
  replace: (options: ReactDialogShowOptions) => DialogId;
}

const DialogContext = createContext<DialogManager | null>(null);

const createPlaceholderContent = () => (ctx: RenderContext) =>
  new BoxRenderable(ctx, { id: "~jsx-placeholder" });

function useDialogManager(): DialogManager {
  const manager = useContext(DialogContext);

  if (!manager) {
    throw new Error(
      "useDialog/useDialogState must be used within a DialogProvider.\n\n" +
        "Wrap your app with <DialogProvider>:\n\n" +
        "  import { DialogProvider } from '@opentui-ui/dialog/react';\n\n" +
        "  function App() {\n" +
        "    return (\n" +
        "      <DialogProvider>\n" +
        "        <YourContent />\n" +
        "      </DialogProvider>\n" +
        "    );\n" +
        "  }",
    );
  }

  return manager;
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
 * // Show a dialog
 * dialog.show({ content: <text>Hello</text> });
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
  const manager = useDialogManager();

  return useMemo<DialogActions>(
    () => ({
      show: (options: ReactDialogShowOptions) => {
        const { content, ...rest } = options;

        return manager.show({
          ...rest,
          content: createPlaceholderContent(),
          // @ts-expect-error - Symbol keys for internal use
          [JSX_CONTENT_KEY]: content,
          [DEFERRED_KEY]: true,
        });
      },

      close: (id?: DialogId) => manager.close(id),

      closeAll: () => manager.closeAll(),

      replace: (options: ReactDialogShowOptions) => {
        const { content, ...rest } = options;

        return manager.replace({
          ...rest,
          content: createPlaceholderContent(),
          // @ts-expect-error - Symbol keys for internal use
          [JSX_CONTENT_KEY]: content,
          [DEFERRED_KEY]: true,
        });
      },
    }),
    [manager],
  );
}

/**
 * Subscribe to reactive dialog state with a selector.
 *
 * Only re-renders when the selected value changes (using reference equality).
 *
 * @example
 * ```tsx
 * // Subscribe to specific state
 * const isOpen = useDialogState(s => s.isOpen);
 * const count = useDialogState(s => s.count);
 * const topDialog = useDialogState(s => s.topDialog);
 * const dialogs = useDialogState(s => s.dialogs);
 *
 * // Use in your component
 * if (isOpen) {
 *   console.log(`${count} dialog(s) open`);
 * }
 * ```
 */
export function useDialogState<T>(selector: (state: DialogState) => T): T {
  const manager = useDialogManager();

  const subscribe = useMemo(
    () => (onStoreChange: () => void) => manager.subscribe(onStoreChange),
    [manager],
  );

  const getSnapshot = () => {
    const dialogs = manager.getDialogs();
    const state: DialogState = {
      isOpen: dialogs.length > 0,
      dialogs,
      topDialog: dialogs.length > 0 ? dialogs[dialogs.length - 1] : undefined,
      count: dialogs.length,
    };
    return selector(state);
  };

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export interface DialogProviderProps extends DialogContainerOptions {
  children: ReactNode;
}

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
export function DialogProvider(props: DialogProviderProps) {
  const { children, ...containerOptions } = props;

  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();

  const [manager] = useState(() => new DialogManager(renderer));

  const [container] = useState(
    () =>
      new DialogContainerRenderable(renderer, {
        manager,
        ...containerOptions,
      }),
  );

  useEffect(() => {
    renderer.root.add(container);
    return () => {
      container.destroy();
      renderer.root.remove(container.id);
      manager.destroy();
    };
  }, [container, manager, renderer]);

  const subscribe = useMemo(
    () => (onStoreChange: () => void) => manager.subscribe(onStoreChange),
    [manager],
  );

  const storeVersion = useSyncExternalStore(
    subscribe,
    () => manager.version,
    () => manager.version,
  );

  useEffect(() => {
    container.updateDimensions(dimensions.width);
  }, [container, dimensions.width]);

  const { portals, deferredDialogs } = useMemo(() => {
    // storeVersion is used to trigger recomputation when dialog state changes
    void storeVersion;

    const portals: ReactNode[] = [];
    const deferredDialogs: DialogRenderable[] = [];
    const dialogRenderables = container.getDialogRenderables();

    for (const [id, dialogRenderable] of dialogRenderables) {
      const dialogWithJsx = dialogRenderable.dialog as DialogWithJsx;
      const jsxContent = dialogWithJsx[JSX_CONTENT_KEY];

      if (jsxContent !== undefined) {
        if (dialogWithJsx[DEFERRED_KEY]) {
          deferredDialogs.push(dialogRenderable);
        }
        portals.push(
          createPortal(jsxContent, dialogRenderable._contentBox, id),
        );
      }
    }

    return { portals, deferredDialogs };
  }, [container, storeVersion]);

  useLayoutEffect(() => {
    for (const dialogRenderable of deferredDialogs) {
      dialogRenderable.reveal();
    }
  }, [deferredDialogs]);

  return (
    <DialogContext.Provider value={manager}>
      {children}
      {portals}
    </DialogContext.Provider>
  );
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
