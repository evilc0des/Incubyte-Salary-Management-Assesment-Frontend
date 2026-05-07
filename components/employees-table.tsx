"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import type { EmployeeListResponse } from "../lib/dashboard-api";
import { formatCurrency, formatDate } from "../lib/formatters";

type EmployeesTableProps = {
  response: EmployeeListResponse | null;
  isLoading?: boolean;
};

type SortColumn = "name" | "title" | "salary";
type SortDirection = "asc" | "desc";

export function EmployeesTable({ response, isLoading = false }: EmployeesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const currentSearch = searchParams.get("search") ?? "";
  const currentLimit = parseInt(searchParams.get("limit") ?? "20", 10);
  const currentOffset = parseInt(searchParams.get("offset") ?? "0", 10);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = formData.get("search") as string;

    const params = new URLSearchParams();
    if (search.trim()) {
      params.set("search", search);
    }
    params.set("limit", String(currentLimit));
    params.set("offset", "0");

    router.push(`/employees?${params.toString()}`);
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams();
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    params.set("limit", String(currentLimit));
    params.set("offset", String(Math.max(0, newOffset)));

    router.push(`/employees?${params.toString()}`);
  };

  const pageNumber = Math.floor(currentOffset / currentLimit) + 1;
  const totalPages = response ? Math.ceil(response.total / currentLimit) : 0;
  const hasNextPage = response ? currentOffset + currentLimit < response.total : false;
  const hasPrevPage = currentOffset > 0;

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  const sortedItems = useMemo(() => {
    if (!response) {
      return [];
    }

    const items = [...response.items];
    const direction = sortDirection === "asc" ? 1 : -1;

    items.sort((left, right) => {
      if (sortColumn === "name") {
        return left.full_name.localeCompare(right.full_name) * direction;
      }

      if (sortColumn === "title") {
        return left.job_title.localeCompare(right.job_title) * direction;
      }

      const leftSalary = Number(left.salary);
      const rightSalary = Number(right.salary);
      return (leftSalary - rightSalary) * direction;
    });

    return items;
  }, [response, sortColumn, sortDirection]);

  const getSortState = (column: SortColumn): "none" | "ascending" | "descending" => {
    if (sortColumn !== column) {
      return "none";
    }

    return sortDirection === "asc" ? "ascending" : "descending";
  };

  if (!response) {
    return (
      <article className="dashboard-panel dashboard-panel-empty">
        <h2>Employees unavailable</h2>
        <p>Employee data is unavailable right now.</p>
      </article>
    );
  }

  if (response.items.length === 0) {
    return (
      <article className="dashboard-panel dashboard-panel-empty">
        <h2>No employees found</h2>
        <p>No employees match your search.</p>
      </article>
    );
  }

  return (
    <div className="employees-table-container">
      <form className="employees-search-form" onSubmit={handleSearch}>
        <label htmlFor="search">Search employees:</label>
        <input
          id="search"
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by name..."
          className="employees-search-input"
          aria-label="Search"
        />
        <button type="submit" className="employees-search-button">
          Search
        </button>
      </form>

      <div className="employees-pagination-info">
        <p>
          Showing {response.items.length} of {response.total} employees
          {currentSearch && ` matching "${currentSearch}"`}
        </p>
      </div>

      <div className="employees-table-wrapper">
        <table className="employees-table">
          <thead>
            <tr>
              <th aria-sort={getSortState("name")}>
                <button type="button" className="table-sort-button" onClick={() => handleSort("name")}>
                  Name
                </button>
              </th>
              <th aria-sort={getSortState("title")}>
                <button type="button" className="table-sort-button" onClick={() => handleSort("title")}>
                  Title
                </button>
              </th>
              <th>Department</th>
              <th>Country</th>
              <th aria-sort={getSortState("salary")}>
                <button type="button" className="table-sort-button" onClick={() => handleSort("salary")}>
                  Salary
                </button>
              </th>
              <th>Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <Link href={`/employees/${employee.id}`}>{employee.full_name}</Link>
                </td>
                <td>{employee.job_title}</td>
                <td>{employee.department ?? "Unassigned"}</td>
                <td>{employee.country}</td>
                <td>{formatCurrency(employee.salary, employee.currency)}</td>
                <td>{formatDate(employee.hire_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="employees-pagination-controls">
        <button
          type="button"
          onClick={() => handlePageChange(currentOffset - currentLimit)}
          disabled={!hasPrevPage || isLoading}
          className="pagination-button"
        >
          Previous
        </button>

        <span className="pagination-info">
          Page {pageNumber} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => handlePageChange(currentOffset + currentLimit)}
          disabled={!hasNextPage || isLoading}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}
