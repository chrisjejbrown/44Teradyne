# Cards Parser Image Fix Plan

## Problem Analysis

The cards parser at line 37-48 extracts images using:
```js
const imgEl = item.querySelector('img');
newImg.src = imgEl.getAttribute('src') || '';
```

In the **cleaned HTML** (from the scrape step), image `src` values are local paths like `./images/a533ca5bbefa628afc8a5713352f36ae.png`. These were saved during scraping when original URLs (e.g., `https://cdn-ilehcci.nitrocdn.com/.../TeradyneLifestyle255705-1.jpg`) were replaced with local references.

However, when the import runs via the **bulk import script against the live page** (not the local HTML), the image `src` should be the actual live URLs. The problem is:

1. **When importing via local HTTP server**: The DOM has `./images/<hash>.png` paths. The `WebImporter.rules.adjustImageUrls(main, url, params.originalURL)` call at line 159 is supposed to convert relative URLs to absolute using `params.originalURL` as the base. But since `params.originalURL` points to `https://www.teradyne.com` and the page was served from `http://localhost:8765`, the relative `./images/` path resolves to `http://localhost:8765/images/<hash>.png` — which is not accessible from AEM.

2. **The parser itself is correct** — it properly extracts `img.src`. The issue is upstream: the bulk import was run against our local server serving the cleaned HTML (because the live site returns 403). The cleaned HTML has hash-based local paths instead of the original source URLs.

## Root Cause

The scrape step replaces all original image URLs with local `./images/<hash>.png` paths in `cleaned.html`. When the import runs against this local HTML, the parser captures these local paths. The `adjustImageUrls` helper can't map them back to the original source URLs because it only converts relative to absolute based on the page URL — it doesn't reverse the scraper's URL mapping.

## Fix

Update the **import script** (not the parser) to include a post-processing step that maps local hash-based image paths back to their original absolute URLs using the metadata.json mapping. This keeps parsers simple and handles all blocks uniformly.

The canonical source paths are derived by stripping the CDN prefix from the nitrocdn URLs:
- CDN: `https://cdn-ilehcci.nitrocdn.com/.../www.teradyne.com/wp-content/uploads/2025/10/TeradyneLifestyle255705-1.jpg`
- Canonical: `https://www.teradyne.com/wp-content/uploads/2025/10/TeradyneLifestyle255705-1.jpg`

## Checklist

- [ ] Update `tools/importer/import-homepage.js` to include an IMAGE_MAP constant with hash→original URL mappings
- [ ] Add a post-transform step after `adjustImageUrls` that replaces hash-based image paths with original source URLs
- [ ] Re-bundle the import script
- [ ] Re-run the import to generate updated `content/index.plain.html` with correct absolute image URLs
- [ ] Verify all 11 images in the output HTML have valid `https://www.teradyne.com/wp-content/uploads/...` URLs
- [ ] Update `aem-deployment-package/content/teradyne/index.plain.html` with the fixed content
- [ ] Commit and push the fix

## Implementation Detail

Add to `import-homepage.js` after `WebImporter.rules.adjustImageUrls(main, url, params.originalURL)`:

```js
const IMAGE_MAP = {
  'a533ca5bbefa628afc8a5713352f36ae': 'https://www.teradyne.com/wp-content/uploads/2025/10/TeradyneLifestyle255705-1.jpg',
  '9e2af5b6f67309172c32bc9461ec7e11': 'https://www.teradyne.com/wp-content/uploads/2025/07/latest-blog-header.jpg',
  '38fae5974fe1784c111cc439e8ca56d4': 'https://www.teradyne.com/wp-content/uploads/2025/07/homeimage-cropped.jpg',
  '1aa9c4f724daf8fb365ace6e1e3ec837': 'https://www.teradyne.com/wp-content/uploads/2026/02/AAS-2026-web-graphic-1.png',
  '8725db7d56938f0f2f233067fd8a9b2a': 'https://embed-ssl.wistia.com/deliveries/8abfdb977b7ac0f3bd3f34b40ba9911c89a5289b.webp?image_crop_resized=1280x720',
  'f273cd86f0712a4dff9dfa70c8b3467a': 'https://www.teradyne.com/wp-content/uploads/2025/07/circuit-icon.svg',
  '0062ba123c2e0bfe6659e619e03f7718': 'https://www.teradyne.com/wp-content/uploads/2025/07/robot-icon.svg',
  'de5ef0679a5d28be85228a4d8b641d5a': 'https://www.teradyne.com/wp-content/uploads/2025/07/mir-logo.svg',
  '00e775e1526d8dbf732fd3fd0941693c': 'https://www.teradyne.com/wp-content/uploads/2025/07/ur-logo.svg',
  'edf71a67375c8c2422f77c142c27ba6b': 'https://www.teradyne.com/wp-content/uploads/2025/07/litepoint-logo.svg',
  '9cac75cd345d730641246da46ca3a602': 'https://www.teradyne.com/wp-content/uploads/2025/07/quantifi-photonics-logo-final.svg',
};

main.querySelectorAll('img').forEach((img) => {
  const src = img.getAttribute('src') || '';
  for (const [hash, originalUrl] of Object.entries(IMAGE_MAP)) {
    if (src.includes(hash)) {
      img.setAttribute('src', originalUrl);
      break;
    }
  }
});
```

---

**Status:** Ready for execution. Switch to Execute mode to implement.
