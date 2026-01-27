"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";

type QrResponse = {
  data: {
    token: string;
    expiresAt: string;
    dataUrl: string;
    credentialId: string;
  };
};

export default function QrPanel({ credentialId }: { credentialId: string }) {
  const { t, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const generateQr = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/credentials/${credentialId}/qr`, { method: "POST" });
      const body: QrResponse = await res.json();
      if (!res.ok) throw new Error(t("qrPanel.error"));
      setDataUrl(body.data.dataUrl);
      setExpiresAt(body.data.expiresAt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{t("qrPanel.title")}</h3>
          <p className="text-xs text-white/60">{t("qrPanel.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={generateQr}
          className="rounded-full border border-glass-border bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-glow hover:bg-white/20"
          disabled={loading}
        >
          {loading ? t("qrPanel.generating") : t("qrPanel.generate")}
        </button>
      </div>
      {dataUrl ? (
        <div className="mt-4 flex flex-col items-start gap-3">
          <img src={dataUrl} alt="QR token" className="h-40 w-40 rounded-xl border border-white/20" />
          <p className="text-xs text-white/60">
            {t("qrPanel.expiresAt", { date: new Date(expiresAt ?? "").toLocaleString(locale) })}
          </p>
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">
            {t("qrPanel.warning")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
