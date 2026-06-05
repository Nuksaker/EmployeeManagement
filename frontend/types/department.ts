export type Department = {
  departmentId: number;
  departmentName: string;
  departmentAddress: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type DepartmentFormValues = {
  departmentName: string;
  departmentAddress: string;
};
