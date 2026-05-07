import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
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
    pushMock.mockReset();
    refreshMock.mockReset();
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

  it("opens the add employee panel and navigates to the new employee after a successful create", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
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
              }
            ],
            total: 1,
            limit: 20,
            offset: 0
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
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
            created_at: "2026-05-08T08:30:00Z",
            updated_at: "2026-05-08T08:30:00Z"
          })
        })
    );

    render(await EmployeesPage({ searchParams: Promise.resolve({}) }));

    await user.click(screen.getByRole("button", { name: "Add employee" }));

    expect(screen.getByRole("dialog", { name: "Add employee" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("First name"), "Grace");
    await user.type(screen.getByLabelText("Last name"), "Hopper");
    await user.type(screen.getByLabelText("Job title"), "Staff Engineer");
    await user.type(screen.getByLabelText("Department"), "Infrastructure");
    await user.type(screen.getByLabelText("Country"), "United States");
    await user.type(screen.getByLabelText("Salary"), "138000.00");
    await user.type(screen.getByLabelText("Hire date"), "2020-01-15");

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/employees/5d23499d-eb7c-43be-a8bd-c99c8c3a9361"
      );
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Add employee" })).not.toBeInTheDocument();
    });
    expect(refreshMock).not.toHaveBeenCalled();
  });
});