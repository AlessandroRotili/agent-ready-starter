import { test, expect } from "@playwright/test";
import { project } from "../../config/project";
test("workspace follows the selected identity/data mode", async ({ page }) => {
  await page.goto("/dashboard");
  if (String(project.provider) === "supabase") {
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Bentornato" }),
    ).toBeVisible();
    return;
  }
  if (String(project.provider) === "mock") {
    await expect(page.getByRole("status")).toContainText("Demo locale");
    await page.getByLabel("Titolo").fill("Attivita browser");
    await page.getByRole("button", { name: "Aggiungi" }).click();
    await expect(page.getByText("Attivita browser")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Attivita browser")).toHaveCount(0);
  } else
    await expect(
      page.getByRole("heading", { name: "Area da configurare" }),
    ).toBeVisible();
});
