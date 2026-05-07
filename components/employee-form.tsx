"use client";

import { FormEvent, useState } from "react";

import type { EmployeeWritePayload } from "../lib/dashboard-api";

type EmployeeFormProps = {
  mode: "create" | "edit";
  submitLabel: string;
  initialValue?: Partial<EmployeeWritePayload>;
  onSubmit: (value: EmployeeWritePayload) => Promise<void>;
  onCancel: () => void;
};

type EmployeeFormState = {
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  country: string;
  salary: string;
  hire_date: string;
};

function buildInitialState(initialValue?: Partial<EmployeeWritePayload>): EmployeeFormState {
  return {
    first_name: initialValue?.first_name ?? "",
    last_name: initialValue?.last_name ?? "",
    job_title: initialValue?.job_title ?? "",
    department: initialValue?.department ?? "",
    country: initialValue?.country ?? "",
    salary: initialValue?.salary ?? "",
    hire_date: initialValue?.hire_date ?? ""
  };
}

function normalizeEmployeeFormValue(value: EmployeeFormState): EmployeeWritePayload {
  return {
    first_name: value.first_name.trim(),
    last_name: value.last_name.trim(),
    job_title: value.job_title.trim(),
    department: value.department.trim() ? value.department.trim() : null,
    country: value.country.trim(),
    salary: value.salary.trim(),
    hire_date: value.hire_date.trim() ? value.hire_date.trim() : null
  };
}

export function EmployeeForm({
  mode,
  submitLabel,
  initialValue,
  onSubmit,
  onCancel
}: EmployeeFormProps) {
  const [formValue, setFormValue] = useState<EmployeeFormState>(() => buildInitialState(initialValue));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFieldChange = (field: keyof EmployeeFormState, value: string) => {
    setFormValue((current) => ({
      ...current,
      [field]: value
    }));
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onSubmit(normalizeEmployeeFormValue(formValue));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit}>
      <div className="employee-form-grid">
        <label className="employee-form-field" htmlFor={`${mode}-employee-first-name`}>
          <span>First name</span>
          <input
            id={`${mode}-employee-first-name`}
            name="first_name"
            type="text"
            value={formValue.first_name}
            onChange={(event) => handleFieldChange("first_name", event.target.value)}
            required
          />
        </label>

        <label className="employee-form-field" htmlFor={`${mode}-employee-last-name`}>
          <span>Last name</span>
          <input
            id={`${mode}-employee-last-name`}
            name="last_name"
            type="text"
            value={formValue.last_name}
            onChange={(event) => handleFieldChange("last_name", event.target.value)}
            required
          />
        </label>

        <label className="employee-form-field employee-form-field-full" htmlFor={`${mode}-employee-job-title`}>
          <span>Job title</span>
          <input
            id={`${mode}-employee-job-title`}
            name="job_title"
            type="text"
            value={formValue.job_title}
            onChange={(event) => handleFieldChange("job_title", event.target.value)}
            required
          />
        </label>

        <label className="employee-form-field" htmlFor={`${mode}-employee-department`}>
          <span>Department</span>
          <input
            id={`${mode}-employee-department`}
            name="department"
            type="text"
            value={formValue.department}
            onChange={(event) => handleFieldChange("department", event.target.value)}
          />
        </label>

        <label className="employee-form-field" htmlFor={`${mode}-employee-country`}>
          <span>Country</span>
          <input
            id={`${mode}-employee-country`}
            name="country"
            type="text"
            value={formValue.country}
            onChange={(event) => handleFieldChange("country", event.target.value)}
            required
          />
        </label>

        <label className="employee-form-field" htmlFor={`${mode}-employee-salary`}>
          <span>Salary</span>
          <input
            id={`${mode}-employee-salary`}
            name="salary"
            type="text"
            inputMode="decimal"
            pattern="^\d+(?:\.\d+)?$"
            value={formValue.salary}
            onChange={(event) => handleFieldChange("salary", event.target.value)}
            required
          />
        </label>

        <label className="employee-form-field" htmlFor={`${mode}-employee-hire-date`}>
          <span>Hire date</span>
          <input
            id={`${mode}-employee-hire-date`}
            name="hire_date"
            type="date"
            value={formValue.hire_date}
            onChange={(event) => handleFieldChange("hire_date", event.target.value)}
          />
        </label>
      </div>

      {errorMessage ? (
        <p className="employee-form-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="employee-form-actions flex gap-2 justify-end items-center">
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}