import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Locals Search", () => {
  test.describe("Auth guard", () => {
    test("redirects unauthenticated users to login", async ({ page }) => {
      await page.goto("/locals/search")
      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test("redirects unauthenticated users from product detail to login", async ({ page }) => {
      await page.goto("/locals/products/some-id")
      await expect(page).toHaveURL(/\/auth\/login/)
    })

    test("redirects unauthenticated users from service detail to login", async ({ page }) => {
      await page.goto("/locals/services/some-id")
      await expect(page).toHaveURL(/\/auth\/login/)
    })
  })

  test.describe("Search page structure (navigation tabs)", () => {
    test.beforeEach(async ({ page }) => {
      // Go to the locals section — will redirect to login but we can
      // test the login page renders correctly after redirect
      await page.goto("/locals/search")
      await page.waitForURL(/\/auth\/login/)
    })

    test("login page is accessible after redirect from search", async ({ page }) => {
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
