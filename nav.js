/* The native disclosure remains usable before this script loads. */
(() => {
  const menu = document.querySelector('.rail-menu');
  if (!menu) return;
  const summary = menu.querySelector('summary');
  function closeMenu(returnFocus) {
    if (!menu.open) return;
    menu.open = false;
    if (returnFocus) summary.focus();
  }
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) closeMenu(false);
    else if (event.target.closest('.drawer-close')) closeMenu(true);
    else if (event.target.closest('a')) closeMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.querySelector('dialog[open]')) closeMenu(true);
  });
  window.addEventListener('hashchange', () => closeMenu(false));
})();
