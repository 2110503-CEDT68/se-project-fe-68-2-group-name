import { Page, expect } from '@playwright/test';

// ──────────────────────────────────────────────────────────────────────────────
// Test credentials – adjust to match seed data in your DB
// ──────────────────────────────────────────────────────────────────────────────
export const MEMBER = {
  email: 'b@b.com',
  password: '123456',
  name: 'b',
};
export const MEMBER2 = {
  email: 'a@a.com',
  password: '123456',
  name: 'a',
};
export const ADMIN = {
  email: 'test2@example.com',
  password: '123456',
  name: 'test',
};

// A known coworking space ID that exists in your DB
export const SPACE_ID = process.env.TEST_SPACE_ID || '69c170bc3d0e13729e874c59';

// Backend base URL
export const API_BASE =
  process.env.API_BASE || 'https://swdevprac-project-backend.vercel.app';

// ──────────────────────────────────────────────────────────────────────────────
// Auth helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Log in via the UI login page and wait for redirect to home.
 */
export async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]', { timeout: 10_000 });

  await page.getByPlaceholder(/you@example\.com/i).fill(email);
  await page.getByPlaceholder(/Enter your password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Fail fast if login error appears
  const errorOrRedirect = await Promise.race([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 })
      .then(() => 'redirected'),
    page.waitForSelector('text=Invalid email or password', { timeout: 15_000 })
      .then(() => 'error'),
  ]);

  if (errorOrRedirect === 'error') {
    throw new Error(`Login failed for ${email} — check credentials or if backend is running`);
  }
}

/**
 * Log in directly via the API.
 */
export async function loginViaAPI(
  page: Page,
  email: string,
  password: string,
): Promise<string> {
  const response = await page.request.post(`${API_BASE}/api/v1/auth/login`, {
    data: { email, password },
  });
  const body = await response.json();
  if (!body.token) throw new Error(`Login failed for ${email}: ${JSON.stringify(body)}`);
  return body.token;
}

/**
 * Navigate to the comment section of a coworking space page.
 */
export async function goToSpacePage(page: Page, spaceId: string = SPACE_ID) {
  await page.goto(`/spaces/${spaceId}`);
  await page.waitForSelector('text=Comments', { timeout: 10_000 });
  // Wait for comments to finish loading
  await page.waitForFunction(
    () => !document.querySelector('.loading-comments') && !document.body.innerText.includes('Loading comments...'),
    { timeout: 10_000 }
  );
}

// helpers or in the test itself — scroll past "Show more" until comment appears
export async function postAndWaitForComment(page: any, message: string) {
  await page.getByLabel('3 Stars').first().click({ force: true });
  await page.getByPlaceholder('Write your comment here...').fill(message);
  await page.getByRole('button', { name: /post comment/i }).click();

  // Keep clicking "Show more" until the comment is visible
  for (let i = 0; i < 10; i++) {
    const card = page.locator('div.bg-gray-50').filter({ hasText: message });
    if (await card.isVisible()) break;

    const showMore = page.getByRole('button', { name: /show more/i });
    if (await showMore.isVisible()) {
      await showMore.click();
      await page.waitForTimeout(500);
    } else {
      break;
    }
  }

  await expect(page.locator('div.bg-gray-50').filter({ hasText: message })).toBeVisible({ timeout: 8_000 });
}