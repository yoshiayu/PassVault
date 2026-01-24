import type { Session } from "next-auth";
import type { Prisma } from "@prisma/client";
import type { ActiveScope } from "@/lib/scope";

export function isAdmin(session: Session): boolean {
  return session.user.role === "ADMIN";
}

export function systemWhereForScope(session: Session, scope: ActiveScope): Prisma.SystemWhereInput {
  if (isAdmin(session)) {
    return {};
  }

  if (scope.type === "organization") {
    return { scopeType: "ORGANIZATION", organizationId: scope.organizationId };
  }

  return { scopeType: "PERSONAL", ownerId: session.user.id };
}

export function credentialWhereForScope(session: Session, scope: ActiveScope): Prisma.CredentialWhereInput {
  if (isAdmin(session)) {
    return {};
  }

  return { system: systemWhereForScope(session, scope) };
}
