#!/usr/bin/env node
// Run against the local mock + webpack preview. No production credentials needed.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const origin = process.env.COLLABS_PREVIEW_URL || 'http://localhost:3000';
const shots = path.resolve(__dirname, '../.preview-shots');
const menuOrder = ['About', 'Tattoo', 'Flash', 'Ceramics', 'Collaborations', 'Shop', 'Contact'];

async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth
  }));
  assert.equal(sizes.document, sizes.viewport, `document overflow: ${JSON.stringify(sizes)}`);
  assert.equal(sizes.body, sizes.viewport, `body overflow: ${JSON.stringify(sizes)}`);
}

// Composite the text and ancestor backgrounds/opacity as painted, rather than
// assuming that a transparent note sits directly on the theme's background.
async function paintedColors(locator) {
  return locator.evaluate(element => {
    function rgba(value) {
      const match = value.match(/^rgba?\(([^)]+)\)$/);
      if (!match) throw new Error(`Unsupported computed colour: ${value}`);
      const parts = match[1].split(/[\s,/]+/).map(Number);
      return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    }
    function over(front, back) {
      const alpha = front[3] + back[3] * (1 - front[3]);
      if (!alpha) return [0, 0, 0, 0];
      return [...front.slice(0, 3).map((channel, i) =>
        (channel * front[3] + back[i] * back[3] * (1 - front[3])) / alpha), alpha];
    }
    let foreground = rgba(getComputedStyle(element).color);
    let background = [0, 0, 0, 0];
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage !== 'none' || style.filter !== 'none' || style.mixBlendMode !== 'normal') {
        throw new Error('Contrast check needs a solid background without filters or blending');
      }
      const surface = rgba(style.backgroundColor);
      foreground = over(foreground, surface);
      background = over(background, surface);
      foreground[3] *= Number(style.opacity);
      background[3] *= Number(style.opacity);
    }
    // The browser's default canvas is white if all ancestors are transparent.
    foreground = over(foreground, [255, 255, 255, 1]);
    background = over(background, [255, 255, 255, 1]);
    const luminance = color => color.slice(0, 3).map(channel => {
      const s = channel / 255;
      return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
    }).reduce((sum, channel, i) => sum + channel * [.2126, .7152, .0722][i], 0);
    const light = luminance(foreground), dark = luminance(background);
    return {
      foreground: foreground.slice(0, 3), background: background.slice(0, 3),
      contrast: (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05)
    };
  });
}

async function noteContrast(page, theme) {
  const notes = page.locator('.collab-note');
  assert.ok(await notes.count(), 'Fixture must include a note for the contrast check');
  for (const note of await notes.all()) {
    const colors = await paintedColors(note);
    const expectedBackground = theme === 'dark' ? [18, 18, 18] : [255, 255, 255];
    assert.deepEqual(colors.background, expectedBackground, `${theme}: note must sit on the site theme background`);
    assert.ok(colors.contrast >= 4.5, `${theme}: note contrast ${colors.contrast.toFixed(2)}:1 is below WCAG AA 4.5:1; ${JSON.stringify(colors)}`);
    console.log(`PASS ${theme} note contrast ${colors.contrast.toFixed(2)}:1; background rgb(${colors.background.join(', ')})`);
  }
}

async function openMenu(page) {
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  if (await toggle.isVisible() && await toggle.getAttribute('aria-expanded') !== 'true') {
    await toggle.click();
    await page.waitForFunction(() => document.querySelector('.navbar-collapse')?.classList.contains('show'));
  }
}

async function galleryReady(page) {
  await page.waitForFunction(() => document.querySelectorAll('.collab-photo').length === 7);
  assert.deepEqual(await page.locator('main section h2').allTextContents(), ['Collab with Studio X', 'Quiet objects']);
  assert.equal(await page.getByText('Hidden collaboration', { exact: true }).count(), 0);
  assert.equal(await page.locator('main section').nth(0).locator('.collab-photo').count(), 5);
  assert.equal(await page.locator('main section').nth(1).locator('.collab-photo').count(), 2);
  assert.equal(await page.locator('main section').nth(1).locator('.collab-note, .collab-link').count(), 0);
  const link = page.locator('.collab-link');
  assert.equal(await link.innerText(), 'instagram.com/studiox ↗');
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
  assert.equal(await page.locator('.collab-photo img[loading="lazy"]').count(), 7);
}

async function swipe(page, from, to) {
  const viewer = page.getByRole('dialog');
  await viewer.dispatchEvent('touchstart', { touches: [{ identifier: 1, clientX: from, clientY: 400 }] });
  await viewer.dispatchEvent('touchend', { changedTouches: [{ identifier: 1, clientX: to, clientY: 405 }] });
}

async function main() {
  await fs.mkdir(shots, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  try {
    for (const [width, height] of [[390, 844], [1440, 900]]) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme: theme, hasTouch: width === 390 });
        await context.addInitScript(value => localStorage.setItem('theme', value), theme);
        const page = await context.newPage();
        page.on('pageerror', error => failures.push(`${width}/${theme}: ${error.message}`));
        await page.goto(`${origin}/collaborations`);
        await galleryReady(page);
        await page.waitForFunction(value => document.querySelector('.flex-container')?.dataset.bsTheme === value, theme);
        // Check immediately after the theme is active: waiting out the body's
        // colour animation would hide the grey-background regression.
        await noteContrast(page, theme);
        await openMenu(page);
        assert.deepEqual(await page.locator('.navbar-nav .nav-link').allTextContents(), menuOrder);
        for (const item of await page.locator('.navbar-nav .nav-link').all()) assert.ok(await item.isVisible());
        await noOverflow(page);
        if (width === 390) {
          await page.screenshot({ path: path.join(shots, `menu-${width}-${theme}.png`), fullPage: true });
          await page.getByRole('button', { name: 'Toggle navigation' }).click();
          await page.waitForFunction(() => !document.querySelector('.navbar-collapse')?.classList.contains('collapsing'));
        }
        // Load all lazy images before capturing the full gallery.
        await page.locator('.collab-photo').last().scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('.collab-photo img')].every(image => image.complete && image.naturalWidth > 0));
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: path.join(shots, `collabs-${width}-${theme}.png`), fullPage: true });
        const firstPhoto = page.locator('.collab-photo').first();
        await firstPhoto.click();
        const dialog = page.getByRole('dialog');
        await dialog.waitFor();
        assert.equal(await dialog.locator('[role="status"]').innerText(), '1 / 5');
        await page.waitForFunction(() => document.querySelector('[role="dialog"] img')?.naturalWidth > 0);
        await noOverflow(page);
        await page.screenshot({ path: path.join(shots, `viewer-${width}-${theme}.png`) });
        await dialog.getByRole('button', { name: 'Next photo', exact: true }).click();
        assert.equal(await dialog.locator('[role="status"]').innerText(), '2 / 5');
        await page.keyboard.press('ArrowRight');
        assert.equal(await dialog.locator('[role="status"]').innerText(), '3 / 5');
        await page.keyboard.press('ArrowLeft');
        await dialog.getByRole('button', { name: 'Previous photo', exact: true }).click();
        assert.equal(await dialog.locator('[role="status"]').innerText(), '1 / 5');
        if (width === 390) {
          await swipe(page, 310, 80);
          assert.equal(await dialog.locator('[role="status"]').innerText(), '2 / 5');
          await swipe(page, 80, 310);
          assert.equal(await dialog.locator('[role="status"]').innerText(), '1 / 5');
        }
        await page.keyboard.press('Escape');
        await dialog.waitFor({ state: 'detached' });
        assert.ok(await firstPhoto.evaluate(node => node === document.activeElement));
        await page.locator('main section').nth(1).locator('.collab-photo').first().click();
        await dialog.waitFor();
        await page.keyboard.press('ArrowLeft');
        assert.equal(await dialog.locator('[role="status"]').innerText(), '2 / 2');
        await dialog.getByRole('button', { name: 'Close full-screen photos' }).click();
        await dialog.waitFor({ state: 'detached' });
        await noOverflow(page);
        if (width === 1440 && theme === 'dark') {
          for (const route of ['/tattoo', '/flash', '/ceramics']) {
            await page.goto(`${origin}${route}`);
            await page.waitForFunction(() => document.querySelector('.flex-container')?.dataset.bsTheme === 'dark');
            // Inspect the page surface itself; Tattoo/Ceramics animate text opacity.
            const colors = await paintedColors(page.locator('main'));
            assert.deepEqual(colors.background, [18, 18, 18], `${route}: dark page background differs from Collaborations`);
          }
          console.log('PASS dark background matches /tattoo, /flash, /ceramics');
        }
        console.log(`PASS ${width}×${height} ${theme}: menu order, sections, full-screen controls, no overflow`);
        await context.close();
      }
    }
    const page = await browser.newPage({ viewport: { width: 320, height: 900 } });
    page.on('pageerror', error => failures.push(error.message));
    await page.goto(`${origin}/collaborations`);
    await galleryReady(page);
    for (const width of [320, 768, 992, 993, 1100, 1199, 1200, 1280, 1399, 1400, 1600, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await openMenu(page);
      await noOverflow(page);
      if (width >= 1200) {
        const layout = await page.locator('.navbar-nav .nav-link').evaluateAll(nodes => nodes.map(node => {
          const rect = node.getBoundingClientRect();
          return { top: rect.top, left: rect.left, right: rect.right };
        }));
        assert.ok(layout.every(rect => Math.abs(rect.top - layout[0].top) < 1), `menu wrapped at ${width}px`);
        assert.ok(layout.every(rect => rect.left >= 0 && rect.right <= width), `menu outside viewport at ${width}px`);
        const iconStart = await page.locator('.nav-icons').evaluate(node => node.getBoundingClientRect().left);
        assert.ok(layout.at(-1).right <= iconStart + 1, `menu overlaps icons at ${width}px`);
      }
    }
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(origin);
    assert.deepEqual(await page.locator('.home-links a').allTextContents().then(texts => texts.map(value => value.trim())), menuOrder);
    assert.ok(await page.locator('.home-links a').evaluateAll(nodes => {
      const photo = document.querySelector('.home-photo').getBoundingClientRect();
      return nodes.every(node => { const r = node.getBoundingClientRect(); return r.left >= photo.left && r.right <= photo.right && r.top >= photo.top && r.bottom <= photo.bottom; });
    }));
    await noOverflow(page);
    await page.screenshot({ path: path.join(shots, 'home-320.png'), fullPage: true });
    console.log('PASS 320–1920px: overflow, header breakpoints, home links inside photo');

    let mode = 'loading';
    let release;
    const loading = new Promise(resolve => { release = resolve; });
    await page.route('**/api/collabs', async route => {
      if (mode === 'loading') await loading;
      await route.fulfill({ status: mode === 'error' ? 500 : 200, contentType: 'application/json', body: JSON.stringify(mode === 'error' ? { success: false, error: 'Offline' } : { success: true, data: [] }) });
    });
    await page.goto(`${origin}/collaborations`);
    await page.getByText('Loading collaborations…', { exact: true }).waitFor();
    release();
    await page.getByText('Collaborations coming soon', { exact: true }).waitFor();
    mode = 'error';
    await page.reload();
    await page.getByRole('alert').waitFor();
    mode = 'empty';
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.getByText('Collaborations coming soon', { exact: true }).waitFor();
    assert.deepEqual(failures, [], 'Browser page errors');
    console.log('PASS loading, error/retry, empty states; 0 page errors');
    console.log(`Screenshots: ${shots}`);
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
