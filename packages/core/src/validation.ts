declare const __DEV__: boolean;

function isDev(): boolean {
  return typeof __DEV__ !== "undefined" ? __DEV__ : false;
}

export function devWarn(condition: boolean, message: string): void {
  if (isDev() && condition) {
    console.warn(`[OpenTUI UI] ${message}`);
  }
}

export function validateNonNegative(
  value: number | undefined,
  name: string,
): void {
  if (isDev() && value !== undefined && value < 0) {
    console.warn(`[OpenTUI UI] "${name}" should not be negative, got ${value}`);
  }
}

export function validateRange(
  value: number | undefined,
  min: number,
  max: number,
  name: string,
): void {
  if (isDev() && value !== undefined && (value < min || value > max)) {
    console.warn(
      `[OpenTUI UI] "${name}" should be between ${min} and ${max}, got ${value}`,
    );
  }
}

export function validateStringLength(
  value: string | undefined,
  maxLength: number,
  name: string,
): void {
  if (isDev() && value !== undefined && value.length > maxLength) {
    console.warn(
      `[OpenTUI UI] "${name}" exceeds maximum length of ${maxLength} characters (got ${value.length})`,
    );
  }
}

export function validateNonEmptyString(
  value: string | undefined,
  name: string,
): void {
  if (isDev() && value !== undefined && value.length === 0) {
    console.warn(`[OpenTUI UI] "${name}" should not be an empty string`);
  }
}

export function validateArrayLength(
  value: unknown[] | undefined,
  maxLength: number,
  name: string,
): void {
  if (isDev() && value !== undefined && value.length > maxLength) {
    console.warn(
      `[OpenTUI UI] "${name}" exceeds maximum length of ${maxLength} items (got ${value.length})`,
    );
  }
}
