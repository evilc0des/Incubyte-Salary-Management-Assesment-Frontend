import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createEmployee,
  DashboardApiError,
  getHiringTrend,
  listInsightsByDepartment,
  listInsightsByTenureBand,
  listInsightsByCountry,
  listInsightsByCountryJobTitles,
  resolveApiBaseUrl,
  updateEmployee
} from "../../lib/dashboard-api";

describe("resolveApiBaseUrl", () => {
  it("prefers the internal API URL for server-side requests", () => {
    expect(
      resolveApiBaseUrl({
        serverSide: true,
        env: {
          INTERNAL_API_URL: "http://backend:8000/api/v1",
          NEXT_PUBLIC_API_URL: "http://localhost:8000/api/v1"
        }
      })
    ).toBe("http://backend:8000/api/v1");
  });

  it("uses the public API URL for client-side requests", () => {
    expect(
      resolveApiBaseUrl({
        serverSide: false,
        env: {
          INTERNAL_API_URL: "http://backend:8000/api/v1",
          NEXT_PUBLIC_API_URL: "http://localhost:8000/api/v1"
        }
      })
    ).toBe("/api/v1");
  });
});

describe("insights API client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls by-country insights with limit and offset", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
          limit: 8,
          offset: 0
        })
      } as Response);

    await listInsightsByCountry(8, 4);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/insights/by-country?limit=8&offset=4",
      { cache: "no-store" }
    );
  });

  it("encodes country for job-title insights", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
          limit: 10,
          offset: 0
        })
      } as Response);

    await listInsightsByCountryJobTitles("United States", 10, 2);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/insights/by-country/United%20States/job-titles?limit=10&offset=2",
      { cache: "no-store" }
    );
  });

  it("calls department insights with limit and offset", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
          limit: 8,
          offset: 0
        })
      } as Response);

    await listInsightsByDepartment(8, 1);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/insights/by-department?limit=8&offset=1",
      { cache: "no-store" }
    );
  });

  it("calls tenure band insights without query params", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 4
        })
      } as Response);

    await listInsightsByTenureBand();

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/insights/tenure-bands",
      { cache: "no-store" }
    );
  });

  it("calls hiring trend with a month window", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 12
        })
      } as Response);

    await getHiringTrend(6);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/insights/hiring-trend?months=6",
      { cache: "no-store" }
    );
  });

  it("throws DashboardApiError when insights response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503
    } as Response);

    await expect(listInsightsByCountry()).rejects.toBeInstanceOf(DashboardApiError);
  });

  it("creates an employee with a POST request", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
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
      } as Response);

    await createEmployee({
      first_name: "Ada",
      last_name: "Lovelace",
      job_title: "Principal Engineer",
      department: "Platform",
      country: "United Kingdom",
      salary: "145000.00",
      hire_date: "2021-03-10"
    });

    expect(fetchSpy).toHaveBeenCalledWith("/api/v1/employees", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        first_name: "Ada",
        last_name: "Lovelace",
        job_title: "Principal Engineer",
        department: "Platform",
        country: "United Kingdom",
        salary: "145000.00",
        hire_date: "2021-03-10"
      }),
      cache: "no-store"
    });
  });

  it("updates an employee with a PATCH request", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
          first_name: "Ada",
          last_name: "Lovelace",
          full_name: "Ada Lovelace",
          job_title: "Distinguished Engineer",
          department: "Platform",
          country: "United Kingdom",
          salary: "152000.00",
          currency: "USD",
          hire_date: "2021-03-10",
          created_at: "2026-05-07T08:30:00Z",
          updated_at: "2026-05-08T08:30:00Z"
        })
      } as Response);

    await updateEmployee("1f48fd9b-4b35-4d35-9c05-34a86e519c77", {
      job_title: "Distinguished Engineer",
      salary: "152000.00"
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/v1/employees/1f48fd9b-4b35-4d35-9c05-34a86e519c77",
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          job_title: "Distinguished Engineer",
          salary: "152000.00"
        }),
        cache: "no-store"
      }
    );
  });

  it("throws DashboardApiError when a mutation response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 422
    } as Response);

    await expect(
      createEmployee({
        first_name: "Ada",
        last_name: "Lovelace",
        job_title: "Principal Engineer",
        department: "Platform",
        country: "United Kingdom",
        salary: "145000.00",
        hire_date: "2021-03-10"
      })
    ).rejects.toEqual(expect.objectContaining({ status: 422 }));
  });
});