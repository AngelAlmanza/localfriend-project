import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Locals Favorites", () => {
  test.describe("Auth guard", () => {
    test("redirects unauthenticated users from saved page to login", async ({ page }) => {
      await page.goto("/locals/saved")
      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test("redirects unauthenticated users from recent page to login", async ({ page }) => {
      await page.goto("/locals/recent")
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe("Saved page redirect", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/locals/saved")
      await page.waitForURL(/\/auth\/login/)
    })

    test("login page is accessible after redirect from favorites", async ({ page }) => {
      await expect(page.locator("form")).toBeVisible()
      await expect(page.getByTestId("login-email-input")).toBeVisible()
    })

    test("accessibility: no critical violations on redirected login page", async ({ page }) => {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()

      const critical = results.violations.filter((v) => v.impact === "critical")
      expect(critical).toHaveLength(0)
    })
  })
})
