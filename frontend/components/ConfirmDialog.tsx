"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { ReactNode } from "react";
import { useLanguage } from "../contexts/LanguageContext";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  recordName?: string;
  isBusy?: boolean;
  confirmLabel?: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  recordName,
  isBusy = false,
  confirmLabel,
  children,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
    >
      <section
        className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-2xl shadow-slate-950/20"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
              <AlertTriangle aria-hidden="true" size={21} strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-rose-500">
                {t("deleteDialogEyebrow")}
              </p>
              <h2
                className="mt-1 text-lg font-black tracking-normal text-slate-950"
                id="confirm-title"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            aria-label={t("modalClose")}
          >
            <X aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid gap-4 px-5 py-5">
          <p className="text-sm leading-6 text-slate-600" id="confirm-message">
            {message}
          </p>

          {recordName && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {t("selectedRecord")}
              </p>
              <p className="mt-1 break-words text-sm font-black text-slate-950">
                {recordName}
              </p>
            </div>
          )}

          {children}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
            type="button"
            onClick={onCancel}
            disabled={isBusy}
          >
            {t("cancel")}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:opacity-60"
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
          >
            <Trash2 aria-hidden="true" size={17} strokeWidth={2.5} />
            {isBusy ? t("deleting") : confirmLabel ?? t("delete")}
          </button>
        </div>
      </section>
    </div>
  );
}
