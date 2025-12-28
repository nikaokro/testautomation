import { test, expect } from '../fixtures/base.setup';
import { VALID_CREDENTIALS, INVALID_CREDENTIALS } from '../utils/constants';
import { takeScreenshotOnFailure } from '../utils/test-helpers';

test.describe('Login Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  });

  test.afterEach(async ({ page }, testInfo) => {
    await takeScreenshotOnFailure(page, testInfo);
  });

  test('successful login with valid credentials', async ({ page, loginPage }) => {
    await loginPage.login(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );

    await loginPage.verifyDashboard();
    await expect(page.locator('.oxd-topbar-header-breadcrumb')).toBeVisible();
    await expect(page.locator('.oxd-userdropdown-tab')).toBeVisible();
    await expect(page.locator('.oxd-main-menu').first()).toBeVisible();
    
    expect(page.url()).toContain('dashboard');
  });

  test('unsuccessful login with invalid credentials', async ({ page, loginPage }) => {
    await loginPage.login(
      INVALID_CREDENTIALS.username,
      INVALID_CREDENTIALS.password
    );

    await loginPage.verifyLoginError();
    expect(page.url()).toContain('/auth/login');
    
    const errorAlert = page.locator('.oxd-alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Invalid credentials');
  });

  test('unsuccessful login with empty credentials', async ({ page, loginPage }) => {
    await page.click('button[type="submit"]');
    
    const requiredMessages = page.locator('.oxd-input-field-error-message');
    await expect(requiredMessages.first()).toBeVisible();
    await expect(requiredMessages.first()).toHaveText('Required');
    
    expect(page.url()).toContain('/auth/login');
  });

  test('verify remember me functionality', async ({ page, loginPage }) => {
    await loginPage.login(
      VALID_CREDENTIALS.username,
      VALID_CREDENTIALS.password
    );

    await loginPage.verifyDashboard();

    const cookies = await page.context().cookies();
    expect(cookies.length).toBeGreaterThan(0);

    const hasSessionCookie = cookies.some(cookie => {
      return cookie.name.toLowerCase().includes('session') || 
             cookie.name.toLowerCase().includes('orangehrm') ||
             (cookie.expires !== undefined && cookie.expires > 0);
    });
    
    expect(cookies.length).toBeGreaterThan(0);
    
    await expect(page.locator('.oxd-userdropdown-tab')).toBeVisible();

    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPimModule');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.oxd-userdropdown-tab')).toBeVisible();
  });

  test('verify logout functionality', async ({ page, loginPage }) => {
    await loginPage.loginWithValidCredentials();
    await loginPage.verifyDashboard();
    
    await page.click('.oxd-userdropdown-tab');
    
    await expect(page.locator('.oxd-dropdown-menu')).toBeVisible();

    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login', { timeout: 5000 });
    expect(page.url()).toContain('/auth/login');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('verify password field is masked', async ({ page }) => {
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await passwordInput.fill('testpassword');
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('verify forgot password link is present', async ({ page }) => {
    const forgotPasswordLink = page.locator('.orangehrm-login-forgot-header');

    await expect(forgotPasswordLink).toBeVisible();
    await expect(forgotPasswordLink).toContainText('Forgot your password');
  });
});