import { prisma } from "@/lib/prisma";
import { createSystem, deleteSystem } from "@/app/actions/system-actions";
import { createOrganization, deleteOrganization, setActiveScope } from "@/app/actions/scope-actions";
import { createOrganizationContact, updateOrganizationContact } from "@/app/actions/organization-contact-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveScope } from "@/lib/scope";
import { systemWhereForScope } from "@/lib/permissions";
import { createTranslator } from "@/lib/i18n/messages";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const locale = getLocaleFromCookies();
  const t = createTranslator(locale);

  const scope = await getActiveScope(session);
  const [systems, organizations, user] = await Promise.all([
    prisma.system.findMany({
      where: systemWhereForScope(session, scope),
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { credentials: true } } }
    }),
    prisma.organization.findMany({
      where: { memberships: { some: { userId: session.user.id } } },
      orderBy: { name: "asc" }
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeOrganizationId: true }
    })
  ]);

  const activeOrganization = organizations.find((org) => org.id === user?.activeOrganizationId) ?? null;
  const organizationContacts =
    activeOrganization && prisma.organizationContact
      ? await prisma.organizationContact.findMany({
          where: { organizationId: activeOrganization.id },
          orderBy: { createdAt: "desc" }
        })
      : [];

  const scopeLabel = activeOrganization
    ? t("settings.scopeOrganization", { name: activeOrganization.name })
    : t("settings.scopePersonal");

  return (
    <div className="flex flex-col gap-8">
      <section className="glass-panel p-6">
        <h1 className="text-2xl font-semibold text-white">{t("settings.adminTitle")}</h1>
        <p className="mt-2 text-sm text-white/70">
          {t("settings.adminSubtitle")}
        </p>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">{t("settings.scopeTitle")}</h2>
        <p className="mt-2 text-sm text-white/70">
          {t("settings.scopeCurrent", { scope: scopeLabel })}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <form action={setActiveScope}>
            <input type="hidden" name="organizationId" value="" />
            <button
              type="submit"
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                activeOrganization
                  ? "border-glass-border text-white/70 hover:border-neon-blue"
                  : "border-neon-blue bg-white/10 text-white shadow-glow"
              }`}
            >
              {t("settings.scopePersonal")}
            </button>
          </form>
          {organizations.map((org) => {
            const isActive = org.id === activeOrganization?.id;
            return (
              <div key={org.id} className="flex items-center gap-2">
                <form action={setActiveScope}>
                  <input type="hidden" name="organizationId" value={org.id} />
                  <button
                    type="submit"
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-neon-blue bg-white/10 text-white shadow-glow"
                        : "border-glass-border text-white/70 hover:border-neon-blue"
                    }`}
                  >
                    {org.name}
                  </button>
                </form>
                <form action={deleteOrganization}>
                  <input type="hidden" name="organizationId" value={org.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-rose-400/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/80 transition hover:border-rose-300 hover:text-rose-100"
                  >
                    {t("settings.delete")}
                  </button>
                </form>
              </div>
            );
          })}
          {organizations.length === 0 ? <p className="text-sm text-white/60">{t("settings.noOrganizations")}</p> : null}
        </div>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">{t("settings.createOrganizationTitle")}</h2>
        <form action={createOrganization} className="mt-4 flex flex-col gap-4 md:flex-row md:items-end">
          <label className="flex flex-1 flex-col gap-2 text-xs text-white/60">
            {t("settings.organizationName")}
            <input name="name" className="glass-field" placeholder={t("settings.organizationPlaceholder")} required />
          </label>
          <button
            type="submit"
            className="rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
          >
            {t("settings.create")}
          </button>
        </form>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">{t("settings.directoryTitle")}</h2>
        <p className="mt-2 text-sm text-white/70">
          {t("settings.directorySubtitle")}
        </p>
        {!activeOrganization ? (
          <p className="mt-4 text-sm text-white/60">{t("settings.directoryInactive")}</p>
        ) : (
          <>
            <form action={createOrganizationContact} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs text-white/60">
                {t("settings.directoryType")}
                <select name="kind" className="glass-field">
                  <option value="PERSON">{t("settings.directoryPersonal")}</option>
                  <option value="COMPANY">{t("settings.directoryCorporate")}</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs text-white/60">
                {t("settings.directoryName")}
                <input name="name" className="glass-field" placeholder={t("settings.directoryNamePlaceholder")} />
              </label>
              <label className="flex flex-col gap-2 text-xs text-white/60">
                {t("settings.directoryAddress")}
                <input name="address" className="glass-field" placeholder={t("settings.directoryAddressPlaceholder")} />
              </label>
              <label className="flex flex-col gap-2 text-xs text-white/60">
                {t("settings.directoryPhone")}
                <input name="phone" className="glass-field" placeholder={t("settings.directoryPhonePlaceholder")} />
              </label>
              <label className="flex flex-col gap-2 text-xs text-white/60">
                {t("settings.directoryEmail")}
                <input name="email" className="glass-field" placeholder={t("settings.directoryEmailPlaceholder")} />
              </label>
              <button
                type="submit"
                className="md:col-span-2 rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
              >
                {t("settings.directoryAddEntry")}
              </button>
            </form>
            <div className="mt-6 space-y-4">
              {organizationContacts.map((contact) => (
                <form
                  key={contact.id}
                  action={updateOrganizationContact}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <input type="hidden" name="contactId" value={contact.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs text-white/60">
                      {t("settings.directoryType")}
                      <select name="kind" className="glass-field" defaultValue={contact.kind}>
                        <option value="PERSON">{t("settings.directoryPersonal")}</option>
                        <option value="COMPANY">{t("settings.directoryCorporate")}</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-white/60">
                      {t("settings.directoryName")}
                      <input name="name" className="glass-field" defaultValue={contact.name ?? ""} />
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-white/60">
                      {t("settings.directoryAddress")}
                      <input name="address" className="glass-field" defaultValue={contact.address ?? ""} />
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-white/60">
                      {t("settings.directoryPhone")}
                      <input name="phone" className="glass-field" defaultValue={contact.phone ?? ""} />
                    </label>
                    <label className="flex flex-col gap-2 text-xs text-white/60">
                      {t("settings.directoryEmail")}
                      <input name="email" className="glass-field" defaultValue={contact.email ?? ""} />
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {t("settings.directoryUpdated", { date: contact.updatedAt.toLocaleDateString(locale) })}
                    </span>
                    <button
                      type="submit"
                      className="rounded-full border border-glass-border px-4 py-1 text-xs font-semibold text-white/80 transition hover:border-neon-blue"
                    >
                      {t("settings.directorySaveChanges")}
                    </button>
                  </div>
                </form>
              ))}
              {organizationContacts.length === 0 ? (
                <p className="text-sm text-white/60">{t("settings.directoryEmpty")}</p>
              ) : null}
            </div>
          </>
        )}
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">{t("settings.registerSystemTitle")}</h2>
        <form action={createSystem} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-2 text-xs text-white/60">
            {t("settings.systemName")}
            <input name="name" className="glass-field" placeholder={t("settings.systemNamePlaceholder")} required />
          </label>
          <label className="flex flex-col gap-2 text-xs text-white/60">
            {t("settings.systemTags")}
            <input name="tags" className="glass-field" placeholder={t("settings.systemTagsPlaceholder")} />
          </label>
          <label className="flex flex-col gap-2 text-xs text-white/60 md:col-span-3">
            {t("settings.systemDescription")}
            <textarea
              name="description"
              className="glass-field min-h-[90px]"
              placeholder={t("settings.systemDescriptionPlaceholder")}
            />
          </label>
          <button
            type="submit"
            className="md:col-span-3 rounded-full border border-glass-border bg-white/10 px-6 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-white/20"
          >
            {t("settings.systemSave")}
          </button>
        </form>
      </section>
      <section className="glass-panel p-6">
        <h2 className="text-lg font-semibold text-white">{t("settings.systemRegistryTitle")}</h2>
        <div className="mt-4 space-y-3">
          {systems.map((system) => (
            <div key={system.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">{system.name}</p>
                  <p className="text-xs text-white/60">{system.description ?? t("settings.systemNoDescription")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/60">
                    {t("settings.systemCreds", { count: system._count.credentials })}
                  </span>
                  <form action={deleteSystem}>
                    <input type="hidden" name="systemId" value={system.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-400/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-100/80 transition hover:border-rose-300 hover:text-rose-100"
                    >
                      {t("settings.delete")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
          {systems.length === 0 ? <p className="text-sm text-white/60">{t("settings.systemNoSystems")}</p> : null}
        </div>
      </section>
    </div>
  );
}
