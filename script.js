/* ===== DAIO PROCONSTRUCT — Landing Page JS ===== */

(function () {
  'use strict';

  /* ===== Theme Toggle ===== */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let currentTheme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', currentTheme);
  updateThemeIcon();

  themeToggle && themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (!themeToggle) return;
    themeToggle.setAttribute('aria-label', 'Schimbă tema (' + (currentTheme === 'dark' ? 'luminoasă' : 'întunecată') + ')');
    themeToggle.innerHTML = currentTheme === 'dark'
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  }

  /* ===== Header scroll shadow ===== */
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scroll = window.scrollY;
    if (scroll > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scroll;
  }, { passive: true });

  /* ===== Mobile nav toggle ===== */
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');

  navToggle && navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
  });

  // Close nav on link click
  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.classList.remove('active');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Scroll Reveal ===== */
  const revealEls = document.querySelectorAll('.material-card, .feature-card, .section__head');
  revealEls.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

  /* ===== WhatsApp + SMS Form Integration ===== */
  const ADMIN_DANIEL = '40750459769';
  const ADMIN_IONUT = '40733824454';

  const form = document.getElementById('quoteForm');
  const modal = document.getElementById('whatsappModal');
  const waDanielLink = document.getElementById('waDaniel');
  const waIonutLink = document.getElementById('waIonut');
  const smsDanielLink = document.getElementById('smsDaniel'); // now holds the "both admins" SMS link
  const smsIonutLink = document.getElementById('smsIonut'); // manual fallback: Ionuț only

  // iOS expects "sms:number&body=...", Android expects "sms:number?body=...".
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function buildSmsHref(number, message) {
    const separator = isIOS ? '&' : '?';
    return 'sms:+' + number + separator + 'body=' + encodeURIComponent(message);
  }

  // Comma-separated recipients: on Android's default Messages app this opens
  // a single message addressed to both numbers, so one tap sends to both at
  // once. (iOS does not reliably support multi-recipient sms: links, so
  // there it will typically fall back to just the first number.)
  function buildSmsHrefBoth(numbers, message) {
    const separator = isIOS ? '&' : '?';
    return 'sms:' + numbers.map(n => '+' + n).join(',') + separator + 'body=' + encodeURIComponent(message);
  }

  // Validates the form, builds the WhatsApp/SMS links, and shows the modal.
  // Returns true if the form was valid and the links were prepared.
  function prepareRequest() {
    // Validate
    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const categoryGrid = document.getElementById('categoryGrid');
    const categoryCheckboxes = Array.from(document.querySelectorAll('input[name="category"]'));
    const otherCheckbox = document.getElementById('categoryOther');
    const otherText = document.getElementById('otherMaterialText');
    let valid = true;

    [name, phone].forEach(field => {
      const errorEl = document.querySelector('[data-error="' + field.name + '"]');
      if (!field.value.trim()) {
        field.classList.add('error');
        if (errorEl) errorEl.textContent = 'Acest câmp este obligatoriu';
        valid = false;
      } else {
        field.classList.remove('error');
        if (errorEl) errorEl.textContent = '';
      }
    });

    // Validate category selection (at least one checkbox)
    const checkedCategories = categoryCheckboxes.filter(cb => cb.checked);
    const categoryErrorEl = document.querySelector('[data-error="category"]');
    if (checkedCategories.length === 0) {
      categoryGrid.classList.add('error');
      if (categoryErrorEl) categoryErrorEl.textContent = 'Selectează cel puțin o categorie';
      valid = false;
    } else {
      categoryGrid.classList.remove('error');
      if (categoryErrorEl) categoryErrorEl.textContent = '';
    }

    // Validate phone (basic Romanian phone validation)
    // Users often type numbers with spaces/dashes (matching the "07xx xxx xxx"
    // placeholder), so strip separators before testing the pattern.
    const phoneValue = phone.value.trim();
    const phoneDigitsOnly = phoneValue.replace(/[\s.-]/g, '');
    if (phoneValue && !phoneDigitsOnly.match(/^(\+?4?0?7\d{8}|\+?4?0?[23]\d{8})$/)) {
      phone.classList.add('error');
      const errorEl = document.querySelector('[data-error="phone"]');
      if (errorEl && phoneValue) errorEl.textContent = 'Număr de telefon invalid';
      valid = false;
    }

    // Validate GDPR / Terms consent checkbox
    const consent = document.getElementById('consent');
    const consentErrorEl = document.querySelector('[data-error="consent"]');
    if (!consent.checked) {
      consent.closest('.form-field--consent').classList.add('error');
      if (consentErrorEl) consentErrorEl.textContent = 'Trebuie să fii de acord cu Termenii și Condițiile și Politica de Confidențialitate pentru a trimite cererea.';
      valid = false;
    } else {
      consent.closest('.form-field--consent').classList.remove('error');
      if (consentErrorEl) consentErrorEl.textContent = '';
    }

    if (!valid) return false;

    // Build the list of requested categories, folding the free-text "Alte
    // materiale" detail into its own entry when provided.
    const categories = checkedCategories.map(cb => {
      if (cb === otherCheckbox) {
        const detail = otherText.value.trim();
        return detail ? 'Alte materiale: ' + detail : 'Alte materiale';
      }
      return cb.value;
    });

    // Get form data
    const formData = {
      name: name.value.trim(),
      phone: phoneValue,
      categories: categories,
      quantity: document.getElementById('quantity').value.trim(),
      location: document.getElementById('location').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    // Build WhatsApp message
    const message = buildWhatsAppMessage(formData);
    const encodedMessage = encodeURIComponent(message);

    // Set WhatsApp links
    waDanielLink.href = 'https://wa.me/' + ADMIN_DANIEL + '?text=' + encodedMessage;
    waIonutLink.href = 'https://wa.me/' + ADMIN_IONUT + '?text=' + encodedMessage;

    // Set SMS link — both admins as recipients in one message (plain text,
    // no WhatsApp-style markdown)
    const plainMessage = buildPlainMessage(formData);
    const smsBothHref = buildSmsHrefBoth([ADMIN_DANIEL, ADMIN_IONUT], plainMessage);
    smsDanielLink.href = smsBothHref;
    smsIonutLink.href = buildSmsHref(ADMIN_IONUT, plainMessage);

    return true;
  }

  form && form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!prepareRequest()) return;

    // Show modal
    showModal();

    // Try to open both WhatsApp links.
    // Most browsers only allow one auto-opened popup per user gesture, so we
    // open the first immediately and leave the second as a clearly-labeled
    // button in the modal for the user to tap (avoiding a silent popup block).
    setTimeout(() => {
      window.open(waDanielLink.href, '_blank');
    }, 100);
  });

  // "Trimite pe SMS" button — same validation/data, but opens the SMS app
  // (for Daniel) instead of WhatsApp, with Ionuț's SMS link left in the
  // modal for a second tap.
  const smsSubmitBtn = document.getElementById('submitSms');
  smsSubmitBtn && smsSubmitBtn.addEventListener('click', function () {
    if (!prepareRequest()) return;

    showModal();

    setTimeout(() => {
      window.location.href = smsDanielLink.href;
    }, 100);
  });

  // Clear the consent error as soon as the box is checked
  const consentCheckbox = document.getElementById('consent');
  consentCheckbox && consentCheckbox.addEventListener('change', () => {
    if (consentCheckbox.checked) {
      consentCheckbox.closest('.form-field--consent').classList.remove('error');
      const consentErrorEl = document.querySelector('[data-error="consent"]');
      if (consentErrorEl) consentErrorEl.textContent = '';
    }
  });
  const otherCheckboxEl = document.getElementById('categoryOther');
  const otherTextEl = document.getElementById('otherMaterialText');
  otherCheckboxEl && otherCheckboxEl.addEventListener('change', () => {
    otherTextEl.hidden = !otherCheckboxEl.checked;
    if (otherCheckboxEl.checked) otherTextEl.focus();
  });

  // Toggle a "checked" class on each category card (fallback for browsers
  // without :has() support, and clears the error state as the user fixes it).
  document.querySelectorAll('.category-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.category-option').classList.toggle('is-checked', cb.checked);
      const grid = document.getElementById('categoryGrid');
      if (grid.querySelectorAll('input[name="category"]:checked').length > 0) {
        grid.classList.remove('error');
        const categoryErrorEl = document.querySelector('[data-error="category"]');
        if (categoryErrorEl) categoryErrorEl.textContent = '';
      }
    });
  });

  function buildWhatsAppMessage(data) {
    let msg = '*Cerere ofertă nouă — DAIO PROCONSTRUCT SRL*\n\n';
    msg += '*Nume:* ' + data.name + '\n';
    msg += '*Telefon:* ' + data.phone + '\n';
    msg += '*Categorii materiale:*\n' + data.categories.map(c => '• ' + c).join('\n') + '\n';
    msg += '*Cantitate:* ' + (data.quantity || 'Nespecificată') + '\n';
    msg += '*Localitate livrare:* ' + (data.location || 'Nespecificată') + '\n';
    msg += '*Mesaj:* ' + (data.message || 'Niciun mesaj suplimentar');
    return msg;
  }

  function buildPlainMessage(data) {
    let msg = 'Cerere ofertă nouă - DAIO PROCONSTRUCT SRL\n\n';
    msg += 'Nume: ' + data.name + '\n';
    msg += 'Telefon: ' + data.phone + '\n';
    msg += 'Categorii materiale: ' + data.categories.join(', ') + '\n';
    msg += 'Cantitate: ' + (data.quantity || 'Nespecificată') + '\n';
    msg += 'Localitate livrare: ' + (data.location || 'Nespecificată') + '\n';
    msg += 'Mesaj: ' + (data.message || 'Niciun mesaj suplimentar');
    return msg;
  }

  /* ===== Modal Controls ===== */
  function showModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-close-modal]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  /* ===== Smooth scroll for anchor links ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
