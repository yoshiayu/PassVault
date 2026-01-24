import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export type ActiveScope =
  | { type: "personal" }
  | { type: "organization"; organizationId: string };

export async function getActiveScope(session: Session): Promise<ActiveScope> {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeOrganizationId: true }
  });

  if (!user?.activeOrganizationId) {
    return { type: "personal" };
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, organizationId: user.activeOrganizationId }
  });

  if (!membership) {
    return { type: "personal" };
  }

  return { type: "organization", organizationId: user.activeOrganizationId };
}
