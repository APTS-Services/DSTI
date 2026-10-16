import { expect, test, watchErrors } from './fixtures.js';

const ROUTES = [
  ['/', null],
  ['/about', 'About the Department'], ['/about/mission', 'Mission'], ['/about/objectives', 'Objectives'],
  ['/about/organisation', 'Organisation Structure'], ['/about/awards', 'Awards'],
  ['/organisations', 'Organisations'], ['/organisations/apsac', 'AP Space Applications Centre'],
  ['/districts', 'District Explorer'], ['/how-it-connects', 'How it all connects'],
  ['/ict', 'e-Governance'], ['/ict/projects', 'Projects & Initiatives'],
  ['/policies', 'Policies'], ['/policies/drone', 'Drone Policy'], ['/policies/semiconductor', 'Semiconductor'],
  ['/investors', "Investor's Corner"],
  ['/ecitizen', 'e-Citizen'], ['/ecitizen/rti', 'Right to Information'], ['/ecitizen/acts', 'Acts & Rules'],
  ['/ecitizen/government-orders', 'Government Orders'], ['/ecitizen/notifications', 'Notifications & Circulars'],
  ['/ecitizen/policies', 'Policies'], ['/ecitizen/guidelines', 'Guidelines'], ['/ecitizen/faqs', 'FAQs'],
  ['/ecitizen/useful-links', 'Useful Links'], ['/ecitizen/it-act-2000', 'IT Act 2000'], ['/ecitizen/posh-act', 'PoSH Act'],
  ['/tenders', 'Tender Notices'], ['/media', 'Media'], ['/media/science-stories', 'Science Stories'], ['/media/events', 'Events'],
  ['/contact', 'Contact Us'],
  ['/policies/website-policy', 'Website Policy'], ['/policies/privacy-policy', 'Privacy Policy'], ['/policies/terms-of-use', 'Terms of Use'],
  ['/policies/copyright', 'Copyright'], ['/policies/disclaimer', 'Disclaimer'], ['/policies/hyperlink-policy', 'Hyperlink Policy'],
  ['/policies/accessibility-statement', 'Accessibility Statement'], ['/screen-reader-access', 'Screen Reader Access'],
  ['/help', 'Help'], ['/sitemap', 'Sitemap'],
];

test('home page renders every section with one logo and no errors', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.locator('.hero .hero-title')).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('header.site-header img')).toHaveCount(1);
  await expect(page.locator('.ticker')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What brings you here?' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'News, Orders & Updates' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How it all connects' })).toBeVisible();
  await expect(page.getByText('This day in science')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Science Stories' })).toBeVisible();
  await expect(page.locator('.site-footer')).toContainText('Visitors');
  await page.mouse.wheel(0, 4000);
  await page.waitForTimeout(800);
  await expect(page.locator('.reveal.is-visible').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('every page in the requirement list opens with its title', async ({ page }) => {
  const errors = watchErrors(page);
  for (const [path, title] of ROUTES) {
    await page.goto(path);
    if (title) await expect(page.locator('h1').first(), path).toContainText(title);
    await expect(page.getByText('Page not found'), path).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test('unknown pages show a 404 page', async ({ page }) => {
  await page.goto('/no/such/page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await page.goto('/organisations/nothing');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('menu dropdowns navigate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'e-Citizen' }).click();
  await page.getByRole('link', { name: 'Government Orders' }).first().click();
  await expect(page).toHaveURL(/government-orders/);
  await expect(page.locator('h1')).toHaveText('Government Orders');
});

test('language switch translates the interface and content', async ({ page }) => {
  await page.goto('/about');
  await page.getByRole('button', { name: 'తెలుగు' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'te');
  await expect(page.locator('h1')).toHaveText('శాఖ పరిచయం');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('శాఖ పరిచయం');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('h1')).toHaveText('About the Department');
});

test('accessibility controls: text size, dark mode and high contrast', async ({ page }) => {
  await page.goto('/');
  const size = () => page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  const before = await size();
  await page.getByRole('button', { name: 'Increase text size' }).click();
  expect(parseFloat(await size())).toBeGreaterThan(parseFloat(before));
  await page.getByRole('button', { name: 'Reset text size' }).click();
  expect(await size()).toBe(before);
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
  await page.getByRole('button', { name: 'High contrast' }).click();
  await expect(page.locator('html')).toHaveClass(/hc/);
});

test('skip link moves focus to main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content/);
});

test('site-wide search finds policies, orders and tenders', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByPlaceholder('Search pages, policies, orders, tenders…').fill('drone');
  await expect(page.locator('.search-hit').first()).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/search\?q=drone/);
  await expect(page.locator('ol .dst-card').first()).toBeVisible();
  await page.goto('/search?q=G.O.Ms.No.42');
  await expect(page.getByText('Space-Tech Incubation Park').first()).toBeVisible();
});

test('Vigyan Mitra answers from site content and cites the source', async ({ page }) => {
  await page.goto('/');
  await page.locator('.assistant-launcher').click();
  const dialog = page.getByRole('dialog', { name: 'Ask Vigyan Mitra' });
  await dialog.getByPlaceholder('Type your question…').fill('How do I file an RTI request?');
  await dialog.getByRole('button', { name: 'Submit' }).click();
  await expect(dialog.getByText('Sources')).toBeVisible();
  await dialog.locator('.bubble.bot a').first().click();
  await expect(page).toHaveURL(/\/ecitizen/);
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('.assistant-launcher').click();
  await page.getByPlaceholder('Type your question…').fill('xyzzy plugh');
  await page.keyboard.press('Enter');
  await expect(page.getByText('I could not find an answer')).toBeVisible();
});

test('district explorer: map, keyboard and accessible table', async ({ page }) => {
  await page.goto('/districts');
  await page.locator('.district-map g[aria-label="Tirupati"]').click();
  await expect(page.locator('.dst-card h3')).toHaveText('Tirupati');
  await page.locator('.district-map g[aria-label="Kurnool"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.dst-card h3')).toHaveText('Kurnool');
  await page.getByRole('button', { name: 'Table view' }).click();
  await expect(page.locator('table tbody tr')).toHaveCount(26);
  await page.goto('/districts?district=guntur');
  await expect(page.locator('.dst-card h3')).toHaveText('Guntur');
});

test('tenders filter by status and download documents', async ({ page, request }) => {
  await page.goto('/tenders?status=closed');
  await expect(page.locator('article .pill.open')).toHaveCount(0);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  const total = await page.locator('article').count();
  expect(total).toBeGreaterThan(3);
  await page.getByPlaceholder('Search tenders…').fill('satellite');
  await expect(page.locator('article')).toHaveCount(1);
  const href = await page.locator('article a').first().getAttribute('href');
  const pdf = await request.get(href);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toBe('application/pdf');
});

test('document repository: search, filter, sort and PDF download', async ({ page, request }) => {
  await page.goto('/ecitizen/notifications');
  const rows = page.locator('table tbody tr');
  await expect(rows.first()).toBeVisible();
  const all = await rows.count();
  await page.locator('#doc-type').selectOption('circular');
  expect(await rows.count()).toBeLessThan(all);
  await page.locator('#doc-type').selectOption('');
  await page.locator('#doc-sort').selectOption('asc');
  const first = await rows.first().locator('td').nth(1).textContent();
  await page.locator('#doc-sort').selectOption('desc');
  expect(await rows.first().locator('td').nth(1).textContent()).not.toBe(first);
  const href = await rows.first().locator('a').getAttribute('href');
  expect((await request.get(href)).status()).toBe(200);
});

test('feedback form validates input and requires a correct CAPTCHA', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid e-mail address.')).toBeVisible();
  await page.getByLabel('Your name').fill('Test Citizen');
  await page.getByLabel('Email address').fill('citizen@example.com');
  await page.getByLabel('Your message').fill('The website is very easy to use.');
  await page.locator('#fb-captcha').fill('wrong');
  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByRole('alert')).toContainText('CAPTCHA');
});

test('responsive layout: mobile menu and no horizontal scroll @mobile', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Open main menu' }).click();
  const drawer = page.getByRole('dialog', { name: 'Menu' });
  await drawer.getByRole('button', { name: 'Media' }).click();
  await drawer.getByRole('link', { name: 'Events' }).click();
  await expect(page.locator('h1')).toHaveText('Events');
  for (const path of ['/tenders', '/contact', '/districts', '/ecitizen/government-orders']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), path).toBeLessThanOrEqual(1);
  }
});

test('SEO: titles, descriptions, sitemap and robots', async ({ page, request }) => {
  await page.goto('/policies/drone');
  await expect(page).toHaveTitle(/Drone Policy \| DSTI/);
  expect(await page.locator('meta[name="description"]').getAttribute('content')).toContain('drone');
  expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toContain('Drone Policy');
  const sm = await request.get('/sitemap.xml');
  expect(await sm.text()).toContain('/policies/drone');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
});
