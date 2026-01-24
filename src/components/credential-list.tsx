"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type Credential = {
  id: string;
  label: string;
  expiresAt: string;
  system: { name: string };
  notes?: string | null;
};

type ApiResponse<T> = { data: T };

async function fetchCredentials(query: string): Promise<Credential[]> {
  const url = new URL("/api/credentials", window.location.origin);
  if (query) url.searchParams.set("q", query);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load credentials");
  const body: ApiResponse<Credential[]> = await res.json();
  return body.data;
}

export default function CredentialList() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["credentials", query],
    queryFn: () => fetchCredentials(query)
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteCredential = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/credentials/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete credential");
      window.location.reload();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Credential registry</h2>
          <p className="text-xs text-white/60">Search by label or notes. Expires are enforced server-side.</p>
        </div>
        <Input
          placeholder="Search credentials"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="md:w-72"
        />
      </div>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-white/60">Loading...</p>
        ) :
        data?.length ? (
          data.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-white/60">{item.system.name}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>Expires {new Date(item.expiresAt).toLocaleDateString()}</span>
                  <Link className="text-neon-blue" href={`/items/${item.id}`}>
                    View details
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteCredential(item.id)}
                    className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-200 hover:border-red-400"
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-white/50">Label detail: {item.label}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/60">No credentials found.</p>
        )}
      </div>
    </div>
  );
}
