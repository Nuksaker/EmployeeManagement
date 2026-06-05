"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getFileUrl } from "../services/api";
import { Employee } from "../types/employee";

type EmployeeTableProps = {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

export default function EmployeeTable({
  employees,
  onEdit,
  onDelete
}: EmployeeTableProps) {
  const { t, formatDate } = useLanguage();

  if (employees.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm font-semibold text-slate-500">
          {t("noEmployeesFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[980px] w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-400">
            <th className="px-5 py-4">{t("id")}</th>
            <th className="px-5 py-4">{t("photo")}</th>
            <th className="px-5 py-4">{t("name")}</th>
            <th className="px-5 py-4">{t("gender")}</th>
            <th className="px-5 py-4">{t("dateJoined")}</th>
            <th className="px-5 py-4">{t("department")}</th>
            <th className="px-5 py-4">{t("address")}</th>
            <th className="w-28 px-5 py-4 text-right">{t("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr
              className="text-sm text-slate-600 transition hover:bg-slate-50/80"
              key={employee.employeeId}
            >
              <td className="px-5 py-4 font-bold text-slate-500">
                #{employee.employeeId}
              </td>
              <td className="px-5 py-4">
                {employee.photo ? (
                  <img
                    className="h-11 w-11 rounded-2xl border border-slate-200 object-cover"
                    src={getFileUrl(employee.photo)}
                    alt={`${employee.employeeFirstName} ${employee.employeeLastName}`}
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-400">
                    -
                  </span>
                )}
              </td>
              <td className="px-5 py-4">
                <p className="font-bold text-slate-950">
                  {employee.employeeFirstName} {employee.employeeLastName}
                </p>
              </td>
              <td className="px-5 py-4">{employee.gender || "-"}</td>
              <td className="px-5 py-4">{formatDate(employee.dateJoined)}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                  {employee.departmentName}
                </span>
              </td>
              <td className="max-w-[220px] truncate px-5 py-4">
                {employee.employeeAddress || "-"}
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex justify-end gap-2 whitespace-nowrap">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                    type="button"
                    onClick={() => onEdit(employee)}
                    aria-label={t("edit")}
                    title={t("edit")}
                  >
                    <Pencil aria-hidden="true" size={16} strokeWidth={2.3} />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
                    type="button"
                    onClick={() => onDelete(employee)}
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
