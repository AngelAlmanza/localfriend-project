import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Worker Services", () => {
  test.describe("Services list page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/app/workers/services")
    })

    test("displays page title and add button", async ({ page }) => {
      await expect(page.locator("h1")).toBeVisible()
      await expect(page.getByRole("link", { name: /nuevo servicio|new service/i })).toBeVisible()
    })

    test("displays services table with headers", async ({ page }) => {
      await expect(page.getByRole("table")).toBeVisible()
      await expect(page.getByRole("columnheader").first()).toBeVisible()
    })

    test("has no accessibility violations", async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })

  test.describe("New service form", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/app/workers/services/new")
    })

    test("displays service form", async ({ page }) => {
      await expect(page.locator("h1")).toBeVisible()
      await expect(page.getByTestId("service-name")).toBeVisible()
      await expect(page.getByTestId("service-description")).toBeVisible()
      await expect(page.getByTestId("service-category")).toBeVisible()
      await expect(page.getByTestId("service-price-min")).toBeVisible()
      await expect(page.getByTestId("service-price-max")).toBeVisible()
    })

    test("shows validation errors on empty submit", async ({ page }) => {
      await page.getByTestId("service-submit").click()
      await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
    })

    test("can add and remove service variants", async ({ page }) => {
      await page.getByRole("button", { name: /agregar variante|add variant/i }).click()
      await expect(page.getByTestId("svc-variant-name-0")).toBeVisible()
      await expect(page.getByTestId("svc-variant-price-min-0")).toBeVisible()
      await expect(page.getByTestId("svc-variant-price-max-0")).toBeVisible()

      await page.getByRole("button", { name: /agregar variante|add variant/i }).click()
      await expect(page.getByTestId("svc-variant-name-1")).toBeVisible()

      await page.getByTestId("svc-variant-delete-1").click()
      await expect(page.getByTestId("svc-variant-name-1")).not.toBeVisible()
    })

    test("has cancel link back to services list", async ({ page }) => {
      const cancelLink = page.getByRole("link", { name: /cancelar|cancel/i })
      await expect(cancelLink).toBeVisible()
      await expect(cancelLink).toHaveAttribute("href", "/app/workers/services")
    })

    test("has no accessibility violations", async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })
})
