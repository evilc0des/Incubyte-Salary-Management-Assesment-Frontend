import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

import EmployeesPage from "../../app/employees/page";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

describe("Employees page", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("renders employee rows and links to detail pages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
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
            },
            {
              id: "5d23499d-eb7c-43be-a8bd-c99c8c3a9361",
              first_name: "Grace",
              last_name: "Hopper",
              full_name: "Grace Hopper",
              job_title: "Staff Engineer",
              department: "Infrastructure",
              country: "United States",
              salary: "138000.00",
              currency: "USD",
              hire_date: "2020-01-15",
              created_at: "2026-05-07T08:30:00Z",
              updated_at: "2026-05-07T08:30:00Z"
            }
          ],
          total: 2,
          limit: 20,
          offset: 0
        })
      })
    );

    render(await EmployeesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Principal Engineer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute(
      "href",
      "/employees/1f48fd9b-4b35-4d35-9c05-34a86e519c77"
    );
    expect(screen.getByText("$145,000.00")).toBeInTheDocument();
  });

  it("shows an empty state when there are no employees", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
          limit: 20,
          offset: 0
        })
      })
    );

    render(await EmployeesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
    expect(screen.getByText("No employees found")).toBeInTheDocument();
  });
});