import { test, expect } from '@playwright/test';
import { openSignIn } from './helpers/sidebar';

test.describe('Cover Letter Creator - Basic Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Assuming the app is running on localhost:5173
        await page.goto('/');
    });

    test('should allow user to fill job description and template', async ({ page }) => {
        // Fill job description
        const jobDesc = page.getByPlaceholder(/Paste the job requirements here/i);
        await jobDesc.fill('I am looking for a Software Engineer with experience in React and Node.js.');
        await expect(jobDesc).toHaveValue('I am looking for a Software Engineer with experience in React and Node.js.');

        // Fill template
        const template = page.getByPlaceholder(/Paste your existing cover letter/i);
        await template.fill('Hi, I am [Name], and I want this job.');
        await expect(template).toHaveValue('Hi, I am [Name], and I want this job.');
    });

    test('should have a disabled generate button when job description is empty', async ({ page }) => {
        const generateBtn = page.getByRole('button', { name: /Generate Cover Letter/i });
        await expect(generateBtn).toBeDisabled();
    });

    test('should enable generate button when job description is provided', async ({ page }) => {
        const jobDesc = page.getByPlaceholder(/Paste the job requirements here/i);
        await jobDesc.fill('Job description goes here.');
        
        const generateBtn = page.getByRole('button', { name: /Generate Cover Letter/i });
        await expect(generateBtn).toBeEnabled();
    });

    test('responsiveness - mobile viewport', async ({ page }) => {
        // Playwright handles this via the config projects,
        // but we can also test specific layout changes here if needed.
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        const header = page.getByRole('heading', { name: /Create Free Cover Letters/i });
        await expect(header).toBeVisible();
    });

    test('sidebar switches to a horizontal row on mobile with no horizontal page overflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const sidebar = page.locator('aside');
        await expect(sidebar).toBeVisible();
        const flexDirection = await sidebar.evaluate(
            (el) => getComputedStyle(el).flexDirection,
        );
        expect(flexDirection).toBe('row');

        const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
        }));
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    });

    test('sidebar switches to a vertical column on tablet and desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 768 });

        const sidebar = page.locator('aside');
        const flexDirection = await sidebar.evaluate(
            (el) => getComputedStyle(el).flexDirection,
        );
        expect(flexDirection).toBe('column');
    });

    test('phone top bar keeps FAQ/Support in the hamburger menu', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await expect(page.getByRole('link', { name: 'Cover Letter' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'FAQ', exact: true })).toBeHidden();

        await page.getByRole('button', { name: 'Open menu' }).click();
        const menu = page.getByRole('menu');
        await expect(menu.getByRole('menuitem')).toHaveText([
            /^(Dark|Light) Mode$/,
            'FAQ',
            'Support',
            'Sign In',
        ]);

        // The open menu must not introduce horizontal page scroll.
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);

        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
    });

    test('hovering a sidebar icon shows its name in a tooltip', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name.startsWith('Mobile'), 'hover needs a mouse');
        await page.setViewportSize({ width: 1024, height: 768 });

        await page.getByRole('link', { name: 'Support', exact: true }).hover();
        await expect(page.getByRole('tooltip')).toHaveText('Support');

        await page.mouse.move(700, 400);
        await expect(page.getByRole('tooltip')).toBeHidden();
    });

    test('expanded desktop sidebar is 180px wide', async ({ page }, testInfo) => {
        test.skip(testInfo.project.name.startsWith('Mobile'), 'desktop layout only');
        await page.setViewportSize({ width: 1280, height: 800 });
        await page.evaluate(() => localStorage.setItem('cl_sidebar_expanded', 'true'));
        await page.reload();

        const box = await page.locator('aside').boundingBox();
        expect(box?.width).toBe(180);
    });
});

test.describe('Cover Letter Creator - Mobile Card/Grid Views (authenticated)', () => {
    test('templates view renders cards on mobile and a table on desktop', async ({ page }) => {
        // No stable seeded test-user fixture exists in this repo (and
        // hardcoding one account's credentials here wouldn't survive a
        // fresh/CI database anyway), so this signs up a fresh throwaway
        // account through the real UI instead.
        await page.goto('/');
        await openSignIn(page);
        await page.getByRole('button', { name: 'Sign up' }).click();

        const uniqueSuffix = Date.now();
        await page.getByPlaceholder('Full name').fill('E2E Test User');
        await page.getByPlaceholder('Email address').fill(`e2e-${uniqueSuffix}@example.com`);
        await page.getByPlaceholder('Password').fill(`TestPass${uniqueSuffix}`);
        await page.getByRole('button', { name: 'Create account' }).click();
        // Wait on the success toast rather than a sidebar element — the
        // labeled "Sign Out" button only renders on expanded desktop
        // sidebars (hidden below lg), so it isn't a reliable signal on the
        // mobile-viewport projects. The toast fires once regardless of
        // viewport, right when registration actually succeeds.
        await expect(
            page.getByText("Awesome! You're now registered."),
        ).toBeVisible({ timeout: 15000 });
        // Signed-in-only nav proves the session took, on every viewport.
        await expect(page.getByRole('link', { name: 'Templates' })).toBeVisible();

        // HashRouter is used app-wide, so routes live after the `#`.
        await page.goto('/#/cover-letter/templates');
        await expect(
            page.getByRole('heading', { name: 'Cover Letter Templates' }),
        ).toBeVisible();

        // Mobile: the card/grid view is forced regardless of the user's
        // stored table/grid preference, so no <table> should render at all.
        await page.setViewportSize({ width: 375, height: 667 });
        await expect(page.locator('table')).toHaveCount(0);

        // Desktop: the table view (the default for this view) is back.
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(page.locator('table')).toHaveCount(1);
    });
});
