"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

type PaginationControlsProps = {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (pageNumber: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const pageSizeOptions = [5, 10, 20, 50];

export default function PaginationControls({
  pageNumber,
  pageSize,
  totalCount,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) {
  const { t } = useLanguage();
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-bold text-slate-500" htmlFor="pageSize">
          {t("rowsPerPage")}
        </label>
        <select
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
          id="pageSize"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-sm font-semibold text-slate-500">
          {totalCount} {t("records")}
        </span>
      </div>

      <div className="flex items-center justify-end gap-3">
        <span className="text-sm font-bold text-slate-600">
          {t("page")} {pageNumber} {t("of")} {safeTotalPages}
        </span>
        <div className="flex gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
            type="button"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={!hasPreviousPage}
            aria-label={t("previousPage")}
            title={t("previousPage")}
          >
            <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-50"
            type="button"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={!hasNextPage}
            aria-label={t("nextPage")}
            title={t("nextPage")}
          >
            <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
