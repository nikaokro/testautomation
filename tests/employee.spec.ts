import { test, expect } from '../fixtures/base.setup';
import { generateRandomString, generateEmployeeId, takeScreenshotOnFailure } from '../utils/test-helpers';
import { TEST_EMPLOYEE } from '../utils/constants';
import * as path from 'path';

test.describe('Employee Management', () => {
  let employeeId: string;
  let employeeName: string;

  test.beforeEach(async ({ page, pimPage }) => {
    employeeId = generateEmployeeId();
    employeeName = `${TEST_EMPLOYEE.firstName} ${TEST_EMPLOYEE.middleName} ${TEST_EMPLOYEE.lastName}`;
  });

  test.afterEach(async ({ page }, testInfo) => {
    await takeScreenshotOnFailure(page, testInfo);
  });

  test('add new employee with complete details', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    
    await pimPage.clickAddEmployee();

    await pimPage.fillEmployeeDetails(
      TEST_EMPLOYEE.firstName,
      TEST_EMPLOYEE.middleName,
      TEST_EMPLOYEE.lastName
    );
    
    const generatedId = await pimPage.getGeneratedEmployeeId();
    console.log('Auto-generated Employee ID:', generatedId);
    
    await pimPage.saveEmployee();
    
    await pimPage.verifyEmployeeCreated();
    
    await authenticatedPage.waitForURL('**/pim/viewPersonalDetails/**', { timeout: 10000 });
    expect(authenticatedPage.url()).toContain('/pim/viewPersonalDetails/');
    const headerName = authenticatedPage.locator('.orangehrm-edit-employee-name h6');
    await expect(headerName).toBeVisible({ timeout: 10000 });
  });

  test('add employee with login credentials', async ({ authenticatedPage, pimPage }) => {
    const username = `user_${generateRandomString(6)}`;
    const password = 'Test@123456';
    
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();

    await pimPage.fillEmployeeDetails(
      `Test${generateRandomString(4)}`,
      'User',
      `Employee${generateRandomString(4)}`
    );
    await pimPage.createLoginCredentials(username, password);
    await pimPage.saveEmployee();
    
    await authenticatedPage.waitForTimeout(3000);
    const url = authenticatedPage.url();
    expect(url).toContain('pim');
  });

  test('search and verify created employee by ID', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();
    await pimPage.fillEmployeeDetails(
      TEST_EMPLOYEE.firstName,
      TEST_EMPLOYEE.middleName,
      TEST_EMPLOYEE.lastName
    );
    
    const generatedEmployeeId = await pimPage.getGeneratedEmployeeId();
    console.log('Created employee with ID:', generatedEmployeeId);
    
    await pimPage.saveEmployee();  
    await authenticatedPage.waitForTimeout(3000); 
    await pimPage.navigateToPIM();
    
    await pimPage.searchEmployeeById(generatedEmployeeId);
    await pimPage.verifySearchResults(TEST_EMPLOYEE.firstName);
    
    const searchResults = authenticatedPage.locator('.oxd-table-card');
    await expect(searchResults.first()).toBeVisible();
    const resultText = await searchResults.first().textContent();
    expect(resultText).toContain(generatedEmployeeId);
  });

  test('search employee by name', async ({ authenticatedPage, pimPage }) => {
    const uniqueFirstName = `TestUser${generateRandomString(6)}`;
    const uniqueLastName = `Employee${generateRandomString(6)}`;
    
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();
    await pimPage.fillEmployeeDetails(
      uniqueFirstName,
      'Test',
      uniqueLastName
    );
    
    const generatedEmployeeId = await pimPage.getGeneratedEmployeeId();
    
    await pimPage.saveEmployee();

    await authenticatedPage.waitForTimeout(3000);

    await pimPage.navigateToPIM();
    await pimPage.searchEmployeeById(generatedEmployeeId);
    
    await pimPage.verifySearchResults(uniqueFirstName);
  });

  test('edit employee personal details', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();
    await pimPage.fillEmployeeDetails(
      TEST_EMPLOYEE.firstName,
      TEST_EMPLOYEE.middleName,
      TEST_EMPLOYEE.lastName
    );
    await pimPage.saveEmployee();
    
    await authenticatedPage.waitForTimeout(3000);

    const licenseNumber = `LIC${generateRandomString(8)}`;
    const dateOfBirth = '1990-15-01'; 
    
    await pimPage.updatePersonalDetails(licenseNumber, dateOfBirth);
    
    await pimPage.verifyPersonalDetailsUpdated();
    
    const licenseInput = authenticatedPage.locator('.oxd-input').nth(1);
    await expect(licenseInput).toHaveValue(licenseNumber);
  });

  test('verify employee list displays correctly', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    
    const employeeList = authenticatedPage.locator('.oxd-table');
    await expect(employeeList).toBeVisible();
    
    const tableHeaders = authenticatedPage.locator('.oxd-table-header');
    await expect(tableHeaders).toBeVisible();
    
    const tableCards = authenticatedPage.locator('.oxd-table-card');
    await expect(tableCards.first()).toBeVisible();
  });

  test('verify required field validation on add employee', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();

    await authenticatedPage.click('button[type="submit"]');
    
    const errorMessages = authenticatedPage.locator('.oxd-input-field-error-message');
    await expect(errorMessages.first()).toBeVisible();
    await expect(errorMessages.first()).toHaveText('Required');
  });

  test('delete employee', async ({ authenticatedPage, pimPage }) => {
    await pimPage.navigateToPIM();
    await pimPage.clickAddEmployee();
    await pimPage.fillEmployeeDetails(
      `Delete${generateRandomString(4)}`,
      'Test',
      `User${generateRandomString(4)}`
    );
    
    const generatedEmployeeId = await pimPage.getGeneratedEmployeeId();
    console.log('Deleting employee with ID:', generatedEmployeeId);
    
    await pimPage.saveEmployee();
    
    await authenticatedPage.waitForTimeout(2000);
    
    await pimPage.navigateToPIM();
    await pimPage.searchEmployeeById(generatedEmployeeId);
    
    await authenticatedPage.waitForTimeout(1000);
    
    const searchResults = authenticatedPage.locator('.oxd-table-card');
    await expect(searchResults.first()).toBeVisible({ timeout: 5000 });
    
    const deleteButtons = authenticatedPage.locator('button i.bi-trash');
    await deleteButtons.first().click();
    
    await authenticatedPage.click('button:has-text("Yes, Delete")');
    
    await authenticatedPage.waitForTimeout(2000);
    console.log('Employee deleted successfully');
  });
});