import Image from "next/image";
import Link from "next/link";
import { createTranslator } from "@/lib/i18n/messages";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export default function HomePage() {
  const locale = getLocaleFromCookies();
  const t = createTranslator(locale);

  const features = [
    { title: t("home.feature1.title"), desc: t("home.feature1.desc") },
    { title: t("home.feature2.title"), desc: t("home.feature2.desc") },
    { title: t("home.feature3.title"), desc: t("home.feature3.desc") }
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="glass-panel p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="glass-chip">{t("layout.brandTitle")}</span>
            <Image
              src="/PassVault%20(1).png"
              alt="PassVault"
              width={220}
              height={64}
              className="h-10 w-auto drop-shadow-[0_0_12px_rgba(125,231,255,0.65)]"
              priority
            />
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            {t("home.headline")}
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            {t("home.subhead")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
            >
              {t("home.signIn")}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-neon-blue transition hover:border-neon-blue"
            >
              {t("home.dashboard")}
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {features.map((item) => (
          <div key={item.title} className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-white/70">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
