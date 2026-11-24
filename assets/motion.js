/* Our Story: الحركة (ظهور، كلام كلمة كلمة، عدّادات، بارالاكس، زراير) */
(function () {
  var d = document, R = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  R.classList.add('js');

  /* ---- الكلام كلمة كلمة: بيلف كل كلمة من غير ما يكسر الحروف العربي ---- */
  function split(el) {
    if (el.__split) return; el.__split = 1;
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/), frag = d.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span'); w.className = 'sw-w';
            var s = d.createElement('span'); s.style.setProperty('--i', i++); s.textContent = p;
            w.appendChild(s); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('sw-w')) walk(n);
      });
    })(el);
  }

  /* ---- عدّاد بيجري لحد الرقم ---- */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')) || 0, dur = +(el.getAttribute('data-dur') || 1600), t0 = null;
    if (reduce) { el.textContent = Math.round(to).toLocaleString('en'); return; }
    function f(t) {
      if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k);
      el.textContent = Math.round(to * (k === 1 ? 1 : e)).toLocaleString('en');
      if (k < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  /* ---- الظهور ---- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target; el.classList.add('vis'); io.unobserve(el);
      if (el.hasAttribute('data-count')) count(el);
      el.querySelectorAll && el.querySelectorAll('[data-count]').forEach(function (c) { if (!c.__c) { c.__c = 1; count(c); } });
    });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;

  function observe(scope) {
    scope = scope || d;
    scope.querySelectorAll('[data-split]').forEach(split);
    scope.querySelectorAll('[data-stagger]').forEach(function (p) {
      var step = parseFloat(p.getAttribute('data-stagger')) || .09, base = parseFloat(p.getAttribute('data-base')) || 0;
      Array.prototype.forEach.call(p.children, function (c, i) { c.style.setProperty('--d', (base + i * step).toFixed(2) + 's'); });
    });
    scope.querySelectorAll('[data-rv],[data-split],[data-line],[data-count]').forEach(function (el) {
      if (el.__o) return; el.__o = 1;
      if (!io || reduce) { el.classList.add('vis'); if (el.hasAttribute('data-count')) count(el); return; }
      io.observe(el);
    });
  }

  /* ---- بارالاكس + سكرول ---- */
  var pars = [], scrubs = [], bar = null, ticking = false;
  function collect() {
    pars = Array.prototype.slice.call(d.querySelectorAll('[data-par]'));
    scrubs = Array.prototype.slice.call(d.querySelectorAll('[data-scrub]'));
    bar = d.querySelector('.sp');
  }
  function frame() {
    ticking = false;
    var vh = innerHeight;
    if (bar) { var max = R.scrollHeight - vh; bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0); }
    if (reduce) return;
    pars.forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      var k = parseFloat(el.getAttribute('data-par')) || .1;
      el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + 'px';
    });
    scrubs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      /* 0 لما يدخل من تحت، 1 لما يوصل نص الشاشة */
      var p = Math.min(1, Math.max(0, (vh - r.top) / (vh * .5 + r.height * .5)));
      el.style.setProperty('--p', p.toFixed(3));
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---- الزراير: تموّج الضغطة + مغناطيس خفيف على الديسكتوب ---- */
  d.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn,[data-ripple]'); if (!b || b.disabled || reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2.2, x = d.createElement('span');
    x.className = 'rp'; x.style.width = x.style.height = s + 'px';
    x.style.left = (e.clientX - r.left - s / 2) + 'px'; x.style.top = (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(x); setTimeout(function () { x.remove(); }, 750);
  });
  if (fine && !reduce) {
    d.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest('.btn:not(.nomag)');
      if (b && !b.disabled) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * .14).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * .28).toFixed(1) + 'px');
        b.__m = 1;
      }
    });
    d.addEventListener('pointerout', function (e) {
      var b = e.target.closest && e.target.closest('.btn'); if (!b || !b.__m) return;
      if (e.relatedTarget && b.contains(e.relatedTarget)) return;
      b.style.removeProperty('--mx'); b.style.removeProperty('--my'); b.__m = 0;
    });
  }

  function init() { observe(d); collect(); frame(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();

  window.OSUI = { observe: function (s) { observe(s); collect(); frame(); }, split: split, count: count, reduce: reduce, fine: fine };
})();
