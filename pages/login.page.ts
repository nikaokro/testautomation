import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private userNameInput = 'input[name="username"]';
  private passwordInput = 'input[name="password"]';
  private loginButton = 'button[type="submit"]';
  private rememberMeCheckbox = '.oxd-checkbox-wrapper';
  private errorMessage = '.oxd-alert';
  private dashboardHeader = '.oxd-topbar-header-breadcrumb';

  async navigate() {
    await this.page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  }

  async login(username: string, password: string, remember: boolean = false) {
    await this.page.fill(this.userNameInput, username);
    await this.page.fill(this.passwordInput, password);
    
    if (remember) {
      await this.page.click(this.rememberMeCheckbox);
      await this.page.waitForTimeout(500);
    }
    
    await this.page.click(this.loginButton);
  }

  async loginWithValidCredentials() {
    await this.login('Admin', 'admin123');
  }

  async verifyLoginError() {
    await this.page.waitForSelector(this.errorMessage, { timeout: 5000 });
    const isVisible = await this.page.isVisible(this.errorMessage);
    expect(isVisible).toBeTruthy();
    
    const errorText = await this.page.textContent(this.errorMessage);
    expect(errorText).toContain('Invalid credentials');
  }

  async verifyDashboard() {
    await this.page.waitForURL('**/dashboard/**', { timeout: 15000 });
    await expect(this.page.locator(this.dashboardHeader)).toBeVisible();
    
    const url = this.page.url();
    expect(url).toContain('dashboard');
  }

  async verifyRememberMeChecked() {
    const checkbox = this.page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  }
}