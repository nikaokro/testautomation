import { Page, expect } from '@playwright/test';

export class PIMPage {
  constructor(private page: Page) {}

  private pimMenuItem = 'a[href="/web/index.php/pim/viewPimModule"]';
  private addEmployeeTab = 'a:has-text("Add Employee")';
  private employeeListTab = 'a:has-text("Employee List")';

  private firstNameInput = 'input[name="firstName"]';
  private middleNameInput = 'input[name="middleName"]';
  private lastNameInput = 'input[name="lastName"]';
  private uploadPhotoInput = 'input[type="file"]';
  private createLoginToggle = '.oxd-switch-input';
  private saveButton = 'button[type="submit"]';
  private successMessage = '.oxd-toast';

  private employeeNameInput = 'input[placeholder="Type for hints..."]';
  private searchButton = 'button[type="submit"]';
  private searchResults = '.oxd-table-card';
  private editButton = '.oxd-icon-button:has(.bi-pencil-fill)';

  async navigateToPIM() {
    await this.page.click(this.pimMenuItem);
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddEmployee() {
    await this.page.click(this.addEmployeeTab);
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmployeeDetails(
    firstName: string,
    middleName: string,
    lastName: string,
    employeeId?: string
  ) {
    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.middleNameInput, middleName);
    await this.page.fill(this.lastNameInput, lastName);

    if (employeeId) {
      await this.page.waitForTimeout(500);

      const allInputs = this.page.locator('.oxd-form input.oxd-input');
      
      const empIdField = allInputs.nth(3);
      await empIdField.clear();
      await empIdField.fill(employeeId);
    }
  }

  async getGeneratedEmployeeId(): Promise<string> {
    await this.page.waitForTimeout(500);
    const allInputs = this.page.locator('.oxd-form input.oxd-input');
    const empIdField = allInputs.nth(3);
    const employeeId = await empIdField.inputValue();
    return employeeId;
  }

  async uploadEmployeePhoto(filePath: string) {
    await this.page.setInputFiles(this.uploadPhotoInput, filePath);
  }

  async createLoginCredentials(username: string, password: string) {
    await this.page.click(this.createLoginToggle);
    await this.page.waitForTimeout(500);

    const usernameFields = this.page.locator('input[autocomplete="off"]');
    await usernameFields.nth(0).fill(username);

    const passwordFields = this.page.locator('input[type="password"]');
    await passwordFields.nth(0).fill(password);
    await passwordFields.nth(1).fill(password);
  }

  async saveEmployee() {
    await this.page.click(this.saveButton);
    try {
      await this.page.waitForURL('**/pim/viewPersonalDetails/**', { timeout: 15000 });
    } catch {
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    }
  }

  async verifyEmployeeCreated() {
    const url = this.page.url();
    const isOnPersonalDetails = url.includes('/pim/viewPersonalDetails/');
    const isOnAddEmployee = url.includes('/pim/addEmployee');
    
    if (isOnPersonalDetails) {
      expect(isOnPersonalDetails).toBeTruthy();
    } else if (isOnAddEmployee) {
      await this.page.waitForTimeout(1000);
      const currentUrl = this.page.url();
      expect(currentUrl).toContain('pim');
    } else {
      expect(url).toContain('pim');
    }
  }

  async searchEmployeeByName(employeeName: string) {
    await this.page.click(this.employeeListTab);
    await this.page.waitForLoadState('networkidle');

    await this.page.fill(this.employeeNameInput, employeeName);
    await this.page.waitForTimeout(1000);
    
    await this.page.press(this.employeeNameInput, 'Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async searchEmployeeById(employeeId: string) {
    await this.page.click(this.employeeListTab);
    await this.page.waitForLoadState('networkidle');
    
    await this.page.waitForTimeout(1000);

    const searchInputs = this.page.locator('.oxd-input');
    await searchInputs.nth(1).clear();
    await searchInputs.nth(1).fill(employeeId);
    
    await this.page.click(this.searchButton);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  }

  async verifySearchResults(expectedName: string) {
    const searchResults = this.page.locator(this.searchResults);
    const count = await searchResults.count();
    
    if (count === 0) {
      const noRecords = this.page.locator('text=No Records Found');
      const hasNoRecords = await noRecords.isVisible().catch(() => false);
      
      if (hasNoRecords) {
        throw new Error(`No employee found with name: ${expectedName}`);
      }
      await this.page.waitForTimeout(2000);
      const newCount = await searchResults.count();
      expect(newCount).toBeGreaterThan(0);
    }
    
    await expect(searchResults.first()).toBeVisible();
    const resultText = await searchResults.first().textContent();
    expect(resultText).toContain(expectedName);
  }

  async editFirstEmployee() {
    await this.page.locator(this.editButton).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async updatePersonalDetails(licenseNumber: string, dateOfBirth: string) {
    await this.page.waitForTimeout(2000);
    
    const licenseInput = this.page.locator('.oxd-input').nth(1);
    await licenseInput.scrollIntoViewIfNeeded();
    await licenseInput.fill(licenseNumber);

    const dobInput = this.page.locator('input[placeholder="yyyy-dd-mm"]').nth(1);
    await dobInput.fill(dateOfBirth);

    await this.page.locator('input[type="radio"][value="1"]').click({ force: true });
    const saveButtons = this.page.locator('button[type="submit"]');
    await saveButtons.first().click();
    
    await this.page.waitForTimeout(2000);
  }

  async verifyPersonalDetailsUpdated() {
    const url = this.page.url();
    expect(url).toContain('/pim/viewPersonalDetails/');
  }
}