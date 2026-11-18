/* Motive Customs — product catalogue renderer.
   All products live in data/products.json (edited from admin.html).
   This file draws the Shop grid, the Home "From The Shop" preview and the
   optional site-wide sale bar from that one file. */
(function () {
  var DATA_URL = 'data/products.json';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function money(n, cur) { return cur + ' $' + Number(n).toLocaleString('en-AU', { maximumFractionDigits: 2 }); }

  function priceHTML(p, cur) {
    if (p.price == null || p.price === '') return 'Request Price';
    if (p.salePrice != null && p.salePrice !== '' && Number(p.salePrice) < Number(p.price)) {
      return '<s class="price-was">' + esc(money(p.price, cur)) + '</s> <span class="price-now">' + esc(money(p.salePrice, cur)) + '</span>';
    }
    return esc(money(p.price, cur));
  }

  function onSale(p) {
    return p.price != null && p.salePrice != null && p.salePrice !== '' && Number(p.salePrice) < Number(p.price);
  }

  function cardHTML(p, cur, mode) {
    var badge = onSale(p) ? 'Sale' : p.badge;
    var mediaCls = 'product-media' + (p.tallOnMobile && mode === 'shop' ? ' product-media--full' : '');
    var imgStyle = p.imagePosition ? ' style="object-position:' + esc(p.imagePosition) + '"' : '';
    var attrs = mode === 'shop'
      ? ' data-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '" data-detail="' + esc(p.description || p.summary) + '"' +
        (p.variants && p.variants.length ? " data-variants='" + esc(JSON.stringify(p.variants.map(function (v) { return { label: v }; }))) + "'" : '') +
        (p.inquireUrl ? ' data-inquire-url="' + esc(p.inquireUrl) + '"' : '') +
        (p.imageFit === 'contain' ? ' data-img-fit="contain"' : '')
      : '';
    var button = mode === 'shop'
      ? (p.inquireUrl
          ? '<a class="btn btn-sm btn-dark" href="' + esc(p.inquireUrl) + '">Customise</a>'
          : '<button class="btn btn-sm btn-dark" data-quote-product="' + esc(p.inquireName || p.name) + '">Inquire</button>')
      : '<a href="shop.html?p=' + encodeURIComponent(p.id) + '" class="btn btn-sm btn-dark">View</a>';
    return '<div class="product-card reveal in' + (onSale(p) ? ' is-sale' : '') + '"' + attrs + '>' +
      '<div class="' + mediaCls + '">' +
        (badge ? '<span class="product-badge">' + esc(badge) + '</span>' : '') +
        '<img src="' + esc(p.image) + '" alt="' + esc(p.imageAlt || p.name) + '" loading="lazy"' + imgStyle + '>' +
      '</div>' +
      '<div class="product-body">' +
        '<div class="product-cat">' + esc(p.categoryLabel) + '</div>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p>' + esc(p.summary) + '</p>' +
        '<div class="product-footer"><span class="product-price">' + priceHTML(p, cur) + '</span>' + button + '</div>' +
      '</div></div>';
  }

  function bindFilters(grid) {
    var btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var cat = btn.getAttribute('data-filter');
        grid.querySelectorAll('.product-card').forEach(function (card) {
          card.style.display = (cat === 'all' || card.getAttribute('data-category') === cat) ? '' : 'none';
        });
      });
    });
  }

  function saleBar(sale) {
    if (!sale || !sale.enabled || !sale.text || document.querySelector('.sale-bar')) return;
    var bar = document.createElement(sale.link ? 'a' : 'div');
    bar.className = 'sale-bar';
    if (sale.link) bar.href = sale.link;
    bar.innerHTML = '<span class="sale-bar-dot"></span><span>' + esc(sale.text) + '</span>' + (sale.link ? '<span class="sale-bar-cta">Shop now &rarr;</span>' : '');
    document.body.insertBefore(bar, document.body.firstChild);
    document.body.classList.add('has-sale-bar');
  }

  function render(data) {
    var cur = (data.settings && data.settings.currency) || 'AUD';
    var products = (data.products || []).filter(function (p) { return p.visible !== false; });
    saleBar(data.settings && data.settings.sale);

    var grid = document.getElementById('product-grid');
    if (grid) {
      grid.innerHTML = products.map(function (p) { return cardHTML(p, cur, 'shop'); }).join('');
      bindFilters(grid);
    }
    var home = document.getElementById('home-products');
    if (home) {
      var featured = products.filter(function (p) { return p.featured; }).slice(0, 4);
      if (!featured.length) featured = products.slice(0, 4);
      home.innerHTML = featured.map(function (p) { return cardHTML(p, cur, 'home'); }).join('');
    }
    document.dispatchEvent(new CustomEvent('products:rendered', { detail: data }));
  }

  function load() {
    fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () {
        var grid = document.getElementById('product-grid') || document.getElementById('home-products');
        if (grid) grid.innerHTML = '<p class="products-error">Products couldn’t load right now — please refresh, or <a href="contact.html">contact us</a>.</p>';
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
