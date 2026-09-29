/**
 * Accordion - reusable, accessible accordion (WAI-ARIA Authoring Practices pattern).
 *
 * Usage (auto):   <div data-accordion [data-multiple]> heading>button + panel pairs </div>
 * Usage (manual): const acc = new Accordion(el, { multiple: true });
 * Public API:     open(i), close(i), toggle(i), expandAll(), collapseAll(), destroy()
 * Events:         dispatches "accordion:toggle" on the root with detail {index, expanded}
 */
(function (global) {
  'use strict';

  var uid = 0; // ensures unique ids when several accordions share a page

  function Accordion(root, options) {
    if (!(root instanceof Element)) {
      throw new TypeError('Accordion: first argument must be a DOM element');
    }
    if (root.__accordion) return root.__accordion;   // one instance per element (prevents double listeners)
    this.root = root;
    root.__accordion = this;
    this.options = Object.assign({ multiple: root.hasAttribute('data-multiple') }, options);
    this.triggers = Array.prototype.slice.call(root.querySelectorAll('.accordion__trigger'));
    this.panels = Array.prototype.slice.call(root.querySelectorAll('.accordion__panel'));

    // Error handling: bad markup should warn, never crash the whole page
    if (!this.triggers.length || this.triggers.length !== this.panels.length) {
      console.warn('Accordion: each .accordion__trigger needs a matching .accordion__panel. Left untouched.', root);
      return;
    }
    this._onClick = this._onClick.bind(this);
    this._onKey = this._onKey.bind(this);
    this._init();
  }

  Accordion.prototype._init = function () {
    var id = ++uid, self = this;
    this.triggers.forEach(function (t, i) {
      var p = self.panels[i];
      t.id = t.id || 'acc' + id + '-trigger-' + i;
      p.id = p.id || 'acc' + id + '-panel-' + i;
      t.setAttribute('aria-controls', p.id);
      p.setAttribute('role', 'region');            // named landmark for AT users
      p.setAttribute('aria-labelledby', t.id);
      self._set(i, false, true);                    // start collapsed, no animation
    });
    this.root.addEventListener('click', this._onClick);
    this.root.addEventListener('keydown', this._onKey);
  };

  /** Core state setter. `instant` skips animation. */
  Accordion.prototype._set = function (i, expand, instant) {
    var t = this.triggers[i], p = this.panels[i];
    if (!t) return;
    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    t.setAttribute('aria-expanded', String(expand));
    p.setAttribute('data-open', String(expand));

    if (instant || reduce) {
      p.hidden = !expand;
      p.style.height = '';
    } else if (expand) {
      p.hidden = false;
      p.style.height = '0px';
      // next frame: animate to the content's real height, then release to auto
      requestAnimationFrame(function () { p.style.height = p.scrollHeight + 'px'; });
      p.addEventListener('transitionend', function done() {
        p.style.height = 'auto'; p.removeEventListener('transitionend', done);
      });
    } else {
      p.style.height = p.scrollHeight + 'px';        // fix current height first
      requestAnimationFrame(function () { p.style.height = '0px'; });
      p.addEventListener('transitionend', function done() {
        p.hidden = true; p.removeEventListener('transitionend', done);
      });
    }
    this.root.dispatchEvent(new CustomEvent('accordion:toggle', { detail: { index: i, expanded: expand } }));
  };

  Accordion.prototype.isOpen = function (i) { return this.triggers[i].getAttribute('aria-expanded') === 'true'; };
  Accordion.prototype.open = function (i) {
    if (!this.options.multiple) {
      for (var j = 0; j < this.triggers.length; j++) if (j !== i && this.isOpen(j)) this._set(j, false);
    }
    this._set(i, true);
  };
  Accordion.prototype.close = function (i) { this._set(i, false); };
  Accordion.prototype.toggle = function (i) { this.isOpen(i) ? this.close(i) : this.open(i); };
  Accordion.prototype.expandAll = function () {
    if (!this.options.multiple) return;               // ignored in single-open mode
    for (var i = 0; i < this.triggers.length; i++) if (!this.isOpen(i)) this._set(i, true);
  };
  Accordion.prototype.collapseAll = function () {
    for (var i = 0; i < this.triggers.length; i++) if (this.isOpen(i)) this._set(i, false);
  };

  Accordion.prototype._onClick = function (e) {
    var t = e.target.closest('.accordion__trigger');
    var i = this.triggers.indexOf(t);
    if (i > -1) this.toggle(i);
  };

  /** Keyboard: Up/Down cycle, Home/End jump. Enter/Space work natively on <button>. */
  Accordion.prototype._onKey = function (e) {
    var i = this.triggers.indexOf(document.activeElement), n = this.triggers.length, next;
    if (i < 0) return;
    if (e.key === 'ArrowDown') next = (i + 1) % n;
    else if (e.key === 'ArrowUp') next = (i - 1 + n) % n;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    this.triggers[next].focus();
  };

  Accordion.prototype.destroy = function () {
    this.root.removeEventListener('click', this._onClick);
    this.root.removeEventListener('keydown', this._onKey);
    this.panels.forEach(function (p) { p.hidden = false; p.style.height = ''; });
  };

  /** Auto-initialise every [data-accordion] once the DOM is ready. */
  Accordion.autoInit = function () {
    return Array.prototype.map.call(document.querySelectorAll('[data-accordion]'), function (el) {
      try { return new Accordion(el); } catch (err) { console.error(err); return null; }
    });
  };

  global.Accordion = Accordion;
  // Feature detection fallback: needs classList/closest/CustomEvent; else leave content visible
  if (Element.prototype.closest && global.CustomEvent) Accordion.autoInit();
  else document.documentElement.className = '';
})(window);
