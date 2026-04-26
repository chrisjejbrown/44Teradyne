const WISTIA_VIDEO_ID = 'ojg2f5ya2s';

function createVideoBackground() {
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-banner-video';
  wrapper.style.display = 'none';

  const iframeSrc = `https://fast.wistia.net/embed/iframe/${WISTIA_VIDEO_ID}`
    + '?seo=false&videoFoam=true&autoPlay=true&endVideoBehavior=loop'
    + '&muted=true&controlsVisibleOnLoad=false&playbar=false'
    + '&playButton=false&smallPlayButton=false&fullscreenButton=false'
    + '&playbackRateControl=false&qualityControl=false'
    + '&settingsControl=false&silentAutoPlay=true&volumeControl=false';

  const iframe = document.createElement('iframe');
  iframe.src = iframeSrc;
  iframe.allow = 'autoplay; fullscreen';
  iframe.title = 'Background video';
  iframe.loading = 'lazy';
  iframe.onload = () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const hasError = doc?.body?.textContent?.includes('not authorized');
      if (!hasError) wrapper.style.display = '';
    } catch (e) {
      wrapper.style.display = '';
    }
  };

  wrapper.append(iframe);
  return wrapper;
}

export default function decorate(block) {
  const rows = [...block.children];

  const [imageRow, eyebrowRow, titleRow, bodyRow, primaryLinkRow, secondaryLinkRow] = rows;

  const picture = imageRow?.querySelector('picture') || imageRow?.querySelector('img');
  const eyebrowText = eyebrowRow?.textContent?.trim() || '';
  const titleEl = titleRow?.querySelector('h1, h2');
  const titleText = titleEl?.textContent?.trim() || titleRow?.textContent?.trim() || '';
  const bodyHTML = bodyRow?.querySelector('div')?.innerHTML?.trim() || '';
  const primaryA = primaryLinkRow?.querySelector('a');
  const secondaryA = secondaryLinkRow?.querySelector('a');

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'hero-banner-inner';

  const content = document.createElement('div');
  content.className = 'hero-banner-content';

  if (eyebrowText) {
    const el = document.createElement('p');
    el.className = 'hero-banner-eyebrow';
    el.textContent = eyebrowText;
    content.append(el);
  }

  if (titleText) {
    const el = document.createElement('h1');
    el.className = 'hero-banner-title';
    el.textContent = titleText;
    content.append(el);
  }

  if (bodyHTML) {
    const el = document.createElement('div');
    el.className = 'hero-banner-body';
    el.innerHTML = bodyHTML;
    content.append(el);
  }

  const actions = document.createElement('div');
  actions.className = 'hero-banner-actions';

  if (primaryA) {
    primaryA.className = 'hero-banner-cta hero-banner-cta-primary';
    actions.append(primaryA);
  }

  if (secondaryA) {
    secondaryA.className = 'hero-banner-cta hero-banner-cta-secondary';
    actions.append(secondaryA);
  }

  if (actions.children.length) {
    content.append(actions);
  }

  inner.append(content);

  // Static image fallback behind the video
  if (picture) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'hero-banner-media';
    const img = picture.tagName === 'IMG' ? picture : picture.querySelector('img');
    if (img) img.loading = 'eager';
    mediaDiv.append(picture);
    inner.append(mediaDiv);
  }

  // Wistia background video overlay (hidden until loaded on authorized domain)
  const videoEl = createVideoBackground();
  inner.append(videoEl);

  block.append(inner);
}
