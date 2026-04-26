/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Teradyne sections.
 * Inserts section breaks (<hr>) and Section Metadata blocks based on template sections.
 * Only runs when template has 2+ sections defined in page-templates.json.
 *
 * Section selectors validated against migration-work/cleaned.html captured DOM:
 *   - .masked-video-row (line 2161): Hero Section
 *   - .vc_custom_1750270793937 (line 2190): Two-Column Features
 *   - .vc_custom_1750270777936 (line 2242): Teradyne Companies
 *   - #slider-row (line 2281): Events Carousel
 *   - #three-column-container (line 2294): Three-Column Cards
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { template } = payload;
    if (!template || !template.sections || template.sections.length < 2) return;

    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
    const sections = template.sections;

    // Process sections in reverse order to avoid offset issues when inserting elements
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;

      // Add Section Metadata block after the section element if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before each section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
