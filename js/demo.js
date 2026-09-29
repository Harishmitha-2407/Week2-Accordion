/* Demo wiring: expand/collapse-all buttons using the public API. */
(function () {
  'use strict';
  var first = document.querySelector('[data-accordion][data-multiple]');
  if (!first || !window.Accordion) return;
  var acc = new Accordion(first); // returns the instance already created by autoInit
  document.getElementById('expand-all').addEventListener('click', function () { acc.expandAll(); });
  document.getElementById('collapse-all').addEventListener('click', function () { acc.collapseAll(); });
})();
