/*
 * sp-filter-fix.js — mobile filter row-tap fix
 *
 * Stand-alone version of the fix that's also in global.js. global.js
 * is a large file that Shopify's CDN has been propagating slowly;
 * this small new file gets a fresh asset version and (hopefully)
 * deploys faster.
 *
 * Strategy: capture-phase click handler on every mobile filter row
 * <summary>, manual toggle of the parent <details>, body scroll
 * lock to defeat the iOS hit-test bug, and a click trap that
 * swallows taps that land outside the drawer.
 */
(function spFilterFix() {
  var savedScrollY = 0;
  var bodyLocked = false;

  function lockBody() {
    if (bodyLocked) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    bodyLocked = true;
  }
  function unlockBody() {
    if (!bodyLocked) return;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
    bodyLocked = false;
  }

  function bindSummaries(disc) {
    disc.querySelectorAll('.mobile-facets__summary').forEach(function (s) {
      if (s.dataset.spfSummaryBound === '1') return;
      s.dataset.spfSummaryBound = '1';
      s.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var d = s.parentNode;
        if (!d || d.tagName !== 'DETAILS') return;
        if (d.hasAttribute('open')) {
          d.removeAttribute('open');
          s.setAttribute('aria-expanded', 'false');
        } else {
          d.setAttribute('open', '');
          s.setAttribute('aria-expanded', 'true');
        }
      }, true);
    });
  }

  function init() {
    var disc = document.querySelector('.mobile-facets__disclosure');
    if (!disc) return;

    bindSummaries(disc);

    function sync() {
      if (disc.hasAttribute('open') && window.matchMedia('(max-width: 749px)').matches) {
        lockBody();
      } else {
        unlockBody();
      }
    }
    sync();

    if (!disc.dataset.spfLockObserver) {
      disc.dataset.spfLockObserver = '1';
      new MutationObserver(sync).observe(disc, { attributes: true, attributeFilter: ['open'] });
    }
    var grid = document.getElementById('FacetFiltersFormMobile');
    if (grid && !grid.dataset.spfBindObserver) {
      grid.dataset.spfBindObserver = '1';
      new MutationObserver(function () { bindSummaries(disc); })
        .observe(grid, { childList: true, subtree: true });
    }
  }

  // Click trap: swallow clicks that land outside the drawer while it's open.
  document.addEventListener('click', function (e) {
    if (!window.matchMedia('(max-width: 749px)').matches) return;
    var disc = document.querySelector('.mobile-facets__disclosure');
    if (!disc || !disc.hasAttribute('open')) return;
    var form = disc.querySelector('.mobile-facets');
    if (!form) return;
    var close = disc.querySelector('.mobile-facets__close');
    if (close && close.contains(e.target)) return;
    if (form.contains(e.target)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('shopify:section:load', init);
})();
