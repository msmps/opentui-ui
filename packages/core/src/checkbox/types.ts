import type { Color } from "@opentui/core";
import type { StyledRenderableOptions } from "../styled-renderable";
import type { CHECKBOX_SLOTS } from "./constants";

export type CheckboxSlots = typeof CHECKBOX_SLOTS;

export interface CheckboxState {
  checked: boolean;
  focused: boolean;
  disabled: boolean;
}

export type CheckboxSlotStyleMap = {
  box: {
    color?: Color;
    backgroundColor?: Color;
    gap?: number;
  };
  mark: {
    color?: Color;
  };
  label: {
    color?: Color;
  };
};

export type CheckboxSlotStyles = CheckboxSlotStyleMap;

export type CheckboxSlotStyleResolver = (
  state: CheckboxState,
) => CheckboxSlotStyles;

export interface CheckboxSymbolSet {
  checked: string;
  unchecked: string;
}

export interface CheckboxBaseOptions
  extends StyledRenderableOptions<CheckboxState, CheckboxSlotStyles> {
  label?: string;
  symbols?: Partial<CheckboxSymbolSet>;
  styles?: CheckboxSlotStyles;
  disabled?: boolean;
  focused?: boolean;
}

export interface ControlledCheckboxOptions extends CheckboxBaseOptions {
  checked: boolean;
  defaultChecked?: never;
  onCheckedChange: (checked: boolean) => void;
}

export interface UncontrolledCheckboxOptions extends CheckboxBaseOptions {
  checked?: never;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export type CheckboxOptions =
  | ControlledCheckboxOptions
  | UncontrolledCheckboxOptions;
