import type { Employee } from "../lib/dashboard-api";
import { formatCurrency, formatDate, formatDateTime } from "../lib/formatters";

type EmployeeDetailPageContentProps = {
  employee: Employee | null;
  state: "loaded" | "not-found" | "error";
};

export function EmployeeDetailPageContent({ employee, state }: EmployeeDetailPageContentProps) {
  if (state === "not-found") {
    return (
      <section className="dashboard-section">
        <article className="dashboard-panel dashboard-panel-empty">
          <h1>Employee not found</h1>
          <p>This employee record could not be loaded.</p>
        </article>
      </section>
    );
  }

  if (state === "error" || employee === null) {
    return (
      <section className="dashboard-section">
        <article className="dashboard-panel dashboard-panel-empty">
          <h1>Employee unavailable</h1>
          <p>Employee data is unavailable right now.</p>
        </article>
      </section>
    );
  }

  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Employee profile</p>
          <h1>{employee.full_name}</h1>
        </div>
        <p className="dashboard-copy">{employee.job_title}</p>
      </div>

      <article className="dashboard-panel">
        <dl className="dashboard-detail-grid">
          <div>
            <dt>Department</dt>
            <dd>{employee.department ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt>Country</dt>
            <dd>{employee.country}</dd>
          </div>
          <div>
            <dt>Salary</dt>
            <dd>{formatCurrency(employee.salary, employee.currency)}</dd>
          </div>
          <div>
            <dt>Hire date</dt>
            <dd>{formatDate(employee.hire_date)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDateTime(employee.created_at)}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDateTime(employee.updated_at)}</dd>
          </div>
        </dl>
      </article>
    </section>
  );
}