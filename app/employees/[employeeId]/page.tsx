import { EmployeeDetailPageContent } from "../../../components/employee-detail-page";
import { DashboardShell } from "../../../components/dashboard-shell";
import { DashboardApiError, getEmployee } from "../../../lib/dashboard-api";

type EmployeeDetailPageProps = {
  params: Promise<{
    employeeId: string;
  }>;
};

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { employeeId } = await params;

  let employee = null;
  let state: "loaded" | "not-found" | "error" = "loaded";

  try {
    employee = await getEmployee(employeeId);
  } catch (error) {
    if (error instanceof DashboardApiError && error.status === 404) {
      state = "not-found";
    } else {
      state = "error";
    }
  }

  return (
    <DashboardShell currentPath="/employees">
      <EmployeeDetailPageContent employee={employee} state={state} />
    </DashboardShell>
  );
}