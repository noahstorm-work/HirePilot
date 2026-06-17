import { test, expect } from "@playwright/test"

test.describe("Profile Page Auth Guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Profile Redirect", () => {
  test("unauthenticated user is redirected from profile to login", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
  })
})

test.describe("Profile Page Access", () => {
  test("profile page requires authentication", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    // Verify we're on login page - profile is protected
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
  })

  test("login page has create account link for new users", async ({ page }) => {
    await page.goto("/profile", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page.getByRole("link", { name: "Create one free" })).toBeVisible()
  })
})
