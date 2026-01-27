import { prisma } from "@/lib/prisma";
import QrPanel from "@/components/qr-panel";
import CredentialSecret from "@/components/credential-secret";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { credentialWhereForScope } from "@/lib/permissions";
import { getActiveScope } from "@/lib/scope";
import { createTranslator } from "@/lib/i18n/messages";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export default async function CredentialDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const locale = getLocaleFromCookies();
  const t = createTranslator(locale);
  const scope = await getActiveScope(session);
  const credential = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForScope(session, scope) },
    include: { system: true }
  });

  if (!credential) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="glass-panel p-6">
        <h1 className="text-2xl font-semibold text-white">{credential.label}</h1>
        <p className="mt-2 text-sm text-white/70">{t("items.detail.system", { name: credential.system.name })}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">{t("items.detail.expiresAt")}</p>
            <p className="text-sm text-white">{credential.expiresAt.toLocaleString(locale)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/50">{t("items.detail.lastUpdated")}</p>
            <p className="text-sm text-white">{credential.updatedAt.toLocaleString(locale)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2">
            <p className="text-xs text-white/50">{t("items.detail.notes")}</p>
            <p className="text-sm text-white/70">{credential.notes ?? t("items.detail.noNotes")}</p>
          </div>
        </div>
      </section>
      <div className="flex flex-col gap-6">
        <QrPanel credentialId={credential.id} />
        <CredentialSecret credentialId={credential.id} />
      </div>
    </div>
  );
}
