import { test } from '@playwright/test';
import { QuizPage } from './QuizPage';

test.describe('Test Automation Finals Practice Quiz - POM', () => {

  test('Student completes quiz successfully', async ({ page }) => {
    const quiz = new QuizPage(page);

    await quiz.goto();
    await quiz.fillStudentInfo();
    await quiz.answerK6Section();
    await quiz.answerPostmanSection();
    await quiz.answerPlaywrightSection();
    await quiz.answerGeneralSection();
    await quiz.submitQuiz();
    await quiz.verifyPerfectScore();
  });

});
