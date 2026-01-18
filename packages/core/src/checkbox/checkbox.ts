import {
  type KeyEvent,
  type OptimizedBuffer,
  parseColor,
  type RenderContext,
} from "@opentui/core";
import { StyledRenderable } from "../styled-renderable";
import { DEFAULT_CHECKBOX_OPTIONS } from "./constants";
import type {
  CheckboxOptions,
  CheckboxSlotStyles,
  CheckboxState,
  CheckboxSymbolSet,
} from "./types";

const DEFAULT_SLOT_STYLES: CheckboxSlotStyles = {
  box: { backgroundColor: "transparent" },
  mark: { color: "#A3A3A3" },
  label: { color: "#A3A3A3" },
};

export class CheckboxRenderable extends StyledRenderable<
  CheckboxState,
  CheckboxSlotStyles
> {
  protected override _focusable: boolean = true;

  private _isControlled: boolean;
  private _controlledValue: boolean;
  private _internalChecked: boolean;
  private _label: string;
  private _disabled: boolean = false;
  private _symbols: CheckboxSymbolSet;
  private _parsedColors: {
    boxBg: ReturnType<typeof parseColor>;
    markFg: ReturnType<typeof parseColor>;
    labelFg: ReturnType<typeof parseColor>;
  } | null = null;
  private _colorCacheKey: string = "";
  private _maxSymbolLength: number = 0;
  private _currentGap: number = 1;
  private _onCheckedChange?: (checked: boolean) => void;

  protected _defaultOptions = DEFAULT_CHECKBOX_OPTIONS;

  constructor(ctx: RenderContext, options: CheckboxOptions = {}) {
    const symbols: CheckboxSymbolSet = {
      ...DEFAULT_CHECKBOX_OPTIONS.symbols,
      ...options.symbols,
    };

    const initialState: CheckboxState = {
      checked: options?.checked ?? false,
      disabled: options?.disabled ?? false,
      focused: options?.focused ?? false,
    };
    const initialStyles =
      options.styles ??
      options.styleResolver?.(initialState) ??
      DEFAULT_SLOT_STYLES;
    const label = options.label ?? DEFAULT_CHECKBOX_OPTIONS.label;
    const gap = initialStyles.box?.gap ?? 1;
    const maxSymbolLength = Math.max(
      symbols.checked.length,
      symbols.unchecked.length,
    );
    const minWidth = maxSymbolLength + gap + label.length;

    super(
      ctx,
      {
        ...options,
        width: options.width ?? minWidth,
        height: options.height ?? 1,
        onMouseUp: () => {
          if (!this._disabled) {
            this.toggle();
            this.focus();
          }
        },
      },
      DEFAULT_SLOT_STYLES,
    );

    if (options.styles) {
      this._styles = options.styles;
    }

    this._isControlled = options.checked !== undefined;
    this._controlledValue = options.checked ?? false;
    this._internalChecked =
      options.checked ?? options.defaultChecked ?? this._defaultOptions.checked;

    this._label = label;
    this._symbols = symbols;
    this._onCheckedChange = options.onCheckedChange;
    this._disabled = options.disabled ?? false;
    this._maxSymbolLength = maxSymbolLength;
    this._currentGap = gap;
  }

  private updateParsedColors(): void {
    const styles = this.getResolvedStyles();
    const boxStyles = styles.box ?? {};
    const markStyles = styles.mark ?? {};
    const labelStyles = styles.label ?? {};

    this._parsedColors = {
      boxBg: parseColor(boxStyles.backgroundColor ?? "transparent"),
      markFg: parseColor(markStyles.color ?? "#A3A3A3"),
      labelFg: parseColor(labelStyles.color ?? "#A3A3A3"),
    };
  }

  private getColorCacheKey(): string {
    const styles = this.getResolvedStyles();
    const boxBg = styles.box?.backgroundColor ?? "transparent";
    const markFg = styles.mark?.color ?? "#A3A3A3";
    const labelFg = styles.label?.color ?? "#A3A3A3";

    return `${boxBg}|${markFg}|${labelFg}`;
  }

  private getParsedColors() {
    const currentKey = this.getColorCacheKey();
    if (!this._parsedColors || this._colorCacheKey !== currentKey) {
      this.updateParsedColors();
      this._colorCacheKey = currentKey;
    }
    // biome-ignore lint/style/noNonNullAssertion: Guarded against above
    return this._parsedColors!;
  }

  public getState(): CheckboxState {
    return {
      checked: this.checked,
      focused: this._focused,
      disabled: this._disabled,
    };
  }

  private syncWidthWithCurrentStyles(): void {
    const gap = this.getResolvedStyles().box?.gap ?? 1;
    if (gap !== this._currentGap) {
      this._currentGap = gap;
      const newWidth = this._maxSymbolLength + gap + this._label.length;
      if (this.width !== newWidth) {
        this.width = newWidth;
      }
    }
  }

  private recalculateWidth(): void {
    const newWidth =
      this._maxSymbolLength + this._currentGap + this._label.length;
    if (this.width !== newWidth) {
      this.width = newWidth;
    }
  }

  public toggle(): void {
    if (this._disabled) {
      return;
    }

    const newValue = !this.checked;

    if (this._isControlled) {
      this._onCheckedChange?.(newValue);
    } else {
      this._internalChecked = newValue;
      this.requestRender();
      this._onCheckedChange?.(newValue);
    }
  }

  public override handleKeyPress(key: KeyEvent): boolean {
    if (this._disabled) {
      return false;
    }

    if (key.name === "space") {
      this.toggle();
      return true;
    }
    if (key.name === "return" || key.name === "enter") {
      this.toggle();
      return true;
    }
    return false;
  }

  protected override renderSelf(
    buffer: OptimizedBuffer,
    _deltaTime: number,
  ): void {
    this.syncWidthWithCurrentStyles();

    const colors = this.getParsedColors();
    const { boxBg, markFg, labelFg } = colors;

    const symbol = this.checked
      ? this._symbols.checked
      : this._symbols.unchecked;

    if (boxBg.a > 0) {
      buffer.fillRect(this.x, this.y, this.width, this.height, boxBg);
    }

    if (markFg.a > 0) {
      buffer.drawText(symbol, this.x, this.y, markFg, boxBg);
    }

    if (this._label && labelFg.a > 0) {
      const labelX = this.x + this._maxSymbolLength + this._currentGap;
      buffer.drawText(this._label, labelX, this.y, labelFg, boxBg);
    }
  }

  get checked(): boolean {
    return this._isControlled ? this._controlledValue : this._internalChecked;
  }

  set checked(value: boolean) {
    if (typeof value !== "boolean") {
      return;
    }

    // Setting checked prop switches to controlled mode.
    // This is necessary because Solid spreads props after construction,
    // so _isControlled would be false at construction time even for controlled usage.
    if (!this._isControlled) {
      this._isControlled = true;
    }

    if (this._controlledValue !== value) {
      this._controlledValue = value;
      this.requestRender();
    }
  }

  get defaultChecked(): boolean {
    return this._internalChecked;
  }

  set defaultChecked(value: boolean) {
    if (!this._isControlled && this._internalChecked !== value) {
      this._internalChecked = value;
      this.requestRender();
    }
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    if (this._label !== value) {
      this._label = value;
      this.recalculateWidth();
      this.requestRender();
    }
  }

  get symbols(): CheckboxSymbolSet {
    return this._symbols;
  }

  set symbols(value: Partial<CheckboxSymbolSet>) {
    const newSymbols = { ...this._symbols, ...value };
    if (
      this._symbols.checked !== newSymbols.checked ||
      this._symbols.unchecked !== newSymbols.unchecked
    ) {
      this._symbols = newSymbols;
      this._maxSymbolLength = Math.max(
        newSymbols.checked.length,
        newSymbols.unchecked.length,
      );
      this.recalculateWidth();
      this.requestRender();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    if (this._disabled !== value) {
      this._disabled = value;
      this.requestRender();
    }
  }

  get onCheckedChange(): ((checked: boolean) => void) | undefined {
    return this._onCheckedChange;
  }

  set onCheckedChange(callback: ((checked: boolean) => void) | undefined) {
    this._onCheckedChange = callback;
  }

  override get styles(): CheckboxSlotStyles {
    return this.getResolvedStyles();
  }

  override set styles(value: CheckboxSlotStyles) {
    this._styles = value;
    this._parsedColors = null;
    this._colorCacheKey = "";
    this.recalculateWidth();
    this.requestRender();
  }

  public override destroy(): void {
    this._onCheckedChange = undefined;
    this._parsedColors = null;
    super.destroy();
  }
}
