import { test, expect } from "@playwright/test"

test.describe("Login Page", () => {
  test("renders login form with email and password fields", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Try Demo Account" })).toBeVisible()
  })

  test("shows HirePilot branding", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByText("HirePilot")).toBeVisible()
    await expect(page.getByText("Sign in to your career cockpit")).toBeVisible()
  })
})

test.describe("Auth Navigation", () => {
  test("navigates from login to register", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("link", { name: "Create one free" }).click()
    await expect(page).toHaveURL(/\/register/)
    await expect(page.getByRole("heading", { name: /create|sign up/i })).toBeVisible()
  })

  test("navigates from login to forgot password", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("link", { name: "Forgot password?" }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test("navigates from register back to login", async ({ page }) => {
    await page.goto("/register")

    const loginLink = page.getByRole("link", { name: /sign in|log in/i })
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("navigates from forgot password back to login", async ({ page }) => {
    await page.goto("/forgot-password")

    const backLink = page.getByRole("link", { name: /back|sign in/i })
    await backLink.click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Dashboard Auth Guard", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard")

    await expect(page).toHaveURL(/\/login/)
  })

  test("redirects to login from protected sub-routes", async ({ page }) => {
    await page.goto("/discover")

    await expect(page).toHaveURL(/\/login/)
  })
})
