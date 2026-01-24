import { prisma } from "@/lib/prisma";
import { createSystem } from "@/app/actions/system-actions";

export default async function SettingsPage() {
  const systems = await prisma.system.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { credentials: true } } }
  });

  return (
    <div className="flex flex-col gap-8">
      <section className="glass-panel p-6">
        <h1 className="text-2xl font-semibold text-white">Admin settings</h1>
        <p className="mt-2 text-sm text-white/70">
          Adjust password generation policy and cleanup rules in the next iteration. Current view focuses on system registry.
        </p>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">Register system</h2>
        <form action={createSystem} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs text-white/60">
            Name
            <input name="name" className="glass-field" placeholder="System name" required />
          </label>
          <label className="flex flex-col gap-2 text-xs text-white/60">
            Tags (comma separated)
            <input name="tags" className="glass-field" placeholder="infra, finance" />
          </label>
          <label className="flex flex-col gap-2 text-xs text-white/60 md:col-span-3">
            Description
            <textarea name="description" className="glass-field min-h-[90px]" placeholder="Usage and access notes" />
          </label>
          <button
            type="submit"
            className="md:col-span-3 rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
          >
            Save system
          </button>
        </form>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">System registry</h2>
        <div className="mt-4 space-y-3">
          {systems.map((system) => (
            <div key={system.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{system.name}</p>
                  <p className="text-xs text-white/60">{system.description ?? "No description"}</p>
                </div>
                <span className="text-xs text-white/60">{system._count.credentials} creds</span>
              </div>
            </div>
          ))}
          {systems.length === 0 ? <p className="text-sm text-white/60">No systems registered.</p> : null}
        </div>
      </section>
    </div>
  );
}
