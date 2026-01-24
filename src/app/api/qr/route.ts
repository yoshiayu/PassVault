import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptSecret, hashToken } from "@/lib/crypto";
import { error, ok } from "@/lib/api-response";
import { resolveQrSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resolveQrSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid token", 400, parsed.error.flatten());
  }

  const tokenHash = hashToken(parsed.data.token);
  const qrToken = await prisma.qRToken.findUnique({
    where: { tokenHash },
    include: { credential: true }
  });

  if (!qrToken) return error("NOT_FOUND", "Token not found", 404);
  if (qrToken.usedAt) return error("CONFLICT", "Token already used", 409);
  if (qrToken.expiresAt < new Date()) return error("EXPIRED", "Token expired", 410);

  const secret = decryptSecret(qrToken.credential.encryptedSecret);

  await prisma.qRToken.update({
    where: { id: qrToken.id },
    data: { usedAt: new Date() }
  });

  await writeAuditLog({
    userId: qrToken.createdById,
    action: "RESOLVE_QR",
    entityType: "QRToken",
    entityId: qrToken.id
  });

  return ok({ credentialId: qrToken.credentialId, secret });
}
