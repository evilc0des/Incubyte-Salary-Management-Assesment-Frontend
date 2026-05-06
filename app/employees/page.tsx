import { DashboardShell } from "../../components/dashboard-shell";
import { EmployeesPageContent } from "../../components/employees-page";
import { listEmployees } from "../../lib/dashboard-api";

export default async function EmployeesPage() {
  let response = null;

  try {
    response = await listEmployees(undefined, 20, 0);
  } catch {
    response = null;
  }

  return (
    <DashboardShell currentPath="/employees">
      <EmployeesPageContent response={response} />
    </DashboardShell>
  );
}