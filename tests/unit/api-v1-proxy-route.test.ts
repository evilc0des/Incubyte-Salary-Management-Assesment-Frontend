import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PATCH, POST } from "../../app/api/v1/[...path]/route";

describe("API v1 proxy route", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards POST requests with the JSON body to the upstream API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
          full_name: "Ada Lovelace"
        }),
        {
          status: 201,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const request = new NextRequest("http://localhost:3000/api/v1/employees", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        first_name: "Ada",
        last_name: "Lovelace"
      })
    });

    const response = await POST(request, {
      params: Promise.resolve({ path: ["employees"] })
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      new URL("employees", "http://localhost:8000/api/v1/"),
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          first_name: "Ada",
          last_name: "Lovelace"
        }),
        cache: "no-store"
      }
    );
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
      full_name: "Ada Lovelace"
    });
  });

  it("forwards PATCH requests with the JSON body to the upstream API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
          job_title: "Distinguished Engineer"
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json"
          }
        }
      )
    );

    const request = new NextRequest(
      "http://localhost:3000/api/v1/employees/1f48fd9b-4b35-4d35-9c05-34a86e519c77",
      {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          job_title: "Distinguished Engineer"
        })
      }
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        path: ["employees", "1f48fd9b-4b35-4d35-9c05-34a86e519c77"]
      })
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      new URL(
        "employees/1f48fd9b-4b35-4d35-9c05-34a86e519c77",
        "http://localhost:8000/api/v1/"
      ),
      {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "content-type": "application/json"
        },
        body: JSON.stringify({
          job_title: "Distinguished Engineer"
        }),
        cache: "no-store"
      }
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      id: "1f48fd9b-4b35-4d35-9c05-34a86e519c77",
      job_title: "Distinguished Engineer"
    });
  });
});