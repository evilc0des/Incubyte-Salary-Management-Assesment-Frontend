import { defineConfig, devices } from "@playwright/test";


export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "node ./tests/e2e/mock-api-server.mjs",
      url: "http://127.0.0.1:8000/healthz",
      name: "Mock API",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: "npx next dev --hostname 127.0.0.1 --port 3001",
      url: "http://127.0.0.1:3001",
      name: "Frontend",
      env: {
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:8000/api/v1"
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
