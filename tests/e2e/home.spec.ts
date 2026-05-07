import { expect, test } from "@playwright/test";

test("dashboard navigation loads overview, employees, and employee details", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("$124,500.00")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Salary distribution" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Average salary by country" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Country" })).toBeVisible();
  await expect(page.getByText("Selected country: United States")).toBeVisible();

  await page.getByRole("combobox", { name: "Country" }).selectOption("United Kingdom");
  await expect(page.getByText("Selected country: United Kingdom")).toBeVisible();

  await page.getByRole("link", { name: "Employees" }).first().click();
  await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ada Lovelace" })).toBeVisible();

  await page.getByRole("link", { name: "Ada Lovelace" }).click();
  await expect(page.getByRole("heading", { name: "Ada Lovelace" })).toBeVisible();
  await expect(page.getByText("Principal Engineer")).toBeVisible();
  await expect(page.getByText("United Kingdom")).toBeVisible();
});
