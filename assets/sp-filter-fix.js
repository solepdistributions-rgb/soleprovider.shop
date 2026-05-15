/*
 * sp-filter-fix.js v2 — mobile filter accordion
 *
 * Bypasses Dawn's broken slide-in submenu pattern and works around the
 * iOS Safari bug where styles keyed off the [open] attribute on a
 * <details> element don't always recalc when the attribute is set
 * programmatically.
 *
 * When a filter row <summary> is tapped we set BOTH:
 *   - the [open] attribute (for native semantics + a11y)
 *   - a custom .sp-open class on the parent <details>
 *
 * The CSS in theme.liquid <head> keys submenu visibility off .sp-open
 * (with [open] as a fallback), so the accordion works regardless of
 * any Safari [open] recalc quirks.
 */
(function () {
  'use strict';

  function setRowOpen(details, summary, shouldOpen) {
    if (shouldOpen) {
      details.classList.add('sp-open');
      details.setAttribute('open', '');
      if (summary) summary.setAttribute('aria-expanded', 'true');
    } else {
      details.classList.remove('sp-open');
      details.removeAttribute('open');
      if (summary) summary.setAttribute('aria-expanded', 'false');
    }
  }

  function bindSummary(summary) {
    if (summary.dataset.spfBound === '1') return;
    summary.dataset.spfBound = '1';
    summary.addEventListener('click', function (e) {
      var details = summary.parentNode;
      if (!details || details.tagName !== 'DETAILS') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      var isOpen = details.classList.contains('sp-open') || details.hasAttribute('open');
      setRowOpen(details, summary, !isOpen);
    }, true);
  }

  function bindAll(root) {
    var nodes = root.querySelectorAll('details.mobile-facets__details > summary.mobile-facets__summary');
    for (var i = 0; i < nodes.length; i++) bindSummary(nodes[i]);
  }

  function init() {
    var disc = document.querySelector('.mobile-facets__disclosure');
    if (!disc) return;
    bindAll(disc);

    var grid = document.getElementById('FacetFiltersFormMobile');
    if (grid && grid.dataset.spfObs !== '1') {
      grid.dataset.spfObs = '1';
      new MutationObserver(function () { bindAll(disc); })
        .observe(grid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
