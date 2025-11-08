import { config } from "@config";

export default defineI18nConfig(() => ({
  legacy: false,
  availableLocales: Object.keys(
    config.i18n.locales,
  ) as (keyof typeof config.i18n.locales)[],
  locale: config.i18n.defaultLocale,
  fallbackLocale: config.i18n.defaultLocale,
  // @ts-expect-error
  numberFormats: Object.fromEntries(
    Object.entries(config.i18n.locales).map(([key, value]) => [
      key,
      value.numberFormats,
    ]),
  ),
}));
