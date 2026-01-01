import { DEFAULT_SIZE, DEFAULT_SIZES, FULL_SIZE_OFFSET } from "../constants";
import type { DialogContainerOptions, DialogSize } from "../types";

/** Get the width in columns for a dialog size preset. */
export function getDialogWidth(
  size: DialogSize | undefined,
  containerOptions?: DialogContainerOptions,
  terminalWidth?: number,
): number {
  const effectiveSize: DialogSize =
    size ?? containerOptions?.size ?? DEFAULT_SIZE;

  const customWidth = containerOptions?.sizePresets?.[effectiveSize];
  if (customWidth !== undefined && customWidth > 0) {
    return customWidth;
  }

  const defaultWidth = DEFAULT_SIZES[effectiveSize];

  if (defaultWidth === -1) {
    return terminalWidth ? terminalWidth - FULL_SIZE_OFFSET : 80;
  }

  return defaultWidth;
}
