/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-banner
 * Base block: hero-banner
 * Source selector: .masked-video-row
 * Source: https://www.teradyne.com
 *
 * xwalk model fields (id: hero-banner):
 *   image (reference) - collapsed with alt
 *   eyebrow (text)
 *   title (text)
 *   body (richtext)
 *   primaryLink (aem-content) - collapsed with primaryLabel
 *   secondaryLink (aem-content) - collapsed with secondaryLabel
 *
 * Target table structure (6 rows):
 *   Row 1: image (picture element with alt from collapsed alt field)
 *   Row 2: eyebrow text
 *   Row 3: title (h1/h2 heading)
 *   Row 4: body (richtext paragraph)
 *   Row 5: primaryLink (anchor with collapsed primaryLabel as text)
 *   Row 6: secondaryLink (anchor with collapsed secondaryLabel as text)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: image field
  // Source has an img inside .wistia_click_to_play or .trigger-popup, and background via .upb_row_bg
  // Use the visible image from the play button area, or fallback to any img in the element
  const imageContainer = document.createElement('div');
  const fieldHintImage = document.createComment(' field:image ');
  imageContainer.append(fieldHintImage);

  const img = element.querySelector('.wistia_click_to_play img, .trigger-popup img, img.lazyloaded, img');
  if (img) {
    // Clone the image and ensure alt is set (collapsed alt field)
    const imgClone = img.cloneNode(true);
    if (!imgClone.getAttribute('alt')) {
      imgClone.setAttribute('alt', '');
    }
    // Wrap in picture element for EDS compatibility
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.setAttribute('srcset', imgClone.getAttribute('src') || '');
    picture.append(source);
    picture.append(imgClone);
    imageContainer.append(picture);
  }
  cells.push([imageContainer]);

  // Row 2: eyebrow field
  // Source does not have explicit eyebrow text, but the row must exist for xwalk
  const eyebrowContainer = document.createElement('div');
  const fieldHintEyebrow = document.createComment(' field:eyebrow ');
  eyebrowContainer.append(fieldHintEyebrow);

  const eyebrow = element.querySelector('.eyebrow, [class*="eyebrow"], [class*="kicker"], [class*="overline"]');
  if (eyebrow) {
    eyebrowContainer.append(eyebrow.cloneNode(true));
  }
  cells.push([eyebrowContainer]);

  // Row 3: title field
  // Source has h1 "Powering the Pursuit of Innovation" inside .masked-video-text-column
  const titleContainer = document.createElement('div');
  const fieldHintTitle = document.createComment(' field:title ');
  titleContainer.append(fieldHintTitle);

  const title = element.querySelector('.masked-video-text-column h1, .masked-video-text-column h2, h1, h2');
  if (title) {
    titleContainer.append(title.cloneNode(true));
  }
  cells.push([titleContainer]);

  // Row 4: body field (richtext)
  // Source has a p element "We excel in innovative test solutions and advanced robotics"
  const bodyContainer = document.createElement('div');
  const fieldHintBody = document.createComment(' field:body ');
  bodyContainer.append(fieldHintBody);

  const heading = element.querySelector('.masked-video-text-column h1, .masked-video-text-column h2, h1, h2');
  const bodyParagraphs = element.querySelectorAll('.masked-video-text-column .wpb_text_column p, .masked-video-text-column p');
  if (bodyParagraphs.length > 0) {
    bodyParagraphs.forEach((p) => {
      // Skip if the paragraph is actually inside or is the heading
      if (heading && heading.contains(p)) return;
      bodyContainer.append(p.cloneNode(true));
    });
  }
  cells.push([bodyContainer]);

  // Row 5: primaryLink field (collapsed with primaryLabel as link text)
  // Source does not have explicit CTA links (only a video popover trigger)
  // Row must exist for xwalk even if empty
  const primaryLinkContainer = document.createElement('div');
  const fieldHintPrimaryLink = document.createComment(' field:primaryLink ');
  primaryLinkContainer.append(fieldHintPrimaryLink);

  // Look for CTA-style links (not the video trigger popup)
  const allLinks = Array.from(element.querySelectorAll('a'));
  const ctaLinks = allLinks.filter((a) => {
    const href = a.getAttribute('href') || '';
    const cls = a.getAttribute('class') || '';
    // Exclude video popup triggers and empty/hash-only links
    if (cls.includes('trigger-popup') || cls.includes('wistia')) return false;
    if (href === '#' || href === '') return false;
    return true;
  });

  if (ctaLinks.length > 0) {
    const primaryLink = ctaLinks[0].cloneNode(true);
    primaryLinkContainer.append(primaryLink);
  }
  cells.push([primaryLinkContainer]);

  // Row 6: secondaryLink field (collapsed with secondaryLabel as link text)
  // Row must exist for xwalk even if empty
  const secondaryLinkContainer = document.createElement('div');
  const fieldHintSecondaryLink = document.createComment(' field:secondaryLink ');
  secondaryLinkContainer.append(fieldHintSecondaryLink);

  if (ctaLinks.length > 1) {
    const secondaryLink = ctaLinks[1].cloneNode(true);
    secondaryLinkContainer.append(secondaryLink);
  }
  cells.push([secondaryLinkContainer]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
