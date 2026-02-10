import { Page, Locator, expect } from '@playwright/test';

export class BoardPage {
  constructor(private page: Page) {}

  /** Escape user text for safe use in RegExp */
  private esc(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Navigate to a project via the left sidebar.
   * Clicks the <button> whose child <h2> equals the provided name (case-insensitive),
   * then confirms the content header in the main area updated.
   */
  async goToProject(projectName: string) {
    const exact = new RegExp(`^\\s*${this.esc(projectName)}\\s*$`, 'i');

    // Locate the sidebar project button by its <h2> text
    const sidebar = this.page.locator('nav,aside,[role="navigation"]').first();
    const buttons = sidebar
      .locator('button:has(h2)')
      .filter({ has: this.page.locator('h2', { hasText: exact }) });

    // Require exactly one match to avoid accidental clicks
    await expect(buttons, `Sidebar project "${projectName}" not found or ambiguous`).toHaveCount(1, { timeout: 5000 });

    const btn = buttons.first();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    // Confirm: top content header shows the selected project
    const mainTitle = this.page
      .locator('h1.text-xl.font-semibold')
      .filter({ hasText: new RegExp(this.esc(projectName), 'i') })
      .first();

    await expect(mainTitle, `Main project header "${projectName}" not visible`).toBeVisible({ timeout: 10_000 });
  }

  /**
   * Return the column container for a given column label (e.g., "To Do").
   * Finds the label text, then climbs to the nearest section/div container.
   */
  private async column(columnName: string): Promise<Locator> {
    const rx = new RegExp(`\\b${this.esc(columnName)}\\b`, 'i');

    const label = this.page.getByText(rx).first();
    await expect(label, `Column label "${columnName}" not found`).toBeVisible();

    const container = label.locator('xpath=ancestor::section[1] | ancestor::div[1]').first();
    await expect(container, `Column container not found for "${columnName}"`).toBeVisible();

    return container;
  }

  /**
   * Return the card container inside a column by its title text.
   * Finds the title, then climbs to the nearest article/li/div.
   */
  private async cardIn(column: Locator, cardTitle: string): Promise<Locator> {
    const rx = new RegExp(this.esc(cardTitle), 'i');

    const titleEl = column.getByText(rx).first();
    await expect(titleEl, `Card title "${cardTitle}" not found`).toBeVisible();

    const container = titleEl.locator('xpath=ancestor::article[1] | ancestor::li[1] | ancestor::div[1]').first();
    await expect(container, `Card container not found for "${cardTitle}"`).toBeVisible();

    return container;
  }

  /** Assert that a card is visible within the specified column. */
  async expectCardInColumn(columnName: string, cardTitle: string) {
    const col = await this.column(columnName);
    const card = await this.cardIn(col, cardTitle);
    await expect(card, `Card "${cardTitle}" not visible in "${columnName}"`).toBeVisible();
  }

  /**
   * Assert that a set of tag chips exist on a given card.
   * Searches typical “chip-like” elements and requires exact tag text.
   */
  async expectTagsOnCard(columnName: string, cardTitle: string, tags: string[]) {
    if (!tags?.length) return;

    const col = await this.column(columnName);
    const card = await this.cardIn(col, cardTitle);

    for (const tag of tags) {
      const exact = new RegExp(`^\\s*${this.esc(tag)}\\s*$`, 'i');
      const chip = card.locator('span').filter({ hasText: exact }).first();
      await expect(chip, `Missing tag "${tag}" on "${cardTitle}" in "${columnName}"`).toBeVisible();
    }
  }
}