import type { EmployeeListResponse } from "../lib/dashboard-api";
import { formatCurrency, formatDate } from "../lib/formatters";

type EmployeesPageContentProps = {
  response: EmployeeListResponse | null;
};

export function EmployeesPageContent({ response }: EmployeesPageContentProps) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Directory</p>
          <h1>Employees</h1>
        </div>
        <p className="dashboard-copy">Browse the current employee roster.</p>
      </div>

      {response === null ? (
        <article className="dashboard-panel dashboard-panel-empty">
          <h2>Employees unavailable</h2>
          <p>Employee data is unavailable right now.</p>
        </article>
      ) : response.items.length === 0 ? (
        <article className="dashboard-panel dashboard-panel-empty">
          <h2>No employees yet</h2>
          <p>No employees found yet.</p>
        </article>
      ) : (
        <div className="dashboard-list">
          {response.items.map((employee) => (
            <article className="dashboard-list-item" key={employee.id}>
              <div className="dashboard-list-primary">
                <a className="dashboard-list-link" href={`/employees/${employee.id}`}>
                  {employee.full_name}
                </a>
                <p>{employee.job_title}</p>
              </div>

              <dl className="dashboard-list-meta">
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
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}