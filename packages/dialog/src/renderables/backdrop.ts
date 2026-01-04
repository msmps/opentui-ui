import {
  BoxRenderable,
  parseColor,
  type RenderContext,
  type RGBA,
} from "@opentui/core";
import { normalizeOpacity } from "@opentui-ui/utils";
import { DEFAULT_BACKDROP_OPACITY, DEFAULT_STYLE } from "../themes";
import type { DialogStyle } from "../types";

export interface BackdropRenderableOptions {
  style?: DialogStyle;
  visible?: boolean;
  onClick?: () => void;
}

/**
 * Container-level backdrop renderable.
 * Manages a single full-screen backdrop for all dialogs.
 */
export class BackdropRenderable extends BoxRenderable {
  private _onClick?: () => void;

  constructor(ctx: RenderContext, options: BackdropRenderableOptions = {}) {
    super(ctx, {
      id: "dialog-backdrop",
      position: "absolute",
      left: 0,
      top: 0,
      width: ctx.width,
      height: ctx.height,
      backgroundColor: "transparent",
      visible: options.visible ?? false,
      onMouseUp: () => this.handleClick(),
    });

    this._onClick = options.onClick;
  }

  private handleClick(): void {
    this._onClick?.();
  }

  public updateStyle(style?: DialogStyle): void {
    const { color, opacity } = computeBackdropColor(style);
    this.backgroundColor = createBackdropRGBA(color, opacity);
    this.requestRender();
  }

  public updateDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.requestRender();
  }

  public set onClick(handler: (() => void) | undefined) {
    this._onClick = handler;
  }
}

function computeBackdropColor(style?: DialogStyle): {
  color: string;
  opacity: number;
} {
  const color =
    style?.backdropColor ?? DEFAULT_STYLE.backdropColor ?? "#000000";
  const opacity = normalizeOpacity(
    style?.backdropOpacity,
    DEFAULT_BACKDROP_OPACITY,
    "@opentui-ui/dialog",
  );
  return { color, opacity };
}

function createBackdropRGBA(color: string, opacity: number): RGBA {
  const rgba = parseColor(color);
  rgba.a = opacity / 255;
  return rgba;
}
