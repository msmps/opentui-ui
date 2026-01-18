import { mergeStyledConfig } from "./merge";
import { processStyledConfig } from "./resolve";
import {
  $$OtuiComponentMeta,
  $$StyledComponent,
  $$StyledConfig,
} from "./symbols";
import type {
  ComponentMeta,
  ExtractSlotStyleMap,
  ExtractStateKeys,
  ProcessedStyledConfig,
  StyledConfig,
  VariantProps,
  VariantsConfig,
} from "./types";

// =============================================================================
// Styled Component Definition Types
// =============================================================================

/**
 * A component that has OTUI component metadata attached.
 */
export interface ComponentWithMeta<
  Slots extends readonly string[],
  SlotStyleMap extends Record<Slots[number], object>,
  StateKeys extends readonly string[],
> {
  [$$OtuiComponentMeta]: ComponentMeta<Slots, SlotStyleMap, StateKeys>;
}

/**
 * A styled component with attached config and variant props.
 */
export interface StyledComponentDefinition<
  BaseComponent extends ComponentWithMeta<
    readonly string[],
    Record<string, object>,
    readonly string[]
  >,
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
  V extends VariantsConfig<SlotStyleMap, StateKeys>,
> {
  /** The base component being styled */
  component: BaseComponent;
  /** Processed styled config */
  processed: ProcessedStyledConfig<SlotStyleMap, StateKeys, V>;
  /** Original config (for composition) */
  config: StyledConfig<SlotStyleMap, StateKeys, V>;
  /** Marker for styled component detection */
  [$$StyledComponent]: true;
  /** Stored config for composition */
  [$$StyledConfig]: ProcessedStyledConfig<SlotStyleMap, StateKeys, V>;
  /** Component metadata (forwarded from base) */
  [$$OtuiComponentMeta]: ComponentMeta<
    readonly string[],
    SlotStyleMap,
    StateKeys
  >;
}

// =============================================================================
// Styled Factory
// =============================================================================

/**
 * Creates a styled component definition.
 * This is the framework-agnostic core of the styled() API.
 *
 * The returned definition contains:
 * - The base component
 * - Processed config for runtime resolution
 * - Metadata for type inference and composition
 *
 * Framework wrappers (React, Solid) use this to create actual components.
 *
 * @param Component - Base component with OTUI metadata
 * @param config - Styled config with base, variants, etc.
 * @returns Styled component definition
 *
 * @example
 * ```ts
 * // Framework-agnostic definition
 * const definition = createStyled(Checkbox, {
 *   base: { root: { fg: "white" } },
 *   variants: {
 *     intent: {
 *       warning: { root: { fg: "orange" } },
 *       danger: { root: { fg: "red" } }
 *     }
 *   },
 *   defaultVariants: { intent: "warning" }
 * });
 *
 * // Framework wrapper creates actual component from definition
 * ```
 */
export function createStyled<
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
): StyledComponentDefinition<
  BaseComponent,
  ExtractSlotStyleMap<BaseComponent>,
  ExtractStateKeys<BaseComponent>,
  V
> {
  type SlotStyleMap = ExtractSlotStyleMap<BaseComponent>;
  type StateKeys = ExtractStateKeys<BaseComponent>;

  // Get component metadata with guard
  const meta = Component[$$OtuiComponentMeta] as
    | ComponentMeta<readonly string[], SlotStyleMap, StateKeys>
    | undefined;

  if (!meta) {
    throw new Error(
      `styled() requires a component with OTUI metadata. ` +
        `Ensure the component has [$$OtuiComponentMeta] attached.`,
    );
  }

  // Check if base component is already styled (composition)
  let finalConfig: StyledConfig<SlotStyleMap, StateKeys, V>;

  if (isStyledComponentDefinition(Component)) {
    // Composition: merge configs
    const baseConfig = Component[$$StyledConfig] as ProcessedStyledConfig<
      SlotStyleMap,
      StateKeys,
      VariantsConfig<SlotStyleMap, StateKeys>
    >;

    // Convert processed config back to regular config for merging
    const baseAsConfig: StyledConfig<
      SlotStyleMap,
      StateKeys,
      VariantsConfig<SlotStyleMap, StateKeys>
    > = {
      base: baseConfig.base,
      variants: baseConfig.variants,
      compoundVariants: baseConfig.compoundVariants,
      defaultVariants: baseConfig.defaultVariants,
    };

    finalConfig = mergeStyledConfig(baseAsConfig, config) as StyledConfig<
      SlotStyleMap,
      StateKeys,
      V
    >;
  } else {
    finalConfig = config;
  }

  // Process the config
  const processed = processStyledConfig(
    finalConfig,
    meta.stateKeys as StateKeys,
  );

  return {
    component: Component,
    processed,
    config: finalConfig,
    [$$StyledComponent]: true,
    [$$StyledConfig]: processed,
    [$$OtuiComponentMeta]: meta,
  };
}

/**
 * Type guard to check if a value is a styled component definition.
 */
export function isStyledComponentDefinition(
  value: unknown,
): value is StyledComponentDefinition<
  ComponentWithMeta<
    readonly string[],
    Record<string, object>,
    readonly string[]
  >,
  Record<string, object>,
  readonly string[],
  VariantsConfig<Record<string, object>, readonly string[]>
> {
  return (
    typeof value === "object" &&
    value !== null &&
    $$StyledComponent in value &&
    $$StyledConfig in value
  );
}

// =============================================================================
// Variant Props Extraction Utilities
// =============================================================================

/**
 * Splits props into variant props and forward props.
 * Variant props are consumed by the styled system.
 * Forward props are passed to the underlying component.
 *
 * @param props - All props passed to the styled component
 * @param variantNameSet - Pre-computed Set for O(1) lookup (from ProcessedStyledConfig.variantNameSet)
 * @returns Tuple of [variantProps, forwardProps]
 */
export function splitVariantProps<
  Props extends Record<string, unknown>,
  V extends VariantsConfig<Record<string, object>, readonly string[]>,
>(
  props: Props,
  variantNameSet: ReadonlySet<string>,
): [VariantProps<V>, Omit<Props, keyof V>] {
  const variantProps: Record<string, unknown> = {};
  const forwardProps: Record<string, unknown> = {};

  for (const key in props) {
    if (Object.hasOwn(props, key)) {
      if (variantNameSet.has(key)) {
        variantProps[key] = props[key];
      } else {
        forwardProps[key] = props[key];
      }
    }
  }

  return [
    variantProps as VariantProps<V>,
    forwardProps as Omit<Props, keyof V>,
  ];
}

/**
 * Gets the variant names from a processed config.
 */
export function getVariantNames<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
  V extends VariantsConfig<SlotStyleMap, StateKeys>,
>(processed: ProcessedStyledConfig<SlotStyleMap, StateKeys, V>): (keyof V)[] {
  return Array.from(processed.variantNameSet) as (keyof V)[];
}
