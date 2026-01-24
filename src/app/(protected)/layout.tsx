import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authOptions } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="/PassVault.png"
              alt="PassVault logo"
              width={120}
              height={120}
              className="h-30 w-30 shrink-0 drop-shadow-[0_0_16px_rgba(76,195,255,0.6)]"
              priority
            />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neon-blue">PassVault QR</p>
              <p className="text-xs text-white/60">Secure credential lifecycle</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-white/80 hover:text-white">
              Dashboard
            </Link>
            <Link href="/items" className="text-white/80 hover:text-white">
              Credentials
            </Link>
            <Link href="/settings" className="text-white/80 hover:text-white">
              Settings
            </Link>
            <Link href="/api/auth/signout" className="rounded-full border border-glass-border px-4 py-1 text-white/80">
              Sign out
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
