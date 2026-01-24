import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-16">
      <section className="glass-panel p-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="glass-chip">PassVault QR</span>
            <Image
              src="/PassVault%20(1).png"
              alt="PassVault"
              width={220}
              height={64}
              className="h-10 w-auto drop-shadow-[0_0_12px_rgba(125,231,255,0.65)]"
              priority
            />
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white">
            Secure, consistent credential lifecycle with QR handoff.
          </h1>
          <p className="max-w-2xl text-base text-white/70">
            Centralize systems, auto-generate strong passwords, and hand off secrets with short-lived QR tokens.
            Designed for internal security teams and operators who need repeatable governance.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signin"
              className="rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
            >
              Sign in with Google
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-glass-border px-6 py-2 text-sm font-semibold text-neon-blue transition hover:border-neon-blue"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Policy-based generation",
            desc: "Length, character classes, and cadence rules stored in a single place."
          },
          {
            title: "Lifecycle visibility",
            desc: "Track expirations, auto-expire QR access, and prevent stale credentials."
          },
          {
            title: "Audit ready",
            desc: "Every create, view, and delete action is logged without storing secrets."
          }
        ].map((item) => (
          <div key={item.title} className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-3 text-sm text-white/70">{item.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
