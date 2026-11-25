/* The native disclosure remains usable before this script loads. */
(() => {
  const menu = document.querySelector('.rail-menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  const rail = menu.closest('.site-rail');
  const drawer = menu.querySelector('.rail-drawer');
  const language = rail.querySelector('.language-menu');
  const phone = matchMedia('(max-width: 767px), (orientation: landscape) and (max-height: 500px) and (max-width: 1000px)');

  function updateHeaderOffset() {
    if (phone.matches) {
      document.documentElement.style.setProperty('--mobile-rail-height', '0px');
    } else if (getComputedStyle(rail).position === 'sticky') {
      document.documentElement.style.setProperty('--mobile-rail-height', Math.ceil(rail.getBoundingClientRect().height) + 'px');
    } else {
      document.documentElement.style.removeProperty('--mobile-rail-height');
    }
  }

  function syncMenuState() {
    document.body.classList.toggle('mobile-menu-open', phone.matches && menu.open);
    if (phone.matches && !menu.open && language) language.open = false;
  }

  function closeMenu(returnFocus) {
    if (!menu.open) return;
    menu.open = false;
    syncMenuState();
    if (returnFocus) summary.focus();
  }

  function syncLayout() {
    if (language && drawer) {
      language.open = false;
      if (phone.matches) drawer.append(language);
      else rail.insertBefore(language, rail.querySelector('.rail-actions') || menu);
    }
    closeMenu(false);
    syncMenuState();
    updateHeaderOffset();
  }

  syncLayout();
  menu.addEventListener('toggle', syncMenuState);
  if (typeof phone.addEventListener === 'function') phone.addEventListener('change', syncLayout);
  else phone.addListener(syncLayout);
  if ('ResizeObserver' in window) new ResizeObserver(updateHeaderOffset).observe(rail);

  document.addEventListener('click', event => {
    if (phone.matches && language?.contains(event.target)) return;
    if (!menu.contains(event.target)) closeMenu(false);
    else if (event.target.closest('.drawer-close')) closeMenu(true);
    else if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    if (phone.matches && language?.open && drawer?.contains(language)) {
      // Handle the nested disclosure before language.js or the drawer sees Escape.
      event.preventDefault();
      event.stopImmediatePropagation();
      language.open = false;
      language.querySelector('summary')?.focus();
    }
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.querySelector('dialog[open]')) closeMenu(true);
  });
  window.addEventListener('hashchange', () => closeMenu(false));
})();
