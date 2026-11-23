(() => {
  const strings = JSON.parse(document.getElementById('ui-strings').textContent);
  window.totoyaText = (key, ...values) =>
    (strings[key] || key).replace(/\{(\d+)\}/g, (_, i) => values[i]);
  const menu = document.querySelector('.language-menu');
  if (!menu) return;
  const trigger = menu.querySelector('summary');
  const panel = menu.querySelector('.language-panel');
  function positionPanel() {
    if (!menu.open) return;
    const rect = trigger.getBoundingClientRect();
    const rail = menu.closest('.site-rail');
    const beside = rail && getComputedStyle(rail).position === 'fixed';
    const proposed = beside ? rect.top : rect.bottom + 4;
    const top = Math.max(6, Math.min(proposed, innerHeight - panel.offsetHeight - 6));
    panel.style.top = top + 'px';
  }
  // Each link already points to the same page in its language. Retain the section on arrival.
  function syncLinks() {
    for (const a of panel.querySelectorAll('a')) {
      const url = new URL(a.href);
      url.hash = location.hash;
      url.search = location.search;
      a.href = url.href;
    }
  }
  syncLinks();
  window.addEventListener('hashchange', syncLinks);
  window.addEventListener('resize', positionPanel);
  menu.addEventListener('toggle', () => {
    if (menu.open) { syncLinks(); positionPanel(); }
  });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) menu.open = false; });
  document.addEventListener('keydown', e => {
    if (menu.open && e.key === 'Escape') { menu.open = false; trigger.focus(); }
  });
})();
