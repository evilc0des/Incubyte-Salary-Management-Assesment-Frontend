import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DashboardApiError,
  listInsightsByCountry,
  listInsightsByCountryJobTitles,
  resolveApiBaseUrl
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

  it("throws DashboardApiError when insights response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 503
    } as Response);

    await expect(listInsightsByCountry()).rejects.toBeInstanceOf(DashboardApiError);
  });
});