/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards (container block).
 * UE Model: card (fields: image [reference], text [richtext]).
 * Instances:
 *   1. .three-columns-companies — company logo cards (.companies-column items)
 *   2. #three-column-container .three-column-row — three-column cards (.bold-links items)
 * Generated: 2026-04-25
 */
export default function parse(element, { document }) {
  const cells = [];

  // Determine which instance we are parsing based on element classes/structure
  const isCompanyLogos = element.classList.contains('three-columns-companies');
  const isThreeColumnCards = element.classList.contains('three-column-row');

  let cardItems = [];

  if (isCompanyLogos) {
    // Instance 1: Company logo cards
    // Each .companies-column contains an image (logo) + text description
    cardItems = Array.from(element.querySelectorAll(':scope > .companies-column'));
  } else if (isThreeColumnCards) {
    // Instance 2: Three-column feature cards
    // Each .bold-links contains image + h2 + h3 + description + CTA link
    cardItems = Array.from(element.querySelectorAll(':scope > .bold-links'));
  } else {
    // Fallback: try both selectors
    cardItems = Array.from(element.querySelectorAll('.companies-column, .bold-links'));
  }

  cardItems.forEach((item) => {
    // --- Cell 1: Image with field hint ---
    const imgEl = item.querySelector('img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));

    if (imgEl) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = imgEl.getAttribute('src') || '';
      newImg.alt = imgEl.getAttribute('alt') || imgEl.getAttribute('title') || '';
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }

    // --- Cell 2: Text (richtext) with field hint ---
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (isCompanyLogos) {
      // Company logos: extract paragraph description and optional link
      const linkEl = item.querySelector('figure a, .wpb_wrapper > a');
      const descP = item.querySelector('.wpb_text_column .wpb_wrapper p');

      if (descP) {
        const p = document.createElement('p');
        p.textContent = descP.textContent.trim();
        textCell.appendChild(p);
      }
      if (linkEl && linkEl.getAttribute('href')) {
        const link = document.createElement('p');
        const a = document.createElement('a');
        a.href = linkEl.getAttribute('href');
        a.textContent = linkEl.getAttribute('href');
        link.appendChild(a);
        textCell.appendChild(link);
      }
    } else {
      // Three-column cards: extract h2, h3, description, and CTA link
      const h2El = item.querySelector('.three-col-card h2');
      const h3El = item.querySelector('.three-col-card h3');
      const descEl = item.querySelector('.three-col-excerpt .wpb_wrapper p, .three-col-excerpt p');
      const ctaEl = item.querySelector('.blue-link a');

      if (h2El) {
        const h2 = document.createElement('h2');
        h2.textContent = h2El.textContent.trim();
        textCell.appendChild(h2);
      }
      if (h3El) {
        const h3 = document.createElement('h3');
        h3.textContent = h3El.textContent.trim();
        textCell.appendChild(h3);
      }
      if (descEl) {
        const p = document.createElement('p');
        p.innerHTML = descEl.innerHTML.trim();
        textCell.appendChild(p);
      }
      if (ctaEl) {
        const linkP = document.createElement('p');
        const a = document.createElement('a');
        a.href = ctaEl.getAttribute('href') || '';
        a.textContent = ctaEl.textContent.trim();
        linkP.appendChild(a);
        textCell.appendChild(linkP);
      }
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
