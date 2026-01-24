import type { Session } from "next-auth";

export function isAdmin(session: Session): boolean {
  return session.user.role === "ADMIN";
}

export function credentialWhereForSession(session: Session) {
  if (isAdmin(session)) {
    return {};
  }
  return { createdById: session.user.id };
}

export function systemWhereForSession(session: Session) {
  if (isAdmin(session)) {
    return {};
  }
  return { ownerId: session.user.id };
}
