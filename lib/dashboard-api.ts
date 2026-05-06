export type EmployeeInsightsFilters = {
  country: string | null;
  job_title: string | null;
};

export type EmployeeInsightsOverview = {
  filters: EmployeeInsightsFilters;
  employee_count: number;
  currency: string;
  min_salary: string | null;
  max_salary: string | null;
  average_salary: string | null;
  median_salary: string | null;
  p25_salary: string | null;
  p75_salary: string | null;
  salary_range: string | null;
  last_updated_at: string | null;
};

export type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  job_title: string;
  department: string | null;
  country: string;
  salary: string;
  currency: string;
  hire_date: string;
  created_at: string;
  updated_at: string;
};

export type EmployeeListResponse = {
  items: Employee[];
  total: number;
  limit: number;
  offset: number;
};

export class DashboardApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DashboardApiError";
    this.status = status;
  }
}

type ApiEnvironment = {
  INTERNAL_API_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
};

type ResolveApiBaseUrlOptions = {
  serverSide: boolean;
  env?: ApiEnvironment;
};

export function resolveApiBaseUrl({ serverSide, env }: ResolveApiBaseUrlOptions) {
  const resolvedEnv = env ?? process.env;

  if (serverSide) {
    return (
      resolvedEnv.INTERNAL_API_URL ??
      resolvedEnv.NEXT_PUBLIC_API_URL ??
      "http://localhost:8000/api/v1"
    );
  }

  return resolvedEnv.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
}

async function fetchDashboardData<T>(path: string): Promise<T> {
  const response = await fetch(
    `${resolveApiBaseUrl({ serverSide: typeof window === "undefined" })}${path}`,
    {
    cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new DashboardApiError(`Dashboard request failed for ${path}`, response.status);
  }

  return (await response.json()) as T;
}

export function getInsightsOverview() {
  return fetchDashboardData<EmployeeInsightsOverview>("/insights/overview");
}

export function listEmployees(search: string | undefined, limit: number, offset: number) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  if (search) {
    params.set("search", search);
  }

  return fetchDashboardData<EmployeeListResponse>(`/employees?${params.toString()}`);
}

export function getEmployee(employeeId: string) {
  return fetchDashboardData<Employee>(`/employees/${employeeId}`);
}