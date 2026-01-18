import { createElement, extend } from "@opentui/react";
import type { BadgeLayoutProps } from "@opentui-ui/core";
import {
  BADGE_META,
  type BadgeOptions,
  BadgeRenderable,
  type BadgeSlotStyleMap,
  type BadgeSlots,
} from "@opentui-ui/core/badge";
import { $$OtuiComponentMeta, type ComponentMeta } from "@opentui-ui/styles";
import type { ReactElement } from "react";

extend({
  "otui-badge": BadgeRenderable,
});

export type BadgeProps = BadgeOptions & BadgeLayoutProps;

interface BadgeComponent {
  (props: BadgeProps): ReactElement;
  [$$OtuiComponentMeta]: ComponentMeta<
    BadgeSlots,
    BadgeSlotStyleMap,
    typeof BADGE_META.stateKeys
  >;
}

export const Badge: BadgeComponent = Object.assign(
  function Badge({
    label,
    styles,
    styleResolver,
    ...layoutProps
  }: BadgeProps): ReactElement {
    return createElement("otui-badge", {
      label,
      styles,
      styleResolver,
      ...layoutProps,
    });
  },
  {
    [$$OtuiComponentMeta]: BADGE_META,
  },
);
