import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Worker Products", () => {
  test.describe("Products list page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/app/workers/products")
    })

    test("displays page title and add button", async ({ page }) => {
      await expect(page.locator("h1")).toBeVisible()
      await expect(page.getByRole("link", { name: /nuevo producto|new product/i })).toBeVisible()
    })

    test("displays products table with headers", async ({ page }) => {
      await expect(page.getByRole("table")).toBeVisible()
      await expect(page.getByRole("columnheader").first()).toBeVisible()
    })

    test("has no accessibility violations", async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })

  test.describe("New product form", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/app/workers/products/new")
    })

    test("displays product form", async ({ page }) => {
      await expect(page.locator("h1")).toBeVisible()
      await expect(page.getByTestId("product-name")).toBeVisible()
      await expect(page.getByTestId("product-description")).toBeVisible()
      await expect(page.getByTestId("product-category")).toBeVisible()
      await expect(page.getByTestId("product-is-immediate")).toBeVisible()
    })

    test("shows validation errors on empty submit", async ({ page }) => {
      await page.getByTestId("product-submit").click()
      await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
    })

    test("can add and remove variants", async ({ page }) => {
      await page.getByRole("button", { name: /agregar variante|add variant/i }).click()
      await expect(page.getByTestId("variant-name-0")).toBeVisible()
      await expect(page.getByTestId("variant-price-0")).toBeVisible()

      await page.getByRole("button", { name: /agregar variante|add variant/i }).click()
      await expect(page.getByTestId("variant-name-1")).toBeVisible()

      await page.getByTestId("variant-delete-1").click()
      await expect(page.getByTestId("variant-name-1")).not.toBeVisible()
    })

    test("has cancel link back to products list", async ({ page }) => {
      const cancelLink = page.getByRole("link", { name: /cancelar|cancel/i })
      await expect(cancelLink).toBeVisible()
      await expect(cancelLink).toHaveAttribute("href", "/app/workers/products")
    })

    test("has no accessibility violations", async ({ page }) => {
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  })
})
