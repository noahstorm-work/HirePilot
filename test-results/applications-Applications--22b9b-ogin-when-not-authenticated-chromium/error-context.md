# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: applications.spec.ts >> Applications Page Auth Guard >> redirects to login when not authenticated
- Location: tests\e2e\applications.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3000/applications", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test"
  2  | 
  3  | test.describe("Applications Page Auth Guard", () => {
  4  |   test("redirects to login when not authenticated", async ({ page }) => {
> 5  |     await page.goto("/applications", { waitUntil: "domcontentloaded" })
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  6  |     await page.waitForURL(/\/login/, { timeout: 15000 })
  7  |     await expect(page).toHaveURL(/\/login/)
  8  |   })
  9  | })
  10 | 
  11 | test.describe("Applications Redirect", () => {
  12 |   test("unauthenticated user is redirected from applications to login", async ({ page }) => {
  13 |     await page.goto("/applications", { waitUntil: "domcontentloaded" })
  14 |     await page.waitForURL(/\/login/, { timeout: 15000 })
  15 |     await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
  16 |   })
  17 | })
  18 | 
  19 | test.describe("Applications Page Access", () => {
  20 |   test("applications page requires authentication", async ({ page }) => {
  21 |     await page.goto("/applications", { waitUntil: "domcontentloaded" })
  22 |     await page.waitForURL(/\/login/, { timeout: 15000 })
  23 |     // Verify we're on login page - applications is protected
  24 |     await expect(page.getByLabel("Email")).toBeVisible()
  25 |     await expect(page.getByLabel("Password")).toBeVisible()
  26 |   })
  27 | })
  28 | 
```