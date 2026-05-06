import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardShell } from "../../components/dashboard-shell";

describe("DashboardShell", () => {
  it("renders the sidebar navigation and highlights the active route", () => {
    render(
      <DashboardShell currentPath="/employees">
        <section>
          <h1>Employees</h1>
          <p>Browse employee records.</p>
        </section>
      </DashboardShell>
    );

    expect(screen.getByRole("banner", { name: "Salary dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Employees" })).toHaveAttribute(
      "href",
      "/employees"
    );
    expect(screen.getByRole("link", { name: "Employees" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("heading", { name: "Employees" })).toBeInTheDocument();
    expect(screen.getByText("Browse employee records.")).toBeInTheDocument();
  });
});