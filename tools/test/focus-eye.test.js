// The custom eye follows the focused tile and disappears outside its theme.
const fs = require('fs'),
  path = require('path'),
  vm = require('vm');
const { root, ok, run } = require('./lib');

function classes() {
  const set = {};
  return {
    add: function (name) { set[name] = true; },
    remove: function () { Array.prototype.slice.call(arguments).forEach(function (name) { delete set[name]; }); },
    contains: function (name) { return !!set[name]; },
  };
}

run(async () => {
  const focusEye = { classList: classes(), style: {}, innerHTML: '', offsetWidth: 300 },
    focusName = { classList: classes(), style: {}, textContent: '' },
    body = { getAttribute: () => 'crimson-eye' },
    view = { getBoundingClientRect: () => ({ top: 180, left: 0 }) },
    docEvents = {},
    winEvents = {},
    document = {
      body,
      hidden: false,
      addEventListener: (name, fn) => { docEvents[name] = fn; },
    },
    window = { addEventListener: (name, fn) => { winEvents[name] = fn; } },
    ids = { 'focus-eye': focusEye, 'focus-name': focusName, view, scroll: view },
    nextTimer = { value: 0 },
    context = {
      $, document, window, Math, Date,
      setTimeout: () => ++nextTimer.value,
      clearTimeout: () => {},
      rows: [], r: 0, c: 0,
    };
  function $(id) { return ids[id]; }
  context.$ = $;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'app', 'src', 'js', 'focus-eye.js'), 'utf8'), context);
  const tile = {
    _a: { title: 'الأفلام' },
    classList: { contains: name => name === 'tile' },
    getBoundingClientRect: () => ({ left: 800, top: 800, width: 148, height: 148, bottom: 948 }),
  };
  context.FOCUS_EYE.follow(tile);
  ok(focusEye.classList.contains('on') && focusName.classList.contains('on'), 'the eye and focused app label appear for a focused tile');
  ok(focusName.textContent === 'الأفلام' && focusEye.style.transform.indexOf('translate3d(') === 0, 'the eye follows the tile and shows its name');
  body.getAttribute = () => 'classic';
  context.FOCUS_EYE.themeChanged();
  ok(!focusEye.classList.contains('on') && !focusName.classList.contains('on'), 'the custom effect is hidden after switching to another theme');
});
