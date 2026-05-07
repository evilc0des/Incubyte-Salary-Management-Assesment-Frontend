import { DashboardShell } from "../components/dashboard-shell";
import { OverviewPage } from "../components/overview-page";
import {
  getInsightsOverview,
  listInsightsByCountry,
  listInsightsByCountryJobTitles
} from "../lib/dashboard-api";

export default async function Home() {
  let overview = null;
  let countryInsights = null;
  let initialCountryJobTitleInsights = null;
  let initialCountry = null;

  try {
    overview = await getInsightsOverview();
  } catch {
    overview = null;
  }

  try {
    countryInsights = await listInsightsByCountry(8, 0);
    initialCountry = countryInsights.items[0]?.country ?? null;
  } catch {
    countryInsights = null;
    initialCountry = null;
  }

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
        initialCountry={initialCountry}
        initialCountryJobTitleInsights={initialCountryJobTitleInsights}
      />
    </DashboardShell>
  );
}

