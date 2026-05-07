import { createServer } from "node:http";

const host = "127.0.0.1";
const port = Number(process.env.E2E_MOCK_API_PORT ?? "8010");

const overview = {
  filters: {
    country: null,
    job_title: null
  },
  employee_count: 24,
  currency: "USD",
  min_salary: "72000.00",
  max_salary: "180000.00",
  average_salary: "124500.00",
  median_salary: "121000.00",
  p25_salary: "99000.00",
  p75_salary: "146000.00",
  salary_range: "108000.00",
  last_updated_at: "2026-05-07T08:30:00Z"
};

const insightsByCountry = {
  items: [
    {
      country: "United States",
      employee_count: 12,
      currency: "USD",
      min_salary: "90000.00",
      max_salary: "180000.00",
      average_salary: "136000.00",
      median_salary: "133000.00",
      p25_salary: "118000.00",
      p75_salary: "152000.00",
      salary_range: "90000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    },
    {
      country: "United Kingdom",
      employee_count: 7,
      currency: "USD",
      min_salary: "98000.00",
      max_salary: "168000.00",
      average_salary: "132000.00",
      median_salary: "129000.00",
      p25_salary: "115000.00",
      p75_salary: "145000.00",
      salary_range: "70000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    }
  ],
  total: 2,
  limit: 8,
  offset: 0
};

const jobTitlesByCountry = {
  "United States": {
    items: [
      {
        job_title: "Staff Engineer",
        employee_count: 5,
        currency: "USD",
        min_salary: "126000.00",
        max_salary: "170000.00",
        average_salary: "144000.00",
        median_salary: "142000.00",
        p25_salary: "136000.00",
        p75_salary: "151000.00",
        salary_range: "44000.00",
        last_updated_at: "2026-05-07T08:30:00Z"
      },
      {
        job_title: "Engineering Manager",
        employee_count: 3,
        currency: "USD",
        min_salary: "140000.00",
        max_salary: "180000.00",
        average_salary: "158000.00",
        median_salary: "156000.00",
        p25_salary: "148000.00",
        p75_salary: "170000.00",
        salary_range: "40000.00",
        last_updated_at: "2026-05-07T08:30:00Z"
      }
    ],
    total: 2,
    limit: 10,
    offset: 0
  },
  "United Kingdom": {
    items: [
      {
        job_title: "Principal Engineer",
        employee_count: 2,
        currency: "USD",
        min_salary: "142000.00",
        max_salary: "168000.00",
        average_salary: "155000.00",
        median_salary: "155000.00",
        p25_salary: "148500.00",
        p75_salary: "161500.00",
        salary_range: "26000.00",
        last_updated_at: "2026-05-07T08:30:00Z"
      }
    ],
    total: 1,
    limit: 10,
    offset: 0
  }
};

const employee = {
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
};

const employees = {
  items: [employee],
  total: 1,
  limit: 20,
  offset: 0
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json"
  });
  response.end(JSON.stringify(payload));
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${host}:${port}`);

  if (url.pathname === "/healthz") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === "/api/v1/insights/overview") {
    sendJson(response, 200, overview);
    return;
  }

  if (url.pathname === "/api/v1/insights/by-country") {
    sendJson(response, 200, insightsByCountry);
    return;
  }

  if (url.pathname.startsWith("/api/v1/insights/by-country/") && url.pathname.endsWith("/job-titles")) {
    const country = decodeURIComponent(
      url.pathname.replace("/api/v1/insights/by-country/", "").replace("/job-titles", "")
    );

    sendJson(response, 200, jobTitlesByCountry[country] ?? {
      items: [],
      total: 0,
      limit: 10,
      offset: 0
    });
    return;
  }

  if (url.pathname === "/api/v1/employees") {
    sendJson(response, 200, employees);
    return;
  }

  if (url.pathname === `/api/v1/employees/${employee.id}`) {
    sendJson(response, 200, employee);
    return;
  }

  sendJson(response, 404, {
    detail: "Not found"
  });
}).listen(port, host);