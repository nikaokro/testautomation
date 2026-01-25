import { Page, expect } from '@playwright/test';

export class BookStorePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('http://localhost:3000'); // adjust if needed
  }

  /* ========= SECTION 1: Registration ========= */

  async fillRegistrationForm() {
    // Username – XPath with id
    await this.page.fill('//input[@id="user-name"]', 'examUser');

    // Password – CSS with type
    await this.page.fill('input[type="password"]', 'Password123');

    // Membership – Premium (XPath with value)
    await this.page.check('//input[@name="membership" and @value="premium"]');

    // Interests – at least 2 (CSS with data-category)
    await this.page.check('input[data-category="fiction"]');
    await this.page.check('input[data-category="science"]');

    // Language – Spanish (CSS select)
    await this.page.selectOption('#language-dropdown', 'spanish');

    // Experience – Intermediate (XPath with name)
    await this.page.selectOption('//select[@name="experience"]', 'intermediate');
  }

  /* ========= SECTION 2: Color Sorting ========= */

  async sortColorBoxes() {
    const colors = ['red', 'blue', 'green'];

    for (const color of colors) {
      const boxes = this.page.locator(`.color-box[data-color="${color}"]`);
      const zone = this.page.locator(`.drop-zone[data-zone="${color}"]`);

      const count = await boxes.count();

      for (let i = 0; i < count; i++) {
        await boxes.nth(i).dragTo(zone);
      }
    }

    await expect(this.page.locator('#sorted-count')).toHaveText('9');
  }

  /* ========= SECTION 3: Dynamic Table ========= */

  async completeTableActions() {
    // Search box
    await this.page.fill('#table-search', '1984');

    // Sort by price
    await this.page.click('#sortByPrice');

    // Find book with price > $40 (XPath given)
    await expect(
      this.page.locator('//td[number(translate(text(), "$", "")) > 40]')
    ).toBeVisible();

    // Add to Cart for "1984"
    await this.page.click(
      '//tr[td[text()="1984"]]//button[contains(text(),"Add")]'
    );

    // View Details for author containing "Tolkien"
    await this.page.click(
      '//tr[td[contains(text(),"Tolkien")]]//button[contains(text(),"View")]'
    );

    await expect(this.page.locator('#actions-count')).toHaveText('2');
  }

  /* ========= SECTION 4: Grid Interaction ========= */

  async completeGridChallenge() {
    // Handle prompt dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept('CONFIRM');
    });

    await this.page.click('#verifyBtn');

    // Click middle boxes using nth-child
    await this.page.click('.grid-box:nth-child(2)');
    await this.page.click('.grid-box:nth-child(5)');
    await this.page.click('.grid-box:nth-child(8)');

    await expect(this.page.locator('#required-clicked')).toHaveText('3');
  }

  /* ========= SUBMIT ========= */

  async submitExam() {
    await expect(this.page.locator('#submitBtn')).toBeEnabled();
    await this.page.click('#submitBtn');
  }
}
