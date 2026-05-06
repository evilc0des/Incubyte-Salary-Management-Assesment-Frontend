import type { EmployeeInsightsOverview } from "../lib/dashboard-api";
import { formatCurrency, formatDateTime } from "../lib/formatters";

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
};

export function OverviewPage({ overview }: OverviewPageProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Overview</p>
          <h1>Overview</h1>
        </div>
        <p className="dashboard-copy">Salary dashboard overview</p>
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

          <article className="dashboard-panel">
            <h2>Data freshness</h2>
            <p>Last updated {formatDateTime(overview.last_updated_at)}</p>
          </article>
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