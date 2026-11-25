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

if (!(navigator.connection && navigator.connection.saveData)) {
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


const galleryVideos = document.querySelectorAll('.clip video');
galleryVideos.forEach(video => {
  const figure = video.closest('.clip');
  const fileLink = figure.querySelector('.clip-file');
  const status = figure.querySelector('.clip-status');
  const mp4 = video.querySelector('source[type^="video/mp4"]');
  const webm = video.querySelector('source[type^="video/webm"]');
  if (!mp4 || !webm || !fileLink || !status) return;
  let retried = false;
  let playbackRequested = false;

  video.addEventListener('play', () => {
    playbackRequested = true;
    galleryVideos.forEach(other => {
      if (other !== video && !other.paused) other.pause();
    });
  });
  video.addEventListener('pause', () => {
    if (!video.error) playbackRequested = false;
  });
  video.addEventListener('loadedmetadata', () => {
    fileLink.href = video.currentSrc;
    status.hidden = true;
  });
  function handleFailure() {
    // Some players accept the container, then fail in their H.264 decoder.
    if (!retried && video.error && video.currentSrc !== webm.src && video.canPlayType(webm.type)) {
      retried = true;
      fileLink.href = webm.src;
      video.src = webm.src;
      if (playbackRequested) video.play().catch(() => {
        if (video.error) status.hidden = false;
      });
      return;
    }
    status.hidden = false;
  }
  video.addEventListener('error', handleFailure);
  webm.addEventListener('error', handleFailure);
  if (!video.canPlayType(mp4.type) && !video.canPlayType(webm.type)) status.hidden = false;
});
