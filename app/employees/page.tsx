import { DashboardShell } from "../../components/dashboard-shell";
import { EmployeesPageContent } from "../../components/employees-page";
import { listEmployees } from "../../lib/dashboard-api";

type EmployeesPageProps = {
  searchParams?: Promise<{
    search?: string;
    limit?: string;
    offset?: string;
  }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await (
    searchParams ?? Promise.resolve<{ search?: string; limit?: string; offset?: string }>({})
  );
  const search = params.search ?? undefined;
  const limit = parseInt(params.limit ?? "20", 10);
  const offset = parseInt(params.offset ?? "0", 10);

  let response = null;

  try {
    response = await listEmployees(search, limit, offset);
  } catch {
    response = null;
  }

  return (
    <DashboardShell currentPath="/employees">
      <EmployeesPageContent response={response} />
    </DashboardShell>
  );
}