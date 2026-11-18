/* Shop product detail modal — click a product card for full description,
   options (where available) and quantity, then inquire with those details. */
(function () {
  var overlay = document.getElementById('pm-overlay');
  if (!overlay) return;

  var imgEl = document.getElementById('pm-img');
  var catEl = document.getElementById('pm-cat');
  var titleEl = document.getElementById('pm-title');
  var descEl = document.getElementById('pm-desc');
  var variantsWrap = document.getElementById('pm-variants-wrap');
  var variantsEl = document.getElementById('pm-variants');
  var qtyValEl = document.getElementById('pm-qty-val');
  var priceEl = document.getElementById('pm-price');
  var inquireBtn = document.getElementById('pm-inquire');
  var closeBtn = document.getElementById('pm-close');
  var qtyMinus = document.getElementById('pm-qty-minus');
  var qtyPlus = document.getElementById('pm-qty-plus');

  var state = { baseName: '', basePrice: '', qty: 1, variant: null };

  function openModal(card) {
    var img = card.querySelector('.product-media img');
    var cat = card.querySelector('.product-cat');
    var title = card.querySelector('h3');
    var price = card.querySelector('.product-price');
    var inquireSrc = card.querySelector('[data-quote-product]');
    var detail = card.getAttribute('data-detail') || (card.querySelector('.product-body p') || {}).textContent || '';
    var variantsRaw = card.getAttribute('data-variants');

    imgEl.src = img ? img.src : '';
    imgEl.alt = title ? title.textContent : '';
    catEl.textContent = cat ? cat.textContent : '';
    titleEl.textContent = title ? title.textContent : '';
    descEl.textContent = detail;
    priceEl.textContent = price ? price.textContent : '';

    state.baseName = inquireSrc ? inquireSrc.getAttribute('data-quote-product') : (title ? title.textContent : '');
    state.basePrice = price ? price.textContent : '';
    state.qty = 1;
    qtyValEl.textContent = '1';

    variantsEl.innerHTML = '';
    var variants = [];
    if (variantsRaw) {
      try { variants = JSON.parse(variantsRaw); } catch (e) { variants = []; }
    }
    if (variants.length) {
      variantsWrap.style.display = '';
      variants.forEach(function (v, i) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pm-variant-btn' + (i === 0 ? ' active' : '');
        btn.textContent = v.label;
        btn.addEventListener('click', function () {
          variantsEl.querySelectorAll('.pm-variant-btn').forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          state.variant = v.label;
        });
        variantsEl.appendChild(btn);
      });
      state.variant = variants[0].label;
    } else {
      variantsWrap.style.display = 'none';
      state.variant = null;
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.product-card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('[data-quote-product]')) return; // let the existing Inquire button behave as before
      openModal(card);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  qtyMinus.addEventListener('click', function () {
    state.qty = Math.max(1, state.qty - 1);
    qtyValEl.textContent = state.qty;
  });
  qtyPlus.addEventListener('click', function () {
    state.qty = state.qty + 1;
    qtyValEl.textContent = state.qty;
  });

  inquireBtn.addEventListener('click', function () {
    var parts = [state.baseName];
    if (state.variant) parts.push('(' + state.variant + ')');
    if (state.qty > 1) parts.push('x' + state.qty);
    window.location.href = 'quote.html?product=' + encodeURIComponent(parts.join(' '));
  });
})();
