import { describe, expect, it } from "vitest";

import { resolveApiBaseUrl } from "../../lib/dashboard-api";

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
    ).toBe("http://localhost:8000/api/v1");
  });
});