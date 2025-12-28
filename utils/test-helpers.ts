import { Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

export async function login(page: Page) {
  const loginPage = new LoginPage(page);
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await loginPage.loginWithValidCredentials();
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateEmployeeId(): string {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

export async function takeScreenshotOnFailure(page: Page, testInfo: any) {
  if (testInfo.status !== 'passed') {
    const screenshot = await page.screenshot();
    await testInfo.attach('screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  }
}