import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { getLocalizedProjects, publicCopy } from "@/data/public-site";
import { locales, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/projects">): Promise<Metadata> {
  const { locale } = await params;

  return buildPageMetadata(locale as Locale, "projects");
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function ProjectsPage({
  params,
}: PageProps<"/[locale]/projects">) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const copy = publicCopy[typedLocale];
  const projects = getLocalizedProjects(typedLocale);

  return (
    <div className="bg-white">
      <section className="reveal px-4 py-14 sm:px-6 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              {copy.projects.eyebrow}
            </p>
            <h1 className="mt-5 break-words font-display text-5xl font-semibold leading-[0.98] text-[var(--color-foreground)] md:text-7xl">
              {copy.projects.title}
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {copy.projects.subtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 md:px-10 md:pb-24">
        <div className="mx-auto max-w-7xl space-y-8">
          {projects.map((project, index) => (
            <article
              key={project.id}
              className="premium-lift reveal grid overflow-hidden rounded-[40px] border border-black/8 bg-[#f8fcfe] shadow-[0_26px_80px_rgba(8,27,42,0.08)] hover:shadow-[0_32px_92px_rgba(8,27,42,0.12)] lg:grid-cols-[1fr_1fr]"
              style={{ "--reveal-delay": `${Math.min(index, 5) * 70}ms` } as CSSProperties}
            >
              <div className="relative flex min-h-[340px] items-center justify-center bg-[linear-gradient(180deg,#f5f7f8_0%,#e4e9ec_100%)]">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_48%,rgba(8,27,42,0.08)_49%,rgba(8,27,42,0.08)_51%,transparent_52%,transparent_100%)]" />
                <div className="relative rounded-lg border border-black/10 bg-white/50 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-muted)] shadow-[0_12px_34px_rgba(8,27,42,0.08)]">
                  Placeholder
                </div>
              </div>
              <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-14">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-strong)]">
                  {project.location}
                </p>
                <h2 className="mt-5 max-w-2xl break-words font-display text-4xl font-semibold leading-[1.04] text-[var(--color-foreground)] md:text-5xl">
                  {project.title}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-muted)]">
                  {project.summary}
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {project.metrics.map((metric) => (
                    <div
                      key={`${project.id}-${metric.value}`}
                      className="rounded-[22px] border border-black/8 bg-white p-4"
                    >
                      <p
                        className="text-2xl font-semibold text-[var(--color-foreground)]"
                        data-counter
                        data-counter-value={metric.value}
                      >
                        {metric.value}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-[var(--color-muted)]">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {copy.projects.detailLabel}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                    {typedLocale === "sq"
                      ? "Auditim, instalim, konfigurim dhe dorëzim i qartë."
                      : "Audit, installation, configuration, and clean handover."}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="reveal px-4 pb-18 sm:px-6 md:px-10 md:pb-24" data-parallax>
        <div className="mx-auto max-w-7xl rounded-[36px] bg-[var(--color-panel)] p-8 text-white shadow-[0_28px_80px_rgba(2,14,24,0.26)] sm:p-10">
          <h2 className="max-w-3xl break-words font-display text-3xl font-semibold leading-[1.08] md:text-5xl">
            {typedLocale === "sq"
              ? "Placeholder projekte. Gati për zëvendësim."
              : "Placeholder projects. Ready to replace."}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
            {typedLocale === "sq"
              ? "Struktura është vendosur për raste reale, imazhe dhe metrika të reja."
              : "The structure is prepared for real case studies, images, and updated metrics."}
          </p>
        </div>
      </section>
    </div>
  );
}
