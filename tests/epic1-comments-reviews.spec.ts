/**
 * EPIC 1 – Comments & Reviews
 *
 * User Stories covered:
 *   US1-1  Member can leave a comment on a coworking space
 *   US1-2  Member can rate a space 1–5 stars
 *   US1-3  Member can edit and delete their own comment
 *   US1-4  Operator can moderate comments (delete/report/block)
 *
 * Prerequisites:
 *   - Frontend running at http://localhost:3000
 *   - Backend running at http://localhost:5000
 *   - Seed credentials defined in helpers.ts
 *   - SPACE_ID env var or constant set to a valid coworking space _id
 *
 * Strategy:
 *   US1-1 → US1-2 → US1-3 form a single comment lifecycle:
 *     post → verify name/date → verify rating → edit → delete
 *   This means only ONE comment is created per full run, and the
 *   delete at the end leaves the DB clean for the next run.
 */

import { test, expect, request } from '@playwright/test';
import {
  loginViaUI,
  loginViaAPI,
  goToSpacePage,
  MEMBER,
  MEMBER2,
  ADMIN,
  SPACE_ID,
  API_BASE,
} from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Shared state – flows through the lifecycle chain US1-1 → US1-2 → US1-3
// ─────────────────────────────────────────────────────────────────────────────
let sharedMessage: string;

// Helper: find a comment card by its visible text
function getCommentCard(page: any, text: string) {
  return page.locator('div.bg-gray-50').filter({ hasText: text });
}

// ─────────────────────────────────────────────────────────────────────────────
// beforeAll – delete any pre-existing comment by MEMBER so tests start clean
// ─────────────────────────────────────────────────────────────────────────────
// test.beforeAll(async () => {
//   const context = await request.newContext();

//   // Get token
//   const loginRes = await context.post(`${API_BASE}/api/v1/auth/login`, {
//     data: { email: MEMBER.email, password: MEMBER.password },
//   });
//   const { token } = await loginRes.json();

//   // Fetch comments for this space
//   const commentsRes = await context.get(
//     `${API_BASE}/api/v1/coworkingspaces/${SPACE_ID}/comments`,
//   );
//   const body = await commentsRes.json();

//   // Delete existing comment by MEMBER if found
//   const myComment = body.data?.find(
//     (c: any) => c.user?.email === MEMBER.email || c.user?.name === MEMBER.name,
//   );
//   if (myComment) {
//     await context.delete(`${API_BASE}/api/v1/comments/${myComment._id}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log('🗑️  Cleaned up pre-existing MEMBER comment');
//   }

//   await context.dispose();
// });

// ─────────────────────────────────────────────────────────────────────────────
// US1-1 · Leave a comment
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US1-1 · Leave a comment', () => {

  test('AC1 – logged-in member can submit a comment and it appears on the page', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    sharedMessage = `Lifecycle comment – ${Date.now()}`;

    // Star rating is required to post
    await page.locator('.MuiRating-root').first().locator('label').nth(3).click({ force: true }); // 4 stars
    await page.getByPlaceholder('Write your comment here...').fill(sharedMessage);
    await page.getByRole('button', { name: /post comment/i }).click();

    await expect(
      page.locator('div.bg-gray-50').filter({ hasText: sharedMessage }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('AC2 – comment shows display name and date/time after submission', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const commentCard = getCommentCard(page, sharedMessage);
    await expect(commentCard).toBeVisible({ timeout: 10_000 });

    // Name should appear in the card
    await expect(commentCard).toContainText(MEMBER.name);

    // Date should match toLocaleString() format: M/D/YYYY, H:MM:SS AM/PM
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{4},\s\d{1,2}:\d{2}:\d{2}\s(AM|PM)/;
    const cardText = await commentCard.innerText();
    expect(datePattern.test(cardText)).toBeTruthy();
  });

  test('blocked member cannot post a comment', async ({ page }) => {
    await loginViaUI(page, 'block@block.com', '123456');
    await goToSpacePage(page);

    await page.getByLabel('3 Stars').first().click({ force: true });
    await page.getByPlaceholder('Write your comment here...').fill('I should not be able to post');
    await page.getByRole('button', { name: /post comment/i }).click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message().toLowerCase()).toContain('blocked');
      await dialog.accept();
    });
  });

  test('unauthenticated user is redirected to login on submit', async ({ page }) => {
    await goToSpacePage(page);

    page.once('dialog', async (dialog) => {
      expect(dialog.message().toLowerCase()).toContain('sign in');
      await dialog.accept();
    });

    await page.getByPlaceholder('Write your comment here...').fill('Anonymous attempt');
    await page.getByRole('button', { name: /post comment/i }).click();

    await page.waitForURL(/\/login/, { timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US1-2 · Rate a space (1–5 stars)
// Reuses the comment posted in US1-1 AC1 — no new comment needed
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US1-2 · Star rating', () => {

  test('AC1 – selected star rating is saved and visible on the comment card', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const commentCard = getCommentCard(page, sharedMessage);
    await expect(commentCard).toBeVisible({ timeout: 10_000 });

    // 4 filled stars should be visible inside the card (we posted with 4 Stars)
    await expect(commentCard.locator('.MuiRating-iconFilled')).toHaveCount(4);
  });

  test('AC2 – average rating component is visible on the space page', async ({ page }) => {
    await goToSpacePage(page);

    const ratingEl = page.locator('[aria-label*="Stars"], [aria-label*="Star"]').first();
    await expect(ratingEl).toBeVisible({ timeout: 6_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US1-3 · Edit and delete own comment
// Continues the lifecycle — edits then deletes the shared comment
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US1-3 · Edit and delete own comment', () => {

  test('AC1 – member can edit their comment and updated text replaces old text', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const commentCard = getCommentCard(page, sharedMessage);
    await expect(commentCard).toBeVisible({ timeout: 10_000 });
    await commentCard.getByRole('button', { name: /edit/i }).click();

    // Wait for textarea to appear
    const editArea = page.locator('textarea').last(); // use page-level locator, not card
    await expect(editArea).toBeVisible({ timeout: 5_000 });

    const editedMessage = `EDITED – ${Date.now()}`;

    // Triple click selects all text, then type replaces it — works with React controlled inputs
    await editArea.click({ clickCount: 3 });
    await editArea.fill(editedMessage);
    await expect(editArea).toHaveValue(editedMessage, { timeout: 5_000 });

    await page.getByRole('button', { name: /save/i }).click();

    await expect(
      page.locator('div.bg-gray-50').filter({ hasText: editedMessage }),
    ).toBeVisible({ timeout: 8_000 });

    sharedMessage = editedMessage;
  });

  test('AC2 – member can delete their comment and it is removed from the page (cleanup)', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const commentCard = getCommentCard(page, sharedMessage);
    await expect(commentCard).toBeVisible({ timeout: 10_000 });

    page.once('dialog', (dialog) => dialog.accept());
    await commentCard.getByRole('button', { name: /delete/i }).click();

    await expect(
      page.locator('div.bg-gray-50').filter({ hasText: sharedMessage }),
    ).not.toBeVisible({ timeout: 8_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US1-4 · Operator moderation (delete / block / report)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US1-4 · Operator moderation', () => {
  let moderationMsg: string;

  test.beforeAll(async () => {
    // Post a fresh comment via API so UI tests don't need to worry about it
    const context = await request.newContext();
    const loginRes = await context.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: MEMBER.email, password: MEMBER.password },
    });
    const { token } = await loginRes.json();

    moderationMsg = `Moderation target – ${Date.now()}`;

    await context.post(`${API_BASE}/api/v1/coworkingspaces/${SPACE_ID}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { message: moderationMsg, rating: 4 },
    });

    await context.dispose();
  });

  test.afterAll(async () => {
    // Clean up — delete the moderation comment if it still exists
    const context = await request.newContext();
    const loginRes = await context.post(`${API_BASE}/api/v1/auth/login`, {
      data: { email: MEMBER.email, password: MEMBER.password },
    });
    const { token } = await loginRes.json();

    const commentsRes = await context.get(
      `${API_BASE}/api/v1/coworkingspaces/${SPACE_ID}/comments`,
    );
    const body = await commentsRes.json();
    const myComment = body.data?.find(
      (c: any) => c.user?.email === MEMBER.email || c.user?.name === MEMBER.name,
    );
    if (myComment) {
      await context.delete(`${API_BASE}/api/v1/comments/${myComment._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    await context.dispose();
  });

  test('admin can see all comments in the admin dashboard', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/comments');
    await expect(page.getByRole('heading', { name: /comment/i })).toBeVisible({ timeout: 8_000 });
  });

  test('member can report a comment and success alert appears', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, moderationMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });

    page.once('dialog', (dialog) => dialog.accept());
    await card.getByRole('button', { name: /report/i }).click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message().toLowerCase()).toContain('report');
      await dialog.accept();
    });
  });

  test('admin can block a user from the admin dashboard', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/comments');

    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 5,
      { timeout: 10_000 }
    );

    const blockBtn = page.getByRole('button', { name: 'Block User' }).first();
    page.once('dialog', (dialog) => dialog.accept());
    await blockBtn.click();

    await expect(page.getByRole('button', { name: 'Unblock User' }).first()).toBeVisible({ timeout: 8_000 });

    // Unblock to leave DB clean
    const unblockBtn = page.getByRole('button', { name: 'Unblock User' }).first();
    page.once('dialog', (dialog) => dialog.accept());
    await unblockBtn.click();

    await expect(page.getByRole('button', { name: 'Block User' }).first()).toBeVisible({ timeout: 8_000 });
  });

  // test('6767', async ({ page }) => {
  //   await loginViaUI(page, ADMIN.email, ADMIN.password);
  //   await page.goto('/admin/comments');

  //   // Wait for comments to fully load
  //   await page.waitForFunction(
  //     () => document.querySelectorAll('button').length > 5,
  //     { timeout: 10_000 }
  //   );

  //   // Log all buttons with text and aria-label
  //   const buttons = page.getByRole('button');
  //   const count = await buttons.count();
  //   console.log(`Total buttons found: ${count}`);
  //   for (let i = 0; i < count; i++) {
  //     const text = await buttons.nth(i).innerText();
  //     const ariaLabel = await buttons.nth(i).getAttribute('aria-label');
  //     console.log(`Button ${i}: text="${text}" aria-label="${ariaLabel}"`);
  //   }
  // });

test('admin can delete a comment from the admin dashboard', async ({ page }) => {
  await loginViaUI(page, ADMIN.email, ADMIN.password);
  await page.goto('/admin/comments');

  await page.waitForFunction(
    () => document.querySelectorAll('button').length > 5,
    { timeout: 10_000 }
  );

  const deleteButtons = page.getByRole('button', { name: 'Delete Comment' });
  const countBefore = await deleteButtons.count();

  if (countBefore === 0) { test.skip(); return; }

  page.once('dialog', (dialog) => dialog.accept());
  await deleteButtons.first().click();

  // Just verify count decreased by 1 — not that all are gone
  await expect(deleteButtons).toHaveCount(countBefore - 1, { timeout: 8_000 });
});

  test('non-admin cannot access the admin comments page', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await page.goto('/admin/comments');
    await page.waitForURL((url) => !url.pathname.startsWith('/admin'), { timeout: 8_000 });
  });
});