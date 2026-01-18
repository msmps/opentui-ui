import type { JSX } from "@opentui/solid";
import { createElement, extend, spread } from "@opentui/solid";
import type { BadgeLayoutProps } from "@opentui-ui/core";
import {
  BADGE_META,
  type BadgeOptions,
  BadgeRenderable,
  type BadgeSlotStyleMap,
  type BadgeSlots,
} from "@opentui-ui/core/badge";
import { $$OtuiComponentMeta, type ComponentMeta } from "@opentui-ui/styles";
import { splitProps } from "solid-js";

extend({
  "otui-badge": BadgeRenderable,
});

export type BadgeProps = BadgeOptions & BadgeLayoutProps;

interface BadgeComponent {
  (props: BadgeProps): JSX.Element;
  [$$OtuiComponentMeta]: ComponentMeta<
    BadgeSlots,
    BadgeSlotStyleMap,
    typeof BADGE_META.stateKeys
  >;
}

export const Badge: BadgeComponent = Object.assign(
  function Badge(props: BadgeProps): JSX.Element {
    const [local, layoutProps] = splitProps(props, [
      "label",
      "styles",
      "styleResolver",
    ]);

    const el = createElement("otui-badge");

    spread(el, {
      get label() {
        return local.label;
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
    [$$OtuiComponentMeta]: BADGE_META,
  },
);
