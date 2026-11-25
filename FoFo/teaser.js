'use strict';

const film = document.querySelector('#trajectory-video');
const motionButton = document.querySelector('.motion-control');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let wantsPlayback = !reduceMotion.matches;
let inView = true;

function syncFilm() {
  if (!wantsPlayback || !inView || document.hidden) {
    film.pause();
    return;
  }
  film.play().catch(() => { motionButton.textContent = 'Play animation'; });
}

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
film.controls = false;
motionButton.textContent = film.paused ? 'Play animation' : 'Pause animation';
syncFilm();
