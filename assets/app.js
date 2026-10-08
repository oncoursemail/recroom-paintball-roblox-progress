/* Paintball Preservation Port progress site. Generated from a template. No tracking, no network requests. */
(function () {
  var root = document.documentElement;

  /* ---- theme toggle (system default, remembered per browser when chosen) */
  var btn = document.getElementById('theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function mode() { var t = root.getAttribute('data-theme'); return t ? t : (mq && mq.matches ? 'dark' : 'light'); }
  function sync() {
    var m = mode();
    btn.setAttribute('data-mode', m);
    btn.setAttribute('aria-label', m === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  btn.addEventListener('click', function () {
    var next = mode() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('pbp-theme', next); } catch (e) {}
    sync();
  });
  if (mq) { try { mq.addEventListener('change', sync); } catch (e) {} }
  sync();

  /* ---- bars fill in when they scroll into view (CSS turns this off for reduced motion) */
  var reveal = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveal.forEach(function (el) { io.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- highlight the section in view in the top navigation */
  var links = [].slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if ('IntersectionObserver' in window && links.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = byId[e.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) navIo.observe(s); });
  }

  /* ---- task board filters */
  var cards = [].slice.call(document.querySelectorAll('.task'));
  var groups = [].slice.call(document.querySelectorAll('.ws-group'));
  var chips = [].slice.call(document.querySelectorAll('.chip[data-status]'));
  var runBtn = document.getElementById('f-running');
  var sel = document.getElementById('f-ws');
  var q = document.getElementById('f-q');
  var count = document.getElementById('f-count');
  var empty = document.getElementById('f-empty');
  var expand = document.getElementById('f-expand');
  if (!sel) return;
  function on(el) { return el.getAttribute('aria-pressed') === 'true'; }
  function filtered() {
    return chips.some(function (c) { return !on(c); }) || on(runBtn) || sel.value !== 'all' || q.value.trim() !== '';
  }
  function setExpand(open) {
    groups.forEach(function (g) { g.open = open; });
    expand.setAttribute('aria-pressed', open ? 'true' : 'false');
    expand.textContent = open ? 'Collapse all' : 'Expand all';
  }
  function apply() {
    var active = {}; chips.forEach(function (c) { if (on(c)) active[c.getAttribute('data-status')] = true; });
    var ws = sel.value, text = q.value.trim().toLowerCase(), runOnly = on(runBtn), n = 0;
    cards.forEach(function (c) {
      var ok = active[c.getAttribute('data-status')] &&
        (ws === 'all' || c.getAttribute('data-ws') === ws) &&
        (!text || c.getAttribute('data-text').indexOf(text) >= 0) &&
        (!runOnly || c.getAttribute('data-running') === '1');
      c.hidden = !ok; if (ok) n++;
    });
    var isFiltered = filtered();
    groups.forEach(function (g) {
      g.hidden = !g.querySelector('.task:not([hidden])');
      if (isFiltered && !g.hidden) g.open = true;
    });
    count.textContent = n === cards.length ? 'Showing all ' + n + ' tasks' : 'Showing ' + n + ' of ' + cards.length + ' tasks';
    empty.hidden = n > 0;
  }
  function reset() {
    chips.forEach(function (c) { c.setAttribute('aria-pressed', 'true'); });
    runBtn.setAttribute('aria-pressed', 'false'); sel.value = 'all'; q.value = '';
    setExpand(false);
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () { c.setAttribute('aria-pressed', on(c) ? 'false' : 'true'); apply(); });
  });
  runBtn.addEventListener('click', function () { runBtn.setAttribute('aria-pressed', on(runBtn) ? 'false' : 'true'); apply(); });
  sel.addEventListener('change', apply);
  q.addEventListener('input', apply);
  expand.addEventListener('click', function () { setExpand(!on(expand)); });
  document.getElementById('f-reset').addEventListener('click', function () { reset(); apply(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-filter-ws],[data-filter-status],[data-filter-running]') : null;
    if (!a) return;
    e.preventDefault(); reset();
    var ws = a.getAttribute('data-filter-ws'), st = a.getAttribute('data-filter-status');
    if (ws) sel.value = ws;
    if (st) chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-status') === st ? 'true' : 'false'); });
    if (a.hasAttribute('data-filter-running')) runBtn.setAttribute('aria-pressed', 'true');
    apply();
    document.getElementById('board').scrollIntoView();
  });
  apply();
})();
