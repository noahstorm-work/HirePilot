import { test, expect } from "@playwright/test"

test.describe("Protected Page Redirects", () => {
  const protectedRoutes = [
    { path: "/applications", name: "Applications" },
    { path: "/profile", name: "Profile" },
    { path: "/dashboard/career-analysis", name: "Career Analysis" },
    { path: "/dashboard/interview-coach", name: "Interview Coach" },
    { path: "/dashboard/ats-checker", name: "ATS Checker" },
    { path: "/dashboard/skills-gap", name: "Skills Gap" },
    { path: "/dashboard/insights", name: "Insights" },
    { path: "/dashboard/cv-versions", name: "CV Versions" },
  ]

  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) redirects to login`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" })
      await page.waitForURL(/\/login/, { timeout: 15000 })
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

test.describe("Auth Navigation", () => {
  test("navigates from login to register", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    await page.waitForSelector("text=Welcome back", { timeout: 15000 })

    await page.getByRole("link", { name: "Create one free" }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test("navigates from login to forgot password", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" })
    await page.waitForSelector("text=Welcome back", { timeout: 15000 })

    await page.getByRole("link", { name: "Forgot password?" }).click()
    await expect(page).toHaveURL(/\/forgot-password/)
  })

  test("navigates from register back to login", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" })

    const loginLink = page.getByRole("link", { name: /sign in|log in/i })
    await loginLink.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test("navigates from forgot password back to login", async ({ page }) => {
    await page.goto("/forgot-password", { waitUntil: "domcontentloaded" })

    const backLink = page.getByRole("link", { name: /back|sign in/i })
    await backLink.click()
    await expect(page).toHaveURL(/\/login/)
  })
})
