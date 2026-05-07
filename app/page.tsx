import { DashboardShell } from "../components/dashboard-shell";
import { OverviewPage } from "../components/overview-page";
import {
  getHiringTrend,
  getInsightsOverview,
  listInsightsByDepartment,
  listInsightsByTenureBand,
  listInsightsByCountry,
  listInsightsByCountryJobTitles
} from "../lib/dashboard-api";

export default async function Home() {
  const [overviewResult, countryInsightsResult, departmentInsightsResult, tenureBandInsightsResult, hiringTrendResult] =
    await Promise.allSettled([
      getInsightsOverview(),
      listInsightsByCountry(8, 0),
      listInsightsByDepartment(8, 0),
      listInsightsByTenureBand(),
      getHiringTrend(12)
    ]);

  const overview = overviewResult.status === "fulfilled" ? overviewResult.value : null;
  const countryInsights = countryInsightsResult.status === "fulfilled" ? countryInsightsResult.value : null;
  const departmentInsights = departmentInsightsResult.status === "fulfilled" ? departmentInsightsResult.value : null;
  const tenureBandInsights = tenureBandInsightsResult.status === "fulfilled" ? tenureBandInsightsResult.value : null;
  const hiringTrend = hiringTrendResult.status === "fulfilled" ? hiringTrendResult.value : null;

  let initialCountryJobTitleInsights = null;
  const initialCountry = countryInsights?.items[0]?.country ?? null;

  if (initialCountry) {
    try {
      initialCountryJobTitleInsights = await listInsightsByCountryJobTitles(initialCountry, 10, 0);
    } catch {
      initialCountryJobTitleInsights = null;
    }
  }

  return (
    <DashboardShell currentPath="/">
      <OverviewPage
        overview={overview}
        countryInsights={countryInsights}
        departmentInsights={departmentInsights}
        tenureBandInsights={tenureBandInsights}
        hiringTrend={hiringTrend}
        initialCountry={initialCountry}
        initialCountryJobTitleInsights={initialCountryJobTitleInsights}
      />
    </DashboardShell>
  );
}

