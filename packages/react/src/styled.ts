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
  splitVariantProps,
  type VariantProps,
  type VariantsConfig,
} from "@opentui-ui/styles";
import { type ReactElement, useMemo } from "react";

// =============================================================================
// Types
// =============================================================================

/**
 * Extracts the props type from a component.
 */
type ComponentPropsOf<C> = C extends (props: infer P) => ReactElement
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
     *
     * Note: For optimal performance, memoize this prop if passing dynamic objects:
     * ```tsx
     * const styles = useMemo(() => ({ root: { fg: "red" } }), []);
     * <MyCheckbox styles={styles} />
     * ```
     */
    styles?: StyledSlotStyles<
      ExtractSlotStyleMap<BaseComponent>,
      ExtractStateKeys<BaseComponent>
    >;
  };

/**
 * A styled React component with variant props.
 */
interface StyledReactComponent<
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
  (props: StyledComponentProps<BaseComponent, V>): ReactElement;
  /**
   * Component metadata for composition.
   */
  [$$OtuiComponentMeta]: ComponentMeta<
    readonly string[],
    ExtractSlotStyleMap<BaseComponent>,
    ExtractStateKeys<BaseComponent>
  >;
  /**
   * Display name for React DevTools.
   */
  displayName?: string;
}

// =============================================================================
// styled() Function
// =============================================================================

/**
 * Creates a styled React component with type-safe variants.
 *
 * @param Component - Base headless component with OTUI metadata
 * @param config - Styled configuration with base, variants, etc.
 * @returns A styled React component with variant props
 *
 * @example
 * ```tsx
 * import { styled } from "@opentui-ui/react/styled";
 * import { Checkbox } from "@opentui-ui/react/checkbox";
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
): StyledReactComponent<BaseComponent, V> {
  type SlotStyleMap = ExtractSlotStyleMap<BaseComponent>;
  type StateKeys = ExtractStateKeys<BaseComponent>;

  // Create the styled definition (framework-agnostic)
  const styledDef = createStyled(Component, config);
  const variantNames = getVariantNames(styledDef.processed);

  // Create the React component
  function StyledComponent(
    props: StyledComponentProps<BaseComponent, V>,
  ): ReactElement {
    // Split variant props from forward props using pre-computed Set for O(1) lookup
    const [variantProps, forwardProps] = splitVariantProps(
      props as Record<string, unknown>,
      styledDef.processed.variantNameSet,
    );

    // Extract inline styles from forward props
    // Cast needed because splitVariantProps returns Omit<Props, keyof V> which doesn't include styles
    const inlineStyles = (forwardProps as Record<string, unknown>).styles as
      | StyledSlotStyles<SlotStyleMap, StateKeys>
      | undefined;

    // Extract variant values as primitives for memoization dependencies.
    // We iterate over variantNames (consistent with Solid) for predictable ordering.
    // Only string values are valid variants; non-strings become undefined.
    const variantDeps = variantNames.map((name) => {
      const value = variantProps[name as string];
      return typeof value === "string" ? value : undefined;
    });

    // Memoize both filtering and resolver creation.
    // The filtering runs only when variant values actually change.
    //
    // Note: `inlineStyles` uses reference equality. If passing dynamic style objects,
    // users should memoize them: `const styles = useMemo(() => ({...}), [deps])`
    //
    // Note: The closure captures `variantProps` which is a new object each render.
    // This is safe because: (1) the memo recomputes whenever variantDeps changes,
    // (2) variantDeps contains the same values we read inside the memo, so when
    // the memo body executes, variantProps matches the deps that triggered it.
    // We use variantDeps by index to avoid re-filtering (variantDeps already filtered).
    // biome-ignore lint/correctness/useExhaustiveDependencies: variantDeps contains primitive values extracted from variantProps
    const styleResolver = useMemo(() => {
      // Build filteredVariantProps from variantDeps by index.
      // This avoids re-reading variantProps since variantDeps already has filtered values.
      const filteredVariantProps: Partial<Record<keyof V, string>> = {};
      for (let i = 0; i < variantNames.length; i++) {
        const value = variantDeps[i];
        if (value !== undefined) {
          filteredVariantProps[variantNames[i] as keyof V] = value;
        }
      }

      return createStyleResolver(
        styledDef.processed,
        filteredVariantProps,
        inlineStyles,
      );
    }, [...variantDeps, inlineStyles]);

    // Remove inline styles from forward props since they're handled by styleResolver
    const { styles: _, ...restForwardProps } = forwardProps as Record<
      string,
      unknown
    >;

    // Call the underlying component
    const BaseComp = Component as unknown as (
      props: Record<string, unknown>,
    ) => ReactElement;

    return BaseComp({
      ...restForwardProps,
      styleResolver,
    });
  }

  // Attach metadata for composition
  StyledComponent[$$OtuiComponentMeta] = styledDef[$$OtuiComponentMeta];

  // Set display name for DevTools
  const BaseCompWithName = Component as { name?: string };
  const baseName = BaseCompWithName.name || "Component";
  StyledComponent.displayName = `Styled(${baseName})`;

  return StyledComponent as StyledReactComponent<BaseComponent, V>;
}
