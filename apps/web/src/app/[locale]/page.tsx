"use client";

import { Button } from "@domie/ui";
import { useTranslations, useLocale } from "@i18n";
import { locales, type Locale } from "@i18n/config";
import { usePathname, useRouter } from "next/navigation";

export default function Home() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  // Get the path without locale prefix for language switching
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const switchLocale = (newLocale: Locale) => {
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <main className="min-h-screen bg-surface text-surface-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end gap-2 mb-4">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc)}
              className={`px-3 py-1 rounded text-sm border ${
                locale === loc
                  ? "bg-brand-primary text-brand-primary-foreground border-brand-primary"
                  : "bg-transparent border-border-strong hover:bg-surface"
              }`}
              aria-label={t("language.switch")}
            >
              {loc === "en" ? t("language.english") : t("language.spanish")}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{t("home.title")}</h1>
          <p className="text-lg text-surface-foreground/80">
            {t("home.subtitle")}{" "}
            <code className="bg-brand-muted px-2 py-1 rounded">
              {t("home.packageName")}
            </code>
            .
          </p>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("sections.buttonVariants")}
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">{t("buttons.default")}</Button>
              <Button variant="outline">{t("buttons.outline")}</Button>
              <Button variant="ghost">{t("buttons.ghost")}</Button>
              <Button variant="muted">{t("buttons.muted")}</Button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("sections.buttonSizes")}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">{t("buttons.small")}</Button>
              <Button size="md">{t("buttons.medium")}</Button>
              <Button size="lg">{t("buttons.large")}</Button>
            </div>
          </section>

          <section className="p-6 border border-border-subtle rounded-xl bg-surface space-y-4">
            <h2 className="text-2xl font-semibold">
              {t("sections.brandTokens")}
            </h2>
            <p className="text-surface-foreground/80">
              {t("sections.brandTokensDescription")}{" "}
              <code>{t("sections.bgSurface")}</code>, {t("sections.borderBorderSubtle")}{" "}
              <code>{t("sections.borderBorderSubtle")}</code>,{" "}
              {t("sections.andButtonsUse")}
            </p>
            <div className="flex gap-4">
              <Button variant="default" size="lg">
                {t("buttons.primaryAction")}
              </Button>
              <Button variant="outline" size="lg">
                {t("buttons.secondaryAction")}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

