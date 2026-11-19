/* Shared navigation and accessible, connection-aware brand film. */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#primary-nav');
  const close = () => { toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Open navigation menu'); if(toggle) toggle.textContent = 'Menu'; nav?.classList.remove('is-open'); };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    toggle.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('is-open')) { close(); toggle?.focus(); } });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) close(); });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  matchMedia('(min-width: 960px)').addEventListener('change', close);
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const video = document.querySelector('#brand-film');
  const control = document.querySelector('#film-control');
  if (!video || !control) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = reduced.matches || Boolean(navigator.connection?.saveData);
  const sync = () => {
    control.textContent = video.paused ? 'Play film' : 'Pause film';
    control.setAttribute('aria-label', video.paused ? 'Play the TOTOYA brand film' : 'Pause the TOTOYA brand film');
  };
  const play = () => {
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.play().catch(sync);
  };
  control.hidden = false;
  control.addEventListener('click', () => { userPaused = !video.paused; if (userPaused) video.pause(); else play(); });
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('error', () => { control.hidden = true; });
  reduced.addEventListener('change', () => { if (reduced.matches) { userPaused = true; video.pause(); } });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) video.pause(); else if (!userPaused && !document.hidden) play();
  }, { threshold: .15 }).observe(video);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (!userPaused && video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < innerHeight) play();
  });
  if (!userPaused) play();
  sync();
})();
