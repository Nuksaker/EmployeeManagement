"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type ModalProps = {
  title: string;
  isOpen: boolean;
  children: ReactNode;
  onClose: () => void;
};

export default function Modal({ title, isOpen, children, onClose }: ModalProps) {
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
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-5">
          <h2
            className="text-lg font-black tracking-normal text-slate-950"
            id="modal-title"
          >
            {title}
          </h2>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            type="button"
            onClick={onClose}
            aria-label={t("modalClose")}
          >
            <X aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </div>
        <div className="max-h-[calc(100vh-6rem)] overflow-y-auto p-5">
          {children}
        </div>
      </section>
    </div>
  );
}
