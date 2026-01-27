import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { createTranslator } from "@/lib/i18n/messages";
import { getLocaleFromCookies } from "@/lib/i18n/server";
import LanguageSwitcher from "@/components/language-switcher";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const locale = getLocaleFromCookies();
  const t = createTranslator(locale);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-1">
          <div className="flex items-center gap-1">
            <Image
              src="/PassVault.png"
              alt={t("layout.brandTitle")}
              width={120}
              height={120}
              className="h-30 w-30 shrink-0 drop-shadow-[0_0_14px_rgba(76,195,255,0.6)]"
              priority
            />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">{t("layout.brandTitle")}</p>
              <p className="text-xs text-white/60">{t("layout.brandTagline")}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-white/80 hover:text-white">
              {t("layout.nav.dashboard")}
            </Link>
            <Link href="/items" className="text-white/80 hover:text-white">
              {t("layout.nav.credentials")}
            </Link>
            <Link href="/settings" className="text-white/80 hover:text-white">
              {t("layout.nav.settings")}
            </Link>
            <LanguageSwitcher />
            <Link href="/api/auth/signout" className="rounded-full border border-glass-border px-4 py-1 text-white/80">
              {t("layout.nav.signOut")}
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
