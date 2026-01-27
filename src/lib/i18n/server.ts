import { cookies } from "next/headers";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/messages";

export const getLocaleFromCookies = (): Locale => {
  const cookieLocale = cookies().get("locale")?.value ?? null;
  return isLocale(cookieLocale) ? cookieLocale : defaultLocale;
};
