import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "@i18n/config";

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = (await requestLocale) as Locale | undefined;

  // Ensure that the incoming `locale` is valid
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../../../packages/i18n/src/locales/${locale}/common.json`)).default,
  };
});

