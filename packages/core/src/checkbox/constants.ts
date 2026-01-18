import type {
  CheckboxOptions,
  CheckboxSlotStyleMap,
  CheckboxSymbolSet,
} from "./types";

export const CHECKBOX_SLOTS = ["box", "mark", "label"] as const;

export const CHECKBOX_SLOT_STYLE_MAP: CheckboxSlotStyleMap = {
  box: {},
  mark: {},
  label: {},
};

export const CHECKBOX_SYMBOLS = {
  CIRCLE: { checked: "◉", unchecked: "○" },
  BALLOT: { checked: "☑", unchecked: "☐" },
  CHECK: { checked: "✓", unchecked: "○" },
  ASCII: { checked: "[x]", unchecked: "[ ]" },
  SQUARE: { checked: "■", unchecked: "□" },
} as const satisfies Record<string, CheckboxSymbolSet>;

export const DEFAULT_CHECKBOX_OPTIONS = {
  label: "",
  checked: false,
  symbols: CHECKBOX_SYMBOLS.CIRCLE,
} as const satisfies Partial<CheckboxOptions>;
