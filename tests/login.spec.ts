import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import scenariosJson from '../data/scenarios.json';
import type { SuiteData } from '../types/scenarios';

const data = scenariosJson as SuiteData;

test('User can login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(data.credentials.email, data.credentials.password);

  await expect(page).not.toHaveURL(/login/i);
  await expect(page.getByText('Projects')).toBeVisible();
});