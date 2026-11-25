'use strict';

// Native controls and a small inline poster also work with scripts disabled.
const previews = document.querySelectorAll('video[data-poster]');
if ('IntersectionObserver' in window) {
  const posters = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const video = entry.target;
        video.poster = video.dataset.poster;
        posters.unobserve(video);
      }
    }
  }, {rootMargin: '500px 0px'});
  previews.forEach(video => posters.observe(video));
} else {
  previews.forEach(video => { video.poster = video.dataset.poster; });
}

if (!navigator.connection?.saveData) {
  function warmPlayer(video, level) {
    if (video.paused && (video.preload === 'none' || level === 'auto')) {
      video.preload = level;
    }
  }

  // Prepare the first clip as its gallery approaches. Other clips wait for intent.
  if ('IntersectionObserver' in window) {
    const nearby = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          warmPlayer(entry.target, 'metadata');
          nearby.unobserve(entry.target);
        }
      }
    }, {rootMargin: '240px 0px'});

    document.querySelectorAll('.video-grid').forEach(gallery => {
      const first = gallery.querySelector('video');
      if (first) nearby.observe(first);
    });
  }

  document.querySelectorAll('.video-grid video').forEach(video => {
    // A brief dwell avoids fetching a whole row as the pointer crosses it.
    let hoverTimer;
    video.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        hoverTimer = setTimeout(() => warmPlayer(video, 'auto'), 140);
      }
    });
    video.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
    video.addEventListener('focus', () => warmPlayer(video, 'auto'));
    video.addEventListener('pointerdown', () => warmPlayer(video, 'auto'), {passive: true});
  });
}
