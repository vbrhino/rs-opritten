/* === RS Opritten & Terrassen — Main Script === */
(function () {
  'use strict';

  // --- State ---
  let currentLang = localStorage.getItem('lang') || 'nl';
  let translations = {};
  let projects = [];
  let reviews = [];
  let currentFilter = 'all';
  let lightboxImages = [];
  let lightboxIndex = 0;

  // --- Init ---
  document.addEventListener('DOMContentLoaded', async () => {
    await loadTranslations(currentLang);
    await loadData();
    initNavigation();
    initLangSwitcher();
    initCookieBanner();
    initContactForm();
    initScrollHeader();
    renderGallery();
    renderReviews();
    applyTranslations();
    document.getElementById('current-year').textContent = new Date().getFullYear();
  });

  // --- Translations ---
  async function loadTranslations(lang) {
    try {
      const res = await fetch(`lang/${lang}.json`);
      translations = await res.json();
    } catch (e) {
      console.warn('Failed to load translations for', lang);
    }
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value) el.textContent = value;
    });
    // Update page title and meta
    if (translations.meta) {
      document.title = translations.meta.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', translations.meta.description);
    }
    // Update select options
    if (translations.contact && translations.contact.form_service_options) {
      const select = document.getElementById('form-service');
      if (select) {
        const options = translations.contact.form_service_options;
        Array.from(select.options).forEach((opt, i) => {
          if (options[i]) opt.textContent = options[i];
        });
      }
    }
    // Update lang buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    // Re-render dynamic content
    renderGallery();
    renderReviews();
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  // --- Data Loading ---
  async function loadData() {
    try {
      const [projRes, revRes] = await Promise.all([
        fetch('data/projects.json'),
        fetch('data/reviews.json')
      ]);
      projects = await projRes.json();
      reviews = await revRes.json();
    } catch (e) {
      console.warn('Failed to load data:', e);
    }
  }

  // --- Language Switcher ---
  function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem('lang', currentLang);
        await loadTranslations(currentLang);
        applyTranslations();
      });
    });
  }

  // --- Navigation ---
  function initNavigation() {
    const toggle = document.getElementById('menu-toggle');
    const nav = document.getElementById('main-nav');

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });

    // Close mobile nav on link click
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        nav.classList.remove('open');
      });
    });

    // Active section highlight
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = nav.querySelectorAll('a');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => observer.observe(s));
  }

  // --- Scroll Header ---
  function initScrollHeader() {
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // --- Gallery ---
  function renderGallery() {
    renderGalleryFilters();
    renderGalleryCards();
  }

  function renderGalleryFilters() {
    const container = document.getElementById('gallery-filters');
    const t = translations.gallery || {};
    const filters = [
      { key: 'all', label: t.filter_all || 'Alles' },
      { key: 'opritten', label: t.filter_opritten || 'Opritten' },
      { key: 'terrassen', label: t.filter_terrassen || 'Terrassen' },
      { key: 'tuinaanleg', label: t.filter_tuinaanleg || 'Tuinaanleg' },
      { key: 'onderhoud', label: t.filter_onderhoud || 'Onderhoud' },
      { key: 'afsluitingen', label: t.filter_afsluitingen || 'Afsluitingen' }
    ];

    container.innerHTML = filters.map(f =>
      `<button class="gallery-filter-btn${f.key === currentFilter ? ' active' : ''}" data-filter="${f.key}">${f.label}</button>`
    ).join('');

    container.querySelectorAll('.gallery-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        renderGallery();
      });
    });
  }

  function renderGalleryCards() {
    const container = document.getElementById('gallery-grid');
    const t = translations.gallery || {};
    const filtered = currentFilter === 'all'
      ? projects
      : projects.filter(p => p.category === currentFilter);

    if (filtered.length === 0) {
      container.innerHTML = '<p style="text-align:center;color:var(--color-gray-600);">Geen projecten gevonden.</p>';
      return;
    }

    container.innerHTML = filtered.filter(project => {
      return project.images.before.length > 0 || project.images.after.length > 0;
    }).map(project => {
      const title = project.title[currentLang] || project.title.nl;
      const desc = project.description[currentLang] || project.description.nl;
      const hasBefore = project.images.before.length > 0;
      const hasAfter = project.images.after.length > 0;
      const beforeLabel = t.before || 'Voor';
      const afterLabel = t.after || 'Na';

      let imagesHtml = '';

      if (hasBefore && hasAfter) {
        // Side-by-side pairs: pair them by index
        const maxPairs = Math.max(project.images.before.length, project.images.after.length);
        let pairsHtml = '';
        for (let i = 0; i < maxPairs; i++) {
          const beforeImg = project.images.before[i];
          const afterImg = project.images.after[i];
          if (beforeImg && afterImg) {
            pairsHtml += `
              <div class="compare-pair">
                <div class="compare-side" data-src="img/projects/${project.id}/${beforeImg}">
                  <span class="compare-label">${beforeLabel}</span>
                  <img src="img/projects/${project.id}/${beforeImg}" alt="${beforeLabel}" loading="lazy">
                </div>
                <div class="compare-side" data-src="img/projects/${project.id}/${afterImg}">
                  <span class="compare-label label-after">${afterLabel}</span>
                  <img src="img/projects/${project.id}/${afterImg}" alt="${afterLabel}" loading="lazy">
                </div>
              </div>`;
          } else if (afterImg) {
            pairsHtml += `
              <div class="compare-pair">
                <div class="compare-side" style="grid-column: span 2" data-src="img/projects/${project.id}/${afterImg}">
                  <span class="compare-label label-after">${afterLabel}</span>
                  <img src="img/projects/${project.id}/${afterImg}" alt="${afterLabel}" loading="lazy">
                </div>
              </div>`;
          } else if (beforeImg) {
            pairsHtml += `
              <div class="compare-pair">
                <div class="compare-side" style="grid-column: span 2" data-src="img/projects/${project.id}/${beforeImg}">
                  <span class="compare-label">${beforeLabel}</span>
                  <img src="img/projects/${project.id}/${beforeImg}" alt="${beforeLabel}" loading="lazy">
                </div>
              </div>`;
          }
        }
        imagesHtml = `<div class="compare-pairs">${pairsHtml}</div>`;
      } else {
        // After-only or before-only grid
        const imgs = hasAfter ? project.images.after : project.images.before;
        const label = hasAfter ? afterLabel : beforeLabel;
        const labelClass = hasAfter ? 'label-after' : '';
        imagesHtml = `<div class="after-only-grid">${imgs.map(img => `
          <div class="compare-side" data-src="img/projects/${project.id}/${img}">
            <img src="img/projects/${project.id}/${img}" alt="${label}" loading="lazy">
          </div>`).join('')}</div>`;
      }

      return `
        <div class="gallery-card">
          <div class="project-detail-header">
            <h3>${title}</h3>
            <p>${desc}</p>
          </div>
          ${imagesHtml}
        </div>
      `;
    }).join('');

    // Click handler for lightbox on individual images
    container.querySelectorAll('.compare-side[data-src]').forEach(side => {
      side.addEventListener('click', () => {
        const card = side.closest('.gallery-card');
        const allSides = card.querySelectorAll('.compare-side[data-src]');
        lightboxImages = Array.from(allSides).map(s => ({
          type: 'image',
          src: s.dataset.src,
          caption: ''
        }));
        lightboxIndex = Array.from(allSides).indexOf(side);
        showLightbox();
      });
    });
  }

  // --- Lightbox ---
  function showLightbox() {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightbox-content');
    const caption = document.getElementById('lightbox-caption');

    if (lightboxImages.length === 0) return;

    const item = lightboxImages[lightboxIndex];
    content.innerHTML = `<img src="${item.src}" alt="">`;
    caption.textContent = item.caption || '';

    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    document.getElementById('lightbox-prev').style.display = lightboxImages.length > 1 ? '' : 'none';
    document.getElementById('lightbox-next').style.display = lightboxImages.length > 1 ? '' : 'none';
  }

  function closeLightbox() {
    document.getElementById('lightbox').hidden = true;
    document.body.style.overflow = '';
  }

  // Lightbox event listeners
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    showLightbox();
  });
  document.getElementById('lightbox-next').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    showLightbox();
  });
  document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      showLightbox();
    }
    if (e.key === 'ArrowRight') {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      showLightbox();
    }
  });

  // --- Reviews ---
  function renderReviews() {
    const container = document.getElementById('reviews-grid');
    if (!reviews.length) return;

    container.innerHTML = reviews.map(review => {
      const text = review.text[currentLang] || review.text.nl;
      const service = review.service[currentLang] || review.service.nl;
      const stars = '&#9733;'.repeat(review.rating);
      return `
        <div class="review-card">
          <div class="review-stars">${stars}</div>
          <p class="review-text">"${text}"</p>
          <p class="review-author">${review.name}</p>
          <p class="review-meta">${service} — ${review.location}</p>
        </div>
      `;
    }).join('');
  }

  // --- Cookie Banner ---
  function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    const accepted = localStorage.getItem('cookies-accepted');
    if (!accepted) {
      banner.hidden = false;
    }
    document.getElementById('cookie-accept').addEventListener('click', () => {
      localStorage.setItem('cookies-accepted', '1');
      banner.hidden = true;
    });
  }

  // --- Contact Form ---
  function initContactForm() {
    const form = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = translations.contact || {};
      const data = new FormData(form);
      const payload = Object.fromEntries(data);

      // Show success message and open mailto
      feedback.textContent = t.form_success || 'Bedankt! We nemen zo snel mogelijk contact met u op.';
      feedback.className = 'form-feedback success';
      form.reset();

      // Open mailto after brief delay so user sees the feedback
      setTimeout(() => {
        const subject = encodeURIComponent(`Offerte aanvraag — ${payload.service}`);
        const body = encodeURIComponent(
          `Naam: ${payload.name}\nE-mail: ${payload.email}\nTelefoon: ${payload.phone || '-'}\nType werk: ${payload.service}\n\nBericht:\n${payload.message || '-'}`
        );
        window.location.href = `mailto:oprittenroelandt@hotmail.com?subject=${subject}&body=${body}`;
      }, 300);
    });
  }

})();
