import type {
  CountryInsightsListResponse,
  DepartmentInsightsListResponse,
  EmployeeInsightsOverview,
  HiringTrendResponse,
  JobTitleInsightsListResponse,
  TenureBandInsightsListResponse
} from "../lib/dashboard-api";
import { formatCurrency, formatDateTime } from "../lib/formatters";
import { OverviewCharts } from "./overview-charts";

const statDefinitions = [
  {
    label: "Employees",
    value: (overview: EmployeeInsightsOverview) => String(overview.employee_count)
  },
  {
    label: "Average salary",
    value: (overview: EmployeeInsightsOverview) =>
      formatCurrency(overview.average_salary, overview.currency)
  },
  {
    label: "Median salary",
    value: (overview: EmployeeInsightsOverview) =>
      formatCurrency(overview.median_salary, overview.currency)
  },
  {
    label: "Salary range",
    value: (overview: EmployeeInsightsOverview) =>
      formatCurrency(overview.salary_range, overview.currency)
  }
];

type OverviewPageProps = {
  overview: EmployeeInsightsOverview | null;
  countryInsights: CountryInsightsListResponse | null;
  departmentInsights: DepartmentInsightsListResponse | null;
  tenureBandInsights: TenureBandInsightsListResponse | null;
  hiringTrend: HiringTrendResponse | null;
  initialCountry: string | null;
  initialCountryJobTitleInsights: JobTitleInsightsListResponse | null;
};

export function OverviewPage({
  overview,
  countryInsights,
  departmentInsights,
  tenureBandInsights,
  hiringTrend,
  initialCountry,
  initialCountryJobTitleInsights
}: OverviewPageProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1>Overview</h1>
        </div>
        {overview ? <p className="dashboard-copy">Last updated {formatDateTime(overview.last_updated_at)}</p> : null}
      </div>

      {overview ? (
        <>
          <div className="dashboard-stats-grid">
            {statDefinitions.map((stat) => (
              <article className="dashboard-stat-card" key={stat.label}>
                <span className="dashboard-stat-label">{stat.label}</span>
                <strong className="dashboard-stat-value">{stat.value(overview)}</strong>
              </article>
            ))}
          </div>

          <OverviewCharts
            countryInsights={countryInsights}
            departmentInsights={departmentInsights}
            tenureBandInsights={tenureBandInsights}
            hiringTrend={hiringTrend}
            initialCountry={initialCountry}
            initialCountryJobTitleInsights={initialCountryJobTitleInsights}
            overview={overview}
          />
        </>
      ) : (
        <article className="dashboard-panel dashboard-panel-empty">
          <h2>Overview unavailable</h2>
          <p>Overview data is unavailable right now.</p>
        </article>
      )}
    </section>
  );
}