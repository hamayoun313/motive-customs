/* Customise My Car — 4-step build request.
   Steps are shown one at a time; the final submit is sent by the shared
   FormSubmit handler in main.js (form[data-form]). */
(function () {
  var form = document.getElementById('cz-form');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('.cz-step'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-step-dot]'));
  var backBtn = document.getElementById('cz-back');
  var nextBtn = document.getElementById('cz-next');
  var submitBtn = document.getElementById('cz-submit');
  var hint = document.getElementById('cz-hint');
  var upgradesField = document.getElementById('cz-upgrades');
  var panel = form.closest('.cz-panel');
  var current = 1;
  var total = steps.length;

  function $(id) { return document.getElementById(id); }

  function selectedUpgrades() {
    return Array.prototype.slice.call(form.querySelectorAll('[data-upgrade]:checked'))
      .map(function (c) { return c.getAttribute('data-upgrade').replace(/&amp;/g, '&'); });
  }

  function showStep(n) {
    current = n;
    steps.forEach(function (s) { s.classList.toggle('active', Number(s.getAttribute('data-step')) === n); });
    dots.forEach(function (d) {
      var i = Number(d.getAttribute('data-step-dot'));
      d.classList.toggle('active', i === n);
      d.classList.toggle('done', i < n);
    });
    backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
    nextBtn.style.display = n === total ? 'none' : '';
    submitBtn.style.display = n === total ? '' : 'none';
    hint.textContent = '';
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function validate(n) {
    var msg = '';
    if (n === 1) {
      if (!$('cz-make').value) msg = 'Please choose your car’s make (or Other).';
      else if (!$('cz-model').value.trim()) msg = 'Please enter your car’s model.';
    } else if (n === 2) {
      if (!selectedUpgrades().length) msg = 'Pick at least one upgrade, or as many as you like.';
    } else if (n === 4) {
      var email = $('cz-email').value.trim();
      if (!$('cz-name').value.trim()) msg = 'Please enter your name.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = 'Please enter a valid email so we can send your quote.';
    }
    hint.textContent = msg;
    return !msg;
  }

  nextBtn.addEventListener('click', function () {
    if (validate(current)) showStep(Math.min(total, current + 1));
  });
  backBtn.addEventListener('click', function () { showStep(Math.max(1, current - 1)); });

  // Runs before main.js's submit handler: Enter on an early step goes to the
  // next step instead of sending, and the last step is validated first.
  window.addEventListener('submit', function (e) {
    if (e.target !== form) return;
    if (current < total) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (validate(current)) showStep(current + 1);
      return;
    }
    if (!validate(total)) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    upgradesField.value = selectedUpgrades().join(', ');
  }, true);

  /* ---------- Live summary ---------- */
  function renderList(el, items, emptyText) {
    el.innerHTML = '';
    if (!items.length) {
      var li = document.createElement('li'); li.className = 'empty'; li.textContent = emptyText; el.appendChild(li); return;
    }
    items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; el.appendChild(li); });
  }

  function updateSummary() {
    var make = $('cz-make').value, model = $('cz-model').value.trim(), year = $('cz-year').value.trim(), variant = $('cz-variant').value.trim();
    var car = [year, make === 'Other' ? '' : make, model, variant].filter(Boolean).join(' ');
    $('cz-sum-car').textContent = car || 'Choose your car';
    renderList($('cz-sum-list'), selectedUpgrades(), 'None selected yet');
    var style = [];
    form.querySelectorAll('.cz-chips input:checked').forEach(function (r) {
      if (r.value !== 'Not Sure') style.push(r.name + ': ' + r.value);
    });
    renderList($('cz-sum-style'), style, 'We’ll suggest a style');
    upgradesField.value = selectedUpgrades().join(', ');
  }
  form.addEventListener('input', updateSummary);
  form.addEventListener('change', updateSummary);

  /* ---------- Prefill from links, e.g. customise.html?upgrade=ambient&make=Toyota ---------- */
  var params = new URLSearchParams(window.location.search);
  (params.get('upgrade') || '').split(',').forEach(function (key) {
    var box = key && form.querySelector('[data-key="' + key.trim() + '"]');
    if (box) box.checked = true;
  });
  var makeParam = params.get('make');
  if (makeParam) {
    var opt = Array.prototype.slice.call($('cz-make').options).find(function (o) { return o.value.toLowerCase() === makeParam.toLowerCase(); });
    if (opt) $('cz-make').value = opt.value;
  }

  updateSummary();
  showStep(1);
})();
