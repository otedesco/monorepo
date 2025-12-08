// Result type for operations that can succeed or fail
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// Helper functions for Result
export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
  err: <E>(error: E): Result<never, E> => ({ success: false, error }),
  isOk: <T, E>(result: Result<T, E>): result is { success: true; value: T } =>
    result.success === true,
  isErr: <T, E>(result: Result<T, E>): result is { success: false; error: E } =>
    result.success === false,
};

// Brand color tokens (matching our design system)
export type BrandColor =
  | "brand-primary"
  | "brand-primary-foreground"
  | "brand-muted"
  | "brand-muted-foreground";

// Surface color tokens
export type SurfaceColor = "surface" | "surface-foreground";

// Border color tokens
export type BorderColor = "border-subtle" | "border-strong";

// All design token colors
export type DesignTokenColor = BrandColor | SurfaceColor | BorderColor;

// Optional utility type
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Required utility type (complement of Partial)
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ID type alias for consistency
export type ID = string;

// Timestamp type alias
export type Timestamp = Date | string;

