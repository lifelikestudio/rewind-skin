class VideoControls {
  constructor() {
    this.videos = document.querySelectorAll('[data-video-controls]');
    this.init();
  }

  init() {
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Don't initialize if user prefers reduced motion
    }

    this.videos.forEach((video) => {
      this.setupVideoControls(video);
    });

    // Listen for changes in reduced motion preference
    window
      .matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', (e) => {
        if (e.matches) {
          this.destroy();
        } else {
          this.init();
        }
      });
  }

  setupVideoControls(video) {
    const container =
      video.closest('[data-block="collections-hero"]') || video.parentElement;
    const overlay = container.querySelector('[data-video-controls-overlay]');

    if (!overlay) {
      console.warn('Video controls overlay not found for video:', video);
      return;
    }

    const playBtn = overlay.querySelector('[data-video-play]');
    const pauseBtn = overlay.querySelector('[data-video-pause]');
    const muteBtn = overlay.querySelector('[data-video-mute]');

    // Play/Pause functionality
    if (playBtn) {
      playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.playVideo(video, playBtn, pauseBtn);
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.pauseVideo(video, playBtn, pauseBtn);
      });
    }

    // Mute/Unmute functionality
    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMute(video, muteBtn);
      });
    }

    // Update button states based on video events
    video.addEventListener('play', () => {
      this.updatePlayPauseButtons(playBtn, pauseBtn, true);
    });

    video.addEventListener('pause', () => {
      this.updatePlayPauseButtons(playBtn, pauseBtn, false);
    });

    video.addEventListener('volumechange', () => {
      this.updateMuteButton(video, muteBtn);
    });

    // Keyboard accessibility
    video.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (video.paused) {
          this.playVideo(video, playBtn, pauseBtn);
        } else {
          this.pauseVideo(video, playBtn, pauseBtn);
        }
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        this.toggleMute(video, muteBtn);
      }
    });

    // Make video focusable for keyboard users
    video.setAttribute('tabindex', '0');

    // Initialize button states
    this.updatePlayPauseButtons(playBtn, pauseBtn, !video.paused);
    this.updateMuteButton(video, muteBtn);

    // Add click-to-play functionality on the video itself
    video.addEventListener('click', (e) => {
      e.preventDefault();
      if (video.paused) {
        this.playVideo(video, playBtn, pauseBtn);
      } else {
        this.pauseVideo(video, playBtn, pauseBtn);
      }
    });
  }

  playVideo(video, playBtn, pauseBtn) {
    video
      .play()
      .then(() => {
        this.updatePlayPauseButtons(playBtn, pauseBtn, true);
        this.announceToScreenReader('Video playing');
      })
      .catch((error) => {
        console.warn('Video play failed:', error);
        this.announceToScreenReader('Video play failed');
      });
  }

  pauseVideo(video, playBtn, pauseBtn) {
    video.pause();
    this.updatePlayPauseButtons(playBtn, pauseBtn, false);
    this.announceToScreenReader('Video paused');
  }

  toggleMute(video, muteBtn) {
    video.muted = !video.muted;
    this.updateMuteButton(video, muteBtn);
    this.announceToScreenReader(video.muted ? 'Video muted' : 'Video unmuted');
  }

  updatePlayPauseButtons(playBtn, pauseBtn, isPlaying) {
    if (playBtn && pauseBtn) {
      if (isPlaying) {
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        playBtn.setAttribute('aria-pressed', 'false');
        pauseBtn.setAttribute('aria-pressed', 'true');
      } else {
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        playBtn.setAttribute('aria-pressed', 'true');
        pauseBtn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  updateMuteButton(video, muteBtn) {
    if (muteBtn) {
      const isMuted = video.muted;
      muteBtn.setAttribute('aria-pressed', isMuted.toString());
      muteBtn.setAttribute(
        'aria-label',
        isMuted ? 'Unmute video' : 'Mute video'
      );
    }
  }

  announceToScreenReader(message) {
    // Create or update a live region for screen reader announcements
    let liveRegion = document.getElementById('video-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'video-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'visually-hidden';
      document.body.appendChild(liveRegion);
    }

    liveRegion.textContent = message;

    // Clear the message after a short delay
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    }, 1000);
  }

  destroy() {
    // Remove event listeners and clean up
    this.videos.forEach((video) => {
      video.removeAttribute('tabindex');
      const container =
        video.closest('[data-block="collections-hero"]') || video.parentElement;
      const overlay = container.querySelector('[data-video-controls-overlay]');

      if (overlay) {
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach((button) => {
          button.replaceWith(button.cloneNode(true)); // Remove all event listeners
        });
      }
    });
  }
}

export default VideoControls;
