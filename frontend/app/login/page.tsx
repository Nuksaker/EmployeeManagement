"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Languages, LogIn, Server, ShieldCheck } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { authApi, isAuthenticated, setAuthSession } from "../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t, formatApiError } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const session = await authApi.login(username, password);
      setAuthSession(session);
      router.replace("/");
    } catch (err) {
      setError(formatApiError(err, "invalidLoginFallback"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold tracking-normal text-white shadow-sm shadow-teal-200">
              <ShieldCheck aria-hidden="true" size={21} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-950">{t("appName")}</p>
              <p className="text-xs font-semibold text-slate-500">
                {t("secureApi")}
              </p>
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
            role="group"
            aria-label={t("language")}
          >
            {(["en", "th"] as const).map((item) => (
              <button
                key={item}
                className={[
                  "min-h-9 rounded-xl px-4 text-xs font-bold transition",
                  language === item
                    ? "bg-teal-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                ].join(" ")}
                type="button"
                onClick={() => setLanguage(item)}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        <main className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_440px] lg:py-12">
          <section className="max-w-2xl">
            {/* <span className="inline-flex rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-teal-700">
              <ShieldCheck aria-hidden="true" className="mr-2" size={14} strokeWidth={2.5} />
              {t("loginEyebrow")}
            </span> */}
            <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
              {t("loginTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {t("loginDescription")}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-600">
                  <Server aria-hidden="true" size={14} strokeWidth={2.4} />
                  REST API
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  ASP.NET Core + SQL Server
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-7">
            <div className="mb-6">
              {/* <p className="flex items-center gap-2 text-sm font-bold text-teal-700">
                <Languages aria-hidden="true" size={16} strokeWidth={2.4} />
                {t("loginEyebrow")}
              </p> */}
              <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950">
                {t("signIn")}
              </h2>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {error}
              </div>
            )}

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label
                  className="text-sm font-bold text-slate-600"
                  htmlFor="username"
                >
                  {t("username")} <span className="text-rose-600">*</span>
                </label>
                <input
                  className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-bold text-slate-600"
                  htmlFor="password"
                >
                  {t("password")} <span className="text-rose-600">*</span>
                </label>
                <input
                  className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100"
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button
                className="mt-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-black text-white shadow-lg shadow-teal-200 transition hover:bg-teal-700 disabled:opacity-60"
                type="submit"
                disabled={isSaving}
              >
                <LogIn aria-hidden="true" size={18} strokeWidth={2.5} />
                {isSaving ? t("signingIn") : t("loginButton")}
              </button>
            </form>
          </section>
        </main>
      </div>
    </section>
  );
}
