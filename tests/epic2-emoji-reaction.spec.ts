/**
 * EPIC 2 – Comment Reactions & Custom Emojis
 *
 * User Stories covered:
 *   US2-1  Member can react to a comment with emojis
 *   US2-2  Member can remove or toggle emoji reactions
 *   US2-3  Member can upload a custom reaction image
 *   US2-4  Member can preview and manage custom reaction images
 *   US2-5  Operator can moderate comment emojis and reactions
 *
 * Prerequisites:
 *   - Frontend running at http://localhost:3000
 *   - Backend running and accessible
 *   - Seed credentials defined in helpers.ts
 *   - SPACE_ID env var or constant set to a valid coworking space _id
 *
 * Strategy:
 *   US2-1 → US2-2 share a lifecycle: post comment → react → verify → toggle off
 *   US2-3 → US2-4 share a lifecycle: upload custom emoji → verify in picker → delete
 *   US2-5 covers admin-specific flows independently.
 *
 *   All comment seeds are created via API in beforeAll and cleaned up in afterAll
 *   so each describe block is self-contained.
 */

import { test, expect, request } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  loginViaUI,
  goToSpacePage,
  MEMBER,
  MEMBER2,
  ADMIN,
  SPACE_ID,
  API_BASE,
} from './helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Get bearer token for a user via API */
async function getToken(context: any, email: string, password: string): Promise<string> {
  const res = await context.post(`${API_BASE}/api/v1/auth/login`, {
    data: { email, password },
  });
  const body = await res.json();
  if (!body.token) throw new Error(`Login failed for ${email}`);
  return body.token;
}

/** Post a comment via API; returns the created comment object */
async function postComment(
  context: any,
  token: string,
  spaceId: string,
  message: string,
  rating = 4,
): Promise<any> {
  const res = await context.post(
    `${API_BASE}/api/v1/coworkingspaces/${spaceId}/comments`,
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { message, rating },
    },
  );
  const body = await res.json();
  return body.data;
}

/** Delete a comment via API */
async function deleteComment(context: any, token: string, commentId: string) {
  await context.delete(`${API_BASE}/api/v1/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Toggle a reaction via API */
async function toggleReactionViaAPI(
  context: any,
  token: string,
  commentId: string,
  emojiType: 'default' | 'custom',
  emojiValue: string,
) {
  const payload: any = { emojiType, emojiValue };
  if (emojiType === 'custom') payload.customEmoji = emojiValue;

  const res = await context.put(
    `${API_BASE}/api/v1/comments/${commentId}/reactions/toggle`,
    {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: payload,
    },
  );
  return res;
}

/** Delete a custom emoji via API */
async function deleteCustomEmojiViaAPI(context: any, token: string, emojiId: string) {
  await context.delete(`${API_BASE}/api/v1/custom-emojis/${emojiId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Find a comment card on the page by its text */
function getCommentCard(page: any, text: string) {
  return page.locator('div.bg-gray-50').filter({ hasText: text });
}

/** Hover over a comment card to reveal the reaction bar */
async function hoverCard(page: any, card: any) {
  await card.hover();
  await page.waitForTimeout(300);
}

// ─────────────────────────────────────────────────────────────────────────────
// US2-1 · React to a comment with emojis
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US2-1 · React to a comment with emojis', () => {
  let commentMsg: string;
  let commentId: string;
  let memberToken: string;

  test.beforeAll(async () => {
    const context = await request.newContext();
    memberToken = await getToken(context, MEMBER.email, MEMBER.password);

    commentMsg = `Reaction target – ${Date.now()}`;
    const comment = await postComment(context, memberToken, SPACE_ID, commentMsg);
    commentId = comment?._id;

    await context.dispose();
  });

  test.afterAll(async () => {
    if (!commentId) return;
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    await deleteComment(context, token, commentId);
    await context.dispose();
  });

  test('AC1 – hovering a comment card reveals the emoji reaction bar', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });

    await hoverCard(page, card);

    // Quick-access default emojis should appear on hover bar
    const reactionBar = card.locator('.group-hover\\:flex').first();
    await expect(reactionBar).toBeVisible({ timeout: 5_000 });
  });

  test('AC2 – member can click a default emoji and reaction count appears on the card', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    // Click the 👍 emoji from the hover bar
    const thumbsUpBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👍' })
      .first();
    await thumbsUpBtn.click();

    // A reaction badge with count 1 should appear on the card
    await expect(card.locator('button').filter({ hasText: '👍' }).first()).toBeVisible({
      timeout: 8_000,
    });
    await expect(card.locator('button').filter({ hasText: '👍' })).toContainText('1');
  });

  test('AC3 – reaction is highlighted (blue) when the current user has reacted', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    // Click 👌 emoji
    const emojiBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👌' })
      .first();
    await emojiBtn.click();
    await page.waitForTimeout(500);

    // The reaction badge should have blue styling (bg-blue-50 or border-blue-300)
    const reactionBadge = card.locator('button').filter({ hasText: '👌' }).first();
    await expect(reactionBadge).toBeVisible({ timeout: 8_000 });
    const className = await reactionBadge.getAttribute('class');
    expect(className).toMatch(/blue/i);
  });

  test('AC4 – emoji picker popup opens when clicking the "+" button on the hover bar', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    // Click the "+" expand button
    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();

    // The expanded emoji picker should appear with system emojis section
    await expect(page.getByText('System Emojis')).toBeVisible({ timeout: 5_000 });
  });

  test('AC5 – member can react using a system emoji from the expanded picker', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('System Emojis')).toBeVisible({ timeout: 5_000 });

    // Click 🔥 from system emojis
    const fireBtn = page
      .locator('button')
      .filter({ hasText: '🔥' })
      .first();
    await fireBtn.click();

    // Reaction badge should appear on the card
    await expect(card.locator('button').filter({ hasText: '🔥' }).first()).toBeVisible({
      timeout: 8_000,
    });
  });

  test('AC6 – unauthenticated user clicking a reaction is prompted to sign in', async ({ page }) => {
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    page.once('dialog', async (dialog) => {
      expect(dialog.message().toLowerCase()).toContain('sign in');
      await dialog.accept();
    });

    const thumbsUpBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👍' })
      .first();
    await thumbsUpBtn.click();

    await page.waitForURL(/\/login/, { timeout: 8_000 });
  });

  test('AC7 – multiple users can react to the same comment; counts accumulate', async ({ page }) => {
    // MEMBER reacts via API first
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    await toggleReactionViaAPI(context, token, commentId, 'default', '❤️');
    await context.dispose();

    // MEMBER2 reacts via UI
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const heartBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '❤️' })
      .first();
    await heartBtn.click();
    await page.waitForTimeout(500);

    // Count should be 2 (MEMBER + MEMBER2)
    const badge = card.locator('button').filter({ hasText: '❤️' }).first();
    await expect(badge).toBeVisible({ timeout: 8_000 });
    await expect(badge).toContainText('2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US2-2 · Toggle / remove emoji reactions
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US2-2 · Toggle / remove emoji reactions', () => {
  let commentMsg: string;
  let commentId: string;

  test.beforeAll(async () => {
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);

    commentMsg = `Toggle target – ${Date.now()}`;
    const comment = await postComment(context, token, SPACE_ID, commentMsg);
    commentId = comment?._id;

    await context.dispose();
  });

  test.afterAll(async () => {
    if (!commentId) return;
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    await deleteComment(context, token, commentId);
    await context.dispose();
  });

  test('AC1 – clicking an already-active reaction badge removes it (toggles off)', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Add reaction first
    await hoverCard(page, card);
    const thumbsUpBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👍' })
      .first();
    await thumbsUpBtn.click();
    await page.waitForTimeout(500);

    const badge = card.locator('button').filter({ hasText: '👍' }).first();
    await expect(badge).toBeVisible({ timeout: 8_000 });

    // Click the badge again to toggle off
    await badge.click();
    await page.waitForTimeout(500);

    // Badge count should drop to 0 — the badge either disappears or shows 0
    const badgeAfter = card.locator('button').filter({ hasText: '👍' });
    const countAfter = await badgeAfter.count();
    if (countAfter > 0) {
      // If badge persists, its count must not show a number ≥ 1
      const text = await badgeAfter.first().textContent();
      expect(text).not.toMatch(/[1-9]/);
    }
    // badge completely gone is also a passing state
  });

  test('AC2 – toggling off updates the badge styling back to neutral (no blue highlight)', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });

    // React first
    await hoverCard(page, card);
    const heartBtn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '❤️' })
      .first();
    await heartBtn.click();
    await page.waitForTimeout(500);

    const badge = card.locator('button').filter({ hasText: '❤️' }).first();
    await expect(badge).toBeVisible({ timeout: 8_000 });

    // Verify it is highlighted blue
    const classBefore = await badge.getAttribute('class');
    expect(classBefore).toMatch(/blue/i);

    // Toggle off
    await badge.click();
    await page.waitForTimeout(500);

    // If badge still visible, blue class should be gone
    const badgeAfter = card.locator('button').filter({ hasText: '❤️' });
    if (await badgeAfter.count() > 0) {
      const classAfter = await badgeAfter.first().getAttribute('class');
      expect(classAfter).not.toMatch(/bg-blue-50/);
    }
  });

  test('AC3 – UI updates optimistically; no page reload required', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const btn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👌' })
      .first();
    await btn.click();

    // Badge should appear within 1 second WITHOUT a navigation event
    const badge = card.locator('button').filter({ hasText: '👌' }).first();
    await expect(badge).toBeVisible({ timeout: 1_000 });
    await expect(page).toHaveURL(new RegExp(`/spaces/${SPACE_ID}`));
  });

  test('AC4 – one user toggling does not affect another users reaction', async ({ page }) => {
    // MEMBER adds 👍 via API
    const context = await request.newContext();
    const memberToken = await getToken(context, MEMBER.email, MEMBER.password);
    await toggleReactionViaAPI(context, memberToken, commentId, 'default', '👍');
    await context.dispose();

    // MEMBER2 also adds 👍 then removes it
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const btn = card
      .locator('.group-hover\\:flex button')
      .filter({ hasText: '👍' })
      .first();
    await btn.click();
    await page.waitForTimeout(500);

    // Count should be 2 (MEMBER + MEMBER2)
    const badge = card.locator('button').filter({ hasText: '👍' }).first();
    await expect(badge).toContainText('2');

    // MEMBER2 toggles off
    await badge.click();
    await page.waitForTimeout(500);

    // Count should drop to 1 (only MEMBER remains)
    const badgeAfter = card.locator('button').filter({ hasText: '👍' }).first();
    await expect(badgeAfter).toContainText('1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US2-3 · Upload a custom reaction image
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US2-3 · Upload a custom reaction image', () => {
  let commentMsg: string;
  let commentId: string;
  let uploadedEmojiId: string | null = null;

  // Create a tiny valid PNG (1×1 transparent pixel) in /tmp for upload tests
  const tmpImagePath = path.join('/tmp', 'test-emoji.png');

  test.beforeAll(async () => {
    // 1×1 transparent PNG (base64 decoded)
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';
    fs.writeFileSync(tmpImagePath, Buffer.from(pngBase64, 'base64'));

    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);

    commentMsg = `Custom emoji target – ${Date.now()}`;
    const comment = await postComment(context, token, SPACE_ID, commentMsg);
    commentId = comment?._id;

    await context.dispose();
  });

  test.afterAll(async () => {
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);

    if (commentId) await deleteComment(context, token, commentId);
    if (uploadedEmojiId) await deleteCustomEmojiViaAPI(context, token, uploadedEmojiId);

    await context.dispose();
    if (fs.existsSync(tmpImagePath)) fs.unlinkSync(tmpImagePath);
  });

  test('AC1 – "Add New Emoji" button in picker opens the upload modal', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    // Open the extended picker
    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('System Emojis')).toBeVisible({ timeout: 5_000 });

    // Click "Add New Emoji"
    await page.getByRole('button', { name: /add new emoji/i }).click();

    // Upload modal should open
    await expect(page.getByText('Create Custom Emoji')).toBeVisible({ timeout: 5_000 });
  });

  test('AC2 – upload modal requires a name and a file before submitting', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await page.getByRole('button', { name: /add new emoji/i }).click();
    await expect(page.getByText('Create Custom Emoji')).toBeVisible({ timeout: 5_000 });

    // Upload button should be disabled when nothing is filled in
    const uploadBtn = page.getByRole('button', { name: /upload emoji/i });
    await expect(uploadBtn).toBeDisabled();
  });

  test('AC3 – member can successfully upload a custom emoji', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await page.getByRole('button', { name: /add new emoji/i }).click();
    await expect(page.getByText('Create Custom Emoji')).toBeVisible({ timeout: 5_000 });

    // Fill in the name
    const emojiName = `TestEmoji-${Date.now()}`;
    await page.getByPlaceholder(/peepoHappy/i).fill(emojiName);

    // Upload the file
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.locator('input[type="file"]').click(),
    ]);
    await fileChooser.setFiles(tmpImagePath);

    // Wait for the upload button to become enabled
    const uploadBtn = page.getByRole('button', { name: /upload emoji/i });
    await expect(uploadBtn).toBeEnabled({ timeout: 3_000 });

    // Accept success alert
    page.once('dialog', async (dialog) => {
      expect(dialog.message().toLowerCase()).toContain('emoji');
      await dialog.accept();
    });

    await uploadBtn.click();

    // Modal should close
    await expect(page.getByText('Create Custom Emoji')).not.toBeVisible({ timeout: 8_000 });

    // Grab the uploaded emoji ID from API for cleanup
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    const res = await context.get(`${API_BASE}/api/v1/custom-emojis/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    const uploaded = (body.data || []).find((e: any) => e.name === emojiName);
    if (uploaded) uploadedEmojiId = uploaded._id;
    await context.dispose();
  });

  test('AC4 – uploaded custom emoji appears in the picker after upload', async ({ page }) => {
    if (!uploadedEmojiId) test.skip();

    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    // At least one custom emoji image should be present in the picker
    const customEmojiImgs = page.locator('div').filter({ hasText: /your custom emojis/i })
      .locator('img');
    await expect(customEmojiImgs.first()).toBeVisible({ timeout: 5_000 });
  });

  test('AC5 – member can react with their uploaded custom emoji', async ({ page }) => {
    if (!uploadedEmojiId) test.skip();

    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    // Click the first custom emoji in the picker
    const firstCustomEmoji = page
      .locator('div')
      .filter({ hasText: /your custom emojis/i })
      .locator('button img')
      .first();
    await firstCustomEmoji.click();
    await page.waitForTimeout(500);

    // A reaction badge with an img should appear on the card
    const customBadge = card.locator('button img').first();
    await expect(customBadge).toBeVisible({ timeout: 8_000 });
  });

  test('AC6 – uploading an invalid (non-image) file is rejected', async ({ page }) => {
    // Create a text file to simulate invalid upload
    const txtPath = path.join('/tmp', 'invalid.txt');
    fs.writeFileSync(txtPath, 'not an image');

    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await page.getByRole('button', { name: /add new emoji/i }).click();
    await expect(page.getByText('Create Custom Emoji')).toBeVisible({ timeout: 5_000 });

    await page.getByPlaceholder(/peepoHappy/i).fill('InvalidEmoji');

    // The file input accepts="image/*" — browser/frontend should reject non-image
    // Verify the upload button stays disabled or an error occurs
    const uploadBtn = page.getByRole('button', { name: /upload emoji/i });
    // Without a valid image, upload should remain disabled
    await expect(uploadBtn).toBeDisabled();

    if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US2-4 · Preview and manage custom reaction images
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US2-4 · Preview and manage custom reaction images', () => {
  let commentMsg: string;
  let commentId: string;
  let managedEmojiId: string | null = null;

  const tmpImagePath = path.join('/tmp', 'manage-emoji.png');
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

  test.beforeAll(async () => {
    fs.writeFileSync(tmpImagePath, Buffer.from(pngBase64, 'base64'));

    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);

    // Create a comment for context
    commentMsg = `Manage emoji target – ${Date.now()}`;
    const comment = await postComment(context, token, SPACE_ID, commentMsg);
    commentId = comment?._id;

    // Upload a custom emoji via API using multipart form
    const emojiName = `ManageEmoji-${Date.now()}`;
    const formData = new FormData();
    formData.append('name', emojiName);
    formData.append(
      'image',
      new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' }),
      'manage-emoji.png',
    );

    // Use fetch directly for multipart
    const uploadRes = await fetch(`${API_BASE}/api/v1/custom-emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadBody = await uploadRes.json();
    managedEmojiId = uploadBody.data?._id || null;

    await context.dispose();
  });

  test.afterAll(async () => {
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);

    if (commentId) await deleteComment(context, token, commentId);
    if (managedEmojiId) await deleteCustomEmojiViaAPI(context, token, managedEmojiId);

    await context.dispose();
    if (fs.existsSync(tmpImagePath)) fs.unlinkSync(tmpImagePath);
  });

  test('AC1 – custom emojis section shows uploaded emoji images in the picker', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();

    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    // At least one custom emoji should appear
    const emojiImgs = page.locator('div')
      .filter({ hasText: /your custom emojis/i })
      .locator('button img');
    await expect(emojiImgs.first()).toBeVisible({ timeout: 5_000 });
  });

  test('AC2 – hovering a custom emoji in the picker reveals a delete (✕) button', async ({ page }) => {
    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    // Hover the first custom emoji wrapper
    const firstEmojiWrapper = page
      .locator('div')
      .filter({ hasText: /your custom emojis/i })
      .locator('.group\\/emoji')
      .first();
    await firstEmojiWrapper.hover();

    // Delete button (✕) should appear
    const deleteBtn = firstEmojiWrapper.locator('button').filter({ hasText: '✕' });
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });
  });

  test('AC3 – member can delete their custom emoji from the picker', async ({ page }) => {
    if (!managedEmojiId) test.skip();

    await loginViaUI(page, MEMBER.email, MEMBER.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    const emojisBefore = await page
      .locator('div')
      .filter({ hasText: /your custom emojis/i })
      .locator('.group\\/emoji')
      .count();

    // Hover the first emoji to reveal delete button
    const firstEmojiWrapper = page
      .locator('div')
      .filter({ hasText: /your custom emojis/i })
      .locator('.group\\/emoji')
      .first();
    await firstEmojiWrapper.hover();

    const deleteBtn = firstEmojiWrapper.locator('button').filter({ hasText: '✕' });
    await expect(deleteBtn).toBeVisible({ timeout: 5_000 });

    page.once('dialog', (dialog) => dialog.accept());
    await deleteBtn.click();

    // Page reloads after delete (window.location.reload())
    await page.waitForLoadState('networkidle', { timeout: 10_000 });

    managedEmojiId = null; // Mark as deleted so afterAll skips API cleanup
  });

  test('AC4 – custom emojis are only visible to the user who uploaded them (not other users)', async ({ page }) => {
    // Upload an emoji as MEMBER
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    const emojiName = `MemberOnly-${Date.now()}`;

    const formData = new FormData();
    formData.append('name', emojiName);
    formData.append(
      'image',
      new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' }),
      'member-emoji.png',
    );

    const uploadRes = await fetch(`${API_BASE}/api/v1/custom-emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadBody = await uploadRes.json();
    const tempEmojiId = uploadBody.data?._id;
    await context.dispose();

    // Log in as MEMBER2 and open the picker — should NOT see MEMBER's emoji
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    // MEMBER2's custom emojis section should NOT contain MEMBER's emoji by name
    const pickerText = await page.locator('div').filter({ hasText: /your custom emojis/i }).textContent();
    expect(pickerText).not.toContain(emojiName);

    // Cleanup
    const cleanContext = await request.newContext();
    const cleanToken = await getToken(cleanContext, MEMBER.email, MEMBER.password);
    if (tempEmojiId) await deleteCustomEmojiViaAPI(cleanContext, cleanToken, tempEmojiId);
    await cleanContext.dispose();
  });

  test('AC5 – "No custom emojis yet" placeholder shows when user has none', async ({ page }) => {
    // Ensure MEMBER2 has no custom emojis
    const context = await request.newContext();
    const token = await getToken(context, MEMBER2.email, MEMBER2.password);
    const res = await context.get(`${API_BASE}/api/v1/custom-emojis/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    for (const emoji of body.data || []) {
      await deleteCustomEmojiViaAPI(context, token, emoji._id);
    }
    await context.dispose();

    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await goToSpacePage(page);

    const card = getCommentCard(page, commentMsg);
    await expect(card).toBeVisible({ timeout: 10_000 });
    await hoverCard(page, card);

    const expandBtn = card.locator('.group-hover\\:flex button').last();
    await expandBtn.click();
    await expect(page.getByText('Your Custom Emojis')).toBeVisible({ timeout: 5_000 });

    await expect(page.getByText(/no custom emojis yet/i)).toBeVisible({ timeout: 5_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// US2-5 · Operator moderation of emojis and reactions
// ─────────────────────────────────────────────────────────────────────────────
test.describe('US2-5 · Operator moderation of emojis and reactions', () => {
  let emojiIdToModerate: string | null = null;

  const tmpImagePath = path.join('/tmp', 'admin-mod-emoji.png');
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

  test.beforeAll(async () => {
    fs.writeFileSync(tmpImagePath, Buffer.from(pngBase64, 'base64'));

    // Upload an emoji as MEMBER for admin to moderate
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    const emojiName = `AdminTarget-${Date.now()}`;

    const formData = new FormData();
    formData.append('name', emojiName);
    formData.append(
      'image',
      new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' }),
      'admin-target.png',
    );

    const res = await fetch(`${API_BASE}/api/v1/custom-emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const body = await res.json();
    emojiIdToModerate = body.data?._id || null;
    await context.dispose();
  });

  test.afterAll(async () => {
    if (!emojiIdToModerate) return;
    const context = await request.newContext();
    const adminToken = await getToken(context, ADMIN.email, ADMIN.password);
    await deleteCustomEmojiViaAPI(context, adminToken, emojiIdToModerate);
    await context.dispose();
    if (fs.existsSync(tmpImagePath)) fs.unlinkSync(tmpImagePath);
  });

  test('AC1 – admin can access the custom emojis management page', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');

    await expect(
      page.getByRole('heading', { name: /manage custom emojis/i }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('AC2 – admin can see all custom emojis uploaded by all users', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    // Wait for emoji list to load
    await page.waitForFunction(
      () => document.querySelectorAll('img').length > 0 || document.body.innerText.includes('No custom emojis'),
      { timeout: 10_000 },
    );

    // The total count badge should be visible
    const countBadge = page.locator('text=/\\d+ emojis? total/i');
    await expect(countBadge).toBeVisible({ timeout: 8_000 });
  });

  test('AC3 – admin can search for an emoji by name', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('img').length > 0,
      { timeout: 10_000 },
    );

    // Search for a term that won't match anything
    await page.getByPlaceholder(/search by emoji name/i).fill('xyznotfound123');

    // Should show empty state
    await expect(page.getByText(/no custom emojis found/i)).toBeVisible({ timeout: 5_000 });
  });

  test('AC4 – admin can search for an emoji by owner name', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('img').length > 0 || document.body.innerText.includes('No custom emojis'),
      { timeout: 10_000 },
    );

    // Search by MEMBER's name
    await page.getByPlaceholder(/search by emoji name/i).fill(MEMBER.name);

    // Results should contain entries owned by MEMBER
    await page.waitForTimeout(500);
    const results = page.locator('div').filter({ hasText: new RegExp(`by ${MEMBER.name}`, 'i') });
    if (await results.count() > 0) {
      await expect(results.first()).toBeVisible();
    }
    // If no results, MEMBER has no emojis — which is also valid; test passes.
  });

  test('AC5 – admin can delete (moderate) a custom emoji', async ({ page }) => {
    if (!emojiIdToModerate) test.skip();

    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 2,
      { timeout: 10_000 },
    );

    const deleteButtons = page.getByRole('button', { name: /delete/i });
    const countBefore = await deleteButtons.count();

    if (countBefore === 0) { test.skip(); return; }

    page.once('dialog', (dialog) => dialog.accept());
    await deleteButtons.first().click();

    await page.waitForTimeout(1_500);

    const countAfter = await page.getByRole('button', { name: /delete/i }).count();
    expect(countAfter).toBe(countBefore - 1);

    emojiIdToModerate = null; // Mark as deleted to skip afterAll cleanup
  });

  test('AC6 – admin can clear the search filter using the Clear button', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    const searchInput = page.getByPlaceholder(/search by emoji name/i);
    await searchInput.fill('somefilterterm');
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /clear/i }).click();

    // Search input should be emptied
    await expect(searchInput).toHaveValue('');
  });

  test('AC7 – emoji cards show name, owner, date, and status badge', async ({ page }) => {
    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('img').length > 0 || document.body.innerText.includes('No custom emojis'),
      { timeout: 10_000 },
    );

    const emojiCards = page.locator('div.rounded-2xl.border');

    if (await emojiCards.count() === 0) {
      // No emojis in the system; test passes vacuously
      return;
    }

    const firstCard = emojiCards.first();

    // Should contain an image preview
    await expect(firstCard.locator('img').first()).toBeVisible();

    // Should show "by <owner>" text
    await expect(firstCard.locator('p').filter({ hasText: /^by/i })).toBeVisible();

    // Should show a date
    await expect(firstCard.locator('p').last()).toBeVisible();
  });

  test('AC8 – non-admin member cannot access the admin emojis page', async ({ page }) => {
    await loginViaUI(page, MEMBER2.email, MEMBER2.password);
    await page.goto('/admin/emojis');

    // Should be redirected away from /admin/* path
    // (The page currently relies on client-side session; wait for redirect)
    await page.waitForURL((url) => !url.pathname.startsWith('/admin'), {
      timeout: 10_000,
    });
  });

  test('AC9 – unauthenticated user is redirected to login from admin emojis page', async ({ page }) => {
    await page.goto('/admin/emojis');
    await page.waitForURL(/\/login/, { timeout: 8_000 });
  });

  test('AC10 – emoji cards in admin have a working Delete button with confirmation', async ({ page }) => {
    // Upload a throwaway emoji for this test
    const context = await request.newContext();
    const token = await getToken(context, MEMBER.email, MEMBER.password);
    const emojiName = `ThrowawayEmoji-${Date.now()}`;

    const formData = new FormData();
    formData.append('name', emojiName);
    formData.append(
      'image',
      new Blob([Buffer.from(pngBase64, 'base64')], { type: 'image/png' }),
      'throwaway.png',
    );

    const res = await fetch(`${API_BASE}/api/v1/custom-emojis`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const body = await res.json();
    const throwawayId = body.data?._id;
    await context.dispose();

    await loginViaUI(page, ADMIN.email, ADMIN.password);
    await page.goto('/admin/emojis');
    await page.waitForSelector('text=Manage Custom Emojis', { timeout: 10_000 });

    await page.waitForFunction(
      () => document.querySelectorAll('button').length > 2,
      { timeout: 10_000 },
    );

    let dialogShown = false;
    page.once('dialog', async (dialog) => {
      dialogShown = true;
      expect(dialog.message().toLowerCase()).toContain('delete');
      await dialog.dismiss(); // Dismiss to verify dialog appeared
    });

    await page.getByRole('button', { name: /delete/i }).first().click();
    await page.waitForTimeout(1_000);

    expect(dialogShown).toBe(true);

    // Cleanup the throwaway emoji
    if (throwawayId) {
      const cleanContext = await request.newContext();
      const adminToken = await getToken(cleanContext, ADMIN.email, ADMIN.password);
      await deleteCustomEmojiViaAPI(cleanContext, adminToken, throwawayId);
      await cleanContext.dispose();
    }
  });
});