/* ---------- tiles (built once per app, reused across rebuilds) ---------- */
function tile(a) {
  if (tiles[a.id]) {
    tiles[a.id]._a = a;
    return a.input ? inputTile(tiles[a.id], a) : tiles[a.id];
  }
  var d = document.createElement('div');
  d.className = 'tile' + (a.sys ? ' sys' : '');
  d._a = a;
  tiles[a.id] = d;
  hit(d);
  if (a.sys) {
    d.innerHTML = svg(a.icon) + '<div class="slab">' + 'LG Home' + '</div>';
    return d;
  }
  if (a.input) {
    d.innerHTML = svg('hdmi') + '<div class="slab"></div><div class="slab sub"></div>';
    var f = hsl2rgb(hashHue(a.id), 0.3, 0.3);
    paint(d, { c: f, b: hsl2rgb(hashHue(a.id), 0.3, 0.16) });
    return inputTile(d, a);
  }
  var known = colors[a.id];
  if (known) {
    paint(d, known);
    d._col = known;
  }
  var i = new Image();
  i.alt = '';
  i.decoding = 'async';
  d._i = i;
  if (!known) i.crossOrigin = 'anonymous';
  i.onload = function () {
    if (!colors[a.id]) {
      var col = iconColor(i, a.id);
      d._col = col;
      paint(d, col);
      fit(d, !!(d.parentNode && d.parentNode.id === 'dock'));
      if (!col.t) {
        colors[a.id] = col;
        storeSoon();
      }
      if (rows[r] && rows[r][c] === d) glowNow(d);
    }
  };
  i.onerror = function () {
    i.remove();
    var t = document.createElement('div');
    t.className = 't';
    t.textContent = a.title;
    d.appendChild(t);
    if (!colors[a.id]) {
      var f = hsl2rgb(hashHue(a.id), 0.42, 0.42);
      paint(d, { c: f, b: hsl2rgb(hashHue(a.id), 0.4, 0.2) });
    }
  }; /* not remembered: a failed load must not pin a made-up colour */
  i.src = a.id === '__live' ? LIVE_ICON : API + '/icon/' + encodeURIComponent(a.id);
  d.appendChild(i);
  if (i.decode) i.decode().catch(function () {});
  return d;
}

/* ---------- ambient glow: two layers cross-fade, updated only once focus settles ---------- */
function glowNow(e) {
  if (document.body.getAttribute('data-theme') === 'crimson-eye') {
    var spot = e && e.getBoundingClientRect ? e.getBoundingClientRect() : null;
    if (spot) {
      var x = Math.round(spot.left + spot.width / 2 - 960),
        y = Math.round(spot.top + spot.height / 2 - 360);
      $('gA').style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      $('gB').style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    }
  } else {
    $('gA').style.transform = '';
    $('gB').style.transform = '';
  }
  var col = TH.glow || e.style.getPropertyValue('--c') || '74,84,112';
  if (col === gColor) return;
  gColor = col;
  var on = gSide ? $('gB') : $('gA'),
    off = gSide ? $('gA') : $('gB');
  gSide ^= 1;
  on.style.setProperty('--c', col);
  on.classList.add('on');
  off.classList.remove('on');
}
function glowSoon(e) {
  clearTimeout(gT);
  gT = setTimeout(function () {
    glowNow(e);
  }, 110);
}

/* a pinned input: its name (or the port), the port under a name, dimmed while nothing is connected. Its name and state can change
   while the tile is kept, so they are written each time it is drawn. */
function inputTile(d, a) {
  var port = 'HDMI ' + a.input,
    named = a.title && a.title !== port;
  d._a = a;
  d.className = d.className.replace(/ ?\binp\b| ?\boff\b/g, '') + ' inp' + (a.off ? ' off' : '');
  d.children[1].textContent = named ? a.title : port;
  d.children[2].textContent = named ? port : '';
  return d;
}
