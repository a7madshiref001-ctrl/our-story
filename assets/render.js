/* ============================================================
   رسّام صفحة الحكاية — بياخد بيانات العميل ويطلع الصفحة كاملة
   ============================================================ */
(function () {
  var DAY = 864e5;
  var MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(d) { d = new Date(d); return isNaN(d) ? '' : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysSince(d) { var t = new Date(d); return isNaN(t) ? 0 : Math.max(0, Math.floor((Date.now() - t) / DAY)); }
  function safeUrl(u) { u = String(u || ''); return /^(https?:|idb:|blob:|data:image\/|\.\.\/assets\/img\/[a-z0-9-]+\.jpg$)/i.test(u) ? u : ''; }
  function linkUrl(u) { u = String(u || '').trim(); return /^https:\/\//i.test(u) ? u : ''; }

  function img(id) { return 'https://images.unsplash.com/photo-' + id + '?w=900&q=72&auto=format&fit=crop'; }
  function ago(d) { var t = new Date(); t.setHours(0, 0, 0, 0); return new Date(t - d * DAY); }
  function iso(d) { var p = function (n) { return (n < 10 ? '0' : '') + n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }

  /* ديمو بصور من غير أشخاص — للصفحة الرئيسية */
  var DEMO = {
    him: 'يوسف', her: 'ملك', herEn: 'Malak', pet: 'ملوكة', age: 24, theme: 'rose',
    met: iso(ago(812)) + 'T19:40',
    cover: local('cover-rings'),
    coverLine: 'من يوسف، لأحلى 24 سنة',
    chat: { date: iso(ago(811)), msgs: [
      { from: 'him', t: 'إزيك، أنا يوسف صاحب أحمد. كنتي في عيد ميلاد سلمى امبارح' },
      { from: 'her', t: 'آه فاكراك، اللي قال النكتة البايخة' },
      { from: 'him', t: 'هي كانت بايخة للدرجة دي؟' },
      { from: 'her', t: 'جدًا. بس ضحكت عليها لحد دلوقتي' }
    ]},
    moments: [
      { title: 'أول مرة شوفتك', date: iso(ago(812)), img: local('place'), text: 'عيد ميلاد سلمى. كنتي قاعدة جنب الشباك بتضحكي على نكتة بايخة أنا اللي قولتها. من ساعتها وأنا بقول نكت بايخة عشان أسمع الضحكة دي تاني.' },
      { title: 'أول خروجة', date: iso(ago(797)), img: local('coffee'), text: 'طلبتي لاتيه وسيبتيه لحد ما برد عشان كنتي بتحكي عن أختك. أنا مكنتش سامع ولا كلمة، كنت بتفرج عليكي.' },
      { title: 'أول «بحبك»', date: iso(ago(701)), img: local('rose-alt'), text: 'قولتها بسرعة وبصيت في الأرض. وإنتي ضحكتي وقولتي «أخيرًا».' },
      { title: 'النهارده', date: iso(ago(0)), img: local('bouquet-alt'), text: 'عيد ميلادك الـ24. وأنا لسه بحبك أكتر من أول يوم.' }
    ],
    letter: 'ملك،\n\nأنا مش شاطر في الكلام وإنتي عارفة كده. بس قررت السنة دي أكتبلك بدل ما أجيبلك حاجة هتتركن في الدولاب.\n\nمن 812 يوم كنت واحد بيقول نكت بايخة في عيد ميلاد حد ميعرفوش. النهارده أنا واحد عنده سبب يصحى عشانه.\n\nكل سنة وإنتي أحلى حاجة حصلتلي. وكل سنة وأنا جنبك.\n\nبحبك.\nيوسف',
    wish: 'كل سنة وإنتي طيبة يا ملوكة. أمنيتك هتتحقق، أنا هتأكد بنفسي.'
  };

  function paragraphs(text) {
    return String(text || '').split(/\n/).map(function (l) { return l.trim() ? '<p>' + esc(l) + '</p>' : '<p class="gap"></p>'; }).join('');
  }

  var WISH_IMG = '../assets/img/bouquet.jpg';
  function local(n) { return '../assets/img/' + n + '.jpg'; }

  function build(d, o) {
    var h = '';
    var her = d.her || 'حبيبتي', herEn = d.herEn || '';
    var cover = safeUrl(d.cover) || (d.moments && d.moments[0] && safeUrl(d.moments[0].img)) || '';

    if (o.preview) h += '<div class="pv">معاينة. اللينك بيشتغل بعد الدفع</div>';

    h += '<header class="cover" data-s="cover">' + (cover ? '<img data-src="' + esc(cover) + '" alt="">' : '') +
      '<div class="txt"><div class="for">for ' + esc(herEn || her) + '</div><h1>Our Story</h1>' +
      (d.coverLine ? '<p>' + esc(d.coverLine) + '</p>' : '') + '</div><div class="cue"><i></i>انزلي</div></header>';

    if (d.met) {
      h += '<section class="sec count center rv" data-s="count"><div class="t">Together <em>for</em></div>' +
        '<div class="big-n" data-c="d">0</div><div class="lbl">يوم</div>' +
        '<div class="clock"><div><b data-c="h">0</b><span>ساعة</span></div><div><b data-c="m">0</b><span>دقيقة</span></div><div><b data-c="s">0</b><span>ثانية</span></div></div>' +
        '<p class="since">من ' + esc(fmt(d.met)) + '</p></section>';
    }

    var msgs = (d.chat && d.chat.msgs || []).filter(function (m) { return m && String(m.t || '').trim(); });
    if (msgs.length) {
      h += '<section class="sec chat" data-s="chat"><div class="t">The first <em>message</em></div>' +
        '<div class="phone rv"><div class="top"><div class="av">' + esc(her.charAt(0)) + '</div><div><b>' + esc(her) + '</b><small>' + (d.chat.date ? esc(fmt(d.chat.date)) : '') + '</small></div></div>' +
        msgs.map(function (m, i) { return '<div class="b ' + (m.from === 'her' ? 'her' : 'him') + '" style="transition-delay:' + (i * .45) + 's">' + esc(m.t) + '</div>'; }).join('') +
        '</div></section>';
    }

    var ms = (d.moments || []).filter(function (m) { return m && (m.img || m.title || m.text); });
    if (ms.length) {
      h += '<section class="sec" data-s="moments"><div class="t">Our <em>moments</em></div><div class="tl">' +
        ms.map(function (m) {
          var u = safeUrl(m.img);
          return '<div class="m rv">' + (u ? '<div class="ph"><img data-src="' + esc(u) + '" alt=""></div>' : '') +
            (m.date ? '<div class="date">' + esc(fmt(m.date)) + '</div>' : '') + '<h3>' + esc(m.title || '') + '</h3>' +
            (m.text ? '<p>' + esc(m.text) + '</p>' : '') + '</div>';
        }).join('') + '</div></section>';
    }

    if (d.letter && d.letter.trim()) {
      h += '<section class="sec letter" data-s="letter"><div class="t">A <em>letter</em></div><div class="paperl">' + paragraphs(d.letter) + '</div></section>';
    }

    if (o.plan === 'full' && safeUrl(d.voice)) {
      h += '<section class="sec center" data-s="voice"><div class="t">In my <em>voice</em></div>' +
        '<div class="voice"><button data-voice>▶</button><div class="wave">' + Array(36).join('.').split('.').map(function (x, i) { return '<i style="height:' + (20 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70)) + '%"></i>'; }).join('') +
        '</div><span data-vt>0:00</span></div><audio preload="metadata" data-src="' + esc(d.voice) + '"></audio></section>';
    }

    h += '<section class="wish rv" data-s="wish"><img data-src="' + WISH_IMG + '" alt=""><div class="in2 rv">' +
      '<h2>Happy birthday,<br><em>' + esc(herEn || her) + '</em></h2>' +
      '<button class="wbtn">اتمني أمنية واضغطي هنا</button><p class="wtxt">' + esc(d.wish || ('كل سنة وإنتي طيبة يا ' + (d.pet || her))) + '</p></div></section>';

    var site = (window.OS_CONFIG && window.OS_CONFIG.siteUrl) || '../';
    h += '<footer class="foot"><span>Made with</span><a href="' + esc(site) + '" target="_blank" rel="noopener"><img src="../assets/logo.png" alt="Our Story" width="80"></a></footer>';
    return h;
  }

  function wire(root, d, o) {
    var resolve = o.resolve || function (u) { return Promise.resolve(u); };
    root.querySelectorAll('[data-src]').forEach(function (el) {
      resolve(el.getAttribute('data-src')).then(function (u) { if (u) el.src = u; });
    });

    var timers = [];
    if (d.met) {
      var met = new Date(d.met), cs = root.querySelectorAll('[data-c]');
      var tick = function () {
        var s = Math.max(0, Math.floor((Date.now() - met) / 1000));
        var v = { d: Math.floor(s / 86400).toLocaleString('en'), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
        cs.forEach(function (c) { if (c.__run && c.getAttribute('data-c') === 'd') return; c.textContent = v[c.getAttribute('data-c')]; });
      };
      tick(); timers.push(setInterval(tick, 1000));
    }

    var still = o.preview || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    function runDays(sec) {
      var el = sec.querySelector('[data-c="d"]'); if (!el || still || !d.met) return;
      var to = Math.floor((Date.now() - new Date(d.met)) / 864e5), t0 = null; el.__run = 1;
      (function f(t) {
        if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 1800), e = 1 - Math.pow(2, -10 * k);
        el.textContent = Math.round(to * (k === 1 ? 1 : e)).toLocaleString('en');
        if (k < 1) requestAnimationFrame(f); else el.__run = 0;
      })(performance.now());
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        if (e.target.classList.contains('count')) runDays(e.target);
      });
    }, { threshold: .15 });
    root.querySelectorAll('.rv,.paperl p,.t').forEach(function (el) {
      if (el.tagName === 'P') el.style.transitionDelay = (Array.prototype.indexOf.call(el.parentNode.children, el) * .35) + 's';
      if (still) { el.classList.add('in'); el.style.transitionDelay = '0s'; return; }
      io.observe(el);
    });

    var vb = root.querySelector('[data-voice]');
    if (vb) {
      var au = root.querySelector('audio'), bars = root.querySelectorAll('.voice .wave i'), vt = root.querySelector('[data-vt]');
      resolve(au.getAttribute('data-src')).then(function (u) { au.src = u; });
      var mmss = function (t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + (t % 60 < 10 ? '0' : '') + t % 60; };
      au.addEventListener('loadedmetadata', function () { if (isFinite(au.duration)) vt.textContent = mmss(au.duration); });
      au.addEventListener('timeupdate', function () {
        var k = au.duration ? Math.floor(au.currentTime / au.duration * bars.length) : 0;
        bars.forEach(function (b, j) { b.classList.toggle('on', j < k); });
        if (isFinite(au.duration)) vt.textContent = mmss(au.duration - au.currentTime);
      });
      au.addEventListener('ended', function () { vb.textContent = '▶'; });
      vb.addEventListener('click', function () { if (au.paused) { au.play(); vb.textContent = '❚❚'; } else { au.pause(); vb.textContent = '▶'; } });
    }

    var wb = root.querySelector('.wbtn');
    if (wb) wb.addEventListener('click', function () { wb.style.display = 'none'; root.querySelector('.wtxt').classList.add('show'); confetti(); });
    return function () { timers.forEach(clearInterval); io.disconnect(); };
  }

  function confetti() {
    var cv = document.createElement('canvas'); cv.className = 'cf'; document.body.appendChild(cv);
    var x = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight, ps = [];
    var st = getComputedStyle(document.documentElement), acc = st.getPropertyValue('--acc').trim() || '#B4545A';
    var cols = [acc, '#F7DCD8', '#F2B547', '#ffffff', '#2B211D'];
    for (var i = 0; i < 140; i++) ps.push({ x: Math.random() * W, y: -20 - Math.random() * H * .6, r: 4 + Math.random() * 5, c: cols[i % cols.length], vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, a: Math.random() * 6, s: Math.random() < .4 });
    var t0 = performance.now();
    (function fr(t) {
      x.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.y += p.vy; p.x += p.vx + Math.sin(p.a += .05); x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(p.a);
        if (p.s) { x.beginPath(); x.moveTo(0, p.r * .3); x.bezierCurveTo(p.r, -p.r * .6, p.r * .4, -p.r, 0, -p.r * .3); x.bezierCurveTo(-p.r * .4, -p.r, -p.r, -p.r * .6, 0, p.r * .3); x.fill(); }
        else x.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        x.restore();
      });
      if (t - t0 < 5200) requestAnimationFrame(fr); else cv.remove();
    })(t0);
  }

  var cleanup = null;
  function mount(root, d, o) {
    o = o || {};
    if (cleanup) cleanup();
    document.documentElement.setAttribute('data-theme', d.theme || 'rose');
    root.innerHTML = build(d, o);
    cleanup = wire(root, d, o);
  }

  function lockedScreen(root, info) {
    if (cleanup) cleanup();
    document.documentElement.setAttribute('data-theme', info.theme || 'rose');
    root.innerHTML = '<div class="gate"><div class="for">for ' + esc(info.her || '') + '</div><h1>فيه حاجة مستنياكي</h1><p>من ' + esc(info.him || '') + '. هتتفتح لوحدها بعد</p>' +
      '<div class="clock"><div><b data-c="d">0</b><span>يوم</span></div><div><b data-c="h">0</b><span>ساعة</span></div><div><b data-c="m">0</b><span>دقيقة</span></div><div><b data-c="s">0</b><span>ثانية</span></div></div><p>سيبي الصفحة مفتوحة، أو ارجعيلها في ميعادها</p></div>';
    var at = new Date(info.at), cs = root.querySelectorAll('[data-c]');
    var iv = setInterval(function t() {
      var s = Math.floor((at - Date.now()) / 1000);
      if (s <= 0) { clearInterval(iv); location.reload(); return t; }
      var v = { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
      cs.forEach(function (c) { c.textContent = v[c.getAttribute('data-c')]; });
      return t;
    }(), 1000);
    cleanup = function () { clearInterval(iv); };
  }

  function norm(s) {
    return String(s || '').trim().toLowerCase().replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ');
  }
  function sha(s) {
    if (!(window.crypto && crypto.subtle)) return Promise.resolve('plain:' + s);
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
    });
  }
  function hashAnswer(a) { return sha('os:' + norm(a)); }

  /* info = {q, hint, her, theme} · check(hash) → Promise<true لو صح> — التحقق على السيرفر */
  function secretGate(root, info, check) {
    if (cleanup) cleanup();
    document.documentElement.setAttribute('data-theme', info.theme || 'rose');
    root.innerHTML = '<div class="gate"><div class="for">for ' + esc(info.her || '') + '</div><h1>' + esc(info.q) + '</h1><p>جاوبي الأول</p>' +
      '<input id="osAns" autocomplete="off" placeholder="الإجابة"><button id="osGo">افتحي</button><div class="err" id="osErr"></div></div>';
    var inp = root.querySelector('#osAns'), err = root.querySelector('#osErr'), btn = root.querySelector('#osGo'), tries = 0;
    function go() {
      if (!inp.value.trim() || btn.disabled) return;
      btn.disabled = true;
      hashAnswer(inp.value).then(check).then(function (ok) {
        btn.disabled = false;
        if (ok) return;
        tries++; inp.classList.remove('shake'); void inp.offsetWidth; inp.classList.add('shake');
        err.textContent = tries > 2 && info.hint ? 'تلميح: ' + info.hint : 'لأ، فكّري تاني';
      }).catch(function () { btn.disabled = false; err.textContent = 'مشكلة في الاتصال، جرّبي تاني'; });
    }
    root.querySelector('#osGo').onclick = go;
    inp.onkeydown = function (e) { if (e.key === 'Enter') go(); };
  }

  window.OS_RENDER = { mount: mount, locked: lockedScreen, secretGate: secretGate, hashAnswer: hashAnswer, DEMO: DEMO, fmt: fmt, daysSince: daysSince, esc: esc };
})();
