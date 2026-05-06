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
      vi.fn().mockResolvedValue({
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
  });

  it("shows a fallback message when the insights request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503
      })
    );

    render(await Home());

    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Overview data is unavailable right now.")).toBeInTheDocument();
  });
});