import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("loads and displays hero section", async ({ page }) => {
    await expect(page.locator("main")).toBeVisible()
  })

  test("has CTA buttons that navigate to register when unauthenticated", async ({ page }) => {
    const workerCta = page.getByTestId("hero-worker-cta")
    const localCta = page.getByTestId("hero-local-cta")
    await expect(workerCta).toBeVisible()
    await expect(localCta).toBeVisible()

    await workerCta.click()
    await expect(page).toHaveURL(/\/auth\/register/)
  })

  test("accessibility: no critical violations on landing page", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    const critical = results.violations.filter((v) => v.impact === "critical")
    expect(critical).toHaveLength(0)
  })
})
