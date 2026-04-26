/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Teradyne cleanup.
 * Removes non-authorable site chrome (header, footer, cookie consent, language selectors).
 * Selectors validated against migration-work/cleaned.html captured DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent dialog - found at line 2 of cleaned.html: <div id="CybotCookiebotDialog" ...>
    WebImporter.DOMUtils.remove(element, ['#CybotCookiebotDialog']);
  }

  if (hookName === TransformHook.afterTransform) {
    // Site header - found at line 1361: <header id="masthead" class="site-header">
    // Site footer - found at line 2363: <footer class="nitro-offscreen">
    // Language selector asides - found at lines 1365, 1736: <aside class="country-selector weglot-dropdown ...">
    WebImporter.DOMUtils.remove(element, [
      'header#masthead',
      'footer',
      'aside.country-selector',
      'noscript',
      'link',
    ]);
  }
}
