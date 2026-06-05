/* Skerries Coast Guard — main.js */

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// Accordion (safety page)
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const panel = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    // Close all
    document.querySelectorAll('.accordion-trigger').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      t.nextElementSibling.style.maxHeight = null;
    });

    // Open this one if it was closed
    if (!isExpanded) {
      trigger.setAttribute('aria-expanded', 'true');
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});

// Form handling — client-side validation then real submission via mailto action
function handleForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#c0392b';
        field.focus();
      }
    });

    if (!valid) {
      e.preventDefault();
      showMessage(form, 'Please fill in all required fields.', 'error');
    }
  });
}

function showMessage(form, text, type) {
  const existing = form.parentElement.querySelector('.form-message');
  if (existing) existing.remove();

  const msg = document.createElement('div');
  msg.className = 'form-message';
  msg.textContent = text;
  msg.style.cssText = `
    padding: 14px 18px;
    border-radius: 8px;
    font-size: 0.92rem;
    font-weight: 500;
    margin-top: 8px;
    background: ${type === 'success' ? '#d4edda' : '#f8d7da'};
    color: ${type === 'success' ? '#155724' : '#721c24'};
    border: 1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'};
  `;
  form.after(msg);

  if (type === 'success') {
    setTimeout(() => msg.remove(), 8000);
  }
}

// Contact form — validate then submit to Web3Forms via fetch (no page reload)
function handleAjaxForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Required-field validation
    let valid = true;
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach(field => {
      field.style.borderColor = '';
      const empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
      if (empty) {
        valid = false;
        field.style.borderColor = '#c0392b';
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      showMessage(form, 'Please fill in all required fields.', 'error');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

    try {
      const payload = Object.fromEntries(new FormData(form));
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showMessage(form, 'Thank you — your message has been sent. We aim to respond within 3 working days.', 'success');
        form.reset();
      } else {
        showMessage(form, (data && data.message) ? data.message : 'Sorry, something went wrong. Please email us directly instead.', 'error');
      }
    } catch (err) {
      showMessage(form, 'Sorry, your message could not be sent. Please check your connection or email us directly.', 'error');
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
    }
  });
}

handleAjaxForm('contact-form');
handleForm('volunteer-form');

// Smooth scroll offset for sticky header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 130;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Animate stats on scroll
const stats = document.querySelectorAll('.stat-number');
if (stats.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  stats.forEach(stat => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    stat.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(stat);
  });
}
