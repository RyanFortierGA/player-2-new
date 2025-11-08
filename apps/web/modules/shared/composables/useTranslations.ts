import { useI18n } from "#imports";

// Import default locale
import type enLocale from "i18n/translations/en.json";

/**
 * This is the equivalent of `useI18n`, execpt it adds types for the translation keys.
 */
export const useTranslations = () => {
  return useI18n<[typeof enLocale]>();
};
