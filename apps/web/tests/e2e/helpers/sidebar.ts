import type { Page } from '@playwright/test';

// Below md (768px) the sidebar's secondary controls live in the hamburger
// menu; from md up they're directly in the sidebar rail.
const PHONE_MAX_WIDTH = 767;

export const isPhoneViewport = (page: Page) =>
  (page.viewportSize()?.width ?? Infinity) <= PHONE_MAX_WIDTH;

async function clickMenuItem(page: Page, name: string | RegExp) {
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('menuitem', { name }).click();
}

export async function toggleDarkMode(page: Page) {
  if (isPhoneViewport(page)) {
    await clickMenuItem(page, /^(Dark|Light) Mode$/);
  } else {
    await page
      .getByRole('button', { name: /Switch to (Dark|Light) Mode/ })
      .click();
  }
}

export async function navigateFromSidebar(page: Page, name: 'FAQ' | 'Support') {
  if (isPhoneViewport(page)) {
    await clickMenuItem(page, name);
  } else {
    await page.getByRole('link', { name, exact: true }).click();
  }
}

export async function openSignIn(page: Page) {
  if (isPhoneViewport(page)) {
    await clickMenuItem(page, 'Sign In');
  } else {
    await page.getByRole('button', { name: 'Sign In' }).click();
  }
}
