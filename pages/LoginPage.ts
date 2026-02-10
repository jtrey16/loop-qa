import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  /** Navigate to the login page (root path in this demo app). */
  async goto() {
    await this.page.goto('/');
  }

  /** Perform login with provided credentials. */
  async login(email: string, password: string) {
    await this.page.getByLabel('Username').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
