function firstMedia(root) {
  return root?.querySelector('picture, video, img') || null;
}

function isCTAParagraph(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
  if (node.tagName !== 'P') return false;
  const links = node.querySelectorAll('a');
  return links.length > 0 && node.textContent.trim().length <= 120;
}

function toButton(link, primary = true) {
  link.classList.add('button');
  link.classList.add(primary ? 'button--primary' : 'button--secondary');
  return link;
}

function buildBenefitCard(text) {
  const card = document.createElement('div');
  card.className = 'hero-banner__benefit';

  const marker = document.createElement('span');
  marker.className = 'hero-banner__benefit-marker';

  const body = document.createElement('p');
  body.textContent = text;

  card.append(marker, body);
  return card;
}

export default function decorate(block) {
  block.classList.add('hero-banner');

  const [mediaSource, contentSource, benefitsSource] = [...block.children];

  const media = firstMedia(mediaSource);

  const overlay = document.createElement('div');
  overlay.className = 'hero-banner__overlay';

  const panel = document.createElement('div');
  panel.className = 'hero-banner__panel';

  const content = document.createElement('div');
  content.className = 'hero-banner__content';

  const actions = document.createElement('div');
  actions.className = 'hero-banner__actions';

  const benefits = document.createElement('div');
  benefits.className = 'hero-banner__benefits';

  if (contentSource) {
    const nodes = [...contentSource.childNodes];
    const primaryLinks = [];

    nodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        if (node.textContent.trim()) {
          content.append(node.cloneNode(true));
        }
        return;
      }

      if (node.matches('ul')) {
        [...node.querySelectorAll('li')].forEach((li) => {
          benefits.append(buildBenefitCard(li.textContent.trim()));
        });
        return;
      }

      if (isCTAParagraph(node)) {
        [...node.querySelectorAll('a')].forEach((a, index) => {
          primaryLinks.push(toButton(a, index === 0));
        });
        return;
      }

      content.append(node);
    });

    primaryLinks.forEach((link) => actions.append(link));
  }

  if (!benefits.children.length && benefitsSource) {
    const listItems = benefitsSource.querySelectorAll('li');
    listItems.forEach((li) => {
      benefits.append(buildBenefitCard(li.textContent.trim()));
    });
  }

  if (actions.children.length) {
    content.append(actions);
  }

  block.textContent = '';

  if (media) {
    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'hero-banner__media';
    mediaWrap.append(media);
    block.append(mediaWrap);
  } else {
    block.classList.add('hero-banner--no-media');
  }

  block.append(overlay, panel);
  panel.append(content);

  if (benefits.children.length) {
    panel.append(benefits);
  }
}