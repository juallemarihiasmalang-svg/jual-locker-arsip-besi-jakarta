(function () {
  'use strict';

  // Dropdown toggles (desktop Produk + mobile accordion)
  document.querySelectorAll('.dropdown-toggle, .mobile-accordion-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      var parent = toggle.closest('.has-dropdown, .mobile-accordion');

      // Close all other dropdowns
      document.querySelectorAll('.dropdown-toggle, .mobile-accordion-toggle').forEach(function (other) {
        if (other !== toggle) {
          other.setAttribute('aria-expanded', 'false');
          var otherParent = other.closest('.has-dropdown, .mobile-accordion');
          if (otherParent) otherParent.classList.remove('open');
        }
      });

      toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (parent) parent.classList.toggle('open', !expanded);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown-toggle, .mobile-accordion-toggle').forEach(function (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      var parent = toggle.closest('.has-dropdown, .mobile-accordion');
      if (parent) parent.classList.remove('open');
    });
  });

  // Close dropdowns on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.dropdown-toggle, .mobile-accordion-toggle').forEach(function (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        var parent = toggle.closest('.has-dropdown, .mobile-accordion');
        if (parent) parent.classList.remove('open');
      });
    }
  });

  // Mobile navigation toggle
  var hamburger = document.querySelector('.hamburger');
  var mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // FAQ Accordion
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');

      faqItems.forEach(function (other) {
        other.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      }
    });

    question.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });

  // Header scroll effect
  var header = document.querySelector('.header');

  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.pageYOffset > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Logo image: hide the broken-image icon and fall back to the wordmark if no
  // logo file is present yet.
  document.querySelectorAll('.logo').forEach(function (logo) {
    var logoImg = logo.querySelector('.logo-img');
    if (!logoImg) return;

    var showFallback = function () {
      logo.classList.add('logo-text-only');
      logoImg.setAttribute('hidden', '');
    };

    logoImg.addEventListener('error', showFallback);
    if (logoImg.complete && logoImg.naturalWidth === 0) showFallback();
  });

  // Light scroll-reveal animation
  var revealTargets = document.querySelectorAll(
    '.section-header, .masalah-card, .solusi-item, .solusi-visual, .produk-card, .keunggulan-card, .artikel-card, .faq-item, .hero-content, .hero-image'
  );
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el, index) {
      el.classList.add('reveal');
      el.style.transitionDelay = Math.min(index % 4, 3) * 70 + 'ms';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Highlight the nav link of the section currently in view
  var navLinks = document.querySelectorAll('.nav-links a');

  if (navLinks.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var isCurrent = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', isCurrent);
          if (isCurrent) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { threshold: 0.35, rootMargin: '-80px 0px -50% 0px' });

    navLinks.forEach(function (link) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var section = document.querySelector(id);
      if (section) sectionObserver.observe(section);
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var headerHeight = header ? header.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
})();