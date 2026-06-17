import { test, expect } from "@playwright/test"

test.describe("Applications Page Auth Guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/applications", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Applications Redirect", () => {
  test("unauthenticated user is redirected from applications to login", async ({ page }) => {
    await page.goto("/applications", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
  })
})

test.describe("Applications Page Access", () => {
  test("applications page requires authentication", async ({ page }) => {
    await page.goto("/applications", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    // Verify we're on login page - applications is protected
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
  })
})
