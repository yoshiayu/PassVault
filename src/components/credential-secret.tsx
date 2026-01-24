"use client";

import { useState } from "react";

type RevealResponse = {
  data?: {
    secret: string;
    length: number;
  };
  message?: string;
};

export default function CredentialSecret({ credentialId }: { credentialId: string }) {
  const [secret, setSecret] = useState<string | null>(null);
  const [length, setLength] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reveal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/credentials/${credentialId}/reveal`, { method: "POST" });
      const body: RevealResponse = await res.json();
      if (!res.ok) throw new Error(body.message ?? "パスワード表示に失敗しました。");
      setSecret(body.data?.secret ?? null);
      setLength(body.data?.length ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "パスワード表示に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">パスワード表示</h3>
          <p className="text-xs text-white/60">詳細画面で手動表示。監査ログに記録されます。</p>
        </div>
        <button
          type="button"
          onClick={reveal}
          className="rounded-full border border-glass-border bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-white/20"
          disabled={loading}
        >
          {loading ? "表示中..." : "表示する"}
        </button>
      </div>
      {error ? <p className="mt-3 text-xs text-red-200">{error}</p> : null}
      {secret ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs text-white/60">文字数: {length ?? secret.length}</p>
          <p className="mt-2 font-mono text-lg tracking-widest text-white">{secret}</p>
        </div>
      ) : null}
    </div>
  );
}
