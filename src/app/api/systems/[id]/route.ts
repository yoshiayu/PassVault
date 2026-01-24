import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { systemSchema } from "@/lib/validators";
import { error, ok } from "@/lib/api-response";
import { systemWhereForSession } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const system = await prisma.system.findFirst({
    where: { id: params.id, ...systemWhereForSession(session) },
    include: { credentials: true }
  });

  if (!system) return error("NOT_FOUND", "System not found", 404);

  return ok(system);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const existing = await prisma.system.findFirst({
    where: { id: params.id, ...systemWhereForSession(session) }
  });
  if (!existing) return error("NOT_FOUND", "System not found", 404);

  const body = await request.json();
  const parsed = systemSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid system payload", 400, parsed.error.flatten());
  }

  const updated = await prisma.system.update({
    where: { id: params.id },
    data: { ...parsed.data, tags: parsed.data.tags ?? [] }
  });

  await writeAuditLog({ userId: session.user.id, action: "UPDATE", entityType: "System", entityId: updated.id });

  return ok(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const existing = await prisma.system.findFirst({
    where: { id: params.id, ...systemWhereForSession(session) }
  });
  if (!existing) return error("NOT_FOUND", "System not found", 404);

  await prisma.system.delete({ where: { id: params.id } });
  await writeAuditLog({ userId: session.user.id, action: "DELETE", entityType: "System", entityId: params.id });

  return ok({ id: params.id });
}
