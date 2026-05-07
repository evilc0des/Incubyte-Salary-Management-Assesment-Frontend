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

export type EmployeeInsightsMetrics = {
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

export type CountryInsightsRow = EmployeeInsightsMetrics & {
  country: string;
};

export type CountryInsightsListResponse = {
  items: CountryInsightsRow[];
  total: number;
  limit: number;
  offset: number;
};

export type DepartmentInsightsRow = EmployeeInsightsMetrics & {
  department: string;
};

export type DepartmentInsightsListResponse = {
  items: DepartmentInsightsRow[];
  total: number;
  limit: number;
  offset: number;
};

export type JobTitleInsightsRow = EmployeeInsightsMetrics & {
  job_title: string;
};

export type JobTitleInsightsListResponse = {
  items: JobTitleInsightsRow[];
  total: number;
  limit: number;
  offset: number;
};

export type TenureBandInsightsRow = EmployeeInsightsMetrics & {
  tenure_band: string;
};

export type TenureBandInsightsListResponse = {
  items: TenureBandInsightsRow[];
  total: number;
};

export type HiringTrendRow = {
  month: string;
  hires_count: number;
};

export type HiringTrendResponse = {
  items: HiringTrendRow[];
  total: number;
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

  // Keep browser requests same-origin and let Next proxy /api/v1 to the backend.
  return "/api/v1";
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

export function listInsightsByCountry(limit: number = 8, offset: number = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  return fetchDashboardData<CountryInsightsListResponse>(
    `/insights/by-country?${params.toString()}`
  );
}

export function listInsightsByDepartment(limit: number = 8, offset: number = 0) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  return fetchDashboardData<DepartmentInsightsListResponse>(
    `/insights/by-department?${params.toString()}`
  );
}

export function listInsightsByCountryJobTitles(
  country: string,
  limit: number = 10,
  offset: number = 0
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset)
  });

  return fetchDashboardData<JobTitleInsightsListResponse>(
    `/insights/by-country/${encodeURIComponent(country)}/job-titles?${params.toString()}`
  );
}

export function listInsightsByTenureBand() {
  return fetchDashboardData<TenureBandInsightsListResponse>("/insights/tenure-bands");
}

export function getHiringTrend(months: number = 12) {
  const params = new URLSearchParams({
    months: String(months)
  });

  return fetchDashboardData<HiringTrendResponse>(
    `/insights/hiring-trend?${params.toString()}`
  );
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