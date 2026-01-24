import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { batchSchema } from "@/lib/validators";
import { error, ok } from "@/lib/api-response";
import { generatePassword } from "@/lib/password";
import { encryptSecret, hashSecret } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const body = await request.json();
  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return error("VALIDATION_ERROR", "Invalid batch payload", 400, parsed.error.flatten());
  }

  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (start > end) return error("VALIDATION_ERROR", "startDate must be before endDate", 400);

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const expiresInDays = parsed.data.expiresInDays ?? 7;
  const results = await prisma.$transaction(
    days.map((day) => {
      const secret = generatePassword({
        length: parsed.data.length ?? 12,
        minClasses: 4,
        requireSymbol: true,
        maxConsecutive: 2
      });
      return prisma.credential.create({
        data: {
          systemId: parsed.data.systemId,
          label: `${parsed.data.labelPrefix}-${day.toISOString().slice(0, 10)}`,
          notes: null,
          tags: [],
          expiresAt: new Date(day.getTime() + expiresInDays * 24 * 60 * 60 * 1000),
          encryptedSecret: encryptSecret(secret),
          secretHash: hashSecret(secret),
          createdById: session.user.id
        }
      });
    })
  );

  await writeAuditLog({
    userId: session.user.id,
    action: "BATCH_CREATE",
    entityType: "Credential",
    entityId: parsed.data.systemId
  });

  return ok({ count: results.length }, { status: 201 });
}
