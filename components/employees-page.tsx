"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { EmployeeListResponse } from "../lib/dashboard-api";
import { createEmployee } from "../lib/dashboard-api";
import { EmployeeForm } from "./employee-form";
import { EmployeesTable } from "./employees-table";

type EmployeesPageContentProps = {
  response: EmployeeListResponse | null;
};

export function EmployeesPageContent({ response }: EmployeesPageContentProps) {
  const router = useRouter();
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);

  const handleCreateEmployee = async (employee: Parameters<typeof createEmployee>[0]) => {
    const createdEmployee = await createEmployee(employee);
    setIsCreatePanelOpen(false);
    router.push(`/employees/${createdEmployee.id}`);
  };

  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Directory</p>
          <h1>Employees</h1>
        </div>
        <div className="dashboard-section-actions">
          <p className="dashboard-copy">Browse the current employee roster.</p>
          <button
            type="button"
            className="dashboard-action-button"
            onClick={() => setIsCreatePanelOpen(true)}
          >
            Add employee
          </button>
        </div>
      </div>

      {isCreatePanelOpen ? (
        <div className="employee-panel-shell">
          <button
            type="button"
            className="employee-panel-backdrop"
            aria-label="Close add employee panel"
            onClick={() => setIsCreatePanelOpen(false)}
          />
          <aside
            className="employee-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-employee-panel-title"
          >
            <div className="employee-panel-header">
              <div>
                <p className="dashboard-eyebrow">Create record</p>
                <h2 id="add-employee-panel-title">Add employee</h2>
              </div>
              <button
                type="button"
                className="employee-panel-close"
                aria-label="Close add employee panel"
                onClick={() => setIsCreatePanelOpen(false)}
              >
                Close
              </button>
            </div>

            <EmployeeForm
              mode="create"
              submitLabel="Create employee"
              onSubmit={handleCreateEmployee}
              onCancel={() => setIsCreatePanelOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <EmployeesTable response={response} />
    </section>
  );
}