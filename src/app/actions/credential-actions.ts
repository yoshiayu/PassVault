"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePassword } from "@/lib/password";
import { encryptSecret, hashSecret } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";

export async function createCredential(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const systemId = String(formData.get("systemId") ?? "");
  const label = String(formData.get("label") ?? "");
  const expiresAt = String(formData.get("expiresAt") ?? "");
  const length = Number(formData.get("length") ?? 12);

  if (!systemId || !label || !expiresAt) {
    throw new Error("Missing required fields");
  }

  const secret = generatePassword({ length, minClasses: 4, requireSymbol: true, maxConsecutive: 2 });
  const credential = await prisma.credential.create({
    data: {
      systemId,
      label,
      notes: null,
      tags: [],
      expiresAt: new Date(expiresAt),
      encryptedSecret: encryptSecret(secret),
      secretHash: hashSecret(secret),
      createdById: session.user.id
    }
  });

  await writeAuditLog({ userId: session.user.id, action: "CREATE", entityType: "Credential", entityId: credential.id });

  revalidatePath("/items");
}
