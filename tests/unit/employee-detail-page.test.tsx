import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EmployeeDetailPage from "../../app/employees/[employeeId]/page";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

describe("Employee detail page", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("renders the selected employee details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
          first_name: "Ada",
          last_name: "Lovelace",
          full_name: "Ada Lovelace",
          job_title: "Principal Engineer",
          department: "Platform",
          country: "United Kingdom",
          salary: "145000.00",
          currency: "USD",
          hire_date: "2021-03-10",
          created_at: "2026-05-07T08:30:00Z",
          updated_at: "2026-05-07T08:30:00Z"
        })
      })
    );

    render(
      await EmployeeDetailPage({
        params: Promise.resolve({
          employeeId: "1f48fd9b-4b35-4d35-9c05-34a86e519c77"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("Principal Engineer")).toBeInTheDocument();
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    expect(screen.getByText("$145,000.00")).toBeInTheDocument();
  });

  it("shows a not-found state when the employee does not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })
    );

    render(
      await EmployeeDetailPage({
        params: Promise.resolve({
          employeeId: "unknown-employee"
        })
      })
    );

    expect(screen.getByRole("heading", { name: "Employee not found" })).toBeInTheDocument();
    expect(screen.getByText("This employee record could not be loaded.")).toBeInTheDocument();
  });
});