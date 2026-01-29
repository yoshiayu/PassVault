"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/i18n-provider";

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
  const { t, locale } = useI18n();
  const [systemId, setSystemId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [label, setLabel] = useState("");
  const [length, setLength] = useState(12);
  const [passwordPolicy, setPasswordPolicy] = useState<"alpha" | "alnum" | "full">("full");
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

  const readJsonSafe = async <T,>(res: Response): Promise<T | null> => {
    const contentType = res.headers.get("content-type") ?? "";
    const text = await res.text();
    if (!text || !contentType.includes("application/json")) return null;
    try {
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  };

  const generate = async () => {
    if (!systemId || !expiresAt) {
      setError(t("quickGenerate.error.systemRequired"));
      return;
    }
    const expiryIso = toEndOfDayIso(expiresAt);
    if (!expiryIso) {
      setError(t("quickGenerate.error.expirationInvalid"));
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
          label: t("quickGenerate.unlabeled"),
          expiresAt: expiryIso,
          mode: "generate",
          length,
          passwordPolicy
        })
      });
      const body = await readJsonSafe<GenerateResponse & { message?: string }>(res);
      if (!res.ok) {
        throw new Error(body?.message ?? `HTTP ${res.status}`);
      }
      if (!body?.data?.id) {
        throw new Error(t("quickGenerate.error.generateFailed"));
      }

      setCredentialId(body.data.id);
      setGeneratedSecret(body.data.generatedSecret ?? null);
      setLabelSaved(false);
      setRevealed(false);

      const qrRes = await fetch(`/api/credentials/${body.data.id}/qr`, { method: "POST" });
      const qrBody = await readJsonSafe<QrResponse & { message?: string }>(qrRes);
      if (!qrRes.ok) {
        throw new Error(qrBody?.message ?? `HTTP ${qrRes.status}`);
      }
      if (!qrBody?.data?.dataUrl) {
        throw new Error(t("quickGenerate.error.qrFailed"));
      }
      setQrUrl(qrBody.data.dataUrl);
      setQrExpires(qrBody.data.expiresAt);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("quickGenerate.error.generateFailed"));
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
      if (!res.ok) throw new Error(t("quickGenerate.error.saveLabelFailed"));
      setLabelSaved(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("quickGenerate.error.saveLabelFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="glass-panel p-6">
      <h1 className="text-2xl font-semibold text-white">{t("quickGenerate.title")}</h1>
      <p className="mt-2 text-sm text-white/70">
        {t("quickGenerate.subtitle")}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs text-white/60">
          {t("quickGenerate.system")}
          <select
            className="glass-field"
            value={systemId}
            onChange={(event) => setSystemId(event.target.value)}
            disabled={systems.length === 0}
          >
            <option value="" disabled>
              {systems.length === 0 ? t("quickGenerate.systemNone") : t("quickGenerate.systemSelect")}
            </option>
            {systems.map((system) => (
              <option key={system.id} value={system.id} className="text-black">
                {system.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          {t("quickGenerate.expirationDate")}
          <Input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          {t("quickGenerate.label")}
          <Input value={label} onChange={(event) => setLabel(event.target.value)} placeholder={t("quickGenerate.labelPlaceholder")} />
        </label>
        <label className="flex flex-col gap-2 text-xs text-white/60">
          {t("quickGenerate.length")}
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
        <label className="flex flex-col gap-2 text-xs text-white/60">
          {t("quickGenerate.policy")}
          <select
            className="glass-field"
            value={passwordPolicy}
            onChange={(event) => setPasswordPolicy(event.target.value as "alpha" | "alnum" | "full")}
          >
            <option value="alpha" className="text-black">
              {t("quickGenerate.policyAlpha")}
            </option>
            <option value="alnum" className="text-black">
              {t("quickGenerate.policyAlnum")}
            </option>
            <option value="full" className="text-black">
              {t("quickGenerate.policyFull")}
            </option>
          </select>
        </label>
        <div className="md:col-span-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={generate}
            className="rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
            disabled={loading || systems.length === 0}
          >
            {loading ? t("quickGenerate.generating") : t("quickGenerate.generate")}
          </button>
          <button
            type="button"
            onClick={saveLabel}
            className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-neon-blue transition hover:border-neon-blue"
            disabled={saving || !credentialId}
          >
            {saving ? t("quickGenerate.saving") : t("quickGenerate.saveLabel")}
          </button>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-white/80 transition hover:border-neon-blue"
            disabled={!labelSaved || !generatedSecret}
          >
            {t("quickGenerate.revealAfter")}
          </button>
        </div>
      </div>
      {generatedSecret ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          <p className="text-xs text-white/60">{t("quickGenerate.password")}</p>
          <p className="mt-1 font-mono tracking-wider">{revealed ? generatedSecret : "••••••••••••"}</p>
          {!labelSaved ? <p className="mt-2 text-xs text-amber-200">{t("quickGenerate.visibleAfterLabel")}</p> : null}
        </div>
      ) : null}
      {systems.length === 0 ? (
        <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
          {t("quickGenerate.noSystems")}
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
          <p className="text-xs text-white/60">
            {t("quickGenerate.qrExpires", { date: new Date(qrExpires ?? "").toLocaleString(locale) })}
          </p>
        </div>
      ) : null}
    </section>
  );
}
