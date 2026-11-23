/* Load muted reel backgrounds when their surfaces enter the viewport. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const reels = [];
  const preferences = new Map();

  function preferenceFor(element) {
    const group = element.closest('.ed-story') || element;
    if (!preferences.has(group)) preferences.set(group, { enabled: null });
    return preferences.get(group);
  }

  function makeReel(element) {
    const surface = element.querySelector('.ed-reel-media');
    const video = surface.querySelector('video');
    const button = element.querySelector('.ed-reel-toggle');
    const preference = preferenceFor(element);
    const start = Number(video.dataset.start);
    const end = Number(video.dataset.end);
    const reel = { surface, visible: false, update, measure };
    let wanted = false;
    let blocked = false;
    let failed = false;
    let revision = 0;
    let frame = null;
    const frameAPI = typeof video.requestVideoFrameCallback === 'function';

    video.muted = true;
    video.autoplay = false;
    button.hidden = false;

    function showAction() {
      const action = wanted ? 'Pause' : 'Play';
      button.textContent = action;
      button.dataset.action = action.toLowerCase();
      button.setAttribute('aria-label', action + ' background video · ' + button.dataset.filmName);
    }

    function cancelFrame() {
      if (frame === null) return;
      if (frameAPI) video.cancelVideoFrameCallback(frame);
      else cancelAnimationFrame(frame);
      frame = null;
    }

    function keepInClip(time) {
      if (!video.readyState || video.seeking) return;
      if (time < start - .04 || time >= end - .025) {
        video.currentTime = start;
      } else if (video.readyState >= 2) {
        surface.classList.add('has-frame');
      }
    }

    function watchFrame(now, metadata) {
      frame = null;
      if (!wanted || video.paused) return;
      keepInClip(metadata ? metadata.mediaTime : video.currentTime);
      frame = frameAPI ? video.requestVideoFrameCallback(watchFrame) : requestAnimationFrame(watchFrame);
    }

    function measure() {
      const box = surface.getBoundingClientRect();
      reel.visible = box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight &&
        box.right > 0 && box.left < innerWidth;
    }

    function update() {
      const allowed = preference.enabled === null ? !reduced.matches : preference.enabled;
      const play = reel.visible && !element.hidden && !document.hidden && allowed && !blocked && !failed;
      if (play === wanted) {
        showAction();
        return;
      }
      wanted = play;
      const currentRevision = ++revision;
      video.autoplay = wanted;
      showAction();
      if (!wanted) {
        cancelFrame();
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      if (video.readyState && (video.currentTime < start || video.currentTime >= end - .025)) {
        video.currentTime = start;
      }
      const attempt = video.play();
      attempt?.catch(() => {
        if (currentRevision !== revision || !wanted) return;
        blocked = true;
        surface.classList.remove('has-frame');
        update();
      });
    }

    video.addEventListener('loadedmetadata', () => {
      if (Math.abs(video.currentTime - start) > .04) video.currentTime = start;
    });
    video.addEventListener('playing', () => {
      if (!wanted) {
        video.pause();
        return;
      }
      cancelFrame();
      watchFrame();
    });
    video.addEventListener('pause', cancelFrame);
    video.addEventListener('timeupdate', () => {
      if (wanted && !video.paused) keepInClip(video.currentTime);
    });
    video.addEventListener('error', () => {
      failed = true;
      surface.classList.remove('has-frame');
      button.hidden = true;
      update();
    });
    button.addEventListener('click', () => {
      preference.enabled = !wanted;
      blocked = false;
      reel.measure();
      reels.forEach(item => item.update());
    });
    showAction();
    return reel;
  }

  document.querySelectorAll('[data-reel]').forEach(element => reels.push(makeReel(element)));
  if (!reels.length) return;

  function measureAll() {
    reels.forEach(reel => {
      reel.measure();
      reel.update();
    });
  }

  if ('IntersectionObserver' in window) {
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
      requestAnimationFrame(() => { scheduled = false; measureAll(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }
  measureAll();
  document.addEventListener('visibilitychange', measureAll);
  window.addEventListener('pageshow', measureAll);
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      preferences.forEach(preference => {
        if (preference.enabled === true) preference.enabled = null;
      });
    }
    reels.forEach(reel => reel.update());
  });

  const story = document.querySelector('.ed-story-player');
  if (!story) return;
  const chooser = story.querySelector('.ed-scene-chooser');
  const stepper = story.querySelector('.ed-scene-step');
  const options = Array.from(chooser.querySelectorAll('button'));
  const scenes = Array.from(story.querySelectorAll('.ed-scene'));
  let selected = 0;
  function show(index) {
    const next = (index + scenes.length) % scenes.length;
    if (selected === next) return;
    scenes[selected].hidden = true;
    options[selected].setAttribute('aria-pressed', 'false');
    selected = next;
    scenes[next].hidden = false;
    options[next].setAttribute('aria-pressed', 'true');
    measureAll();
  }
  options.forEach((button, index) => {
    button.addEventListener('click', () => show(index));
    button.addEventListener('keydown', event => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      show(index + (event.key === 'ArrowRight' ? 1 : -1));
      options[selected].focus();
    });
  });
  stepper.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => show(selected + Number(button.dataset.step)));
  });
  chooser.hidden = false;
  stepper.hidden = false;
})();
