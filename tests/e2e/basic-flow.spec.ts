import { test, expect } from '@playwright/test';

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
        const header = page.getByRole('heading', { name: /Create Cover Letter/i });
        await expect(header).toBeVisible();
    });
});
