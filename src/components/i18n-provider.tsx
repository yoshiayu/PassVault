"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createTranslator, defaultLocale, isLocale, type Locale } from "@/lib/i18n/messages";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const readInitialLocale = (fallback: Locale) => {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem("locale");
  if (isLocale(stored)) return stored;
  const match = document.cookie.match(/(?:^|; )locale=([^;]+)/);
  if (match && isLocale(match[1])) return match[1];
  return fallback;
};

export default function I18nProvider({
  children,
  initialLocale
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(() => readInitialLocale(initialLocale ?? defaultLocale));
  const t = useMemo(() => createTranslator(locale), [locale]);

  useEffect(() => {
    window.localStorage.setItem("locale", locale);
    document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
};
