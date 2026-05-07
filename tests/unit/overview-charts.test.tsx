import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OverviewCharts } from "../../components/overview-charts";

vi.mock("../../lib/dashboard-api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/dashboard-api")>("../../lib/dashboard-api");

  return {
    ...actual,
    listInsightsByCountryJobTitles: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 10,
      offset: 0
    })
  };
});

describe("OverviewCharts", () => {
  it("toggles a panel into expanded state on click", () => {
    render(
      <OverviewCharts
        countryInsights={{
          items: [
            {
              country: "United States",
              employee_count: 12,
              currency: "USD",
              min_salary: "90000.00",
              max_salary: "180000.00",
              average_salary: "136000.00",
              median_salary: "133000.00",
              p25_salary: "118000.00",
              p75_salary: "152000.00",
              salary_range: "90000.00",
              last_updated_at: "2026-05-07T08:30:00Z"
            }
          ],
          total: 1,
          limit: 8,
          offset: 0
        }}
        departmentInsights={{
          items: [
            {
              department: "Engineering",
              employee_count: 10,
              currency: "USD",
              min_salary: "100000.00",
              max_salary: "180000.00",
              average_salary: "145000.00",
              median_salary: "142000.00",
              p25_salary: "128000.00",
              p75_salary: "157000.00",
              salary_range: "80000.00",
              last_updated_at: "2026-05-07T08:30:00Z"
            }
          ],
          total: 1,
          limit: 8,
          offset: 0
        }}
        hiringTrend={{
          items: [{ month: "2026-05", hires_count: 3 }],
          total: 1
        }}
        initialCountry="United States"
        initialCountryJobTitleInsights={{
          items: [
            {
              job_title: "Staff Engineer",
              employee_count: 8,
              currency: "USD",
              min_salary: "110000.00",
              max_salary: "165000.00",
              average_salary: "138000.00",
              median_salary: "137000.00",
              p25_salary: "128000.00",
              p75_salary: "149000.00",
              salary_range: "55000.00",
              last_updated_at: "2026-05-07T08:30:00Z"
            }
          ],
          total: 1,
          limit: 10,
          offset: 0
        }}
        overview={{
          filters: {
            country: null,
            job_title: null
          },
          employee_count: 24,
          currency: "USD",
          min_salary: "72000.00",
          max_salary: "180000.00",
          average_salary: "124500.00",
          median_salary: "121000.00",
          p25_salary: "99000.00",
          p75_salary: "146000.00",
          salary_range: "108000.00",
          last_updated_at: "2026-05-07T08:30:00Z"
        }}
        tenureBandInsights={{
          items: [
            {
              tenure_band: "<1 year",
              employee_count: 5,
              currency: "USD",
              min_salary: "72000.00",
              max_salary: "130000.00",
              average_salary: "97000.00",
              median_salary: "95000.00",
              p25_salary: "84000.00",
              p75_salary: "112000.00",
              salary_range: "58000.00",
              last_updated_at: "2026-05-07T08:30:00Z"
            }
          ],
          total: 1
        }}
      />
    );

    const panel = screen.getByRole("button", { name: "Expand Salary distribution panel" });

    fireEvent.click(panel);

    expect(panel).toHaveClass("overview-chart-panel-expanded");
    expect(panel).toHaveAttribute("aria-label", "Collapse Salary distribution panel");

    fireEvent.click(panel);

    expect(panel).not.toHaveClass("overview-chart-panel-expanded");
    expect(panel).toHaveAttribute("aria-label", "Expand Salary distribution panel");
  });
});