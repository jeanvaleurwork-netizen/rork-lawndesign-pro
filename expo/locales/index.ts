import en from "./en";
import es from "./es";
import zh from "./zh";
import ht from "./ht";
import hi from "./hi";

export const translations = {
  en,
  es,
  zh,
  ht,
  hi,
};

export type TranslationKeys = typeof en;
export type SupportedLanguages = keyof typeof translations;
