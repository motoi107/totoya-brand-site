/* Mobile nav toggle + header solid-on-scroll (homepage only) */
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* On the homepage the header starts transparent over the hero video,
     then turns solid after scrolling. Sub-pages set .is-solid in markup. */
  /* Respect reduced-motion: hold a still frame instead of looping video */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.hero__bg, .hero__fg').forEach(function (v) {
      try { v.removeAttribute('autoplay'); v.pause(); } catch (e) {}
    });
  }

  if (header && header.dataset.scrollSolid === 'true') {
    var onScroll = function () {
      if (window.scrollY > 40) header.classList.add('is-solid');
      else header.classList.remove('is-solid');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
