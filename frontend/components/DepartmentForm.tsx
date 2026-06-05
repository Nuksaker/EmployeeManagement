"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Department, DepartmentFormValues } from "../types/department";

type DepartmentFormProps = {
  selectedDepartment: Department | null;
  isSaving: boolean;
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
  onCancelEdit: () => void;
};

const emptyValues: DepartmentFormValues = {
  departmentName: "",
  departmentAddress: ""
};

const departmentFieldLimits = {
  name: 100,
  address: 255
} as const;

const inputClass =
  "min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100";

export default function DepartmentForm({
  selectedDepartment,
  isSaving,
  onSubmit,
  onCancelEdit
}: DepartmentFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<DepartmentFormValues>(emptyValues);

  useEffect(() => {
    if (selectedDepartment) {
      setValues({
        departmentName: selectedDepartment.departmentName,
        departmentAddress: selectedDepartment.departmentAddress ?? ""
      });
    } else {
      setValues(emptyValues);
    }
  }, [selectedDepartment]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);

    if (!selectedDepartment) {
      setValues(emptyValues);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-bold text-slate-600" htmlFor="departmentName">
          {t("departmentName")} <span className="text-rose-600">*</span>
        </label>
        <input
          className={inputClass}
          id="departmentName"
          name="departmentName"
          value={values.departmentName}
          onChange={(event) =>
            setValues({ ...values, departmentName: event.target.value })
          }
          required
          pattern=".*\S.*"
          title={t("departmentNameRequiredTitle")}
          maxLength={departmentFieldLimits.name}
        />
      </div>

      <div className="grid gap-2">
        <label
          className="text-sm font-bold text-slate-600"
          htmlFor="departmentAddress"
        >
          {t("departmentAddress")}
        </label>
        <textarea
          className={`${inputClass} min-h-28 resize-y py-3`}
          id="departmentAddress"
          name="departmentAddress"
          value={values.departmentAddress}
          onChange={(event) =>
            setValues({ ...values, departmentAddress: event.target.value })
          }
          maxLength={departmentFieldLimits.address}
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-teal-600 px-5 text-sm font-black text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700 disabled:opacity-60"
          type="submit"
          disabled={isSaving}
        >
          {isSaving
            ? t("saving")
            : selectedDepartment
              ? t("updateDepartment")
              : t("addDepartment")}
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
