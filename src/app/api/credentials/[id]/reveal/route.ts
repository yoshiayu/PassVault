import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { credentialWhereForScope } from "@/lib/permissions";
import { decryptSecret } from "@/lib/crypto";
import { error, ok } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";
import { getActiveScope } from "@/lib/scope";

type Params = { params: { id: string } };

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const credential = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForScope(session, scope) }
  });

  if (!credential) return error("NOT_FOUND", "Credential not found", 404);
  if (credential.expiresAt < new Date()) {
    return error("EXPIRED", "Credential expired", 409);
  }

  const secret = decryptSecret(credential.encryptedSecret);
  await writeAuditLog({ userId: session.user.id, action: "REVEAL", entityType: "Credential", entityId: credential.id });

  return ok({ secret, length: secret.length });
}
