/* A lightweight, original crimson eye effect for the Crimson Eye theme. It follows the focused app using transform only. */
var FOCUS_EYE = (function () {
  var root = $('focus-eye'),
    label = $('focus-name'),
    blinkTimer = 0,
    blinkEnd = 0,
    last = null,
    enabled = false,
    SIZE = 300,
    LABEL_W = 360;

  root.innerHTML =
    '<svg viewBox="0 0 320 320" focusable="false" aria-hidden="true">' +
    '<g class="eye-art">' +
    '<circle cx="160" cy="160" r="146" fill="#170308" stroke="#ff1939" stroke-width="5" />' +
    '<circle cx="160" cy="160" r="121" fill="#bd0827" stroke="#ff5362" stroke-width="3" />' +
    '<circle cx="160" cy="160" r="57" fill="#090205" stroke="#48000b" stroke-width="5" />' +
    '<circle cx="160" cy="160" r="22" fill="#f32642" />' +
    '<g fill="#090205">' +
    '<path d="M160 68c-18 19-14 35 1 46 7 5 18 8 26 5 11-5 13-19 4-28-6-6-15-6-21-1 2-9-1-16-10-22z" />' +
    '<path d="M160 68c-18 19-14 35 1 46 7 5 18 8 26 5 11-5 13-19 4-28-6-6-15-6-21-1 2-9-1-16-10-22z" transform="rotate(120 160 160)" />' +
    '<path d="M160 68c-18 19-14 35 1 46 7 5 18 8 26 5 11-5 13-19 4-28-6-6-15-6-21-1 2-9-1-16-10-22z" transform="rotate(240 160 160)" />' +
    '</g></g></svg>';

  function active() {
    return document.body.getAttribute('data-theme') === 'crimson-eye';
  }
  function place(tile) {
    if (!tile || !tile.getBoundingClientRect) return;
    var r = tile.getBoundingClientRect(),
      v = $('scroll').getBoundingClientRect(),
      x = Math.round(r.left + r.width / 2 - SIZE / 2),
      y = Math.round(r.top + r.height / 2 - v.top - SIZE / 2),
      lx = Math.round(r.left + r.width / 2 - LABEL_W / 2),
      ly = Math.round(r.bottom - v.top + 22);
    root.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    label.style.transform = 'translate3d(' + lx + 'px,' + ly + 'px,0)';
    label.textContent = tile._a ? tile._a.title : '';
  }
  function blink() {
    blinkTimer = 0;
    if (!active()) return;
    if (root.classList.contains('on')) {
      root.classList.add('blink');
      clearTimeout(blinkEnd);
      blinkEnd = setTimeout(function () {
        root.classList.remove('blink');
      }, 150);
    }
    armBlink();
  }
  function armBlink() {
    if (!blinkTimer && active()) blinkTimer = setTimeout(blink, 2600 + Math.floor(Math.random() * 5200));
  }
  function wake() {
    if (!active()) return;
    root.classList.remove('spin');
    /* Force a style read so the next spin class starts a fresh one-shot animation. */
    root.offsetWidth;
    root.classList.add('spin');
    setTimeout(function () {
      root.classList.remove('spin');
    }, 1300);
    armBlink();
  }
  function follow(tile) {
    if (!active() || !tile || !tile.classList || !tile.classList.contains('tile')) {
      root.classList.remove('on', 'blink');
      label.classList.remove('on');
      last = null;
      return;
    }
    place(tile);
    root.classList.add('on');
    label.classList.add('on');
    if (last !== tile) root.classList.remove('blink');
    last = tile;
    armBlink();
  }
  function themeChanged() {
    var on = active();
    if (!on) {
      enabled = false;
      clearTimeout(blinkTimer);
      blinkTimer = 0;
      root.classList.remove('on', 'blink', 'spin');
      label.classList.remove('on');
      return;
    }
    if (!enabled) wake();
    enabled = true;
    if (typeof rows !== 'undefined' && rows[r] && rows[r][c]) follow(rows[r][c]);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && active()) {
      wake();
      if (typeof rows !== 'undefined' && rows[r] && rows[r][c]) follow(rows[r][c]);
    }
  });
  window.addEventListener('focus', function () {
    if (active()) wake();
  });
  return { follow: follow, themeChanged: themeChanged, wake: wake };
})();
