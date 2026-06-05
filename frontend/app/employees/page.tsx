"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmployeeForm from "../../components/EmployeeForm";
import EmployeeTable from "../../components/EmployeeTable";
import Modal from "../../components/Modal";
import PaginationControls from "../../components/PaginationControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { departmentApi, employeeApi, isAuthenticated } from "../../services/api";
import { Department } from "../../types/department";
import { Employee, EmployeeFormValues } from "../../types/employee";

const defaultPagination = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false
};

export default function EmployeesPage() {
  const router = useRouter();
  const { t, formatApiError } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(defaultPagination);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    loadPageData(defaultPagination.pageNumber, defaultPagination.pageSize);
  }, [router]);

  async function loadPageData(pageNumber = pagination.pageNumber, pageSize = pagination.pageSize) {
    setIsLoading(true);
    setError("");

    try {
      const [employeeData, departmentData] = await Promise.all([
        employeeApi.getAll({ pageNumber, pageSize }),
        departmentApi.getAll({ pageNumber: 1, pageSize: 50 })
      ]);

      setEmployees(employeeData.items);
      setDepartments(departmentData.items);
      setPagination({
        pageNumber: employeeData.pageNumber,
        pageSize: employeeData.pageSize,
        totalCount: employeeData.totalCount,
        totalPages: employeeData.totalPages,
        hasPreviousPage: employeeData.hasPreviousPage,
        hasNextPage: employeeData.hasNextPage
      });
    } catch (err) {
      setError(formatApiError(err, "couldNotLoadEmployees"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(values: EmployeeFormValues) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      let photo = values.photo;
      if (values.photoFile) {
        photo = await employeeApi.uploadPhoto(values.photoFile);
      }

      const valuesToSave = {
        ...values,
        photo
      };

      if (selectedEmployee) {
        await employeeApi.update(selectedEmployee.employeeId, valuesToSave);
        setMessage(t("employeeUpdated"));
      } else {
        await employeeApi.create(valuesToSave);
        setMessage(t("employeeAdded"));
      }

      await loadPageData(selectedEmployee ? pagination.pageNumber : 1, pagination.pageSize);
      closeModal();
    } catch (err) {
      setError(formatApiError(err, "couldNotSaveEmployee"));
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteDialog(employee: Employee) {
    setEmployeeToDelete(employee);
    setMessage("");
    setError("");
  }

  async function confirmDeleteEmployee() {
    if (!employeeToDelete) {
      return;
    }

    setIsDeleting(true);
    setMessage("");
    setError("");

    try {
      await employeeApi.delete(employeeToDelete.employeeId);
      setMessage(t("employeeDeleted"));
      const nextPage =
        employees.length === 1 && pagination.pageNumber > 1
          ? pagination.pageNumber - 1
          : pagination.pageNumber;
      setEmployeeToDelete(null);
      await loadPageData(nextPage, pagination.pageSize);
    } catch (err) {
      setError(formatApiError(err, "couldNotDeleteEmployee"));
      setEmployeeToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function openAddModal() {
    setSelectedEmployee(null);
    setIsModalOpen(true);
    setMessage("");
    setError("");
  }

  function openEditModal(employee: Employee) {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setMessage("");
    setError("");
  }

  function closeModal() {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  }

  function handlePageChange(pageNumber: number) {
    loadPageData(pageNumber, pagination.pageSize);
  }

  function handlePageSizeChange(pageSize: number) {
    loadPageData(1, pageSize);
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-bold text-sky-700">
            <Users aria-hidden="true" size={17} strokeWidth={2.4} />
            {t("employees")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            {t("employeesTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("employeesDescription")}
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-sm font-black text-white shadow-lg shadow-sky-100 transition hover:bg-sky-700 disabled:bg-slate-300 disabled:shadow-none"
          type="button"
          onClick={openAddModal}
          disabled={departments.length === 0}
        >
          <Plus aria-hidden="true" size={18} strokeWidth={2.5} />
          {t("addEmployee")}
        </button>
      </section>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {departments.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {t("addDepartmentBeforeEmployees")}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 px-5">
          <h2 className="text-lg font-black tracking-normal text-slate-950">
            {t("employeeList")}
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {pagination.totalCount} {t("records")}
          </span>
        </div>
        {isLoading ? (
          <p className="px-5 py-8 text-sm font-semibold text-slate-500">
            {t("loadingEmployees")}
          </p>
        ) : (
          <EmployeeTable
            employees={employees}
            onEdit={openEditModal}
            onDelete={openDeleteDialog}
          />
        )}
        <PaginationControls
          pageNumber={pagination.pageNumber}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          totalPages={pagination.totalPages}
          hasPreviousPage={pagination.hasPreviousPage}
          hasNextPage={pagination.hasNextPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>

      <Modal
        title={selectedEmployee ? t("editEmployee") : t("addEmployee")}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <EmployeeForm
          departments={departments}
          selectedEmployee={selectedEmployee}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancelEdit={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={employeeToDelete !== null}
        title={t("deleteEmployeeConfirm")}
        message={t("deleteEmployeeWarning")}
        recordName={
          employeeToDelete
            ? `${employeeToDelete.employeeFirstName} ${employeeToDelete.employeeLastName}`
            : undefined
        }
        isBusy={isDeleting}
        confirmLabel={t("delete")}
        onConfirm={confirmDeleteEmployee}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </div>
  );
}
