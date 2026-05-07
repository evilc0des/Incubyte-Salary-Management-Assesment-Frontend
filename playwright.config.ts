import { defineConfig, devices } from "@playwright/test";

const mockApiPort = Number(process.env.E2E_MOCK_API_PORT ?? "8010");
const mockApiBaseUrl = `http://127.0.0.1:${mockApiPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "node ./tests/e2e/mock-api-server.mjs",
      url: `${mockApiBaseUrl}/healthz`,
      name: "Mock API",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: "npx next dev --webpack --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      name: "Frontend",
      env: {
        NEXT_PUBLIC_API_URL: `${mockApiBaseUrl}/api/v1`
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
