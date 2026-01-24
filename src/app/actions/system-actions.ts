"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { systemSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";
import { getActiveScope } from "@/lib/scope";

export async function createSystem(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const raw = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };

  const parsed = systemSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid system payload");
  }

  const scope = await getActiveScope(session);

  const system = await prisma.system.create({
    data: {
      ...parsed.data,
      tags: parsed.data.tags ?? [],
      ownerId: session.user.id,
      scopeType: scope.type === "organization" ? "ORGANIZATION" : "PERSONAL",
      organizationId: scope.type === "organization" ? scope.organizationId : null
    }
  });

  await writeAuditLog({ userId: session.user.id, action: "CREATE", entityType: "System", entityId: system.id });

  revalidatePath("/settings");
}
