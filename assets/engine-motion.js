/**
 * ENGINE LEGACY™ — Motion & Interaction Control
 * - Hero video: plays with sound while in view, pauses + mutes on scroll away
 * - Scroll-reveal for .sr elements
 * - Sticky header state on scroll
 * - GSAP parallax enhancements (progressive, optional)
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupHeroVideo();
    setupScrollReveal();
    setupHeaderScroll();
    setupGsap();
  }

  /* ═══════════════════════════════════════════════
     HERO VIDEO — sound while visible, stop on scroll
     ═══════════════════════════════════════════════ */
  function setupHeroVideo() {
    var video = document.querySelector('[data-hero-video]');
    if (!video) return;

    var soundEnabled = false;        // becomes true only after a user gesture
    var hasUserInteracted = false;

    var soundToggle = document.querySelector('[data-sound-toggle]');

    /* Browsers block autoplay WITH audio until the user interacts.
       So we start muted (which autoplays fine), and offer a button to
       enable sound. Once enabled, the in-view/out-of-view observer
       controls both playback and audio together. */

    function playInView() {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) { playPromise.catch(function () {}); }
      if (soundEnabled) video.muted = false;
    }

    function pauseOutOfView() {
      video.pause();
      video.muted = true; // always silence when out of view
    }

    /* IntersectionObserver: the source of truth for in/out of view.
       50% threshold = video must be at least half on-screen to play. */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            playInView();
          } else {
            pauseOutOfView();
          }
        });
      }, { threshold: [0, 0.5, 1] });
      io.observe(video);
    } else {
      /* Fallback: scroll listener */
      window.addEventListener('scroll', function () {
        var rect = video.getBoundingClientRect();
        var visible = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
        visible ? playInView() : pauseOutOfView();
      }, { passive: true });
    }

    /* Sound toggle button */
    if (soundToggle) {
      soundToggle.addEventListener('click', function () {
        hasUserInteracted = true;
        soundEnabled = !soundEnabled;
        video.muted = !soundEnabled;
        if (soundEnabled) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        }
        soundToggle.setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
        soundToggle.classList.toggle('is-active', soundEnabled);
        var label = soundToggle.querySelector('[data-sound-label]');
        if (label) label.textContent = soundEnabled ? 'Sound On' : 'Sound Off';
      });
    }

    /* Pause immediately if the tab is hidden (saves battery on iOS) */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pauseOutOfView();
    });
  }

  /* ═══════════════════════════════════════════════
     SCROLL REVEAL
     ═══════════════════════════════════════════════ */
  function setupScrollReveal() {
    var heroItems = document.querySelectorAll('#s-hero .sr');
    heroItems.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, 200 + i * 130);
    });

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.sr').forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px -56px 0px' });

    document.querySelectorAll('.sr').forEach(function (el) {
      if (!el.closest('#s-hero')) io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════
     HEADER SCROLL STATE
     ═══════════════════════════════════════════════ */
  function setupHeaderScroll() {
    var header = document.getElementById('engine-header');
    if (!header) return;
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 72);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════
     GSAP ENHANCEMENTS (optional, progressive)
     ═══════════════════════════════════════════════ */
  function setupGsap() {
    window.addEventListener('load', function () {
      if (!window.gsap || !window.ScrollTrigger) return;
      gsap.registerPlugin(ScrollTrigger);

      /* Disable heavy parallax on touch / small screens for performance */
      if (window.innerWidth > 1060 && !('ontouchstart' in window)) {
        gsap.to('.aether-photo-sticky', {
          yPercent: -7,
          ease: 'none',
          scrollTrigger: { trigger: '#s-aether', start: 'top top', end: 'bottom top', scrub: 1.8 }
        });
      }

      gsap.fromTo('.cta-h',
        { scale: 0.94, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: '#s-cta', start: 'top 75%', toggleActions: 'play none none none' } }
      );
    });
  }
}());
