"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const errorMap: Record<string, string> = {
  AccessDenied: "Email domain not allowed.",
  OAuthAccountNotLinked: "Use the same provider to sign in.",
  default: "Unable to sign in."
};

export default function SignInPage() {
  const params = useSearchParams();
  const error = params.get("error");
  const message = error ? errorMap[error] ?? errorMap.default : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="glass-panel p-10">
        <h1 className="text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-3 text-sm text-white/70">
          Use your corporate Google account to access PassVault QR.
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
          Continue with Google
        </button>
      </div>
    </main>
  );
}
