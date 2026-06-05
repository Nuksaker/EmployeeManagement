"use client";

import { FormEvent, useEffect, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { getFileUrl } from "../services/api";
import { Department } from "../types/department";
import { Employee, EmployeeFormValues } from "../types/employee";

type EmployeeFormProps = {
  departments: Department[];
  selectedEmployee: Employee | null;
  isSaving: boolean;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  onCancelEdit: () => void;
};

const emptyValues: EmployeeFormValues = {
  employeeFirstName: "",
  employeeLastName: "",
  gender: "",
  dateOfBirth: "",
  dateJoined: "",
  employeeAddress: "",
  photo: "",
  photoFile: null,
  departmentId: 0
};

const employeeFieldLimits = {
  firstName: 100,
  lastName: 100,
  address: 255
} as const;

const genderOptions = [
  { value: "Female", labelKey: "female" },
  { value: "Male", labelKey: "male" },
  { value: "Other", labelKey: "other" }
] as const;

const inputClass =
  "min-h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100";

export default function EmployeeForm({
  departments,
  selectedEmployee,
  isSaving,
  onSubmit,
  onCancelEdit
}: EmployeeFormProps) {
  const { t } = useLanguage();
  const [values, setValues] = useState<EmployeeFormValues>(emptyValues);

  useEffect(() => {
    if (selectedEmployee) {
      setValues({
        employeeFirstName: selectedEmployee.employeeFirstName,
        employeeLastName: selectedEmployee.employeeLastName,
        gender: selectedEmployee.gender ?? "",
        dateOfBirth: selectedEmployee.dateOfBirth ?? "",
        dateJoined: selectedEmployee.dateJoined ?? "",
        employeeAddress: selectedEmployee.employeeAddress ?? "",
        photo: selectedEmployee.photo ?? "",
        photoFile: null,
        departmentId: selectedEmployee.departmentId
      });
    } else {
      setValues({
        ...emptyValues,
        departmentId: departments[0]?.departmentId ?? 0
      });
    }
  }, [departments, selectedEmployee]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(values);

    if (!selectedEmployee) {
      setValues({
        ...emptyValues,
        departmentId: departments[0]?.departmentId ?? 0
      });
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="text-sm font-bold text-slate-600" htmlFor="photoFile">
          {t("employeePhoto")}
        </label>
        <div className="flex flex-wrap items-center gap-4">
          {values.photo ? (
            <img
              className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
              src={getFileUrl(values.photo)}
              alt={t("employeePhotoPreview")}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm font-bold text-slate-400">
              {t("photo")}
            </div>
          )}
          <div className="grid flex-1 gap-2">
            <input
              className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-50 file:px-4 file:py-2 file:text-sm file:font-bold file:text-sky-700 hover:file:bg-sky-100"
              id="photoFile"
              name="photoFile"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setValues({
                  ...values,
                  photoFile: event.target.files?.[0] ?? null
                })
              }
            />
            {values.photoFile && (
              <p className="text-xs font-semibold text-slate-500">
                {t("selectedFile")}: {values.photoFile.name}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            className="text-sm font-bold text-slate-600"
            htmlFor="employeeFirstName"
          >
            {t("firstName")} <span className="text-rose-600">*</span>
          </label>
          <input
            className={inputClass}
            id="employeeFirstName"
            name="employeeFirstName"
            value={values.employeeFirstName}
            onChange={(event) =>
              setValues({ ...values, employeeFirstName: event.target.value })
            }
            required
            pattern=".*\S.*"
            title={t("firstNameRequiredTitle")}
            maxLength={employeeFieldLimits.firstName}
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-bold text-slate-600"
            htmlFor="employeeLastName"
          >
            {t("lastName")} <span className="text-rose-600">*</span>
          </label>
          <input
            className={inputClass}
            id="employeeLastName"
            name="employeeLastName"
            value={values.employeeLastName}
            onChange={(event) =>
              setValues({ ...values, employeeLastName: event.target.value })
            }
            required
            pattern=".*\S.*"
            title={t("lastNameRequiredTitle")}
            maxLength={employeeFieldLimits.lastName}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-bold text-slate-600" htmlFor="gender">
            {t("gender")}
          </label>
          <select
            className={inputClass}
            id="gender"
            name="gender"
            value={values.gender}
            onChange={(event) =>
              setValues({ ...values, gender: event.target.value })
            }
          >
            <option value="">{t("notSpecified")}</option>
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-bold text-slate-600"
            htmlFor="departmentId"
          >
            {t("department")} <span className="text-rose-600">*</span>
          </label>
          <select
            className={inputClass}
            id="departmentId"
            name="departmentId"
            value={values.departmentId}
            onChange={(event) =>
              setValues({ ...values, departmentId: Number(event.target.value) })
            }
            required
          >
            <option value={0} disabled>
              {t("selectDepartment")}
            </option>
            {departments.map((department) => (
              <option key={department.departmentId} value={department.departmentId}>
                {department.departmentName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label
            className="text-sm font-bold text-slate-600"
            htmlFor="dateOfBirth"
          >
            {t("dateOfBirth")}
          </label>
          <input
            className={inputClass}
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(event) =>
              setValues({ ...values, dateOfBirth: event.target.value })
            }
          />
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-bold text-slate-600"
            htmlFor="dateJoined"
          >
            {t("dateJoined")}
          </label>
          <input
            className={inputClass}
            id="dateJoined"
            name="dateJoined"
            type="date"
            value={values.dateJoined}
            min={values.dateOfBirth || undefined}
            onChange={(event) =>
              setValues({ ...values, dateJoined: event.target.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-bold text-slate-600" htmlFor="employeeAddress">
          {t("address")}
        </label>
        <textarea
          className={`${inputClass} min-h-28 resize-y py-3`}
          id="employeeAddress"
          name="employeeAddress"
          value={values.employeeAddress}
          onChange={(event) =>
            setValues({ ...values, employeeAddress: event.target.value })
          }
          maxLength={employeeFieldLimits.address}
        />
      </div>


      <div className="mt-2 flex flex-wrap gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-sky-600 px-5 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:opacity-60"
          type="submit"
          disabled={isSaving || departments.length === 0}
        >
          {isSaving
            ? t("saving")
            : selectedEmployee
              ? t("updateEmployee")
              : t("addEmployee")}
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
