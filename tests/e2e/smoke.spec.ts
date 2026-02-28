import { expect, test, type Page } from '@playwright/test';

const createQaUser = () => {
  const randomSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return {
    username: `qa_${randomSuffix}`,
    fullName: `QA User ${randomSuffix}`,
    password: 'qa_test_123',
  };
};

const signup = async (
  page: Page,
  credentials: { username: string; fullName: string; password: string },
) => {
  await page.goto('/login?mode=signup');

  await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();
  await page.getByPlaceholder('maria', { exact: true }).fill(credentials.username);
  await page.getByPlaceholder('Maria Alatsaki').fill(credentials.fullName);
  await page.getByPlaceholder('••••••••').first().fill(credentials.password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await page.waitForURL('**/dashboard');
};

test('QA smoke: signup leads to dashboard', async ({ page }) => {
  const user = createQaUser();

  await signup(page, user);

  await expect(page.getByText('Portfolio Snapshot')).toBeVisible();
  await expect(page.getByRole('heading', { name: user.username })).toBeVisible();
});

test('QA smoke: user can create a project', async ({ page }) => {
  const user = createQaUser();
  const projectName = `QA Project ${Date.now()}`;

  await signup(page, user);

  await page.locator('aside').getByText('Projects', { exact: true }).click();

  const newProjectButton = page.getByRole('button', { name: 'New Project' });
  if (await newProjectButton.isVisible()) {
    await newProjectButton.click();
  }

  await page.getByPlaceholder('My App').fill(projectName);
  await page.getByPlaceholder('React, TypeScript, Tailwind').fill('Playwright, Next.js');
  await page
    .getByPlaceholder('What does this project do? What problem does it solve?')
    .fill('QA smoke test project creation flow.');

  await page.getByRole('button', { name: 'Add Project' }).click();

  await expect(page.getByText(projectName)).toBeVisible();
});

test('QA smoke: public portfolio link opens HR page', async ({ page, context }) => {
  const user = createQaUser();

  await signup(page, user);

  const openPublicPageLink = page.getByRole('link', { name: 'Open Public Page' });
  await expect(openPublicPageLink).toBeVisible();

  const href = await openPublicPageLink.getAttribute('href');
  expect(href).toBeTruthy();
  expect(href).toContain(`/profile/${user.username}`);

  const hrViewPage = await context.newPage();
  await hrViewPage.goto(href!);

  await expect(hrViewPage.getByText('Public Portfolio')).toBeVisible();
  await expect(hrViewPage.getByRole('heading', { name: user.username })).toBeVisible();
});
