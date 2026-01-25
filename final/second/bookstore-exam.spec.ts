import { test } from '@playwright/test';
import { BookStorePage } from './BookStorePage';

test.describe('BookStore – Playwright Final Exam', () => {

  test('Complete all sections successfully', async ({ page }) => {
    const bookstore = new BookStorePage(page);

    await bookstore.goto();
    await bookstore.fillRegistrationForm();
    await bookstore.sortColorBoxes();
    await bookstore.completeTableActions();
    await bookstore.completeGridChallenge();
    await bookstore.submitExam();
  });

});
