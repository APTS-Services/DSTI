import { expect, solveCaptcha, test, watchErrors } from './fixtures.js';

const ROUTES = [
  ['/', null],
  ['/about', 'About the Department'], ['/about/leadership', 'Leadership'], ['/about/mission', 'Vision & Mission'], ['/about/objectives', 'Objectives'],
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
  ['/media/gallery', 'Photo Gallery'], ['/contact', 'Contact Us'], ['/feedback', 'Feedback & Suggestions'],
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
  await expect(page.locator('.hero-leaders figure')).toHaveCount(3);
  await expect(page.locator('.hero-leaders')).toContainText('Chandrababu Naidu');
  await expect(page.getByRole('heading', { name: 'Photo Gallery' })).toBeVisible();
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
  await expect(page.locator('.nav-main > li')).toHaveCount(6);
  await page.getByRole('button', { name: 'Citizen Services' }).click();
  await page.locator('.mega.show').getByRole('link', { name: /Government Orders/ }).click();
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
  await page.getByRole('button', { name: 'Accessibility' }).click();
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
  await page.goto('/feedback');
  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByText('Please enter your name.')).toBeVisible();
  await expect(page.getByText('Please enter a valid e-mail address.')).toBeVisible();
  await page.locator('#fb-name').fill('Test Citizen');
  await page.locator('#fb-email').fill('citizen@example.com');
  await page.locator('#fb-message').fill('The website is very easy to use.');
  await page.locator('#fb-captcha').fill('wrong');
  await page.getByRole('button', { name: 'Send feedback' }).click();
  await expect(page.getByRole('alert')).toContainText('CAPTCHA');
});

test('feedback is submitted, counted on the dashboard and can be tracked', async ({ page, server }) => {
  const answer = await solveCaptcha(page, server, () => page.goto('/feedback'));
  await expect(page.getByRole('heading', { name: 'Feedback at a glance' })).toBeVisible();
  await expect(page.locator('.fb-tile')).toHaveCount(4);
  await page.locator('#fb-name').fill('Track Tester');
  await page.locator('#fb-email').fill('track@example.com');
  await page.locator('#fb-category').selectOption('Website');
  await page.locator('#fb-subject').fill('Gallery photos');
  await page.locator('#fb-message').fill('Please add more photographs of district events.');
  await page.locator('#fb-captcha').fill(answer);
  await page.getByRole('button', { name: 'Send feedback' }).click();
  const status = page.getByRole('status').filter({ hasText: 'Reference number' });
  await expect(status).toBeVisible();
  const reference = (await status.locator('.font-monospace').textContent()).trim();
  expect(reference).toMatch(/^FB-\d{5}$/);
  // The reference is filled in for tracking; the wrong e-mail is refused.
  await expect(page.locator('#tr-ref')).toHaveValue(reference);
  await page.locator('#tr-email').fill('other@example.com');
  await page.getByRole('button', { name: 'Check status' }).click();
  await expect(page.getByText('No feedback matches')).toBeVisible();
  await page.locator('#tr-email').fill('track@example.com');
  await page.getByRole('button', { name: 'Check status' }).click();
  await expect(page.locator('.track-result')).toContainText('Received');
  await expect(page.locator('.track-result')).toContainText('Gallery photos');
});

test('photo gallery: album filter and lightbox arrows, keyboard and close', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/media/gallery');
  const tiles = page.locator('.gallery-tile');
  await expect(tiles.first()).toBeVisible();
  const all = await tiles.count();
  expect(all).toBeGreaterThan(6);
  await page.locator('.chip', { hasText: 'Science outreach' }).click();
  expect(await tiles.count()).toBeLessThan(all);
  await page.locator('.chip', { hasText: 'All albums' }).click();
  await tiles.nth(0).click();
  const box = page.getByRole('dialog');
  await expect(box.locator('.lb-count')).toHaveText(`1 / ${all}`);
  await box.getByRole('button', { name: 'Next' }).click();
  await expect(box.locator('.lb-count')).toHaveText(`2 / ${all}`);
  await box.getByRole('button', { name: 'Previous' }).click();
  await box.getByRole('button', { name: 'Previous' }).click();
  await expect(box.locator('.lb-count')).toHaveText(`${all} / ${all}`);
  await page.keyboard.press('ArrowRight');
  await expect(box.locator('.lb-count')).toHaveText(`1 / ${all}`);
  await box.locator('.lb-thumbs button').nth(3).click();
  await expect(box.locator('.lb-count')).toHaveText(`4 / ${all}`);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('.gallery-tagline')).toBeVisible();
  expect(errors).toEqual([]);
});

test('every link in the menus, footer and sitemap opens a working page', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page.locator('.nav-main > li').first()).toBeVisible();
  await expect(page.locator('.site-footer a[href="/feedback"]')).toBeVisible();
  const fromMenu = await page.locator('.nav-main a, .mega a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const fromFooter = await page.locator('.site-footer a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  await page.goto('/sitemap');
  await expect(page.locator('main nav').first()).toBeVisible();
  const fromSitemap = await page.locator('main a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  const links = [...new Set([...fromMenu, ...fromFooter, ...fromSitemap])].filter((h) => h && h.startsWith('/'));
  expect(links.length).toBeGreaterThan(30);
  for (const href of links) {
    await page.goto(href);
    await expect(page.locator('main h1').first(), href).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Page not found' }), href).toHaveCount(0);
  }
  // Anchored links land on their section.
  await page.goto('/contact#officers');
  await expect(page.locator('#officers')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('leadership page and vision', async ({ page }) => {
  await page.goto('/about/leadership');
  await expect(page.locator('.leader-profile')).toHaveCount(3);
  await expect(page.getByText("Hon'ble Chief Minister")).toBeVisible();
  await page.goto('/about/mission');
  await expect(page.getByRole('heading', { name: 'Our vision' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Our mission' })).toBeVisible();
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
  await expect(page.getByRole('dialog', { name: 'Menu' })).toHaveCount(0);
  await page.goto('/media/gallery');
  await page.locator('.gallery-tile').first().click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('.lb-count')).toContainText('2 /');
  await page.getByRole('button', { name: 'Close' }).click();
  for (const path of ['/', '/tenders', '/contact', '/feedback', '/media/gallery', '/about/leadership', '/districts', '/ecitizen/government-orders']) {
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
