/**
 * Supported locales in the application
 */
export const locales = ["en", "es"] as const;

/**
 * Default locale
 */
export const defaultLocale: (typeof locales)[number] = "en";

/**
 * Type for supported locale codes
 */
export type Locale = (typeof locales)[number];

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

