// MOTIVE CUSTOMS — shared front-end behavior

document.addEventListener('DOMContentLoaded', () => {
  /* Header scroll state */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const toggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => mobileMenu.classList.add('open'));
  }
  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  }
  document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  /* Scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* Stat counters */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(c => cio.observe(c));
    } else {
      counters.forEach(animate);
    }
  }

  /* Shop filters are bound in js/products.js after products load. */

  /* "Inquire" buttons -> prefill quote form via query string */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quote-product]');
    if (!btn) return;
    window.location.href = 'quote.html?product=' + encodeURIComponent(btn.getAttribute('data-quote-product'));
  });

  /* Quote / contact form handling — submits via FormSubmit.co, no custom backend needed */
  document.querySelectorAll('form[data-form]').forEach(form => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    if (product) {
      const serviceField = form.querySelector('[name="service"]');
      const msgField = form.querySelector('[name="message"]');
      if (serviceField) {
        const opt = Array.from(serviceField.options).find(o => o.value === 'product-inquiry');
        if (opt) serviceField.value = 'product-inquiry';
      }
      if (msgField && !msgField.value) {
        msgField.value = `I'm interested in: ${product}`;
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form.querySelector('[name="_honey"]').value) return;

      const panel = form.closest('.form-panel');
      const success = panel ? panel.querySelector('.form-success') : null;
      const submitBtn = form.querySelector('button[type="submit"]');
      const errorBox = panel ? panel.querySelector('.form-error') : null;

      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }
      if (errorBox) errorBox.classList.remove('show');

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const data = await response.json();
        if (!response.ok || (data?.success !== true && data?.success !== 'true')) {
          throw new Error('FormSubmit did not confirm the submission');
        }

        form.style.display = 'none';
        if (success) success.classList.add('show');
      } catch {
        if (errorBox) {
          errorBox.classList.add('show');
        } else {
          alert("We couldn’t send your request. Please try again or email us directly.");
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }
      }
    });
  });
});
