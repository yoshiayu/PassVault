import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialWhereForScope } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CredentialTable from "@/components/credential-table";
import { getActiveScope } from "@/lib/scope";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

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
            <CardTitle>Expiring soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{expiringSoon}</p>
            <p className="mt-2 text-xs text-white/60">Within 3 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-white">{expired}</p>
            <p className="mt-2 text-xs text-white/60">Remove or rotate ASAP</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-xs text-white/70">
              <li>Generate new credentials for critical systems.</li>
              <li>Review expired QR tokens.</li>
              <li>Confirm deletion policy.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
      <CredentialTable />
    </div>
  );
}
