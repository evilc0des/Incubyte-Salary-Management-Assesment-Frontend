import type { EmployeeListResponse } from "../lib/dashboard-api";
import { EmployeesTable } from "./employees-table";

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

      <EmployeesTable response={response} />
    </section>
  );
}