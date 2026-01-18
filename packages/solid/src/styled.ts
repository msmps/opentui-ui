import type { JSX } from "@opentui/solid";
import {
  $$OtuiComponentMeta,
  type ComponentMeta,
  type ComponentWithMeta,
  createStyled,
  createStyleResolver,
  type ExtractSlotStyleMap,
  type ExtractStateKeys,
  getVariantNames,
  type StyledConfig,
  type StyledSlotStyles,
  type VariantProps,
  type VariantsConfig,
} from "@opentui-ui/styles";
import { createMemo, mergeProps, splitProps } from "solid-js";

// =============================================================================
// Types
// =============================================================================

/**
 * Extracts the props type from a Solid component.
 */
type ComponentPropsOf<C> = C extends (props: infer P) => JSX.Element
  ? P
  : never;

/**
 * Props for a styled component.
 * Combines base component props with variant props and style overrides.
 */
type StyledComponentProps<
  BaseComponent extends ComponentWithMeta<
    readonly string[],
    Record<string, object>,
    readonly string[]
  >,
  V extends VariantsConfig<
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>
  >,
> = Omit<ComponentPropsOf<BaseComponent>, "styles" | "styleResolver"> &
  VariantProps<V> & {
    /**
     * Inline style overrides with state selector support.
     * Applied after styled config but before styleResolver.
     */
    styles?: StyledSlotStyles<
      ExtractSlotStyleMap<BaseComponent>,
      ExtractStateKeys<BaseComponent>
    >;
  };

/**
 * A styled Solid component with variant props.
 */
interface StyledSolidComponent<
  BaseComponent extends ComponentWithMeta<
    readonly string[],
    Record<string, object>,
    readonly string[]
  >,
  V extends VariantsConfig<
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>
  >,
> {
  (props: StyledComponentProps<BaseComponent, V>): JSX.Element;
  /**
   * Component metadata for composition.
   */
  [$$OtuiComponentMeta]: ComponentMeta<
    readonly string[],
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>
  >;
}

// =============================================================================
// styled() Function
// =============================================================================

/**
 * Creates a styled Solid component with type-safe variants.
 *
 * @param Component - Base headless component with OTUI metadata
 * @param config - Styled configuration with base, variants, etc.
 * @returns A styled Solid component with variant props
 *
 * @example
 * ```tsx
 * import { styled } from "@opentui-ui/solid/styled";
 * import { Checkbox } from "@opentui-ui/solid/checkbox";
 *
 * const MyCheckbox = styled(Checkbox, {
 *   base: {
 *     root: { fg: "white" },
 *     mark: { fg: "blue" },
 *   },
 *   variants: {
 *     intent: {
 *       warning: { root: { fg: "orange" } },
 *       danger: { root: { fg: "red" } },
 *     },
 *   },
 *   defaultVariants: { intent: "warning" },
 * });
 *
 * // Usage - variant props are fully typed
 * <MyCheckbox intent="danger" checked />
 * ```
 */
export function styled<
  BaseComponent extends ComponentWithMeta<
    readonly string[],
    Record<string, object>,
    readonly string[]
  >,
  V extends VariantsConfig<
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>
  >,
>(
  Component: BaseComponent,
  config: StyledConfig<
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>,
    V
  >,
): StyledSolidComponent<BaseComponent, V> {
  type SlotStyleMap = ExtractSlotStyleMap<BaseComponent>;
  type StateKeys = ExtractStateKeys<BaseComponent>;

  // Create the styled definition (framework-agnostic)
  const styledDef = createStyled(Component, config);
  const variantNames = getVariantNames(styledDef.processed);

  // Create the Solid component.
  function StyledComponent(
    props: StyledComponentProps<BaseComponent, V>,
  ): JSX.Element {
    // Use splitProps to maintain reactivity when separating props
    // First split: extract variant props (consumed by styled system)
    const [variantPropsObj, restAfterVariants] = splitProps(
      props,
      variantNames as (keyof typeof props)[],
    );

    // Second split: extract styles prop (consumed by styled system)
    // Cast needed because TypeScript struggles with splitProps on complex intersection types
    const [stylePropsObj, forwardProps] = splitProps(
      restAfterVariants as {
        styles?: StyledSlotStyles<SlotStyleMap, StateKeys>;
      },
      ["styles"],
    );

    // Memoize filtered variant props to avoid recomputation on every state change.
    // This runs once initially and recomputes only when variant props actually change.
    // We filter to exclude undefined values so they don't override defaultVariants.
    const filteredVariantProps = createMemo(() => {
      const result: Partial<Record<keyof V, string>> = {};
      for (const key of variantNames) {
        const value = variantPropsObj[key as keyof typeof variantPropsObj];
        if (typeof value === "string") {
          result[key as keyof V] = value;
        }
      }
      return result;
    });

    const styleResolver = createMemo(() => {
      const currentVariants = filteredVariantProps();
      const currentStyles = stylePropsObj.styles as
        | StyledSlotStyles<SlotStyleMap, StateKeys>
        | undefined;

      return createStyleResolver(
        styledDef.processed,
        currentVariants,
        currentStyles,
      );
    });

    // Get the base component
    const BaseComp = Component as unknown as (
      props: Record<string, unknown>,
    ) => JSX.Element;

    const mergedProps = mergeProps(forwardProps, {
      get styleResolver() {
        return styleResolver();
      },
    });

    return BaseComp(mergedProps);
  }

  // Attach metadata for composition
  StyledComponent[$$OtuiComponentMeta] = styledDef[$$OtuiComponentMeta];

  return StyledComponent as StyledSolidComponent<BaseComponent, V>;
}
