/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns variant.
 * Base block: columns
 * Source: https://www.teradyne.com
 * Selector: .vc_custom_1750270793937
 * Generated: 2026-04-25
 *
 * Columns is a container block - NO field hinting comments required.
 * Extracts two equal columns, each containing icon image, heading, description, and link lists.
 */
export default function parse(element, { document }) {
  // Select the top-level column containers (two vc_col-sm-6 columns)
  const columnContainers = element.querySelectorAll(':scope > .wpb_column.vc_column_container');

  const cells = [];

  // Build one row with one cell per column
  const row = [];

  columnContainers.forEach((col) => {
    const cellContent = [];

    // Extract icon image from .header-icon
    const img = col.querySelector('.header-icon img');
    if (img) {
      cellContent.push(img);
    }

    // Extract heading from .header-header
    const heading = col.querySelector('.header-header h2, .header-header h3, .header-header h1');
    if (heading) {
      cellContent.push(heading);
    }

    // Extract description paragraph(s)
    const paragraphs = col.querySelectorAll('.wpb_text_column p');
    paragraphs.forEach((p) => {
      if (p.textContent.trim()) {
        cellContent.push(p);
      }
    });

    // Extract all bullet lists (may be split across inner columns)
    const lists = col.querySelectorAll('ul.two-column-bullets');
    if (lists.length > 1) {
      // Merge multiple lists into a single ul for cleaner output
      const mergedList = document.createElement('ul');
      lists.forEach((ul) => {
        const items = ul.querySelectorAll('li');
        items.forEach((li) => {
          mergedList.appendChild(li.cloneNode(true));
        });
      });
      cellContent.push(mergedList);
    } else if (lists.length === 1) {
      cellContent.push(lists[0]);
    }

    row.push(cellContent);
  });

  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
