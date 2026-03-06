import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Auth - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login")
  })

  test("displays login form", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible()
    await expect(page.getByTestId("login-email-input")).toBeVisible()
    await expect(page.getByTestId("login-password-input")).toBeVisible()
  })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByTestId("login-submit-btn").click()
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("shows error for invalid email format", async ({ page }) => {
    await page.getByTestId("login-email-input").fill("not-an-email")
    await page.getByTestId("login-password-input").fill("somepass1")
    await page.getByTestId("login-submit-btn").click()
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("has link to register page", async ({ page }) => {
    await expect(page.getByTestId("login-register-link")).toBeVisible()
  })

  test("password toggle button has accessible label", async ({ page }) => {
    const toggleBtn = page.getByRole("button", { name: /password visibility|contraseña/i })
    await expect(toggleBtn).toBeVisible()
  })

  test("accessibility: no critical violations on login page", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    const critical = results.violations.filter((v) => v.impact === "critical")
    expect(critical).toHaveLength(0)
  })

  test("accessibility: form inputs are properly labeled", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a"])
      .analyze()

    const labelViolations = results.violations.filter((v) =>
      v.id === "label" || v.id === "label-content-name-mismatch"
    )
    expect(labelViolations).toHaveLength(0)
  })
})

test.describe("Auth - Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/register")
  })

  test("displays register form with all fields", async ({ page }) => {
    await expect(page.locator("form")).toBeVisible()
    await expect(page.getByTestId("register-name-input")).toBeVisible()
    await expect(page.getByTestId("register-email-input")).toBeVisible()
  })

  test("shows validation errors on empty submit", async ({ page }) => {
    await page.getByTestId("register-submit-btn").click()
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("shows error when passwords do not match", async ({ page }) => {
    await page.getByTestId("register-name-input").fill("Test User")
    await page.getByTestId("register-email-input").fill("user@example.com")
    await page.getByTestId("register-password-input").fill("Password1!")
    await page.getByTestId("register-confirm-password-input").fill("Different1!")
    await page.getByTestId("register-submit-btn").click()
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("shows password requirements indicator while typing", async ({ page }) => {
    await page.getByTestId("register-password-input").fill("a")
    await expect(page.getByRole("list", { name: /password must have|contraseña debe tener/i })).toBeVisible()
  })

  test("terms checkbox is required to submit", async ({ page }) => {
    await page.getByTestId("register-name-input").fill("Test User")
    await page.getByTestId("register-email-input").fill("user@example.com")
    await page.getByTestId("register-password-input").fill("Password1!")
    await page.getByTestId("register-confirm-password-input").fill("Password1!")
    // Do not check terms
    await page.getByTestId("register-submit-btn").click()
    await expect(page.locator("[aria-invalid='true']").first()).toBeVisible()
  })

  test("terms checkbox is visible", async ({ page }) => {
    await expect(page.getByTestId("register-terms-checkbox")).toBeVisible()
  })

  test("has link to login page", async ({ page }) => {
    await expect(page.getByTestId("register-login-link")).toBeVisible()
  })

  test("role selection is accessible via radio buttons", async ({ page }) => {
    const radios = page.getByRole("radio")
    await expect(radios).toHaveCount(2)
  })

  test("accessibility: no critical violations on register page", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze()

    const critical = results.violations.filter((v) => v.impact === "critical")
    expect(critical).toHaveLength(0)
  })
})
