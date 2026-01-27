"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/messages";
import { useI18n } from "@/components/i18n-provider";

const LANGUAGE_LABELS: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  zh: "中文(简体)",
  es: "Español",
  fr: "Français"
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const router = useRouter();
  const options = useMemo(
    () => locales.map((code) => ({ code, label: LANGUAGE_LABELS[code] ?? code })),
    []
  );

  const handleChange = (next: Locale) => {
    window.localStorage.setItem("locale", next);
    document.cookie = `locale=${next}; path=/; max-age=31536000`;
    setLocale(next);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-glass-border bg-black/60 px-3 py-2 text-xs backdrop-blur">
      <span className="text-white/60">{t("language.switcherLabel")}</span>
      <select
        className="rounded-full border border-glass-border bg-transparent px-2 py-1 text-xs text-white/80 focus:outline-none focus:ring-2 focus:ring-neon-blue"
        value={locale}
        onChange={(event) => handleChange(event.target.value as Locale)}
        aria-label={t("language.switcherLabel")}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code} className="text-black">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
