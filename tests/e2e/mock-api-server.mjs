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

const insightsByDepartment = {
  items: [
    {
      department: "Engineering",
      employee_count: 10,
      currency: "USD",
      min_salary: "100000.00",
      max_salary: "180000.00",
      average_salary: "145000.00",
      median_salary: "142000.00",
      p25_salary: "128000.00",
      p75_salary: "157000.00",
      salary_range: "80000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    },
    {
      department: "Human Resources",
      employee_count: 4,
      currency: "USD",
      min_salary: "82000.00",
      max_salary: "126000.00",
      average_salary: "104000.00",
      median_salary: "103000.00",
      p25_salary: "92000.00",
      p75_salary: "114000.00",
      salary_range: "44000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    }
  ],
  total: 2,
  limit: 8,
  offset: 0
};

const tenureBands = {
  items: [
    {
      tenure_band: "<1 year",
      employee_count: 5,
      currency: "USD",
      min_salary: "72000.00",
      max_salary: "130000.00",
      average_salary: "97000.00",
      median_salary: "95000.00",
      p25_salary: "84000.00",
      p75_salary: "112000.00",
      salary_range: "58000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    },
    {
      tenure_band: "1-2 years",
      employee_count: 6,
      currency: "USD",
      min_salary: "76000.00",
      max_salary: "142000.00",
      average_salary: "108000.00",
      median_salary: "107000.00",
      p25_salary: "93000.00",
      p75_salary: "122000.00",
      salary_range: "66000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    },
    {
      tenure_band: "3-5 years",
      employee_count: 7,
      currency: "USD",
      min_salary: "90000.00",
      max_salary: "150000.00",
      average_salary: "119000.00",
      median_salary: "118000.00",
      p25_salary: "104000.00",
      p75_salary: "132000.00",
      salary_range: "60000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    },
    {
      tenure_band: "5+ years",
      employee_count: 6,
      currency: "USD",
      min_salary: "98000.00",
      max_salary: "160000.00",
      average_salary: "131000.00",
      median_salary: "129000.00",
      p25_salary: "118000.00",
      p75_salary: "144000.00",
      salary_range: "62000.00",
      last_updated_at: "2026-05-07T08:30:00Z"
    }
  ],
  total: 4
};

const hiringTrend = {
  items: [
    { month: "2025-12", hires_count: 1 },
    { month: "2026-01", hires_count: 2 },
    { month: "2026-02", hires_count: 1 },
    { month: "2026-03", hires_count: 2 },
    { month: "2026-04", hires_count: 4 },
    { month: "2026-05", hires_count: 3 }
  ],
  total: 6
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

  if (url.pathname === "/api/v1/insights/by-department") {
    sendJson(response, 200, insightsByDepartment);
    return;
  }

  if (url.pathname === "/api/v1/insights/tenure-bands") {
    sendJson(response, 200, tenureBands);
    return;
  }

  if (url.pathname === "/api/v1/insights/hiring-trend") {
    sendJson(response, 200, hiringTrend);
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