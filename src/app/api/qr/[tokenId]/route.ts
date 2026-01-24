import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error, ok } from "@/lib/api-response";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: { tokenId: string } };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const existing = await prisma.qRToken.findUnique({ where: { id: params.tokenId } });
  if (!existing) return error("NOT_FOUND", "Token not found", 404);

  await prisma.qRToken.delete({ where: { id: params.tokenId } });
  await writeAuditLog({ userId: session.user.id, action: "REVOKE_QR", entityType: "QRToken", entityId: params.tokenId });

  return ok({ id: params.tokenId });
}
