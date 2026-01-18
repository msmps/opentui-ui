import type { JSX } from "@opentui/solid";
import { createElement, extend, spread } from "@opentui/solid";
import type { CheckboxLayoutProps } from "@opentui-ui/core";
import {
  CHECKBOX_META,
  type CheckboxBaseOptions,
  CheckboxRenderable,
  type CheckboxSlotStyleMap,
  type CheckboxSlots,
} from "@opentui-ui/core/checkbox";
import { $$OtuiComponentMeta, type ComponentMeta } from "@opentui-ui/styles";
import { splitProps } from "solid-js";

extend({
  "otui-checkbox": CheckboxRenderable,
});

export type CheckboxProps = CheckboxBaseOptions & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & CheckboxLayoutProps;

interface CheckboxComponent {
  (props: CheckboxProps): JSX.Element;
  [$$OtuiComponentMeta]: ComponentMeta<
    CheckboxSlots,
    CheckboxSlotStyleMap,
    typeof CHECKBOX_META.stateKeys
  >;
}

export const Checkbox: CheckboxComponent = Object.assign(
  function Checkbox(props: CheckboxProps): JSX.Element {
    const [local, layoutProps] = splitProps(props, [
      "checked",
      "defaultChecked",
      "onCheckedChange",
      "focused",
      "disabled",
      "label",
      "symbols",
      "styles",
      "styleResolver",
    ]);

    const el = createElement("otui-checkbox");

    spread(el, {
      get checked() {
        return local.checked;
      },
      get defaultChecked() {
        return local.defaultChecked;
      },
      get onCheckedChange() {
        return local.onCheckedChange;
      },
      get focused() {
        return local.focused;
      },
      get disabled() {
        return local.disabled;
      },
      get label() {
        return local.label;
      },
      get symbols() {
        return local.symbols;
      },
      get styles() {
        return local.styles;
      },
      get styleResolver() {
        return local.styleResolver;
      },
    });

    spread(el, layoutProps);

    return el;
  },
  {
    [$$OtuiComponentMeta]: CHECKBOX_META,
  },
);
