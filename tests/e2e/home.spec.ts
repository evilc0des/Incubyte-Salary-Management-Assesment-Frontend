import { expect, test } from "@playwright/test";


test("home page renders the starter experience", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "FastAPI + Next.js + Postgres" })).toBeVisible();
  await expect(page.getByText("Starter boilerplate")).toBeVisible();
  await expect(page.getByText("Configured API base URL:")).toBeVisible();
  await expect(page.getByText("http://localhost:8000/api/v1")).toBeVisible();
});
