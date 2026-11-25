'use strict';

const film = document.querySelector('#trajectory-video');
const motionButton = document.querySelector('.motion-control');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let wantsPlayback = !reduceMotion.matches;
let inView = true;

function correctSourceWidth() {
  // Older Chromium builds select the first playable source regardless of its media query.
  const sources = Array.from(film.querySelectorAll('source'));
  const selected = sources.find(source => source.src === film.currentSrc);
  if (!selected || !selected.media || window.matchMedia(selected.media).matches) return;
  const desktop = sources.find(source => !source.media && film.canPlayType(source.type));
  if (desktop) film.src = desktop.src;
}

function syncFilm() {
  if (!wantsPlayback || !inView || document.hidden) {
    film.pause();
    return;
  }
  film.play().catch(() => { motionButton.textContent = 'Play animation'; });
}

film.addEventListener('loadstart', correctSourceWidth);
film.addEventListener('loadedmetadata', syncFilm);
film.addEventListener('ended', () => {
  if (wantsPlayback && inView && !document.hidden) {
    film.currentTime = 0;
    syncFilm();
  }
});
film.addEventListener('playing', () => { motionButton.textContent = 'Pause animation'; });
film.addEventListener('pause', () => { motionButton.textContent = 'Play animation'; });
motionButton.addEventListener('click', () => {
  wantsPlayback = film.paused;
  syncFilm();
});
reduceMotion.addEventListener('change', () => {
  wantsPlayback = !reduceMotion.matches;
  syncFilm();
});
document.addEventListener('visibilitychange', syncFilm);
if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncFilm();
  }).observe(film);
}
motionButton.hidden = false;
film.autoplay = false;
// Restart on ended so looping also works with WebKit/GStreamer WebM playback.
film.loop = false;
film.controls = false;
motionButton.textContent = film.paused ? 'Play animation' : 'Pause animation';
correctSourceWidth();
syncFilm();
