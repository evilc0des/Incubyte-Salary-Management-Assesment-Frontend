"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Employee } from "../lib/dashboard-api";
import { updateEmployee } from "../lib/dashboard-api";
import { formatCurrency, formatDate, formatDateTime } from "../lib/formatters";
import { EmployeeForm } from "./employee-form";

type EmployeeDetailPageContentProps = {
  employee: Employee | null;
  state: "loaded" | "not-found" | "error";
};

type EmployeeDetailField = {
  label: string;
  value: string;
  isFullWidth?: boolean;
};

export function EmployeeDetailPageContent({ employee, state }: EmployeeDetailPageContentProps) {
  const router = useRouter();
  const [currentEmployee, setCurrentEmployee] = useState(employee);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentEmployee(employee);
  }, [employee]);

  if (state === "not-found") {
    return (
      <section className="dashboard-section">
        <article className="dashboard-panel dashboard-panel-empty">
          <h1>Employee not found</h1>
          <p>This employee record could not be loaded.</p>
        </article>
      </section>
    );
  }

  if (state === "error" || currentEmployee === null) {
    return (
      <section className="dashboard-section">
        <article className="dashboard-panel dashboard-panel-empty">
          <h1>Employee unavailable</h1>
          <p>Employee data is unavailable right now.</p>
        </article>
      </section>
    );
  }

  const handleSaveEmployee = async (nextEmployee: Parameters<typeof updateEmployee>[1]) => {
    const updatedEmployee = await updateEmployee(currentEmployee.id, nextEmployee);
    setCurrentEmployee(updatedEmployee);
    setIsEditing(false);
    router.refresh();
  };

  const detailFields: EmployeeDetailField[] = [
    {
      label: "First name",
      value: currentEmployee.first_name
    },
    {
      label: "Last name",
      value: currentEmployee.last_name
    },
    {
      label: "Job title",
      value: currentEmployee.job_title,
      isFullWidth: true
    },
    {
      label: "Department",
      value: currentEmployee.department ?? "Unassigned"
    },
    {
      label: "Country",
      value: currentEmployee.country
    },
    {
      label: "Salary",
      value: formatCurrency(currentEmployee.salary, currentEmployee.currency)
    },
    {
      label: "Hire date",
      value: formatDate(currentEmployee.hire_date)
    }
  ];

  return (
    <section className="dashboard-section">
      <div className="dashboard-section-header">
        <div>
          <p className="dashboard-eyebrow">Employee profile</p>
          <h1>{currentEmployee.full_name}</h1>
        </div>
        <div className="dashboard-section-actions">
          <p className="dashboard-copy">Review the current employee record and update it inline.</p>
          {!isEditing ? (
            <button
              type="button"
              className="dashboard-action-button"
              onClick={() => setIsEditing(true)}
            >
              Edit employee
            </button>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <article className="dashboard-panel">
          <EmployeeForm
            mode="edit"
            submitLabel="Save changes"
            initialValue={{
              first_name: currentEmployee.first_name,
              last_name: currentEmployee.last_name,
              job_title: currentEmployee.job_title,
              department: currentEmployee.department,
              country: currentEmployee.country,
              salary: currentEmployee.salary,
              hire_date: currentEmployee.hire_date
            }}
            onSubmit={handleSaveEmployee}
            onCancel={() => setIsEditing(false)}
          />
        </article>
      ) : (
        <div className="employee-detail-grid">
          {detailFields.map((field) => (
            <article
              key={field.label}
              className={`employee-detail-card${field.isFullWidth ? " employee-detail-card-full" : ""}`}
            >
              <h2 className="dashboard-eyebrow">{field.label}</h2>
              <p className="employee-detail-value">{field.value}</p>
            </article>
          ))}
        </div>
      )}

      {!isEditing ? (
        <p className="employee-detail-meta">
          Created {formatDateTime(currentEmployee.created_at)}. Updated {formatDateTime(currentEmployee.updated_at)}.
        </p>
      ) : null}
    </section>
  );
}