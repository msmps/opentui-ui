import { createElement, extend } from "@opentui/react";
import type { CheckboxLayoutProps } from "@opentui-ui/core";
import {
  CHECKBOX_META,
  type CheckboxBaseOptions,
  CheckboxRenderable,
  type CheckboxSlotStyleMap,
  type CheckboxSlots,
} from "@opentui-ui/core/checkbox";
import { $$OtuiComponentMeta, type ComponentMeta } from "@opentui-ui/styles";
import type { ReactElement } from "react";

extend({
  "otui-checkbox": CheckboxRenderable,
});

export type CheckboxProps = CheckboxBaseOptions & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & CheckboxLayoutProps;

interface CheckboxComponent {
  (props: CheckboxProps): ReactElement;
  [$$OtuiComponentMeta]: ComponentMeta<
    CheckboxSlots,
    CheckboxSlotStyleMap,
    typeof CHECKBOX_META.stateKeys
  >;
}

export const Checkbox: CheckboxComponent = Object.assign(
  function Checkbox({
    checked,
    defaultChecked,
    onCheckedChange,
    focused,
    disabled,
    label,
    symbols,
    styles,
    styleResolver,
    ...layoutProps
  }: CheckboxProps): ReactElement {
    return createElement("otui-checkbox", {
      checked,
      defaultChecked,
      onCheckedChange,
      focused,
      disabled,
      label,
      symbols,
      styles,
      styleResolver,
      ...layoutProps,
    });
  },
  {
    [$$OtuiComponentMeta]: CHECKBOX_META,
  },
);
