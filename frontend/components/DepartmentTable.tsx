"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Department } from "../types/department";

type DepartmentTableProps = {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
};

export default function DepartmentTable({
  departments,
  onEdit,
  onDelete
}: DepartmentTableProps) {
  const { t, formatDate } = useLanguage();

  if (departments.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-semibold text-slate-500">
          {t("noDepartmentsFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4">{t("id")}</th>
            <th className="px-5 py-4">{t("name")}</th>
            <th className="px-5 py-4">{t("address")}</th>
            <th className="px-5 py-4">{t("created")}</th>
            <th className="w-28 px-5 py-4 text-right">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {departments.map((department) => (
            <tr
              className="text-sm text-slate-600 transition hover:bg-slate-50/80"
              key={department.departmentId}
            >
              <td className="px-5 py-4 font-bold text-slate-500">
                #{department.departmentId}
              </td>
              <td className="px-5 py-4 font-bold text-slate-950">
                {department.departmentName}
              </td>
              <td className="px-5 py-4">{department.departmentAddress || "-"}</td>
              <td className="px-5 py-4">{formatDate(department.createdAt)}</td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2 whitespace-nowrap">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                    type="button"
                    onClick={() => onEdit(department)}
                    aria-label={t("edit")}
                    title={t("edit")}
                  >
                    <Pencil aria-hidden="true" size={16} strokeWidth={2.3} />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                    type="button"
                    onClick={() => onDelete(department)}
                    aria-label={t("delete")}
                    title={t("delete")}
                  >
                    <Trash2 aria-hidden="true" size={16} strokeWidth={2.3} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
