function textValue(el) {
  return (el?.textContent || '').trim();
}

function firstElement(node) {
  return node?.firstElementChild || node;
}

function createButton(href, label, variant = 'primary') {
  if (!href || !label) return null;

  const a = document.createElement('a');
  a.className = `hero-banner__button hero-banner__button--${variant}`;
  a.href = href;
  a.textContent = label;
  return a;
}

function normalizeImage(wrapper, altText) {
  const picture = wrapper?.querySelector('picture');
  if (!picture) return null;

  const cloned = picture.cloneNode(true);
  const img = cloned.querySelector('img');

  if (img) {
    if (altText) img.alt = altText;
    img.loading = 'eager';
    img.decoding = 'async';
  }

  return cloned;
}

export default function decorate(block) {
  const rows = [...block.children].map(firstElement);

  const [
    imageRow,
    altRow,
    eyebrowRow,
    titleRow,
    bodyRow,
    primaryLinkRow,
    primaryLabelRow,
    secondaryLinkRow,
    secondaryLabelRow,
  ] = rows;

  const imageAlt = textValue(altRow);
  const eyebrow = textValue(eyebrowRow);
  const title = textValue(titleRow);
  const primaryLink = textValue(primaryLinkRow);
  const primaryLabel = textValue(primaryLabelRow);
  const secondaryLink = textValue(secondaryLinkRow);
  const secondaryLabel = textValue(secondaryLabelRow);

  const media = normalizeImage(imageRow, imageAlt);
  const bodyContent = bodyRow?.innerHTML?.trim() || '';

  block.textContent = '';
  block.classList.add('hero-banner');

  const inner = document.createElement('div');
  inner.className = 'hero-banner__inner';

  const content = document.createElement('div');
  content.className = 'hero-banner__content';

  if (eyebrow) {
    const eyebrowEl = document.createElement('p');
    eyebrowEl.className = 'hero-banner__eyebrow';
    eyebrowEl.textContent = eyebrow;
    content.append(eyebrowEl);
  }

  if (title) {
    const titleEl = document.createElement('h1');
    titleEl.className = 'hero-banner__title';
    titleEl.textContent = title;
    content.append(titleEl);
  }

  if (bodyContent) {
    const bodyEl = document.createElement('div');
    bodyEl.className = 'hero-banner__body';
    bodyEl.innerHTML = bodyContent;
    content.append(bodyEl);
  }

  const actions = document.createElement('div');
  actions.className = 'hero-banner__actions';

  const primary = createButton(primaryLink, primaryLabel, 'primary');
}