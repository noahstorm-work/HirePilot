# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile Page Auth Guard >> redirects to login when not authenticated
- Location: tests\e2e\profile.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/profile", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Profile Page Auth Guard", () => {
  4  |   test("redirects to login when not authenticated", async ({ page }) => {
> 5  |     await page.goto("/profile", { waitUntil: "domcontentloaded" })
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  6  |     await page.waitForURL(/\/login/, { timeout: 15000 })
  7  |     await expect(page).toHaveURL(/\/login/)
  8  |   })
  9  | })
  10 | 
  11 | test.describe("Profile Redirect", () => {
  12 |   test("unauthenticated user is redirected from profile to login", async ({ page }) => {
  13 |     await page.goto("/profile", { waitUntil: "domcontentloaded" })
  14 |     await page.waitForURL(/\/login/, { timeout: 15000 })
  15 |     await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
  16 |   })
  17 | })
  18 | 
  19 | test.describe("Profile Page Access", () => {
  20 |   test("profile page requires authentication", async ({ page }) => {
  21 |     await page.goto("/profile", { waitUntil: "domcontentloaded" })
  22 |     await page.waitForURL(/\/login/, { timeout: 15000 })
  23 |     // Verify we're on login page - profile is protected
  24 |     await expect(page.getByLabel("Email")).toBeVisible()
  25 |     await expect(page.getByLabel("Password")).toBeVisible()
  26 |   })
  27 | 
  28 |   test("login page has create account link for new users", async ({ page }) => {
  29 |     await page.goto("/profile", { waitUntil: "domcontentloaded" })
  30 |     await page.waitForURL(/\/login/, { timeout: 15000 })
  31 |     await expect(page.getByRole("link", { name: "Create one free" })).toBeVisible()
  32 |   })
  33 | })
  34 | 
```