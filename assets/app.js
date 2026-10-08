/* Paintball Preservation Port progress site. Generated; do not edit by hand. No tracking, no network requests. */
(function () {
  var root = document.documentElement;
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

  var cards = [].slice.call(document.querySelectorAll('.task'));
  var groups = [].slice.call(document.querySelectorAll('.ws-group'));
  var chips = [].slice.call(document.querySelectorAll('.chip[data-status]'));
  var runBtn = document.getElementById('f-running');
  var sel = document.getElementById('f-ws');
  var q = document.getElementById('f-q');
  var count = document.getElementById('f-count');
  var empty = document.getElementById('f-empty');
  var expand = document.getElementById('f-expand');
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
    var a = e.target.closest ? e.target.closest('[data-filter-ws],[data-filter-status]') : null;
    if (!a) return;
    e.preventDefault(); reset();
    var ws = a.getAttribute('data-filter-ws'), st = a.getAttribute('data-filter-status');
    if (ws) sel.value = ws;
    if (st) chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-status') === st ? 'true' : 'false'); });
    apply();
    document.getElementById('board').scrollIntoView();
  });
  apply();
})();
