import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { PIMPage } from '../pages/pim.page';

type MyFixtures = {
  loginPage: LoginPage;
  pimPage: PIMPage;
  authenticatedPage: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  pimPage: async ({ page }, use) => {
    const pimPage = new PIMPage(page);
    await use(pimPage);
  },

  authenticatedPage: async ({ page }, use) => {
    // Auto-login fixture for tests that require authentication
    const loginPage = new LoginPage(page);
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await loginPage.loginWithValidCredentials();
    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
    await use(page);
    
    // Cleanup: Logout after test
    try {
      await page.click('.oxd-userdropdown-tab');
      await page.click('a:has-text("Logout")');
    } catch (error) {
      console.log('Logout failed or already logged out');
    }
  },
});

export { expect } from '@playwright/test';
