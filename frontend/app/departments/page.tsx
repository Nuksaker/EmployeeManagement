"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus } from "lucide-react";
import ConfirmDialog from "../../components/ConfirmDialog";
import DepartmentForm from "../../components/DepartmentForm";
import DepartmentTable from "../../components/DepartmentTable";
import Modal from "../../components/Modal";
import PaginationControls from "../../components/PaginationControls";
import { useLanguage } from "../../contexts/LanguageContext";
import { departmentApi, isAuthenticated } from "../../services/api";
import { Department, DepartmentFormValues } from "../../types/department";

const defaultPagination = {
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false
};

export default function DepartmentsPage() {
  const router = useRouter();
  const { t, formatApiError } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(
    null
  );
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);
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

    loadDepartments(defaultPagination.pageNumber, defaultPagination.pageSize);
  }, [router]);

  async function loadDepartments(pageNumber = pagination.pageNumber, pageSize = pagination.pageSize) {
    setIsLoading(true);
    setError("");

    try {
      const data = await departmentApi.getAll({ pageNumber, pageSize });
      setDepartments(data.items);
      setPagination({
        pageNumber: data.pageNumber,
        pageSize: data.pageSize,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        hasPreviousPage: data.hasPreviousPage,
        hasNextPage: data.hasNextPage
      });
    } catch (err) {
      setError(formatApiError(err, "couldNotLoadDepartments"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(values: DepartmentFormValues) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      if (selectedDepartment) {
        await departmentApi.update(selectedDepartment.departmentId, values);
        setMessage(t("departmentUpdated"));
      } else {
        await departmentApi.create(values);
        setMessage(t("departmentAdded"));
      }

      await loadDepartments(selectedDepartment ? pagination.pageNumber : 1, pagination.pageSize);
      closeModal();
    } catch (err) {
      setError(formatApiError(err, "couldNotSaveDepartment"));
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteDialog(department: Department) {
    setDepartmentToDelete(department);
    setMessage("");
    setError("");
  }

  async function confirmDeleteDepartment() {
    if (!departmentToDelete) {
      return;
    }

    setIsDeleting(true);
    setMessage("");
    setError("");

    try {
      await departmentApi.delete(departmentToDelete.departmentId);
      setMessage(t("departmentDeleted"));
      const nextPage =
        departments.length === 1 && pagination.pageNumber > 1
          ? pagination.pageNumber - 1
          : pagination.pageNumber;
      setDepartmentToDelete(null);
      await loadDepartments(nextPage, pagination.pageSize);
    } catch (err) {
      setError(formatApiError(err, "couldNotDeleteDepartment"));
      setDepartmentToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function openAddModal() {
    setSelectedDepartment(null);
    setIsModalOpen(true);
    setMessage("");
    setError("");
  }

  function openEditModal(department: Department) {
    setSelectedDepartment(department);
    setIsModalOpen(true);
    setMessage("");
    setError("");
  }

  function closeModal() {
    setSelectedDepartment(null);
    setIsModalOpen(false);
  }

  function handlePageChange(pageNumber: number) {
    loadDepartments(pageNumber, pagination.pageSize);
  }

  function handlePageSizeChange(pageSize: number) {
    loadDepartments(1, pageSize);
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-sm font-bold text-teal-700">
            <Building2 aria-hidden="true" size={17} strokeWidth={2.4} />
            {t("departments")}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            {t("departmentsTitle")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {t("departmentsDescription")}
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 text-sm font-black text-white shadow-lg shadow-teal-100 transition hover:bg-teal-700"
          type="button"
          onClick={openAddModal}
        >
          <Plus aria-hidden="true" size={18} strokeWidth={2.5} />
          {t("addDepartment")}
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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 px-5">
          <h2 className="text-lg font-black tracking-normal text-slate-950">
            {t("departmentList")}
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {pagination.totalCount} {t("records")}
          </span>
        </div>
        {isLoading ? (
          <p className="px-5 py-8 text-sm font-semibold text-slate-500">
            {t("loadingDepartments")}
          </p>
        ) : (
          <DepartmentTable
            departments={departments}
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
        title={selectedDepartment ? t("editDepartment") : t("addDepartment")}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <DepartmentForm
          selectedDepartment={selectedDepartment}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancelEdit={closeModal}
        />
      </Modal>

      <ConfirmDialog
        isOpen={departmentToDelete !== null}
        title={t("deleteDepartmentConfirm")}
        message={t("deleteDepartmentWarning")}
        recordName={departmentToDelete?.departmentName}
        isBusy={isDeleting}
        confirmLabel={t("delete")}
        onConfirm={confirmDeleteDepartment}
        onCancel={() => setDepartmentToDelete(null)}
      />
    </div>
  );
}
