"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationSchema } from "@/lib/validators";
import { writeAuditLog } from "@/lib/audit";

export async function createOrganization(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const raw = { name: String(formData.get("name") ?? "") };
  const parsed = organizationSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid organization payload");
  }

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      memberships: {
        create: { userId: session.user.id, role: "OWNER" }
      }
    }
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeOrganizationId: organization.id }
  });

  await writeAuditLog({ userId: session.user.id, action: "CREATE", entityType: "Organization", entityId: organization.id });

  revalidatePath("/settings");
}

export async function setActiveScope(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const organizationId = String(formData.get("organizationId") ?? "").trim();

  if (!organizationId) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeOrganizationId: null }
    });
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    revalidatePath("/items");
    return;
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, organizationId }
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeOrganizationId: organizationId }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/items");
}

export async function deleteOrganization(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  if (!organizationId) {
    throw new Error("Organization id required");
  }

  const membership = await prisma.membership.findFirst({
    where: { userId: session.user.id, organizationId, role: "OWNER" }
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  await prisma.user.updateMany({
    where: { activeOrganizationId: organizationId },
    data: { activeOrganizationId: null }
  });

  await prisma.organization.delete({ where: { id: organizationId } });

  await writeAuditLog({ userId: session.user.id, action: "DELETE", entityType: "Organization", entityId: organizationId });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/items");
}
