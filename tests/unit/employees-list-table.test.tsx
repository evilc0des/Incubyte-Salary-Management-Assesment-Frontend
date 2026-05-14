import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}));

import EmployeesPage from "../../app/employees/page";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

const mockEmployees = [
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
];

describe("Employees list table", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("renders a table with employee data and column headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockEmployees,
          total: 2,
          limit: 20,
          offset: 0
        })
      })
    );

    render(await EmployeesPage({ searchParams: Promise.resolve({}) }));

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    expect(within(table).getByRole("columnheader", { name: /First Name/ })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /Last Name/ })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /Title/ })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: /Salary/ })).toBeInTheDocument();

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace")).toBeInTheDocument();
    expect(screen.getByText("Hopper")).toBeInTheDocument();
    expect(screen.getByText("Principal Engineer")).toBeInTheDocument();
    expect(screen.getByText("Staff Engineer")).toBeInTheDocument();
  });

  it("renders search input and pagination info", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockEmployees,
          total: 2,
          limit: 20,
          offset: 0
        })
      })
    );

    render(await EmployeesPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("searchbox", { name: /Search/ })).toBeInTheDocument();
    expect(screen.getByText(/Showing 2 of 2/)).toBeInTheDocument();
  });
});