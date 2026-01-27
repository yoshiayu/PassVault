"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";

type Credential = {
  id: string;
  label: string;
  expiresAt: string;
  system: { name: string };
};

type ApiResponse<T> = { data: T };

async function fetchCredentials(): Promise<Credential[]> {
  const res = await fetch("/api/credentials");
  if (!res.ok) throw new Error("Failed to load credentials");
  const body: ApiResponse<Credential[]> = await res.json();
  return body.data;
}

export default function CredentialTable() {
  const { t, locale } = useI18n();
  const { data, isLoading, error } = useQuery({
    queryKey: ["credentials"],
    queryFn: fetchCredentials
  });

  if (isLoading) {
    return <p className="text-sm text-white/60">{t("credentialTable.loading")}</p>;
  }
  if (error || !data) {
    return <p className="text-sm text-red-200">{t("credentialTable.error")}</p>;
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t("credentialTable.title")}</h2>
        <Link
          href="/items"
          className="rounded-full border border-glass-border px-4 py-1 text-xs font-semibold text-neon-blue hover:border-neon-blue"
        >
          {t("credentialTable.viewAll")}
        </Link>
      </div>
      <div className="mt-4 grid gap-3">
        {data.slice(0, 5).map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/60">{item.system.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-white/60">
                {t("credentialTable.expires", { date: new Date(item.expiresAt).toLocaleDateString(locale) })}
              </p>
              <Link className="text-xs text-neon-blue" href={`/items/${item.id}`}>
                {t("credentialTable.details")}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
