import type { Color } from "@opentui/core";
import type { StyledRenderableOptions } from "../styled-renderable";
import type { BADGE_SLOTS } from "./constants";

export type BadgeSlots = typeof BADGE_SLOTS;

export type BadgeState = Record<string, never>;

export interface ColorProps {
  fg?: Color;
  bg?: Color;
}

export interface PaddingProps {
  paddingX?: number;
  paddingY?: number;
}

export type BadgeSlotStyleMap = {
  root: ColorProps & PaddingProps;
};

export type BadgeSlotStyles = BadgeSlotStyleMap;

export type BadgeSlotStyleResolver = (state: BadgeState) => BadgeSlotStyles;

export interface BadgeOptions
  extends StyledRenderableOptions<BadgeState, BadgeSlotStyles> {
  label?: string;
  styles?: BadgeSlotStyles;
}
