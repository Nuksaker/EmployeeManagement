import { Department, DepartmentFormValues } from "../types/department";
import { Employee, EmployeeFormValues } from "../types/employee";
import { ApiClientError, ApiErrorDetails } from "./apiErrors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const API_FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const TOKEN_STORAGE_KEY = "employee_management_token";
const USER_STORAGE_KEY = "employee_management_user";
const TOKEN_EXPIRES_STORAGE_KEY = "employee_management_token_expires";

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  errors?: ApiErrorDetails;
};

type DepartmentApiResponse = {
  Department_ID: number;
  Department_Name: string;
  Department_Address: string | null;
  Created_At: string;
  Updated_At: string | null;
};

type EmployeeApiResponse = {
  Employee_ID: number;
  Employee_First_Name: string;
  Employee_Last_Name: string;
  Gender: string | null;
  Date_of_Birth: string | null;
  Date_Joined: string | null;
  Employee_Address: string | null;
  Photo: string | null;
  Department_ID: number;
  Department_Name: string;
  Created_At: string;
  Updated_At: string | null;
};

type ImageUploadApiResponse = {
  Photo: string;
  File_Name: string;
};

type PagedApiResponse<T> = {
  Items: T[];
  Page_Number: number;
  Page_Size: number;
  Total_Count: number;
  Total_Pages: number;
  Has_Previous_Page: boolean;
  Has_Next_Page: boolean;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  username: string;
};

export type PaginationParams = {
  pageNumber: number;
  pageSize: number;
};

export type PaginatedResult<T> = {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  let response: Response;
  const isFormData = options?.body instanceof FormData;
  const headers = new Headers(options?.headers);
  const token = getAuthToken();

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });
  } catch {
    throw new ApiClientError({
      kind: "network",
      message: "Cannot connect to the backend API."
    });
  }

  if (!response.ok) {
    let statusCode = response.status;
    let serverMessage = "";
    let serverErrors: ApiErrorDetails | undefined;

    try {
      const error = (await response.json()) as ApiErrorResponse;
      statusCode = error.statusCode ?? response.status;
      if (error.message) {
        serverMessage = error.message;
      }
      serverErrors = error.errors;
    } catch {
      // If the API did not return JSON, keep the default status message.
    }

    const message =
      serverMessage || formatErrors(serverErrors) || "Request failed.";

    throw new ApiClientError({
      kind: "response",
      statusCode,
      serverMessage,
      serverErrors,
      message
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const authApi = {
  login: (username: string, password: string) => {
    clearAuthSession();

    return request<AuthSession>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        Username: username,
        Password: password
      })
    });
  }
};

export const departmentApi = {
  getAll: async (pagination: PaginationParams = { pageNumber: 1, pageSize: 10 }) => {
    const departments = await request<PagedApiResponse<DepartmentApiResponse>>(
      `/departments?${toPaginationQuery(pagination)}`
    );
    return mapPagedResult(departments, mapDepartment);
  },
  create: (values: DepartmentFormValues) =>
    request<DepartmentApiResponse>("/departments", {
      method: "POST",
      body: JSON.stringify(toDepartmentRequest(values))
    }).then(mapDepartment),
  update: (id: number, values: DepartmentFormValues) =>
    request<DepartmentApiResponse>(`/departments/${id}`, {
      method: "PUT",
      body: JSON.stringify(toDepartmentRequest(values))
    }).then(mapDepartment),
  delete: (id: number) =>
    request<void>(`/departments/${id}`, {
      method: "DELETE"
    })
};

export const employeeApi = {
  getAll: async (pagination: PaginationParams = { pageNumber: 1, pageSize: 10 }) => {
    const employees = await request<PagedApiResponse<EmployeeApiResponse>>(
      `/employees?${toPaginationQuery(pagination)}`
    );
    return mapPagedResult(employees, mapEmployee);
  },
  create: (values: EmployeeFormValues) =>
    request<EmployeeApiResponse>("/employees", {
      method: "POST",
      body: JSON.stringify(toEmployeeRequest(values))
    }).then(mapEmployee),
  update: (id: number, values: EmployeeFormValues) =>
    request<EmployeeApiResponse>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(toEmployeeRequest(values))
    }).then(mapEmployee),
  delete: (id: number) =>
    request<void>(`/employees/${id}`, {
      method: "DELETE"
    }),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return request<ImageUploadApiResponse>("/employees/upload-photo", {
      method: "POST",
      body: formData
    }).then((response) => response.Photo);
  }
};

export function getFileUrl(path: string | null) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_FILE_BASE_URL}${path}`;
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  window.localStorage.setItem(USER_STORAGE_KEY, session.username);
  window.localStorage.setItem(TOKEN_EXPIRES_STORAGE_KEY, session.expiresAt);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_EXPIRES_STORAGE_KEY);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getCurrentUsername() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(USER_STORAGE_KEY);
}

export function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  const token = getAuthToken();
  const expiresAt = window.localStorage.getItem(TOKEN_EXPIRES_STORAGE_KEY);

  if (!token || !expiresAt) {
    return false;
  }

  if (new Date(expiresAt).getTime() <= Date.now()) {
    clearAuthSession();
    return false;
  }

  return true;
}

function toDepartmentRequest(values: DepartmentFormValues) {
  return {
    Department_Name: values.departmentName,
    Department_Address: values.departmentAddress || null
  };
}

function toEmployeeRequest(values: EmployeeFormValues) {
  return {
    Employee_First_Name: values.employeeFirstName,
    Employee_Last_Name: values.employeeLastName,
    Gender: values.gender || null,
    Date_of_Birth: values.dateOfBirth || null,
    Date_Joined: values.dateJoined || null,
    Employee_Address: values.employeeAddress || null,
    Photo: values.photo || null,
    Department_ID: Number(values.departmentId)
  };
}

function mapDepartment(department: DepartmentApiResponse): Department {
  return {
    departmentId: department.Department_ID,
    departmentName: department.Department_Name,
    departmentAddress: department.Department_Address,
    createdAt: department.Created_At,
    updatedAt: department.Updated_At
  };
}

function mapEmployee(employee: EmployeeApiResponse): Employee {
  return {
    employeeId: employee.Employee_ID,
    employeeFirstName: employee.Employee_First_Name,
    employeeLastName: employee.Employee_Last_Name,
    gender: employee.Gender,
    dateOfBirth: employee.Date_of_Birth,
    dateJoined: employee.Date_Joined,
    employeeAddress: employee.Employee_Address,
    photo: employee.Photo,
    departmentId: employee.Department_ID,
    departmentName: employee.Department_Name,
    createdAt: employee.Created_At,
    updatedAt: employee.Updated_At
  };
}

function mapPagedResult<TApi, TItem>(
  response: PagedApiResponse<TApi>,
  mapper: (item: TApi) => TItem
): PaginatedResult<TItem> {
  return {
    items: response.Items.map(mapper),
    pageNumber: response.Page_Number,
    pageSize: response.Page_Size,
    totalCount: response.Total_Count,
    totalPages: response.Total_Pages,
    hasPreviousPage: response.Has_Previous_Page,
    hasNextPage: response.Has_Next_Page
  };
}

function toPaginationQuery({ pageNumber, pageSize }: PaginationParams) {
  const searchParams = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize)
  });

  return searchParams.toString();
}

function formatErrors(errors: ApiErrorResponse["errors"]) {
  if (!errors) {
    return "";
  }

  if (typeof errors === "string") {
    return errors;
  }

  if (Array.isArray(errors)) {
    return errors.join(" ");
  }

  return Object.values(errors).flat().join(" ");
}
