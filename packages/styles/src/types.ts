import {
  $$OtuiComponentMeta,
  $$StyledComponent,
  type $$StyledConfig,
} from "./symbols";

// =============================================================================
// Component Metadata Types
// =============================================================================

/**
 * Interface for component metadata attached via $$OtuiComponentMeta symbol.
 * This is the bridge between core component definitions and the styled() API.
 *
 * @typeParam Slots - Readonly tuple of slot names (e.g., ["root", "mark", "label"])
 * @typeParam SlotStyleMap - Record mapping slot names to their style interfaces
 * @typeParam StateKeys - Readonly tuple of state keys (e.g., ["checked", "focused"])
 */
export interface ComponentMeta<
  Slots extends readonly string[],
  SlotStyleMap extends Record<Slots[number], object>,
  StateKeys extends readonly string[],
> {
  /** Ordered tuple of slot names for this component */
  readonly slots: Slots;
  /** Type carrier for slot style shapes (runtime value is empty object) */
  readonly slotStyleMap: SlotStyleMap;
  /** Ordered tuple of state keys for pseudo selectors */
  readonly stateKeys: StateKeys;
}

/**
 * Type guard to check if a value has component metadata.
 */
export function hasComponentMeta<
  Slots extends readonly string[],
  SlotStyleMap extends Record<Slots[number], object>,
  StateKeys extends readonly string[],
>(
  value: unknown,
): value is {
  [$$OtuiComponentMeta]: ComponentMeta<Slots, SlotStyleMap, StateKeys>;
} {
  return (
    typeof value === "object" && value !== null && $$OtuiComponentMeta in value
  );
}

/**
 * Extracts the ComponentMeta type from a component with $$OtuiComponentMeta.
 */
export type ExtractMeta<C> = C extends {
  [$$OtuiComponentMeta]: infer M;
}
  ? M
  : never;

/**
 * Extracts the slots tuple from a component's metadata.
 * Returns `never` for types without valid component metadata.
 */
export type ExtractSlots<C> =
  ExtractMeta<C> extends never
    ? never
    : ExtractMeta<C> extends ComponentMeta<
          infer Slots,
          Record<string, object>,
          readonly string[]
        >
      ? Slots
      : never;

/**
 * Extracts the SlotStyleMap from a component's metadata.
 * Returns `never` for types without valid component metadata.
 */
export type ExtractSlotStyleMap<C> =
  ExtractMeta<C> extends never
    ? never
    : ExtractMeta<C> extends ComponentMeta<
          readonly string[],
          infer SlotStyleMap,
          readonly string[]
        >
      ? SlotStyleMap
      : never;

/**
 * Extracts the state keys tuple from a component's metadata.
 * Returns `never` for types without valid component metadata.
 */
export type ExtractStateKeys<C> =
  ExtractMeta<C> extends never
    ? never
    : ExtractMeta<C> extends ComponentMeta<
          readonly string[],
          Record<string, object>,
          infer StateKeys
        >
      ? StateKeys
      : never;

// =============================================================================
// State Selector Types
// =============================================================================

/**
 * Creates a union of state selector strings from a tuple of state keys.
 * E.g., ["checked", "focused"] -> "_checked" | "_focused"
 */
export type StateSelector<K extends readonly string[]> = K extends readonly []
  ? never
  : `_${K[number]}`;

/**
 * Creates a record type for state selector keys with style values.
 * Empty tuple results in empty object (no selectors).
 */
export type StateSelectorStyles<
  Style extends object,
  StateKeys extends readonly string[],
> = StateKeys extends readonly []
  ? Record<never, never>
  : {
      [K in StateSelector<StateKeys>]?: Style;
    };

// =============================================================================
// Slot Style Types
// =============================================================================

/**
 * A single slot's style with optional state selectors.
 * E.g., { color: "white", _checked: { color: "green" } }
 */
export type ConditionalSlotStyle<
  Style extends object,
  StateKeys extends readonly string[],
> = Partial<Style> & StateSelectorStyles<Partial<Style>, StateKeys>;

/**
 * Full slot styles for all slots, each supporting state selectors.
 * E.g., { root: { color: "white", _checked: { color: "green" } }, label: { color: "gray" } }
 */
export type StyledSlotStyles<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
> = {
  [Slot in keyof SlotStyleMap]?: ConditionalSlotStyle<
    SlotStyleMap[Slot],
    StateKeys
  >;
};

// =============================================================================
// Variant Types
// =============================================================================

/**
 * Definition for a single variant (e.g., intent, size).
 * Maps variant values to slot styles.
 */
export type VariantDefinition<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
> = {
  [VariantValue: string]: StyledSlotStyles<SlotStyleMap, StateKeys>;
};

/**
 * Full variants config mapping variant names to their definitions.
 */
export type VariantsConfig<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
> = {
  [VariantName: string]: VariantDefinition<SlotStyleMap, StateKeys>;
};

/**
 * Compound variant definition - applies when multiple variant conditions match.
 */
export type CompoundVariant<
  Variants extends VariantsConfig<SlotStyleMap, StateKeys>,
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
> = {
  [K in keyof Variants]?: keyof Variants[K];
} & {
  /** Styles to apply when all variant conditions match */
  styles: StyledSlotStyles<SlotStyleMap, StateKeys>;
};

/**
 * Default variants - specifies which variant value to use when not provided.
 */
export type DefaultVariants<Variants> = {
  [K in keyof Variants]?: keyof Variants[K];
};

// =============================================================================
// Styled Config Types
// =============================================================================

/**
 * Full configuration for styled().
 *
 * @typeParam SlotStyleMap - The component's slot style map
 * @typeParam StateKeys - The component's state keys tuple
 * @typeParam V - The variants config (inferred for type safety)
 */
export interface StyledConfig<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
  V extends VariantsConfig<SlotStyleMap, StateKeys>,
> {
  /** Base styles applied to all instances */
  base?: StyledSlotStyles<SlotStyleMap, StateKeys>;
  /** Variant definitions */
  variants?: V;
  /** Compound variants applied when multiple conditions match */
  compoundVariants?: CompoundVariant<V, SlotStyleMap, StateKeys>[];
  /** Default variant values when not specified via props */
  defaultVariants?: DefaultVariants<V>;
}

/**
 * Infers variant props from a variants config.
 * E.g., { intent: { warning: ..., danger: ... } } -> { intent?: "warning" | "danger" }
 */
export type VariantProps<V> = {
  [K in keyof V]?: keyof V[K];
};

// =============================================================================
// Styled Component Types
// =============================================================================

/**
 * Marker interface for styled components.
 * Used to detect composition in styled(styled(Component)).
 */
export interface StyledComponentMarker<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
  V extends VariantsConfig<SlotStyleMap, StateKeys>,
> {
  [$$StyledComponent]: true;
  [$$StyledConfig]: ProcessedStyledConfig<SlotStyleMap, StateKeys, V>;
}

/**
 * Processed and normalized styled config ready for runtime resolution.
 */
export interface ProcessedStyledConfig<
  SlotStyleMap extends Record<string, object>,
  StateKeys extends readonly string[],
  V extends VariantsConfig<SlotStyleMap, StateKeys>,
> {
  /** Normalized base styles */
  base: StyledSlotStyles<SlotStyleMap, StateKeys>;
  /** Normalized variants */
  variants: V;
  /** Compound variants array */
  compoundVariants: CompoundVariant<V, SlotStyleMap, StateKeys>[];
  /** Default variant values */
  defaultVariants: DefaultVariants<V>;
  /** State keys for selector matching */
  stateKeys: StateKeys;
  /** Pre-computed Set for O(1) variant name lookup in splitVariantProps */
  variantNameSet: ReadonlySet<string>;
}

// =============================================================================
// Component Type Extraction
// =============================================================================

/**
 * Resolves flat slot styles (selectors applied based on state).
 * This is the output type after style resolution.
 */
export type ResolvedSlotStyles<SlotStyleMap extends Record<string, object>> = {
  [Slot in keyof SlotStyleMap]?: Partial<SlotStyleMap[Slot]>;
};
