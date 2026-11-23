/* The main photograph and navigation links work with JavaScript disabled. */
(() => {
  const hero = document.querySelector('.home-hero');
  const slides = Array.from(hero.querySelectorAll('.home-slides picture'));
  const controls = hero.querySelector('.slide-controls');
  const dots = Array.from(controls.querySelectorAll('[aria-pressed]'));
  const playback = controls.querySelector('.slide-playback');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let playing = !motion.matches && !navigator.connection?.saveData;
  let current = 0;
  let visible = true;
  let timer;

  function select(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-current', i === current);
      slide.setAttribute('aria-hidden', String(i !== current));
      dots[i].setAttribute('aria-pressed', String(i === current));
    });
  }

  function schedule() {
    clearInterval(timer);
    playback.textContent = playing ? 'Pause slideshow' : 'Play slideshow';
    if (playing && visible && !document.hidden) {
      timer = setInterval(() => select(current + 1), 6000);
    }
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      playing = false;
      select(index);
      schedule();
    });
    dot.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const next = (index + (event.key === 'ArrowLeft' ? -1 : 1) + dots.length) % dots.length;
      dots[next].focus();
      dots[next].click();
    });
  });
  playback.addEventListener('click', () => {
    playing = !playing;
    schedule();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) {
      playing = false;
      schedule();
    }
  });
  document.addEventListener('visibilitychange', schedule);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }).observe(hero);
  }
  controls.hidden = false;
  schedule();
})();
