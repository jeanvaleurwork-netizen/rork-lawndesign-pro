import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import { useEffect, useState } from "react";

import { translations, SupportedLanguages } from "@/locales";

const LANGUAGE_KEY = "app_language";

const i18n = new I18n(translations);
i18n.enableFallback = true;
i18n.defaultLocale = "en";

const getDeviceLanguage = (): SupportedLanguages => {
  const deviceLocale = getLocales()[0];
  const languageCode = deviceLocale.languageCode || "en";
  
  if (languageCode.startsWith("es")) return "es";
  if (languageCode.startsWith("zh")) return "zh";
  if (languageCode.startsWith("ht")) return "ht";
  if (languageCode.startsWith("hi")) return "hi";
  
  return "en";
};

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const deviceLang = getDeviceLanguage();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(deviceLang);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      const language = (stored as SupportedLanguages) || getDeviceLanguage();
      setCurrentLanguage(language);
      i18n.locale = language;
    } catch (error) {
      console.error("Failed to load language:", error);
      const deviceLang = getDeviceLanguage();
      setCurrentLanguage(deviceLang);
      i18n.locale = deviceLang;
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (language: SupportedLanguages) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
      setCurrentLanguage(language);
      i18n.locale = language;
    } catch (error) {
      console.error("Failed to save language:", error);
    }
  };

  const t = (key: string, options?: Record<string, string | number>): string => {
    return i18n.t(key, options);
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    supportedLanguages: Object.keys(translations) as SupportedLanguages[],
  };
});
