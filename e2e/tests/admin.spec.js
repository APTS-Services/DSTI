import { ADMIN_PASSWORD, expect, solveCaptcha, test, watchErrors } from './fixtures.js';

async function login(page, server, username, password) {
  const answer = await solveCaptcha(page, server, () => page.goto('/admin/login'));
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.locator('#login-captcha').fill(answer);
  await Promise.all([page.waitForResponse((r) => r.url().endsWith('/api/auth/login')), page.getByRole('button', { name: 'Sign in' }).click()]);
}

test.describe.configure({ mode: 'serial' });

test('admin pages are protected', async ({ page }) => {
  await page.goto('/admin/c/news');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('wrong CAPTCHA or password is rejected', async ({ page, server }) => {
  await solveCaptcha(page, server, () => page.goto('/admin/login'));
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('Init!alPass2026');
  await page.locator('#login-captcha').fill('zzzzz');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Invalid username, password or CAPTCHA');
  await login(page, server, 'admin', 'wrong-password');
  await expect(page.getByRole('alert')).toContainText('Invalid username, password or CAPTCHA');
});

test('first sign-in forces a password change; login sends no clear-text password', async ({ page, server }) => {
  const bodies = [];
  page.on('request', (r) => { if (r.url().includes('/api/auth/')) bodies.push(r.postData() || ''); });
  await login(page, server, 'admin', 'Init!alPass2026');
  await expect(page).toHaveURL(/change-password/);
  await page.getByLabel('Current password').fill('Init!alPass2026');
  await page.getByLabel('New password', { exact: true }).fill(ADMIN_PASSWORD);
  await page.getByLabel('Confirm new password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  expect(bodies.join(' ')).not.toContain('Init!alPass2026');
  expect(bodies.join(' ')).not.toContain(ADMIN_PASSWORD);
});

test('admin manages content end to end and changes appear on the website', async ({ page, server }) => {
  const errors = watchErrors(page);
  await login(page, server, 'admin', ADMIN_PASSWORD);
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();

  // Create a news item
  await page.locator('.admin-sidebar').getByRole('link', { name: 'Latest updates / news' }).click();
  await page.getByRole('link', { name: 'Add new' }).click();
  await page.locator('#f-date').fill('2026-10-16');
  await page.locator('#f-title').fill('E2E headline about quantum computing');
  await page.locator('#f-title-te').fill('క్వాంటమ్ కంప్యూటింగ్ వార్త');
  await page.locator('#f-category').selectOption('News');
  await page.locator('#f-link').fill('/media/events');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved and published.')).toBeVisible();

  // Upload an image into the news item
  await page.locator('input[type=file]').first().setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082', 'hex') });
  await expect(page.locator('#f-image')).toHaveValue(/^\/uploads\/[a-f0-9]{32}\.png$/);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved and published.')).toBeVisible();

  await page.goto('/');
  await expect(page.locator('.article-card', { hasText: 'E2E headline about quantum computing' })).toBeVisible();

  // Validation errors are shown
  await page.goto('/admin/c/news/new');
  await page.locator('#f-link').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Headline is required');
  await expect(page.getByRole('alert')).toContainText('Link must be');

  // Unpublish from the list
  await page.goto('/admin/c/news');
  const row = page.locator('tr', { hasText: 'E2E headline about quantum computing' });
  await row.getByRole('button', { name: 'Unpublish' }).click();
  await expect(row.locator('.badge')).toHaveText('draft');
  await page.goto('/');
  await expect(page.locator('.article-card', { hasText: 'E2E headline' })).toHaveCount(0);

  // Delete
  await page.goto('/admin/c/news');
  page.once('dialog', (d) => d.accept());
  await page.locator('tr', { hasText: 'E2E headline about quantum computing' }).getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Item deleted.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('admin edits a repeater (tender documents) and settings', async ({ page, server }) => {
  await login(page, server, 'admin', ADMIN_PASSWORD);
  await page.goto('/admin/c/tenders/new');
  await page.locator('#f-tenderNo').fill('DSTI/E2E/2026/001');
  await page.locator('#f-title').fill('E2E tender for lab equipment');
  await page.locator('#f-publishedDate').fill('2026-10-10');
  await page.locator('#f-closingDate').fill('2099-12-31');
  await page.getByRole('button', { name: 'Add documents' }).click();
  await page.locator('#documents-0-name').fill('Tender Document');
  await page.locator('#documents-0-file').fill('/uploads/seed/tenders/T-2026-018.pdf');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved and published.')).toBeVisible();
  await page.goto('/tenders?status=open');
  await expect(page.locator('article', { hasText: 'E2E tender for lab equipment' })).toBeVisible();

  await page.goto('/admin/settings/contact');
  await page.locator('#s-contact-phone').fill('+91 863 111 2222');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
  await page.goto('/contact');
  await expect(page.getByText('+91 863 111 2222').first()).toBeVisible();

  await page.goto('/admin/settings/home');
  await page.locator('#s-home-showStories').uncheck();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Science Stories' })).toHaveCount(0);

  // Restore the section so other tests see the default home page.
  await page.goto('/admin/settings/home');
  await page.locator('#s-home-showStories').check();
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
});

test('admin creates an editor; editor can only draft', async ({ page, server, browser }) => {
  await login(page, server, 'admin', ADMIN_PASSWORD);
  await page.goto('/admin/users');
  await page.getByRole('button', { name: 'Add user' }).click();
  await page.locator('#uu').fill('editor1');
  await page.locator('#un').fill('Content Editor');
  await page.locator('#ur').selectOption('Editor');
  await page.locator('#up').fill('Edit0r!Pass2026');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('User created.')).toBeVisible();

  const ctx = await browser.newContext();
  const ed = await ctx.newPage();
  await login(ed, server, 'editor1', 'Edit0r!Pass2026');
  await ed.getByLabel('Current password').fill('Edit0r!Pass2026');
  await ed.getByLabel('New password', { exact: true }).fill('N3w!EditorPass');
  await ed.getByLabel('Confirm new password').fill('N3w!EditorPass');
  await ed.getByRole('button', { name: 'Change password' }).click();
  await expect(ed.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  await expect(ed.getByRole('link', { name: 'Users & roles' })).toHaveCount(0);
  await ed.goto('/admin/c/faqs/new');
  await expect(ed.locator('#meta-status')).toBeDisabled();
  await ed.locator('#f-q').fill('Editor question?');
  await ed.locator('#f-a').fill('Editor answer.');
  await ed.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(ed.getByText('Saved as draft.')).toBeVisible();
  await ctx.close();
});

test('feedback inbox, analytics, audit log and backup pages work', async ({ page, server }) => {
  await login(page, server, 'admin', ADMIN_PASSWORD);
  for (const [link, heading] of [['Feedback inbox', 'Feedback inbox'], ['Visitor statistics', 'Visitor statistics'], ['Audit log', 'Audit log'], ['Backup & restore', 'Backup & restore'], ['Files & images', 'Files & images']]) {
    await page.locator('.admin-sidebar').getByRole('link', { name: link }).click();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }
  await page.locator('.admin-sidebar').getByRole('link', { name: 'Audit log' }).click();
  await expect(page.getByText('LOGIN_FAILED').first()).toBeVisible();
  await page.locator('.admin-sidebar').getByRole('link', { name: 'Backup & restore' }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download backup' }).click()]);
  expect(download.suggestedFilename()).toMatch(/^dsti-content-.*\.json$/);
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
});
