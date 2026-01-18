import {
  Renderable,
  type RenderableOptions,
  type RenderContext,
} from "@opentui/core";

export type StyleState = object;

export type Styles = object;

export type StyleResolver<S extends StyleState, R extends Styles> = (
  state: S,
) => R;

export interface StyledRenderableOptions<S extends StyleState, R extends Styles>
  extends RenderableOptions<Renderable> {
  /** Static styles applied when no styleResolver is provided. */
  styles?: R;
  /** Dynamic style resolver, invoked with component state. */
  styleResolver?: StyleResolver<S, R>;
}

export abstract class StyledRenderable<
  S extends StyleState,
  R extends Styles,
> extends Renderable {
  protected _styleResolver?: StyleResolver<S, R>;
  protected _styles: R;

  constructor(
    ctx: RenderContext,
    options: StyledRenderableOptions<S, R>,
    defaultStyles: R,
  ) {
    super(ctx, options);
    this._styles = options.styles ?? defaultStyles;
    this._styleResolver = options.styleResolver;
  }

  public abstract getState(): S;

  protected getResolvedStyles(): R {
    if (!this._styleResolver) {
      return this._styles;
    }
    return this._styleResolver(this.getState());
  }

  public override destroy(): void {
    if (this._isDestroyed) {
      return;
    }
    this._styleResolver = undefined;
    super.destroy();
  }

  get styles(): R {
    return this._styles;
  }

  set styles(value: R) {
    this._styles = value;
    this.requestRender();
  }

  get styleResolver(): StyleResolver<S, R> | undefined {
    return this._styleResolver;
  }

  set styleResolver(value: StyleResolver<S, R> | undefined) {
    if (this._styleResolver === value) {
      return;
    }
    this._styleResolver = value;
    this.requestRender();
  }
}
