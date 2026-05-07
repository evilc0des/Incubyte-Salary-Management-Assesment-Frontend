import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EmployeeForm } from "../../components/employee-form";

describe("EmployeeForm", () => {
  it("submits normalized create values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <EmployeeForm
        mode="create"
        submitLabel="Create employee"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("First name"), "  Ada ");
    await user.type(screen.getByLabelText("Last name"), " Lovelace  ");
    await user.type(screen.getByLabelText("Job title"), " Principal Engineer ");
    await user.type(screen.getByLabelText("Country"), " United Kingdom ");
    await user.type(screen.getByLabelText("Salary"), "145000.00");

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        first_name: "Ada",
        last_name: "Lovelace",
        job_title: "Principal Engineer",
        department: null,
        country: "United Kingdom",
        salary: "145000.00",
        hire_date: null
      });
    });
  });

  it("prefills edit values", () => {
    render(
      <EmployeeForm
        mode="edit"
        submitLabel="Save changes"
        initialValue={{
          first_name: "Ada",
          last_name: "Lovelace",
          job_title: "Principal Engineer",
          department: "Platform",
          country: "United Kingdom",
          salary: "145000.00",
          hire_date: "2021-03-10"
        }}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByLabelText("First name")).toHaveValue("Ada");
    expect(screen.getByLabelText("Last name")).toHaveValue("Lovelace");
    expect(screen.getByLabelText("Job title")).toHaveValue("Principal Engineer");
    expect(screen.getByLabelText("Department")).toHaveValue("Platform");
    expect(screen.getByLabelText("Country")).toHaveValue("United Kingdom");
    expect(screen.getByLabelText("Salary")).toHaveValue("145000.00");
    expect(screen.getByLabelText("Hire date")).toHaveValue("2021-03-10");
  });

  it("disables actions while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(
      <EmployeeForm
        mode="create"
        submitLabel="Create employee"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Job title"), "Principal Engineer");
    await user.type(screen.getByLabelText("Country"), "United Kingdom");
    await user.type(screen.getByLabelText("Salary"), "145000.00");

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    expect(screen.getByRole("button", { name: "Create employee" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveSubmit?.();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create employee" })).not.toBeDisabled();
    });
  });

  it("shows a submission error message", async () => {
    const user = userEvent.setup();

    render(
      <EmployeeForm
        mode="create"
        submitLabel="Create employee"
        onSubmit={vi.fn().mockRejectedValue(new Error("Request failed"))}
        onCancel={vi.fn()}
      />
    );

    await user.type(screen.getByLabelText("First name"), "Ada");
    await user.type(screen.getByLabelText("Last name"), "Lovelace");
    await user.type(screen.getByLabelText("Job title"), "Principal Engineer");
    await user.type(screen.getByLabelText("Country"), "United Kingdom");
    await user.type(screen.getByLabelText("Salary"), "145000.00");

    await user.click(screen.getByRole("button", { name: "Create employee" }));

    expect(await screen.findByText("Request failed")).toBeInTheDocument();
  });
});