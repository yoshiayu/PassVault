import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialWhereForScope } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CredentialTable from "@/components/credential-table";
import { getActiveScope } from "@/lib/scope";
import { createTranslator } from "@/lib/i18n/messages";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const locale = getLocaleFromCookies();
  const t = createTranslator(locale);
  const scope = await getActiveScope(session);
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [expiringSoon, expired] = await Promise.all([
    prisma.credential.count({
      where: {
        ...credentialWhereForScope(session, scope),
        expiresAt: { gte: now, lte: soon }
      }
    }),
    prisma.credential.count({
      where: {
        ...credentialWhereForScope(session, scope),
        expiresAt: { lt: now }
      }
    })
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.expiringSoon")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{expiringSoon}</p>
            <p className="mt-2 text-xs text-white/60">{t("dashboard.withinDays")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.expired")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{expired}</p>
            <p className="mt-2 text-xs text-white/60">{t("dashboard.expiredHelp")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.nextActions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-white/70">
              <li>{t("dashboard.action.generate")}</li>
              <li>{t("dashboard.action.review")}</li>
              <li>{t("dashboard.action.confirmDelete")}</li>
            </ul>
          </CardContent>
        </Card>
      </section>
      <CredentialTable />
    </div>
  );
}
