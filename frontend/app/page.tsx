"use client";

import Link from "next/link";
import { Building2, ShieldCheck, Users } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

export default function HomePage() {
  const { t } = useLanguage();

  const cards = [
    {
      href: "/departments",
      Icon: Building2,
      title: t("homeDepartmentsTitle"),
      description: t("homeDepartmentsDescription"),
      action: t("openDepartments"),
      accent: "border-teal-200 bg-teal-50 text-teal-700"
    },
    {
      href: "/employees",
      Icon: Users,
      title: t("homeEmployeesTitle"),
      description: t("homeEmployeesDescription"),
      action: t("openEmployees"),
      accent: "border-sky-200 bg-sky-50 text-sky-700"
    }
  ];

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:p-8">
        <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-teal-700">
          <ShieldCheck aria-hidden="true" className="mr-2" size={14} strokeWidth={2.5} />
          {t("protectedWorkspace")}
        </span>
        <div className="mt-5 max-w-3xl">
          <h1 className="text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            {t("homeTitle")}
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {t("homeDescription")}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.href}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70"
          >
            <div
              className={[
                "flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-black tracking-normal",
                card.accent
              ].join(" ")}
            >
              <card.Icon aria-hidden="true" size={22} strokeWidth={2.4} />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-normal text-slate-950">
              {card.title}
            </h2>
            <p className="mt-2 min-h-14 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition group-hover:bg-teal-700"
            >
              {card.action}
            </Link>
          </article>
        ))}
      </section>

      {/* <section className="rounded-3xl border border-slate-200 bg-slate-100/70 p-5">
        <p className="text-sm font-bold text-slate-500">{t("quickActions")}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/departments"
            className="inline-flex min-h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          >
            {t("addDepartment")}
          </Link>
          <Link
            href="/employees"
            className="inline-flex min-h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            {t("addEmployee")}
          </Link>
        </div>
      </section> */}
    </div>
  );
}
