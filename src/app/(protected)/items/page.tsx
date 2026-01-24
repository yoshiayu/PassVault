import { prisma } from "@/lib/prisma";
import CredentialList from "@/components/credential-list";
import QuickGenerate from "@/components/quick-generate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveScope } from "@/lib/scope";
import { systemWhereForScope } from "@/lib/permissions";

export default async function ItemsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const scope = await getActiveScope(session);
  const systems = await prisma.system.findMany({
    where: systemWhereForScope(session, scope),
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col gap-8">
      <QuickGenerate systems={systems} />
      <CredentialList />
    </div>
  );
}
