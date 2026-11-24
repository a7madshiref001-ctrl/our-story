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
    wish: 'كل سنة وإنتي طيبة يا ملوكة. أمنيتك هتتحقق، أنا هتأكد بنفسي.',
    reasons: ['ضحكتك لما بتحاولي ما تضحكيش على نكتة بايخة', 'إنك بتسأليني «أكلت؟» في أصعب يوم', 'صوتك أول ما بتصحي', 'إنك فاكرة كل حاجة صغيرة قولتهالك', 'طريقتك وإنتي بتحكي وإيدك بتتكلم معاكي', 'إنك بتهدّيني من غير ما تقولي كلمة', 'عنادك، حتى لما بيجنني', 'إنك إنتي، من غير أي تعديل'],
    promises: ['أوعدك أفضل أسمعك للآخر، حتى لو الحكاية طويلة', 'أوعدك ما أنامش وإحنا زعلانين', 'أوعدك أضحكك في الأيام اللي مفيهاش ضحك', 'أوعدك أفضل أختارك كل يوم، مش مرة واحدة'],
    openWhen: { on: true, notes: [
      { w: 'لما تزعلي', t: 'لو فتحتي ده يبقى في حاجة مضايقاكي. اقفلي كل حاجة وكلميني دلوقتي. مش مهم الساعة كام، أنا صاحي عشانك.' },
      { w: 'لما أوحشك', t: 'وأنا كمان وحشتيني. على الأغلب أنا في نفس اللحظة دي بفكر فيكي. ابعتيلي كلمة واحدة بس.' },
      { w: 'لما تحتاجي تضحكي', t: 'افتكري يوم ما وقعت قدام الناس كلها وعملت نفسي إني قاصد. لسه بتضحكي؟ أيوه، أنا عارف.' },
      { w: 'لما تشكّي في نفسك', t: 'إنتي أشطر وأقوى من ما إنتي متخيلة. أنا شايف ده كل يوم، حتى لو إنتي مش شايفاه.' }
    ]},
    surprise: { on: true, t: 'عشا يوم الخميس الساعة 8. البسي الفستان اللي بحبه.' }
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
    var him = d.him || '';
    if (!o.preview && !o.noIntro) {
      var ini = (herEn || her).trim().charAt(0).toUpperCase();
      h += '<div class="intro" data-intro>' + (cover ? '<img data-src="' + esc(cover) + '" alt="">' : '') +
        '<div class="in3"><div class="for">for ' + esc(herEn || her) + '</div><h2>فيه حاجة<br>مستنياكي</h2>' + (him ? '<p>من ' + esc(him) + '</p>' : '') +
        '<button class="seal" data-open aria-label="افتحي"><span>' + esc(ini) + '</span></button><span class="hint">اضغطي عشان تفتحيها</span></div></div>';
    }

    h += '<header class="cover" data-s="cover">' + (cover ? '<img data-src="' + esc(cover) + '" alt="">' : '') +
      '<div class="txt"><div class="for">for ' + esc(herEn || her) + '</div><h1>Our Story</h1>' +
      (d.coverLine ? '<p>' + esc(d.coverLine) + '</p>' : '') + '</div><div class="cue"><i></i>انزلي</div></header>';

    if (d.met) {
      h += '<section class="sec count center rv" data-s="count"><div class="t">Together <em>for</em></div>' +
        '<div class="big-n" data-c="d">0</div><div class="lbl">يوم</div>' +
        '<div class="clock"><div><b data-c="h">0</b><span>ساعة</span></div><div><b data-c="m">0</b><span>دقيقة</span></div><div><b data-c="s">0</b><span>ثانية</span></div></div>' +
        '<p class="since">من ' + esc(fmt(d.met)) + '</p>' +
        '<div class="nums"><div><b data-n="months">0</b><span>شهر مع بعض</span></div><div><b data-n="mornings">0</b><span>صباح بدأ بيكي</span></div>' +
        '<div><b data-n="hours">0</b><span>ساعة بفكر فيكي</span></div><div><b data-n="beats">0</b><span>دقة قلب ليكي</span></div></div></section>';
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

    var rs = (d.reasons || []).filter(function (r) { return String(r || '').trim(); }).slice(0, 12);
    if (rs.length) {
      h += '<section class="sec reasons" data-s="reasons"><div class="t">Why I <em>love</em> you</div><p class="sub2">' + rs.length + ' حاجات بحبها فيكي. اضغطي على أي كارت</p><div class="rgrid">' +
        rs.map(function (r, i) { return '<button class="rc" style="--i:' + i + '"><span class="fr"><i>' + (i < 9 ? '0' : '') + (i + 1) + '</i><small>اضغطي</small></span><span class="bk">' + esc(r) + '</span></button>'; }).join('') +
        '</div><div class="rcount"><b data-rc>0</b> من ' + rs.length + '</div></section>';
    }

    if (d.letter && d.letter.trim()) {
      h += '<section class="sec letter" data-s="letter"><div class="t">A <em>letter</em></div><div class="env' + (o.preview ? ' open' : '') + '" data-env><div class="paperl">' + paragraphs(d.letter) + '</div>' +
        '<button class="envseal" data-envopen><span class="en">for you</span><b>افتحي الجواب</b></button></div></section>';
    }

    var ps = (d.promises || []).filter(function (r) { return String(r || '').trim(); }).slice(0, 8);
    if (ps.length) {
      h += '<section class="sec promises" data-s="promises"><div class="t">My <em>promises</em></div><ol class="pl">' +
        ps.map(function (p, i) { return '<li class="rv" style="transition-delay:' + (i * .12) + 's"><i>' + (i < 9 ? '0' : '') + (i + 1) + '</i><p>' + esc(p) + '</p></li>'; }).join('') +
        '</ol>' + (him ? '<div class="sign rv"><span>وعد من</span><b>' + esc(him) + '</b></div>' : '') + '</section>';
    }

    if (o.plan === 'full' && safeUrl(d.voice)) {
      h += '<section class="sec center" data-s="voice"><div class="t">In my <em>voice</em></div>' +
        '<div class="voice"><button data-voice>▶</button><div class="wave">' + Array(36).join('.').split('.').map(function (x, i) { return '<i style="height:' + (20 + Math.round(Math.abs(Math.sin(i * 1.7)) * 70)) + '%"></i>'; }).join('') +
        '</div><span data-vt>0:00</span></div><audio preload="metadata" data-src="' + esc(d.voice) + '"></audio></section>';
    }

    var ow = d.openWhen && d.openWhen.on ? (d.openWhen.notes || []).filter(function (n) { return n && String(n.w || '').trim() && String(n.t || '').trim(); }).slice(0, 6) : [];
    if (o.plan === 'full' && ow.length) {
      h += '<section class="sec ow" data-s="openwhen"><div class="t">Open <em>when</em></div><p class="sub2">جوابات صغيرة، كل واحد ليه وقته</p><div class="owg">' +
        ow.map(function (n, i) { return '<button class="owc" data-ow="' + i + '" style="--i:' + i + '"><span class="lb">افتحيه</span><b>' + esc(n.w) + '</b><span class="st">مقفول</span></button>'; }).join('') +
        '</div></section>';
    }
    if (o.plan === 'full' && d.surprise && d.surprise.on && String(d.surprise.t || '').trim()) {
      h += '<section class="sec surp center" data-s="surprise"><div class="t">A little <em>surprise</em></div><p class="sub2">امسحي بصباعك</p>' +
        '<div class="scr"><p>' + esc(d.surprise.t) + '</p><canvas></canvas></div></section>';
    }

    h += '<section class="wish rv" data-s="wish"><img data-src="' + WISH_IMG + '" alt=""><div class="in2 rv">' +
      '<h2>Happy birthday,<br><em>' + esc(herEn || her) + '</em></h2>' +
      '<button class="wbtn">اتمني أمنية واضغطي هنا</button><p class="wtxt">' + esc(d.wish || ('كل سنة وإنتي طيبة يا ' + (d.pet || her))) + '</p></div></section>';

    h += '<section class="sec end center" data-s="end"><div class="t">To be <em>continued</em></div><p class="endl">والحكاية لسه في أولها.</p>' +
      (him ? '<p class="sig"><span>بحبك،</span><b>' + esc(him) + '</b></p>' : '') + '<button class="again" data-again>اقري من الأول</button></section>';
    if (ow.length && o.plan === 'full') h += '<div class="sheet" data-sheet hidden><div class="shd"><i class="grab"></i><span class="en">Open when</span><b data-sw></b><p data-st></p><button data-close>اقفليه</button></div></div>';
    var site = (window.OS_CONFIG && window.OS_CONFIG.siteUrl) || '../';
    h += '<footer class="foot"><span>Made with</span><a href="' + esc(site) + '" target="_blank" rel="noopener"><img src="../assets/logo.png" alt="Our Story" width="80"></a></footer>';
    return h;
  }

  function wire(root, d, o) {
    var still = o.preview || o.still || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
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

    /* المقدمة: الظرف بيتفتح */
    var intro = root.querySelector('[data-intro]');
    function opened() { document.body.classList.add('opened'); document.body.classList.remove('intro-on'); }
    if (intro) {
      document.body.classList.add('intro-on'); document.body.classList.remove('opened');
      var openIt = function () {
        if (intro.classList.contains('go')) return;
        intro.classList.add('go'); setTimeout(opened, 350);
        setTimeout(function () { intro.remove(); }, 1500);
      };
      intro.querySelector('[data-open]').addEventListener('click', openIt);
      if (o.autoOpen) timers.push(setTimeout(openIt, o.autoOpen));
    } else opened();

    /* الأرقام بتجري لما تبان */
    var numsDone = false;
    function runNums() {
      if (numsDone || !d.met) return; numsDone = true;
      var mins = Math.max(0, (Date.now() - new Date(d.met)) / 6e4);
      var v = { months: Math.floor(mins / 43830), mornings: Math.floor(mins / 1440), hours: Math.floor(mins / 60), beats: Math.floor(mins * 72) };
      root.querySelectorAll('[data-n]').forEach(function (el) {
        var to = v[el.getAttribute('data-n')], t0 = null;
        if (still) { el.textContent = to.toLocaleString('en'); return; }
        (function f(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 2200), e = 1 - Math.pow(2, -10 * k); el.textContent = Math.round(to * (k === 1 ? 1 : e)).toLocaleString('en'); if (k < 1) requestAnimationFrame(f); })(performance.now());
      });
    }
    var nb = root.querySelector('.nums');
    if (nb) { if (still) runNums(); else { var nio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { nb.classList.add('in'); runNums(); nio.disconnect(); } }, { threshold: .3 }); nio.observe(nb); timers.push(0); } }

    /* حاجات بحبها فيكي: الكارت بيتقلب */
    var rcN = root.querySelector('[data-rc]');
    root.querySelectorAll('.rc').forEach(function (c) {
      c.addEventListener('click', function () {
        if (!c.classList.contains('flip')) { c.classList.add('flip'); if (rcN) rcN.textContent = root.querySelectorAll('.rc.flip').length; if (root.querySelectorAll('.rc:not(.flip)').length === 0) hearts(c); }
        else c.classList.remove('flip');
      });
    });

    /* الجواب في ظرف */
    var env = root.querySelector('[data-env]');
    if (env) {
      var showLines = function () { env.querySelectorAll('.paperl p').forEach(function (p, i) { p.style.transitionDelay = (.5 + i * .28) + 's'; p.classList.add('in'); }); };
      if (env.classList.contains('open') || still) { env.classList.add('open'); showLines(); }
      env.querySelector('[data-envopen]').addEventListener('click', function () { env.classList.add('open'); showLines(); });
    }

    /* افتحيها لما... */
    var sheet = root.querySelector('[data-sheet]'), notes = (d.openWhen && d.openWhen.notes || []).filter(function (n) { return n && String(n.w || '').trim() && String(n.t || '').trim(); });
    var owKey = 'os:ow:' + location.search;
    var seen = {}; try { seen = JSON.parse(localStorage.getItem(owKey) || '{}'); } catch (e) {}
    root.querySelectorAll('[data-ow]').forEach(function (b) {
      var i = +b.getAttribute('data-ow');
      if (seen[i]) { b.classList.add('seen'); b.querySelector('.st').textContent = 'اتفتح'; }
      b.addEventListener('click', function () {
        var n = notes[i]; if (!n || !sheet) return;
        sheet.querySelector('[data-sw]').textContent = n.w; sheet.querySelector('[data-st]').textContent = n.t;
        sheet.hidden = false; requestAnimationFrame(function () { sheet.classList.add('on'); });
        b.classList.add('seen'); b.querySelector('.st').textContent = 'اتفتح';
        seen[i] = 1; try { localStorage.setItem(owKey, JSON.stringify(seen)); } catch (e) {}
      });
    });
    if (sheet) {
      var closeSheet = function () { sheet.classList.remove('on'); setTimeout(function () { sheet.hidden = true; }, 450); };
      sheet.addEventListener('click', function (e) { if (e.target === sheet || e.target.hasAttribute('data-close')) closeSheet(); });
    }

    /* المفاجأة: امسحي */
    var scr = root.querySelector('.scr');
    if (scr) scratch(scr, still && !o.preview);

    /* صور الذكريات بتكبر */
    root.querySelectorAll('.m .ph img').forEach(function (im) {
      im.addEventListener('click', function () {
        var m = im.closest('.m'), bx = document.createElement('div'); bx.className = 'lbx';
        bx.innerHTML = '<img src="' + im.src + '" alt=""><p>' + esc((m.querySelector('h3') || {}).textContent || '') + '</p>';
        document.body.appendChild(bx); requestAnimationFrame(function () { bx.classList.add('on'); });
        bx.addEventListener('click', function () { bx.classList.remove('on'); setTimeout(function () { bx.remove(); }, 400); });
      });
    });

    var again = root.querySelector('[data-again]');
    if (again) again.addEventListener('click', function () { scrollTo({ top: 0, behavior: 'smooth' }); });

    var wb = root.querySelector('.wbtn');
    if (wb) wb.addEventListener('click', function () { wb.style.display = 'none'; root.querySelector('.wtxt').classList.add('show'); confetti(); });
    return function () { timers.forEach(function (t) { clearInterval(t); clearTimeout(t); }); io.disconnect(); };
  }

  function scratch(box, reveal) {
    var cv = box.querySelector('canvas'), x = cv.getContext('2d'), done = false;
    var acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#BD5265';
    function paint() {
      var r = box.getBoundingClientRect(), k = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, r.width * k); cv.height = Math.max(1, r.height * k); x.setTransform(k, 0, 0, k, 0, 0);
      var g = x.createLinearGradient(0, 0, r.width, r.height); g.addColorStop(0, acc); g.addColorStop(1, '#302622');
      x.globalCompositeOperation = 'source-over'; x.fillStyle = g; x.fillRect(0, 0, r.width, r.height);
      x.fillStyle = 'rgba(255,255,255,.9)'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'rtl';
      x.font = '700 18px Estedad, sans-serif'; x.fillText('امسحي هنا', r.width / 2, r.height / 2 - 8);
      x.font = 'italic 400 15px Zodiak, Georgia, serif'; x.fillText('for you', r.width / 2, r.height / 2 + 18);
    }
    if (reveal) { box.classList.add('done'); return; }
    paint(); if (document.fonts) document.fonts.ready.then(function () { if (!done && !box.__s) paint(); });
    var last = null, moves = 0;
    function at(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    function rub(p) {
      box.__s = 1; x.globalCompositeOperation = 'destination-out'; x.lineCap = 'round'; x.lineWidth = 46;
      x.beginPath(); x.moveTo((last || p)[0], (last || p)[1]); x.lineTo(p[0], p[1]); x.stroke(); last = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      var dt = x.getImageData(0, 0, cv.width, cv.height).data, n = 0, c = 0;
      for (var i = 3; i < dt.length; i += 64) { n++; if (dt[i] < 40) c++; }
      if (!done && c / n > .45) { done = true; box.classList.add('done'); hearts(box); }
    }
    cv.addEventListener('pointerdown', function (e) { cv.setPointerCapture && cv.setPointerCapture(e.pointerId); last = null; rub(at(e)); });
    cv.addEventListener('pointermove', function (e) { if (e.buttons || e.pointerType === 'touch') rub(at(e)); });
    cv.addEventListener('pointerup', function () { last = null; check(); });
    box.__rub = rub; box.__check = check;
  }

  /* قلوب صغيرة بتطلع من عنصر (مرسومة بالكود، من غير إيموجي) */
  function hearts(el) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var r = el.getBoundingClientRect(), cv = document.createElement('canvas'); cv.className = 'cf'; document.body.appendChild(cv);
    var x = cv.getContext('2d'), W = cv.width = innerWidth, H = cv.height = innerHeight, ps = [];
    var acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#BD5265';
    for (var i = 0; i < 26; i++) ps.push({ x: r.left + r.width * Math.random(), y: r.top + r.height * (.3 + .5 * Math.random()), s: 6 + Math.random() * 9, vy: -1.2 - Math.random() * 2.2, vx: -1 + Math.random() * 2, a: 1, c: i % 3 ? acc : '#F2C9C2' });
    var t0 = performance.now();
    (function fr(t) {
      x.clearRect(0, 0, W, H);
      ps.forEach(function (p) {
        p.y += p.vy; p.x += p.vx * .6; p.a = Math.max(0, 1 - (t - t0) / 2200); x.globalAlpha = p.a; x.fillStyle = p.c;
        var s = p.s; x.beginPath(); x.moveTo(p.x, p.y + s * .35); x.bezierCurveTo(p.x + s, p.y - s * .4, p.x + s * .45, p.y - s, p.x, p.y - s * .45); x.bezierCurveTo(p.x - s * .45, p.y - s, p.x - s, p.y - s * .4, p.x, p.y + s * .35); x.fill();
      });
      if (t - t0 < 2300) requestAnimationFrame(fr); else cv.remove();
    })(t0);
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
