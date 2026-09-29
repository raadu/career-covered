import { test, expect } from '@playwright/test';
import { navigateFromSidebar, toggleDarkMode } from './helpers/sidebar';

test.describe('Cover Letter Creator - Advanced Features', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should toggle dark mode and update HTML element class', async ({ page }) => {
        const html = page.locator('html');
        const wasDark = /dark/.test((await html.getAttribute('class')) ?? '');

        await toggleDarkMode(page);
        if (wasDark) {
            await expect(html).not.toHaveClass(/dark/);
        } else {
            await expect(html).toHaveClass(/dark/);
        }

        await toggleDarkMode(page);
        if (wasDark) {
            await expect(html).toHaveClass(/dark/);
        } else {
            await expect(html).not.toHaveClass(/dark/);
        }
    });

    test('should navigate to FAQ and toggle accordion items', async ({ page }) => {
        await navigateFromSidebar(page, 'FAQ');
        await expect(page).toHaveURL(/.*\/faq/);

        await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();

        // Scoped to <main> — the sidebar's hamburger also carries aria-expanded.
        const accordionBtns = page.locator('main button[aria-expanded]');
        const count = await accordionBtns.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < Math.min(5, count); i++) {
            await expect(accordionBtns.nth(i)).toHaveAttribute('aria-expanded', 'true');
        }
        
        if (count > 5) {
            await expect(accordionBtns.nth(5)).toHaveAttribute('aria-expanded', 'false');
            await accordionBtns.nth(5).click();
            await expect(accordionBtns.nth(5)).toHaveAttribute('aria-expanded', 'true');
        }

        await accordionBtns.first().click();
        await expect(accordionBtns.first()).toHaveAttribute('aria-expanded', 'false');
    });

    test('should navigate to Support page and display contact details', async ({ page }) => {
        await navigateFromSidebar(page, 'Support');
        await expect(page).toHaveURL(/.*\/support/);

        await expect(page.getByRole('heading', { name: /always here to help/i })).toBeVisible();
        
        const connectBtn = page.getByRole('link', { name: /Connect on LinkedIn/i });
        await expect(connectBtn).toBeVisible();
        await expect(connectBtn).toHaveAttribute('href', /linkedin.com/);
    });

    test('should open and handle customization options modal', async ({ page }) => {
        const customizeBtn = page.getByRole('button', { name: /Customize/i });
        await expect(customizeBtn).toBeVisible();
        await customizeBtn.click();

        await expect(page.getByText(/Cover Letter Customization/i)).toBeVisible();

        const limitCheckbox = page.getByLabel(/Limit words/i);
        await expect(limitCheckbox).toBeVisible();
        
        const isChecked = await limitCheckbox.isChecked();
        if (!isChecked) {
            await limitCheckbox.check();
        }
        
        const wordCountInput = page.getByPlaceholder(/Numbers should be between 50 - 1000/i);
        await wordCountInput.fill('350');
        await expect(wordCountInput).toHaveValue('350');

        const promptInput = page.getByPlaceholder(/Wanna add or remove anything/i);
        await promptInput.fill('Please make the tone sound very professional.');
        await expect(promptInput).toHaveValue('Please make the tone sound very professional.');

        const saveBtn = page.getByRole('button', { name: /Save Options/i });
        await saveBtn.click();

        await expect(page.getByText(/Cover Letter Customization/i)).not.toBeVisible();
    });
});
