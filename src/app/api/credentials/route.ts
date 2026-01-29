import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialSchema } from "@/lib/validators";
import { error, ok } from "@/lib/api-response";
import { credentialWhereForScope, systemWhereForScope } from "@/lib/permissions";
import { encryptSecret, hashSecret } from "@/lib/crypto";
import { generatePassword, policyFromPreset } from "@/lib/password";
import { writeAuditLog } from "@/lib/audit";
import { getActiveScope } from "@/lib/scope";

function allowManualSecret(): boolean {
  return (process.env.ALLOW_MANUAL_SECRET ?? "false").toLowerCase() === "true";
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const systemId = searchParams.get("systemId");
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");
  const expiresInDays = searchParams.get("expiresInDays");
  const sort = searchParams.get("sort") ?? "expiresAt-asc";

  const now = new Date();
  const where = {
    ...credentialWhereForScope(session, scope),
    ...(systemId ? { systemId } : {}),
    ...(tag ? { tags: { has: tag } } : {}),
    ...(query
      ? {
          OR: [
            { label: { contains: query, mode: "insensitive" } },
            { notes: { contains: query, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(status === "expired" ? { expiresAt: { lt: now } } : {}),
    ...(status === "active" ? { expiresAt: { gte: now } } : {}),
    ...(expiresInDays
      ? {
          expiresAt: {
            lte: new Date(now.getTime() + Number(expiresInDays) * 24 * 60 * 60 * 1000),
            gte: now
          }
        }
      : {})
  };

  const orderBy = sort === "createdAt-desc" ? { createdAt: "desc" } : { expiresAt: "asc" };

  const credentials = await prisma.credential.findMany({
    where,
    include: { system: true },
    orderBy
  });

  return ok(credentials);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const body = await request.json();
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
          ...policyFromPreset(parsed.data.passwordPolicy ?? "full", parsed.data.length ?? 12)
        });

  if (!secret) {
    return error("VALIDATION_ERROR", "Secret is required", 400);
  }

  const system = await prisma.system.findFirst({
    where: { id: parsed.data.systemId, ...systemWhereForScope(session, scope) }
  });

  if (!system) {
    return error("NOT_FOUND", "System not found", 404);
  }

  const encryptedSecret = encryptSecret(secret);
  const secretHash = hashSecret(secret);

  const credential = await prisma.credential.create({
    data: {
      systemId: parsed.data.systemId,
      label: parsed.data.label,
      notes: parsed.data.notes ?? null,
      tags: parsed.data.tags ?? [],
      expiresAt: new Date(parsed.data.expiresAt),
      encryptedSecret,
      secretHash,
      createdById: session.user.id
    }
  });

  await writeAuditLog({ userId: session.user.id, action: "CREATE", entityType: "Credential", entityId: credential.id });

  return ok({ ...credential, generatedSecret: secret }, { status: 201 });
}
