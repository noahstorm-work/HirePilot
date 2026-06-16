import { test, expect } from "@playwright/test"

test.describe("Dashboard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Command Palette", () => {
  test("opens with Cmd+K and shows search input", async ({ page }) => {
    await page.goto("/login")

    await page.keyboard.press("Control+k")

    const dialog = page.getByRole("dialog", { name: "Command palette" })
    await expect(dialog).toBeVisible()
    await expect(page.getByPlaceholder("Search pages, applications, jobs, skills...")).toBeVisible()
  })

  test("closes with Escape key", async ({ page }) => {
    await page.goto("/login")

    await page.keyboard.press("Control+k")
    const dialog = page.getByRole("dialog", { name: "Command palette" })
    await expect(dialog).toBeVisible()

    await page.keyboard.press("Escape")
    await expect(dialog).not.toBeVisible()
  })
})
