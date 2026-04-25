const { readFileSync, mkdirSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const { JSDOM } = require('jsdom');

const localHtml = readFileSync(resolve('migration-work/cleaned.html'), 'utf8');

// Build a full HTML document
const fullHtml = `<!DOCTYPE html><html><head>
<title>The leader in semiconductor test &amp; robotics</title>
<meta property="og:title" content="The leader in semiconductor test & robotics">
<meta property="og:description" content="Teradyne offers cutting-edge technological solutions for modern problems through innovation expertise.">
<meta property="og:image" content="https://www.teradyne.com/wp-content/uploads/2020/01/semi-test-AI-chip.jpg">
<meta name="description" content="Teradyne offers cutting-edge technological solutions for modern problems through innovation expertise. Stay connected with Teradyne's offerings. Learn more.">
</head>${localHtml}</html>`;

const dom = new JSDOM(fullHtml);
const document = dom.window.document;

// Load parsers
const heroBannerParser = require(resolve('tools/importer/parsers/hero-banner.js'));
const columnsParser = require(resolve('tools/importer/parsers/columns.js'));
const cardsParser = require(resolve('tools/importer/parsers/cards.js'));
const carouselParser = require(resolve('tools/importer/parsers/carousel.js'));

// Load transformers
const cleanupTransformer = require(resolve('tools/importer/transformers/teradyne-cleanup.js'));
const sectionsTransformer = require(resolve('tools/importer/transformers/teradyne-sections.js'));

console.log('Loaded all parsers and transformers');

// Check which selectors match
const selectors = {
  'hero-banner': ['.masked-video-row'],
  'columns': ['.vc_custom_1750270793937'],
  'cards': ['.three-columns-companies', '#three-column-container .three-column-row'],
  'carousel': ['.wpsisac-slick-carousal-wrp']
};

for (const [name, sels] of Object.entries(selectors)) {
  for (const sel of sels) {
    const els = document.querySelectorAll(sel);
    console.log(`  ${name} (${sel}): ${els.length} matches`);
  }
}
