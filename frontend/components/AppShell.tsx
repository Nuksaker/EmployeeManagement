"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  Building2,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users
} from "lucide-react";
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";
import {
  clearAuthSession,
  getCurrentUsername,
  isAuthenticated
} from "../services/api";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <LanguageProvider>
      <AppShellContent>{children}</AppShellContent>
    </LanguageProvider>
  );
}

function AppShellContent({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    const currentUsername = getCurrentUsername();
    setUsername(currentUsername);

    if (!isLoginPage && !isAuthenticated()) {
      setIsReady(false);
      router.replace("/login");
      return;
    }

    setIsReady(true);
  }, [isLoginPage, pathname, router]);

  const navItems = [
    { href: "/", label: t("dashboard"), Icon: LayoutDashboard },
    { href: "/departments", label: t("departments"), Icon: Building2 },
    { href: "/employees", label: t("employees"), Icon: Users }
  ];

  function handleSignOut() {
    clearAuthSession();
    setUsername(null);
    router.replace("/login");
  }

  if (isLoginPage) {
    return <main className="min-h-screen bg-slate-50">{children}</main>;
  }

  if (!isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-sm font-semibold text-slate-500">
        {t("authChecking")}
      </main>
    );
  }

  const shellClass = isCollapsed
    ? "min-h-screen bg-slate-50 transition-[grid-template-columns] duration-300 lg:grid lg:grid-cols-[84px_1fr]"
    : "min-h-screen bg-slate-50 transition-[grid-template-columns] duration-300 lg:grid lg:grid-cols-[280px_1fr]";

  return (
    <div className={shellClass}>
      <aside className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r lg:px-3">
        <div
          className={
            isCollapsed
              ? "flex items-center justify-between gap-3 lg:flex-col lg:justify-center"
              : "flex items-center justify-between gap-3"
          }
        >
          <Link
            href="/"
            className={
              isCollapsed
                ? "flex min-w-0 items-center justify-center"
                : "flex min-w-0 items-center gap-3"
            }
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold tracking-normal text-white shadow-sm shadow-teal-200">
              <ShieldCheck aria-hidden="true" size={21} strokeWidth={2.5} />
            </span>
            {!isCollapsed && (
              <span className="min-w-0">
                <span className="block truncate text-base font-bold text-slate-950">
                  {t("appName")}
                </span>
                <span className="block truncate text-xs font-semibold text-slate-500">
                  {t("secureApi")}
                </span>
              </span>
            )}
          </Link>

          <button
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 lg:flex"
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? t("expandMenu") : t("collapseMenu")}
            title={isCollapsed ? t("expandMenu") : t("collapseMenu")}
          >
            <Menu aria-hidden="true" size={19} strokeWidth={2.5} />
          </button>
        </div>

        <nav
          className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:grid lg:gap-1.5 lg:overflow-visible lg:pb-0"
          aria-label={t("mainMenu")}
        >
          {navItems.map((item) => {
            const Icon = item.Icon;
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "group flex min-h-11 shrink-0 items-center gap-3 rounded-2xl border px-3 text-sm font-semibold transition",
                  isCollapsed ? "lg:justify-center lg:px-2.5" : "lg:px-3",
                  isActive
                    ? "border-teal-200 bg-teal-50 text-teal-800 shadow-sm shadow-teal-100/70"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
                ].join(" ")}
                title={item.label}
              >
                <span
                  className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                    isActive
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-white"
                  ].join(" ")}
                >
                  <Icon aria-hidden="true" size={18} strokeWidth={2.4} />
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-wrap items-center gap-3 lg:mt-auto lg:grid">
          <div
            className={
              isCollapsed
                ? "grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2"
                : "grid gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-3"
            }
          >
            {!isCollapsed && (
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Languages aria-hidden="true" size={14} strokeWidth={2.4} />
                {t("language")}
              </span>
            )}
            <div
              className={
                isCollapsed
                  ? "grid gap-1"
                  : "grid grid-cols-2 gap-1 rounded-xl bg-white p-1"
              }
              role="group"
              aria-label={t("language")}
            >
              {(["en", "th"] as const).map((item) => (
                <button
                  key={item}
                  className={[
                    "min-h-9 rounded-lg px-3 text-xs font-bold transition",
                    language === item
                      ? "bg-teal-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  ].join(" ")}
                  type="button"
                  onClick={() => setLanguage(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div
            className={
              isCollapsed
                ? "grid gap-2 rounded-2xl border border-slate-200 bg-white p-2"
                : "grid gap-3 rounded-3xl border border-slate-200 bg-white p-3"
            }
          >
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-slate-400">
                  {username ? t("signedInAs") : t("notSignedIn")}
                </span>
                <strong className="block truncate text-sm text-slate-900">
                  {username ?? "-"}
                </strong>
              </div>
            )}
            <button
              className={[
                "flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-sm font-bold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100",
                isCollapsed ? "lg:px-2" : ""
              ].join(" ")}
              type="button"
              onClick={handleSignOut}
              title={t("signOut")}
            >
              <LogOut aria-hidden="true" size={17} strokeWidth={2.4} />
              {!isCollapsed && <span>{t("signOut")}</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
