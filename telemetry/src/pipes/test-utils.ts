/**
 * Returns keys of a value if it is a non-null object; otherwise [].
 * Use when pipe.options.output has an unresolved type from the SDK.
 */
export const objectKeysFromUnknown = (obj: unknown): string[] =>
  typeof obj === 'object' && obj !== null ? Object.keys(obj as Record<string, unknown>) : [];
