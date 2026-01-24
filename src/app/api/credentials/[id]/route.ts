import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialSchema, credentialUpdateSchema } from "@/lib/validators";
import { error, ok } from "@/lib/api-response";
import { credentialWhereForSession } from "@/lib/permissions";
import { encryptSecret, hashSecret } from "@/lib/crypto";
import { generatePassword } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: { id: string } };

function allowManualSecret(): boolean {
  return (process.env.ALLOW_MANUAL_SECRET ?? "false").toLowerCase() === "true";
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const credential = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForSession(session) },
    include: { system: true }
  });

  if (!credential) return error("NOT_FOUND", "Credential not found", 404);

  return ok(credential);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const existing = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForSession(session) }
  });
  if (!existing) return error("NOT_FOUND", "Credential not found", 404);

  const body = await request.json();
  if (body?.mode === "generate" || body?.mode === "manual") {
    const parsed = credentialSchema.safeParse(body);
    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid credential payload", 400, parsed.error.flatten());
    }

    if (parsed.data.mode === "manual" && !allowManualSecret()) {
      return error("FORBIDDEN", "Manual secrets disabled", 403);
    }

    const secret =
      parsed.data.mode === "manual"
        ? parsed.data.secret ?? ""
        : generatePassword({
            length: parsed.data.length ?? 12,
            minClasses: 4,
            requireSymbol: true,
            maxConsecutive: 2
          });

    const encryptedSecret = encryptSecret(secret);
    const secretHash = hashSecret(secret);

    const updated = await prisma.credential.update({
      where: { id: params.id },
      data: {
        systemId: parsed.data.systemId,
        label: parsed.data.label,
        notes: parsed.data.notes ?? null,
        tags: parsed.data.tags ?? [],
        expiresAt: new Date(parsed.data.expiresAt),
        encryptedSecret,
        secretHash
      }
    });

    await writeAuditLog({ userId: session.user.id, action: "UPDATE", entityType: "Credential", entityId: updated.id });

    return ok(updated);
  }

  const parsed = credentialUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid credential payload", 400, parsed.error.flatten());
  }

  const updated = await prisma.credential.update({
    where: { id: params.id },
    data: {
      systemId: parsed.data.systemId ?? existing.systemId,
      label: parsed.data.label ?? existing.label,
      notes: parsed.data.notes ?? existing.notes,
      tags: parsed.data.tags ?? existing.tags,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : existing.expiresAt
    }
  });

  await writeAuditLog({ userId: session.user.id, action: "UPDATE", entityType: "Credential", entityId: updated.id });

  return ok(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const existing = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForSession(session) }
  });
  if (!existing) return error("NOT_FOUND", "Credential not found", 404);

  await prisma.$transaction([
    prisma.qRToken.deleteMany({ where: { credentialId: params.id } }),
    prisma.credential.delete({ where: { id: params.id } })
  ]);

  await writeAuditLog({ userId: session.user.id, action: "DELETE", entityType: "Credential", entityId: params.id });

  return ok({ id: params.id });
}
