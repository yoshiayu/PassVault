"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

type System = { id: string; name: string };

type GenerateResponse = {
  data: {
    id: string;
    label: string;
    systemId: string;
    expiresAt: string;
    generatedSecret?: string;
  } & {
    generatedSecret?: string;
  };
};

type QrResponse = {
  data: {
    token: string;
    expiresAt: string;
    dataUrl: string;
    credentialId: string;
  };
};

export default function QuickGenerate({ systems }: { systems: System[] }) {
  const [systemId, setSystemId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [label, setLabel] = useState("");
  const [length, setLength] = useState(12);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrExpires, setQrExpires] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [labelSaved, setLabelSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toEndOfDayIso = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  };

  const generate = async () => {
    if (!systemId || !expiresAt) {
      setError("システムと有効期限は必須です。");
      return;
    }
    const expiryIso = toEndOfDayIso(expiresAt);
    if (!expiryIso) {
      setError("有効期限が不正です。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemId,
          label: "Unlabeled",
          expiresAt: expiryIso,
          mode: "generate",
          length
        })
      });
      const body: GenerateResponse & { message?: string } = await res.json();
      if (!res.ok) throw new Error(body.message ?? "生成に失敗しました。");

      setCredentialId(body.data.id);
      setGeneratedSecret(body.data.generatedSecret ?? null);
      setLabelSaved(false);
      setRevealed(false);

      const qrRes = await fetch(`/api/credentials/${body.data.id}/qr`, { method: "POST" });
      const qrBody: QrResponse & { message?: string } = await qrRes.json();
      if (!qrRes.ok) throw new Error(qrBody.message ?? "QRコードを生成できませんでした。");
      setQrUrl(qrBody.data.dataUrl);
      setQrExpires(qrBody.data.expiresAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const saveLabel = async () => {
    if (!credentialId || !label.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/credentials/${credentialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() })
      });
      if (!res.ok) throw new Error("ラベル保存に失敗しました。");
      setLabelSaved(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ラベル保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass-panel p-6">
      <h1 className="text-2xl font-semibold text-white">クイック生成</h1>
      <p className="mt-2 text-sm text-white/70">
        1) 生成 2) QR発行 3) ラベル付け 4) 後で編集
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs text-white/60">
          システム
          <select
            className="glass-field"
            value={systemId}
            onChange={(event) => setSystemId(event.target.value)}
            disabled={systems.length === 0}
          >
            <option value="" disabled>
              {systems.length === 0 ? "システム未登録" : "システムを選択"}
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id} className="text-black">
                {system.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          有効期限
          <Input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          ラベル
          <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="生成後" />
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          文字数
          <select
            className="glass-field"
            value={String(length)}
            onChange={(event) => setLength(Number(event.target.value))}
          >
            {[6, 8, 10, 12, 15].map((len) => (
              <option key={len} value={len} className="text-black">
                {len}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generate}
            className="rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
            disabled={loading || systems.length === 0}
          >
            {loading ? "生成中..." : "生成とQR"}
          </button>
          <button
            type="button"
            onClick={saveLabel}
            className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-neon-blue transition hover:border-neon-blue"
            disabled={saving || !credentialId}
          >
            {saving ? "保存中..." : "ラベルを保存"}
          </button>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-white/80 transition hover:border-neon-blue"
            disabled={!labelSaved || !generatedSecret}
          >
            パス解除で表示
          </button>
        </div>
      </div>
      {generatedSecret ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <p className="text-xs text-white/60">パスワード</p>
          <p className="mt-1 font-mono tracking-wider">{revealed ? generatedSecret : "••••••••••••"}</p>
          {!labelSaved ? <p className="mt-2 text-xs text-amber-200">ラベル保存後に表示できます。</p> : null}
        </div>
      ) : null}
      {systems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
          システムが未登録です。先に /settings で登録してください。
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {error}
        </div>
      ) : null}
      {qrUrl ? (
        <div className="mt-6 flex flex-col gap-3">
          <img src={qrUrl} alt="QR" className="h-44 w-44 rounded-xl border border-white/20" />
          <p className="text-xs text-white/60">QR有効期限 {new Date(qrExpires ?? "").toLocaleString()}</p>
        </div>
      ) : null}
    </section>
  );
}
