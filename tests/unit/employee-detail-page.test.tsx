import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

import EmployeeDetailPage from "../../app/employees/[employeeId]/page";

const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

describe("Employee detail page", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    refreshMock.mockReset();
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
    expect(screen.getByRole("heading", { name: "First name" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Last name" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Job title" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Department" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Country" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Salary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Hire date" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(7);
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

  it("edits the employee inline and returns to the updated read-only view", async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
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
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
            first_name: "Ada",
            last_name: "Lovelace",
            full_name: "Ada Lovelace",
            job_title: "Distinguished Engineer",
            department: "Platform Strategy",
            country: "United Kingdom",
            salary: "152000.00",
            currency: "USD",
            hire_date: "2021-03-10",
            created_at: "2026-05-07T08:30:00Z",
            updated_at: "2026-05-08T08:30:00Z"
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

    await user.click(screen.getByRole("button", { name: "Edit employee" }));

    const jobTitleInput = screen.getByLabelText("Job title");
    const departmentInput = screen.getByLabelText("Department");
    const salaryInput = screen.getByLabelText("Salary");

    await user.clear(jobTitleInput);
    await user.type(jobTitleInput, "Distinguished Engineer");
    await user.clear(departmentInput);
    await user.type(departmentInput, "Platform Strategy");
    await user.clear(salaryInput);
    await user.type(salaryInput, "152000.00");

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
    });

    expect(screen.getByText("Distinguished Engineer")).toBeInTheDocument();
    expect(screen.getByText("Platform Strategy")).toBeInTheDocument();
    expect(screen.getByText("$152,000.00")).toBeInTheDocument();
  });
});