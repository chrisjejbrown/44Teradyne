import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SCRIPTS_DIR = '/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts';
const helixImporterScript = readFileSync(join(SCRIPTS_DIR, 'static/inject/helix-importer.js'), 'utf8');
const importScriptContent = readFileSync(resolve('tools/importer/import-homepage.bundle.js'), 'utf8');
const localHtml = readFileSync(resolve('migration-work/cleaned.html'), 'utf8');

async function injectScript(page, scriptContent) {
  await page.evaluate(script => {
    const s = document.createElement('script');
    s.textContent = `window.CustomImportScript = {}; (function(){ ${script} \n window.CustomImportScript.default = typeof _default !== 'undefined' ? _default : (typeof exportDefault !== 'undefined' ? exportDefault : null); })();`;
    document.head.appendChild(s);
  }, scriptContent);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // Intercept the URL and serve local HTML
  await page.route('https://www.teradyne.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: `<!DOCTYPE html><html><head><title>The leader in semiconductor test &amp; robotics</title>
<meta property="og:title" content="The leader in semiconductor test & robotics">
<meta property="og:description" content="Teradyne offers cutting-edge technological solutions for modern problems through innovation expertise.">
<meta property="og:image" content="https://www.teradyne.com/wp-content/uploads/2020/01/semi-test-AI-chip.jpg">
<meta name="description" content="Teradyne offers cutting-edge technological solutions for modern problems through innovation expertise. Stay connected with Teradyne's offerings. Learn more.">
</head>${localHtml}</html>`
    });
  });

  try {
    await page.goto('https://www.teradyne.com', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Inject Helix importer
    await page.evaluate(script => {
      const s = document.createElement('script');
      s.textContent = script;
      document.head.appendChild(s);
    }, helixImporterScript);

    // Inject import script
    await page.evaluate(script => {
      const fn = new Function('exports', 'module', script + '\n; return typeof _default !== "undefined" ? _default : module.exports.default || module.exports;');
      const mod = { exports: {} };
      const result = fn(mod.exports, mod);
      window.CustomImportScript = { default: result };
    }, importScriptContent);

    await page.waitForFunction(
      () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
      { timeout: 10000 }
    );

    const result = await page.evaluate(async (pageUrl) => {
      const customImportConfig = window.CustomImportScript?.default;
      if (!customImportConfig) throw new Error('CustomImportScript not available');

      const result = await window.WebImporter.html2md(pageUrl, document, customImportConfig, {
        toDocx: false,
        toMd: true,
        originalURL: pageUrl
      });
      result.html = window.WebImporter.md2da(result.md);
      return result;
    }, 'https://www.teradyne.com');

    // Save the HTML output
    mkdirSync(resolve('content'), { recursive: true });
    if (result.html) {
      writeFileSync(resolve('content/index.plain.html'), result.html);
      console.log('✅ Saved content/index.plain.html (' + result.html.length + ' bytes)');
    }
    if (result.md) {
      writeFileSync(resolve('content/index.md'), result.md);
      console.log('✅ Saved content/index.md (' + result.md.length + ' bytes)');
    }

    // Log report data
    const report = result.report || {};
    console.log('Report:', JSON.stringify(report, null, 2));

  } catch (e) {
    console.error('Import failed:', e.message);
    // Log console messages
    page.on('console', msg => console.log('[Browser]', msg.text()));
  } finally {
    await browser.close();
  }
})();
