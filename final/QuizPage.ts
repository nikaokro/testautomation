import { Page, expect } from '@playwright/test';

export class QuizPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:3000'); // adjust URL
  }

  /* ========= Student Info ========= */
  async fillStudentInfo() {
    await this.page.fill('#studentEmail', 'student@test.com');
    await this.page.fill('[name="fullName"]', 'Automation Student');
  }

  /* ========= Section 1: K6 ========= */
  async answerK6Section() {
    await this.page.check('[name="q1_k6_purpose"][value="performance"]');

    await this.page.check('#q2_feat1');
    await this.page.check('#q2_feat2');

    await this.page.selectOption('#k6ScenarioSelect', 'javascript');

    await this.page.check('[data-test="test-type-radio"][value="spike"]');

    await this.page.check('[name="q5_metrics"][value="code_coverage"]');

    await this.page.locator('#k6ThresholdInput').fill('8');

    await this.page.selectOption('[name="q7_endurance"]', 'endurance');

    await this.page.check('[name="q8_best_practice"][value="baseline"]');

    await this.page.check('[name="q9_streaming_test"][value="stress"]');
  }

  /* ========= Section 2: Postman ========= */
  async answerPostmanSection() {
    await this.page.check('.postman-prerequest[value="before"]');

    await this.page.selectOption('#postmanScriptAnalysis', 'auth');

    await this.page.check('#postman_test1');
    await this.page.check('#postman_test2');
    await this.page.check('#postman_test4');
    await this.page.check('#postman_test5');

    await this.page.check('[name="q13_test_behavior"][value="first_fail_continue"]');

    await this.page.check('#pm_all');

    await this.page.fill('[name="q15_local"]', '1');
    await this.page.fill('[name="q15_data"]', '2');
    await this.page.fill('[name="q15_environment"]', '3');
    await this.page.fill('[name="q15_collection"]', '4');
    await this.page.fill('[name="q15_global"]', '5');

    await this.page.locator('#collectionRunnerImportance').fill('8');

    await this.page.fill(
      '#q17_newman',
      'Newman is a command line (CLI) tool used to run Postman collections in CI/CD pipelines.'
    );
  }

  /* ========= Section 3: Playwright ========= */
  async answerPlaywrightSection() {
    await this.page.check('.playwright-benefits[value="auto_wait"]');
    await this.page.check('.playwright-benefits[value="multi_browser"]');
    await this.page.check('.playwright-benefits[value="network"]');

    await this.page.selectOption('[data-automation="selector-dropdown"]', 'data_testid');

    await this.page.check('[name="q20_auto_wait[]"][value="click"]');
    await this.page.check('[name="q20_auto_wait[]"][value="fill"]');

    await this.page.check('[name="q21_pom"][value="maintainability"]');

    await this.page.selectOption('[name="q22_hooks"]', 'each');

    await this.page.fill(
      '#playwrightFeedback',
      'I faced flaky tests due to timing issues and resolved them using Playwright auto-waiting and stable locators.'
    );
  }

  /* ========= Section 4: General ========= */
  async answerGeneralSection() {
    await this.page.check('#pyramid_unit');
    await this.page.locator('#confidenceLevel').fill('9');
  }

  /* ========= Submit ========= */
  async submitQuiz() {
    await this.page.check('#honestWorkCheckbox');
    await this.page.click('#submitQuizButton');
  }

  /* ========= Assertions ========= */
  async verifyPerfectScore() {
    await expect(this.page.locator('#resultsSection')).toBeVisible();
    await expect(this.page.locator('#finalScore')).toHaveText('25/25');
    await expect(this.page.locator('#letterGrade')).toContainText('A');
  }
}
