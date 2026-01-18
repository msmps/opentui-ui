import {
  type OptimizedBuffer,
  parseColor,
  type RenderContext,
} from "@opentui/core";
import { StyledRenderable } from "../styled-renderable";
import { validateStringLength } from "../validation";
import { DEFAULT_BADGE_OPTIONS } from "./constants";
import type { BadgeOptions, BadgeSlotStyles, BadgeState } from "./types";

const DEFAULT_SLOT_STYLES: BadgeSlotStyles = {
  root: {
    bg: "transparent",
    fg: "#E5E5E5",
    paddingX: 1,
    paddingY: 0,
  },
};

const EMPTY_STATE: BadgeState = Object.freeze({});

export class BadgeRenderable extends StyledRenderable<
  BadgeState,
  BadgeSlotStyles
> {
  protected override _focusable: boolean = false;

  private _label: string;

  constructor(ctx: RenderContext, options: BadgeOptions = {}) {
    validateStringLength(options.label, 100, "label");

    const initialStyles =
      options.styles ?? options?.styleResolver?.({}) ?? DEFAULT_SLOT_STYLES;
    const rootStyles = initialStyles.root ?? {};

    const label = options.label ?? DEFAULT_BADGE_OPTIONS.label;
    const paddingX = rootStyles.paddingX ?? 1;
    const paddingY = rootStyles.paddingY ?? 0;
    const minWidth = label.length + paddingX * 2;
    const minHeight = 1 + paddingY * 2;

    super(
      ctx,
      {
        ...options,
        width: options.width ?? minWidth,
        height: options.height ?? minHeight,
      },
      DEFAULT_SLOT_STYLES,
    );

    if (options.styles) {
      this._styles = options.styles;
    }

    this._label = label;
  }

  public getState(): BadgeState {
    return EMPTY_STATE;
  }

  private getParsedColors() {
    const styles = this.getResolvedStyles();
    const rootStyles = styles.root ?? {};
    return {
      rootBg: parseColor(rootStyles.bg ?? "transparent"),
      rootFg: parseColor(rootStyles.fg ?? "#E5E5E5"),
    };
  }

  private recalculateDimensions(): void {
    const styles = this.getResolvedStyles();
    const rootStyles = styles.root ?? {};
    const paddingX = rootStyles.paddingX ?? 1;
    const paddingY = rootStyles.paddingY ?? 0;
    const newWidth = this._label.length + paddingX * 2;
    const newHeight = 1 + paddingY * 2;

    if (this.width !== newWidth) {
      this.width = newWidth;
    }
    if (this.height !== newHeight) {
      this.height = newHeight;
    }
  }

  protected override renderSelf(
    buffer: OptimizedBuffer,
    _deltaTime: number,
  ): void {
    const colors = this.getParsedColors();
    const { rootBg, rootFg } = colors;

    const styles = this.getResolvedStyles();
    const rootStyles = styles.root ?? {};
    const paddingX = rootStyles.paddingX ?? 1;
    const paddingY = rootStyles.paddingY ?? 0;

    if (rootBg.a > 0) {
      buffer.fillRect(this.x, this.y, this.width, this.height, rootBg);
    }

    if (this._label && rootFg.a > 0) {
      const labelX = this.x + paddingX;
      const labelY = this.y + paddingY;
      buffer.drawText(this._label, labelX, labelY, rootFg, rootBg);
    }
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    if (this._label !== value) {
      this._label = value;
      this.recalculateDimensions();
      this.requestRender();
    }
  }

  override get styles(): BadgeSlotStyles {
    return this.getResolvedStyles();
  }

  override set styles(value: BadgeSlotStyles) {
    this._styles = value;
    this.recalculateDimensions();
    this.requestRender();
  }
}
