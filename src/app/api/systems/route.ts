import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { systemSchema } from "@/lib/validators";
import { error, ok } from "@/lib/api-response";
import { systemWhereForScope } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { getActiveScope } from "@/lib/scope";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  const systems = await prisma.system.findMany({
    where: {
      ...systemWhereForScope(session, scope),
      ...(query
        ? {
            OR: [{ name: { contains: query, mode: "insensitive" } }, { tags: { has: query } }]
          }
        : {})
    },
    orderBy: { updatedAt: "desc" }
  });

  return ok(systems);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const body = await request.json();
  const parsed = systemSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid system payload", 400, parsed.error.flatten());
  }

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

  return ok(system, { status: 201 });
}
