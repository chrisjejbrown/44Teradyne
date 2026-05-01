/* eslint-disable */
/* global WebImporter */

import heroBannerParser from './parsers/hero-banner.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';

import cleanupTransformer from './transformers/teradyne-cleanup.js';
import sectionsTransformer from './transformers/teradyne-sections.js';

const parsers = {
  'hero-banner': heroBannerParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'carousel': carouselParser,
};

const PAGE_TEMPLATE = {
  name: 'homepage',
  urls: [
    'https://www.teradyne.com'
  ],
  description: 'Teradyne corporate homepage with hero banner, product highlights, and company information',
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.masked-video-row']
    },
    {
      name: 'columns',
      instances: ['.vc_custom_1750270793937']
    },
    {
      name: 'cards',
      instances: ['.three-columns-companies', '#three-column-container .three-column-row']
    },
    {
      name: 'carousel',
      instances: ['.wpsisac-slick-carousal-wrp']
    }
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Section',
      selector: '.masked-video-row',
      style: 'dark-gradient',
      blocks: ['hero-banner'],
      defaultContent: []
    },
    {
      id: 'section-2-features',
      name: 'Two-Column Features',
      selector: '.vc_custom_1750270793937',
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-3-companies',
      name: 'Teradyne Companies',
      selector: '.vc_custom_1750270777936',
      style: null,
      blocks: ['cards'],
      defaultContent: ['.teradyne-companies', '.we-solve h2']
    },
    {
      id: 'section-4-events',
      name: 'Events Carousel',
      selector: '#slider-row',
      style: 'light-grey',
      blocks: ['carousel'],
      defaultContent: ['#slider-row .teradyne-companies']
    },
    {
      id: 'section-5-cards',
      name: 'Three-Column Cards',
      selector: '#three-column-container',
      style: null,
      blocks: ['cards'],
      defaultContent: []
    }
  ]
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // Map local hash-based image paths back to original source URLs
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

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
