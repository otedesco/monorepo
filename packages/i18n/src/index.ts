// Re-export next-intl utilities
export { useTranslations, useLocale, useMessages } from "next-intl";
export type { AbstractIntlMessages } from "next-intl";

// Export config
export { locales, defaultLocale, isValidLocale, type Locale } from "./config";

// Export locale messages (for Next.js i18n routing)
export { default as enMessages } from "./locales/en/common.json";
export { default as esMessages } from "./locales/es/common.json";

