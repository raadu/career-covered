import { test, expect } from '@playwright/test';

// Visual baselines for the design-system revamp. Scoped to chromium only —
// running across every browser project would multiply the number of
// baseline images fivefold for little benefit (font/anti-aliasing render
// slightly differently per engine, which would mean cross-browser noise
// rather than real regressions) and font rendering already varies just
// between OSes, so a generous diff ratio is used throughout.
//
// Scoped to unauthenticated, deterministic pages only — the authenticated
// views (Templates/PreviousCoverLetters/Resume) render a freshly
// signed-up user's name/email each run (see basic-flow.spec.ts), which
// would make every run's screenshot differ from the baseline regardless of
// any real UI change.
//
// Re-baseline intentionally (`npx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots`)
// whenever a future change deliberately alters one of these pages' visuals.
test.describe('Visual regression', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    // `browserName` maps to the underlying engine, not the project —
    // "Mobile Chrome" also reports `chromium`, so the project name is
    // checked instead to target the single desktop chromium project.
    test.skip(
      testInfo.project.name !== 'chromium',
      'chromium (desktop) only — see file header',
    );
    await page.goto('/');
  });

  const screenshotOptions = {
    animations: 'disabled' as const,
    maxDiffPixelRatio: 0.02,
  };

  test('home view - desktop - light', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(page).toHaveScreenshot('home-desktop-light.png', {
      ...screenshotOptions,
      fullPage: true,
    });
  });

  test('home view - desktop - dark', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.getByTitle('Switch to Dark Mode').click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page).toHaveScreenshot('home-desktop-dark.png', {
      ...screenshotOptions,
      fullPage: true,
    });
  });

  test('home view - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('home-mobile.png', {
      ...screenshotOptions,
      fullPage: true,
    });
  });

  test('sidebar - collapsed on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.getByTitle(/ollapse/i).click();
    await expect(page.locator('aside')).toHaveScreenshot(
      'sidebar-collapsed.png',
      screenshotOptions,
    );
  });

  test('sidebar - tablet row-to-rail breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1100 });
    await expect(page.locator('aside')).toHaveScreenshot(
      'sidebar-tablet.png',
      screenshotOptions,
    );
  });

  test('faq view', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.getByTitle('Frequently Asked Questions').click();
    await expect(
      page.getByRole('heading', { name: 'Frequently Asked Questions' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot('faq-desktop-light.png', {
      ...screenshotOptions,
      fullPage: true,
    });
  });

  test('support view', async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.getByTitle('Get Support').click();
    await expect(
      page.getByRole('heading', { name: /always here to help/i }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot('support-desktop-light.png', {
      ...screenshotOptions,
      fullPage: true,
    });
  });
});
