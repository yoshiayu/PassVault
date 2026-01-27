"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/components/i18n-provider";

export default function SignInPage() {
  const params = useSearchParams();
  const { t } = useI18n();
  const error = params.get("error");
  const message =
    error === "AccessDenied"
      ? t("signin.error.accessDenied")
      : error === "OAuthAccountNotLinked"
        ? t("signin.error.oauthNotLinked")
        : error
          ? t("signin.error.default")
          : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="glass-panel p-10">
        <h1 className="text-3xl font-semibold text-white">{t("signin.title")}</h1>
        <p className="mt-3 text-sm text-white/70">
          {t("signin.subtitle")}
        </p>
        {message ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {message}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-6 rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
        >
          {t("signin.cta")}
        </button>
      </div>
    </main>
  );
}
