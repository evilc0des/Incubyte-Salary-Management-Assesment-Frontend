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