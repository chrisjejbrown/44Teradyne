/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel variant.
 * Base block: carousel (container block with carousel-item children).
 * Source: https://www.teradyne.com
 * Selector: .wpsisac-slick-carousal-wrp
 *
 * UE Model (carousel-item):
 *   - media_image (reference) + media_imageAlt (collapsed into alt attribute)
 *   - content_text (richtext)
 *
 * Each .wpsisac-image-slide becomes one row with two cells:
 *   Cell 1 (media_ group): <!-- field:media_image --><picture><img src="..." alt="..."></picture>
 *   Cell 2 (content_ group): <!-- field:content_text --><p>link or text</p>
 */
export default function parse(element, { document }) {
  // Find all slide elements within the carousel wrapper
  const slides = element.querySelectorAll('.wpsisac-image-slide');

  const cells = [];

  slides.forEach((slide) => {
    // --- Cell 1: media_ group (media_image with collapsed media_imageAlt) ---
    const img = slide.querySelector('img');
    const mediaCell = document.createDocumentFragment();
    mediaCell.appendChild(document.createComment(' field:media_image '));

    if (img) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src || img.getAttribute('src') || '';
      newImg.alt = img.alt || img.getAttribute('alt') || '';
      picture.appendChild(newImg);
      mediaCell.appendChild(picture);
    }

    // --- Cell 2: content_ group (content_text as richtext) ---
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_text '));

    const link = slide.querySelector('a');
    if (link) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.href || link.getAttribute('href') || '';
      // Use the image alt text as link text since the source link wraps only an image
      const linkText = (img && (img.alt || img.getAttribute('alt'))) || '';
      a.textContent = linkText;
      p.appendChild(a);
      contentCell.appendChild(p);
    }

    cells.push([mediaCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
