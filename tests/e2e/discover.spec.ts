import { test, expect } from "@playwright/test"

test.describe("Discover Page Auth Guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/discover", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Discover Redirect", () => {
  test("unauthenticated user is redirected from discover to login", async ({ page }) => {
    await page.goto("/discover", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
  })
})

test.describe("Discover Login Page", () => {
  test("login page loads with HirePilot branding", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    await expect(page.getByText("HirePilot")).toBeVisible()
    await expect(page.getByText("Sign in to your career cockpit")).toBeVisible()
  })

  test("login page has email and password fields", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Try Demo Account" })).toBeVisible()
  })

  test("login form accepts email input", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    const emailInput = page.getByLabel("Email")
    await emailInput.fill("test@example.com")
    await expect(emailInput).toHaveValue("test@example.com")
  })

  test("login form accepts password input", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    const passwordInput = page.getByLabel("Password")
    await passwordInput.fill("password123")
    await expect(passwordInput).toHaveValue("password123")
  })
})
