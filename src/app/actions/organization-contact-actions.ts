"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { organizationContactSchema } from "@/lib/validators";
import { getActiveScope } from "@/lib/scope";
import { writeAuditLog } from "@/lib/audit";

function normalizeOptional(value: FormDataEntryValue | null) {
  const trimmed = String(value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

export async function createOrganizationContact(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const scope = await getActiveScope(session);
  if (scope.type !== "organization") {
    throw new Error("Organization scope required");
  }

  const raw = {
    kind: String(formData.get("kind") ?? "PERSON"),
    name: normalizeOptional(formData.get("name")),
    address: normalizeOptional(formData.get("address")),
    phone: normalizeOptional(formData.get("phone")),
    email: normalizeOptional(formData.get("email"))
  };

  const parsed = organizationContactSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid organization contact payload");
  }

  const contact = await prisma.organizationContact.create({
    data: {
      ...parsed.data,
      organizationId: scope.organizationId
    }
  });

  await writeAuditLog({
    userId: session.user.id,
    action: "CREATE",
    entityType: "OrganizationContact",
    entityId: contact.id
  });

  revalidatePath("/settings");
}

export async function updateOrganizationContact(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const scope = await getActiveScope(session);
  if (scope.type !== "organization") {
    throw new Error("Organization scope required");
  }

  const contactId = String(formData.get("contactId") ?? "").trim();
  if (!contactId) {
    throw new Error("Contact id required");
  }

  const raw = {
    kind: String(formData.get("kind") ?? "PERSON"),
    name: normalizeOptional(formData.get("name")),
    address: normalizeOptional(formData.get("address")),
    phone: normalizeOptional(formData.get("phone")),
    email: normalizeOptional(formData.get("email"))
  };

  const parsed = organizationContactSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid organization contact payload");
  }

  const result = await prisma.organizationContact.updateMany({
    where: { id: contactId, organizationId: scope.organizationId },
    data: parsed.data
  });

  if (result.count === 0) {
    throw new Error("Contact not found");
  }

  await writeAuditLog({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "OrganizationContact",
    entityId: contactId
  });

  revalidatePath("/settings");
}
