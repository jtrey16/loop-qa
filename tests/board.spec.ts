import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { BoardPage } from '../pages/BoardPage';
import scenariosJson from '../data/scenarios.json';
import type { SuiteData } from '../types/scenarios';

const data = scenariosJson as SuiteData;

test.describe('Board checks (data-driven)', () => {
  test.beforeEach(async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(data.credentials.email, data.credentials.password);
  });

  for (const s of data.scenarios) {
    test(s.name, async ({ page }) => {
      const board = new BoardPage(page);

      if (s.board) {
        await board.goToProject(s.board);
      }

      await board.expectCardInColumn(s.column, s.cardTitle);
      await board.expectTagsOnCard(s.column, s.cardTitle, s.tags ?? []);
    });
  }
});