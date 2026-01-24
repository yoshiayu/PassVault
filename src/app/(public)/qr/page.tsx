"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ResolveResponse = {
  data?: {
    credentialId: string;
    secret: string;
  };
  message?: string;
};

export default function QrResolvePage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const resolve = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/qr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const body: ResolveResponse = await res.json();
        if (!res.ok) {
          throw new Error(body.message ?? "トークン解決に失敗しました。");
        }
        setSecret(body.data?.secret ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "トークン解決に失敗しました。");
      } finally {
        setLoading(false);
      }
    };
    resolve();
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 px-6 py-16">
      <div className="glass-panel p-8">
        <h1 className="text-2xl font-semibold text-white">QRパスワード表示</h1>
        <p className="mt-2 text-sm text-white/70">
          QRは1回限り有効です。表示後は共有しないでください。
        </p>
        {!token ? <p className="mt-4 text-sm text-red-200">トークンがありません。</p> : null}
        {loading ? <p className="mt-4 text-sm text-white/60">読み込み中...</p> : null}
        {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
        {secret ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/60">パスワード</p>
            <p className="mt-2 font-mono text-lg tracking-widest text-white">{secret}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
