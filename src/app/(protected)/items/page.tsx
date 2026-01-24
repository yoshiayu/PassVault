import { prisma } from "@/lib/prisma";
import CredentialList from "@/components/credential-list";
import QuickGenerate from "@/components/quick-generate";

export default async function ItemsPage() {
  const systems = await prisma.system.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-8">
      <QuickGenerate systems={systems} />
      <CredentialList />
    </div>
  );
}
