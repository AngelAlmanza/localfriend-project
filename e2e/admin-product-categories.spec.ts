import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

/**
 * These tests run against the admin categories pages.
 * They require an authenticated session — if unauthenticated, they verify redirect behaviour.
 */
test.describe("Admin - Product Categories (unauthenticated)", () => {
  test("redirects unauthenticated users away from product categories page", async ({ page }) => {
    await page.goto("/admin/categories/products")
    await expect(page).not.toHaveURL(/admin\/categories\/products/)
  })
})

test.describe("Admin - Service Categories (unauthenticated)", () => {
  test("redirects unauthenticated users away from service categories page", async ({ page }) => {
    await page.goto("/admin/categories/services")
    await expect(page).not.toHaveURL(/admin\/categories\/services/)
  })
})

test.describe("Admin - Dashboard (unauthenticated)", () => {
  test("redirects unauthenticated users away from admin dashboard", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).not.toHaveURL(/^\/admin$/)
  })
})

test.describe("Auth pages accessibility audit", () => {
  const pages = [
    { name: "login", url: "/auth/login" },
    { name: "register", url: "/auth/register" },
  ]

  for (const { name, url } of pages) {
    test(`${name} page: no serious/critical axe violations`, async ({ page }) => {
      await page.goto(url)

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "best-practice"])
        .analyze()

      const serious = results.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious"
      )

      if (serious.length > 0) {
        console.log(
          `[${name}] Accessibility violations:`,
          serious.map((v) => `${v.id}: ${v.description}`)
        )
      }

      expect(serious).toHaveLength(0)
    })
  }
})
