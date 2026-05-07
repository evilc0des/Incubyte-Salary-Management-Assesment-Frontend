import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "../../app/page";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

describe("Dashboard overview page", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("renders overview metrics from the insights endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);

        if (url.includes("/insights/overview")) {
          return {
            ok: true,
            json: async () => ({
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
            })
          };
        }

        if (url.includes("/insights/by-country/United%20States/job-titles")) {
          return {
            ok: true,
            json: async () => ({
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
            })
          };
        }

        if (url.includes("/insights/by-department")) {
          return {
            ok: true,
            json: async () => ({
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
                },
                {
                  department: "Human Resources",
                  employee_count: 4,
                  currency: "USD",
                  min_salary: "82000.00",
                  max_salary: "126000.00",
                  average_salary: "104000.00",
                  median_salary: "103000.00",
                  p25_salary: "92000.00",
                  p75_salary: "114000.00",
                  salary_range: "44000.00",
                  last_updated_at: "2026-05-07T08:30:00Z"
                }
              ],
              total: 2,
              limit: 8,
              offset: 0
            })
          };
        }

        if (url.includes("/insights/tenure-bands")) {
          return {
            ok: true,
            json: async () => ({
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
                },
                {
                  tenure_band: "1-2 years",
                  employee_count: 6,
                  currency: "USD",
                  min_salary: "76000.00",
                  max_salary: "142000.00",
                  average_salary: "108000.00",
                  median_salary: "107000.00",
                  p25_salary: "93000.00",
                  p75_salary: "122000.00",
                  salary_range: "66000.00",
                  last_updated_at: "2026-05-07T08:30:00Z"
                }
              ],
              total: 4
            })
          };
        }

        if (url.includes("/insights/hiring-trend")) {
          return {
            ok: true,
            json: async () => ({
              items: [
                { month: "2026-03", hires_count: 2 },
                { month: "2026-04", hires_count: 4 },
                { month: "2026-05", hires_count: 3 }
              ],
              total: 3
            })
          };
        }

        if (url.includes("/insights/by-country")) {
          return {
            ok: true,
            json: async () => ({
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
            })
          };
        }

        return {
          ok: false,
          status: 404,
          json: async () => ({ detail: "Not found" })
        };
      })
    );

    render(await Home());

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Employees" })).toHaveAttribute(
      "href",
      "/employees"
    );
    expect(screen.getByText("Employees", { selector: ".dashboard-stat-label" })).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Average salary")).toBeInTheDocument();
    expect(screen.getByText("$124,500.00")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Salary distribution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Average salary by country" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Headcount by country" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Headcount by department" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Average salary by department" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Workforce tenure mix" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hiring trend" })).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
    expect(screen.getByText("Selected country: United States")).toBeInTheDocument();
  });

  it("shows a fallback message when the insights request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const url = String(input);

        if (url.includes("/insights/overview")) {
          return {
            ok: false,
            status: 503
          };
        }

        return {
          ok: true,
          json: async () => ({
            items: [],
            total: 0,
            limit: 8,
            offset: 0
          })
        };
      })
    );

    render(await Home());

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Overview data is unavailable right now.")).toBeInTheDocument();
  });
});