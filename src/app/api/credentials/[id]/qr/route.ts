import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { error, ok } from "@/lib/api-response";
import { credentialWhereForScope } from "@/lib/permissions";
import { hashToken } from "@/lib/crypto";
import QRCode from "qrcode";
import crypto from "crypto";
import { writeAuditLog } from "@/lib/audit";
import { getActiveScope } from "@/lib/scope";

type Params = { params: { id: string } };

function getTokenTtlMinutes() {
  return Number(process.env.QR_TOKEN_TTL_MINUTES ?? 5);
}

function getBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export async function POST(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return error("UNAUTHORIZED", "Login required", 401);

  const scope = await getActiveScope(session);
  const credential = await prisma.credential.findFirst({
    where: { id: params.id, ...credentialWhereForScope(session, scope) },
    include: { system: true }
  });

  if (!credential) return error("NOT_FOUND", "Credential not found", 404);
  if (credential.expiresAt < new Date()) {
    return error("EXPIRED", "Credential expired", 409);
  }

  const token = crypto.randomUUID() + crypto.randomBytes(8).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + getTokenTtlMinutes() * 60 * 1000);

  const qrToken = await prisma.qRToken.create({
    data: {
      credentialId: credential.id,
      tokenHash,
      expiresAt,
      createdById: session.user.id
    }
  });

  const payloadUrl = `${getBaseUrl()}/qr?token=${encodeURIComponent(token)}`;
  const dataUrl = await QRCode.toDataURL(payloadUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    color: { dark: "#79d5ff", light: "#0b0f14" }
  });

  await writeAuditLog({ userId: session.user.id, action: "CREATE_QR", entityType: "QRToken", entityId: qrToken.id });

  return ok({ token, expiresAt, dataUrl, credentialId: credential.id, payloadUrl });
}
