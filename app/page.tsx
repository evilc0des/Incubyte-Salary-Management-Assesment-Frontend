import { DashboardShell } from "../components/dashboard-shell";
import { OverviewPage } from "../components/overview-page";
import { getInsightsOverview } from "../lib/dashboard-api";

export default async function Home() {
  let overview = null;

  try {
    overview = await getInsightsOverview();
  } catch {
    overview = null;
  }

  return (
    <DashboardShell currentPath="/">
      <OverviewPage overview={overview} />
    </DashboardShell>
  );
}

