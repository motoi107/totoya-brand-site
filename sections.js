/* Start each silent reel when its own surface is visible. */
(() => {
  const elements = document.querySelectorAll('[data-reel]');
  if (!elements.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width: 767px), (orientation: landscape) and (max-height: 500px) and (max-width: 1000px)');
  const t = window.totoyaText || ((key, ...parts) => key.replace(/\{(\d+)\}/g, (_, i) => parts[i]));

  function surfaceIsVisible(surface) {
    const rect = surface.getBoundingClientRect();
    let left = Math.max(rect.left, 0);
    let top = Math.max(rect.top, 0);
    let right = Math.min(rect.right, innerWidth);
    let bottom = Math.min(rect.bottom, innerHeight);
    for (let parent = surface.parentElement; parent && left < right && top < bottom; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (style.overflowX === 'visible' && style.overflowY === 'visible') continue;
      const bounds = parent.getBoundingClientRect();
      if (style.overflowX !== 'visible') {
        left = Math.max(left, bounds.left);
        right = Math.min(right, bounds.right);
      }
      if (style.overflowY !== 'visible') {
        top = Math.max(top, bounds.top);
        bottom = Math.min(bottom, bounds.bottom);
      }
    }
    return left < right && top < bottom;
  }

  function makeReel(element) {
    const surface = element.querySelector('.ed-reel-media');
    const video = surface.querySelector('video');
    const button = element.querySelector('.ed-reel-toggle');
    const playlist = video.dataset.playlist ? JSON.parse(video.dataset.playlist) : null;
    const mobileScreen = playlist && matchMedia('(max-width: 767px), (orientation: landscape) and (max-height: 500px) and (max-width: 1000px)');
    const reel = { surface, visible: false, update, motionChanged };
    let scene = 0;
    let preference = null;
    let wanted = false;
    let blocked = false;
    let failed = false;
    let revision = 0;
    let firstFrame = null;

    video.muted = true;
    video.playsInline = true;
    video.loop = !playlist;
    video.autoplay = false;
    button.hidden = false;

    function showAction() {
      const action = wanted ? 'Pause' : 'Play';
      button.textContent = t(action);
      button.dataset.action = action.toLowerCase();
      button.setAttribute('aria-label', t(action + ' background video · {0}', button.dataset.filmName));
    }

    function cancelFirstFrame() {
      if (firstFrame === null) return;
      video.cancelVideoFrameCallback(firstFrame);
      firstFrame = null;
    }

    function reveal() {
      firstFrame = null;
      if (wanted && !video.paused && video.readyState >= 2) surface.classList.add('has-frame');
    }

    function update() {
      // Mobile uses still photography. Never assign an MP4 URL on a phone,
      // and release a desktop video's resource when the viewport changes.
      if (phone.matches) {
        wanted = false;
        revision++;
        video.autoplay = false;
        cancelFirstFrame();
        video.pause();
        if (video.hasAttribute('src')) {
          video.removeAttribute('src');
          video.load();
        }
        surface.classList.remove('has-frame');
        showAction();
        return;
      }
      const allowed = preference ?? !(reduced.matches || (playlist && navigator.connection?.saveData));
      if (reduced.matches && !allowed) surface.classList.remove('has-frame');
      const play = reel.visible && (!mobileScreen || mobileScreen.matches)
        && !element.hidden && !document.hidden && allowed && !blocked && !failed;
      if (play === wanted) return;
      wanted = play;
      const currentRevision = ++revision;
      video.autoplay = wanted;
      showAction();
      if (!wanted) {
        cancelFirstFrame();
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = playlist ? playlist[scene].src : video.dataset.src;
      video.play()?.catch(() => {
        if (currentRevision !== revision || !wanted) return;
        blocked = true;
        surface.classList.remove('has-frame');
        update();
      });
    }

    function motionChanged() {
      if (reduced.matches && preference === true) preference = null;
      update();
    }

    video.addEventListener('playing', () => {
      if (!wanted) {
        video.pause();
        return;
      }
      cancelFirstFrame();
      if (typeof video.requestVideoFrameCallback === 'function') {
        firstFrame = video.requestVideoFrameCallback(reveal);
      } else {
        reveal();
      }
    });
    if (playlist) {
      mobileScreen.addEventListener('change', update);
      navigator.connection?.addEventListener?.('change', update);
      video.addEventListener('ended', () => {
        if (!wanted) return;
        scene = (scene + 1) % playlist.length;
        wanted = false;
        cancelFirstFrame();
        surface.querySelector('img').src = playlist[scene].poster;
        surface.classList.remove('has-frame');
        video.removeAttribute('src');
        video.load();
        update();
      });
    }
    video.addEventListener('pause', cancelFirstFrame);
    video.addEventListener('error', () => {
      failed = true;
      surface.classList.remove('has-frame');
      button.hidden = true;
      update();
    });
    button.addEventListener('click', () => {
      preference = !wanted;
      blocked = false;
      reel.visible = surfaceIsVisible(surface);
      update();
    });
    showAction();
    return reel;
  }

  const reels = Array.from(elements, makeReel);
  const observed = 'IntersectionObserver' in window;

  function refresh() {
    for (const reel of reels) {
      if (!observed) reel.visible = surfaceIsVisible(reel.surface);
      reel.update();
    }
  }

  if (observed) {
    const bySurface = new Map(reels.map(reel => [reel.surface, reel]));
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const reel = bySurface.get(entry.target);
        reel.visible = entry.isIntersecting && entry.intersectionRatio > 0;
        reel.update();
      }
    }, { threshold: [0, .01] });
    reels.forEach(reel => observer.observe(reel.surface));
  } else {
    let scheduled = false;
    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => { scheduled = false; refresh(); });
    };
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onScroll);
    refresh();
  }

  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pageshow', refresh);
  function viewportChanged() {
    for (const reel of reels) {
      reel.visible = surfaceIsVisible(reel.surface);
      reel.update();
    }
  }
  if (typeof phone.addEventListener === 'function') phone.addEventListener('change', viewportChanged);
  else phone.addListener(viewportChanged);
  // Apply the mobile resource gate before the first intersection callback.
  if (phone.matches) refresh();
  const onMotionChange = () => reels.forEach(reel => reel.motionChanged());
  if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', onMotionChange);
  else reduced.addListener(onMotionChange);
})();
