/* Make one story scene visible and stop the previous film on selection. */
(() => {
  const section = document.querySelector('.ed-story-player');
  if (section) {
    const chooser = section.querySelector('.ed-scene-chooser');
    const stepper = section.querySelector('.ed-scene-step');
    const options = Array.from(chooser.querySelectorAll('button'));
    const scenes = Array.from(section.querySelectorAll('.ed-scene'));
    let selected = 0;

    function show(index) {
      const next = (index + scenes.length) % scenes.length;
      if (selected === next) return;
      const previousVideo = scenes[selected].querySelector('video');
      if (previousVideo) previousVideo.pause();
      scenes[selected].hidden = true;
      options[selected].setAttribute('aria-pressed', 'false');
      selected = next;
      scenes[next].hidden = false;
      options[next].setAttribute('aria-pressed', 'true');
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
  }

  const films = Array.from(document.querySelectorAll('.ed-section video'));
  films.forEach(video => {
    // Media fragments open the original venue film at the chosen take. Enforce the
    // endpoint as well on browsers that use only the fragment's starting time.
    const source = video.querySelector('source');
    const times = source?.getAttribute('src')?.match(/#t=([\d.]+),([\d.]+)$/);
    const start = times ? Number(times[1]) : 0;
    const end = times ? Number(times[2]) : Infinity;
    if (times) {
      video.addEventListener('loadedmetadata', () => {
        if (video.currentTime < start) video.currentTime = start;
      });
      video.addEventListener('timeupdate', () => {
        if (!video.paused && video.currentTime >= end) {
          video.pause();
          if (video.currentTime > end) video.currentTime = end;
        }
      });
    }
    video.addEventListener('play', () => {
      if (times && video.readyState && (video.currentTime < start || video.currentTime >= end - .05)) {
        video.currentTime = start;
      }
      films.forEach(other => {
        if (other !== video && !other.paused) other.pause();
      });
    });
  });
})();
