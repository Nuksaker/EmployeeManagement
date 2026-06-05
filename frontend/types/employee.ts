export type Employee = {
  employeeId: number;
  employeeFirstName: string;
  employeeLastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  dateJoined: string | null;
  employeeAddress: string | null;
  photo: string | null;
  departmentId: number;
  departmentName: string;
  createdAt: string;
  updatedAt: string | null;
};

export type EmployeeFormValues = {
  employeeFirstName: string;
  employeeLastName: string;
  gender: string;
  dateOfBirth: string;
  dateJoined: string;
  employeeAddress: string;
  photo: string;
  photoFile: File | null;
  departmentId: number;
};
