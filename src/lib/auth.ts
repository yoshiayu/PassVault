import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function isAllowedDomain(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? "").split(",").map((d) => d.trim()).filter(Boolean);
  if (allowed.length === 0) return true;
  const domain = email.split("@")[1] ?? "";
  return allowed.includes(domain);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async signIn({ user }) {
      if (!isAllowedDomain(user.email)) {
        return "/signin?error=AccessDenied";
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }
      return session;
    }
  },
  session: {
    strategy: "database"
  }
};
