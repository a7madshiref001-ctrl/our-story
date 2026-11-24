/* ============================================================
   طبقة الباك إند — نفس الواجهة في الوضعين:
   demo: كل حاجة على الجهاز (IndexedDB) + دفع تجريبي
   live: Supabase (RPC + Storage + Edge Functions) + Paymob
   ============================================================ */
(function () {
  var CFG = window.OS_CONFIG;
  var LIVE = CFG.mode === 'live' && CFG.supabaseUrl && CFG.supabaseAnonKey;

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  function slugify(en) {
    var base = String(en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20);
    return (base || 'story') + '-' + Math.random().toString(36).slice(2, 7);
  }

  /* ---------- session (لينك التعديل محفوظ على الجهاز) ---------- */
  var Session = {
    get: function () { try { return JSON.parse(localStorage.getItem('os:session')); } catch (e) { return null; } },
    set: function (s) { try { localStorage.setItem('os:session', JSON.stringify(s)); } catch (e) {} },
    clear: function () { try { localStorage.removeItem('os:session'); } catch (e) {} }
  };

  /* ================= DEMO (IndexedDB) ================= */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var r = indexedDB.open('our-story-demo', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('stories'); r.result.createObjectStore('blobs'); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function idb(store, mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var tx = d.transaction(store, mode), st = tx.objectStore(store), out;
        var q = fn(st);
        if (q) q.onsuccess = function () { out = q.result; };
        tx.oncomplete = function () { res(out); };
        tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function getRec(id) { return idb('stories', 'readonly', function (s) { return s.get(id); }); }
  function putRec(rec) { return idb('stories', 'readwrite', function (s) { return s.put(rec, rec.id); }); }
  function findBySlug(slug) {
    return idb('stories', 'readonly', function (s) { return s.getAll(); }).then(function (all) {
      return (all || []).filter(function (r) { return r.slug === slug; })[0] || null;
    });
  }
  function authed(id, token) {
    return getRec(id).then(function (r) { if (!r || r.token !== token) throw new Error('auth'); return r; });
  }
  var urlCache = {};

  var Demo = {
    createDraft: function (info) {
      var rec = { id: uuid(), token: uuid(), status: 'draft', plan: 'full', buyer: info.buyer, phone: info.phone, data: { him: info.buyer, her: info.her }, created: Date.now() };
      return putRec(rec).then(function () { return { id: rec.id, token: rec.token }; });
    },
    saveDraft: function (id, token, data) {
      return authed(id, token).then(function (r) { r.data = data; r.updated = Date.now(); return putRec(r); });
    },
    loadDraft: function (id, token) {
      return authed(id, token).then(function (r) { return { status: r.status, plan: r.plan, slug: r.slug, data: r.data, email: r.email || '' }; });
    },
    upload: function (id, token, blob, kind) {
      return authed(id, token).then(function () {
        var key = id + '/' + uuid();
        return idb('blobs', 'readwrite', function (s) { return s.put(blob, key); }).then(function () { return 'idb:' + key; });
      });
    },
    mediaUrl: function (u) {
      if (!u || u.indexOf('idb:') !== 0) return Promise.resolve(u);
      if (urlCache[u]) return Promise.resolve(urlCache[u]);
      return idb('blobs', 'readonly', function (s) { return s.get(u.slice(4)); }).then(function (b) {
        if (!b) return '';
        return (urlCache[u] = URL.createObjectURL(b));
      });
    },
    startPayment: function (id, token, plan, email) {
      return authed(id, token).then(function (r) {
        r.plan = plan; r.email = email; r.status = 'pending'; r.amount = CFG.plans[plan].price;
        return putRec(r).then(function () { return { url: '../pay/?id=' + encodeURIComponent(id) }; });
      });
    },
    /* بوابة الدفع التجريبية بس — مش موجودة في وضع live */
    demoPay: function (id) {
      return getRec(id).then(function (r) {
        if (!r) throw new Error('missing');
        if (r.status !== 'paid') { r.status = 'paid'; r.slug = slugify(r.data && r.data.herEn); r.paidAt = Date.now(); }
        return putRec(r).then(function () { return r; });
      });
    },
    demoInfo: function (id) { return getRec(id).then(function (r) { return r ? { plan: r.plan, amount: r.amount, her: r.data && r.data.her, status: r.status } : null; }); },
    getStatus: function (id, token) {
      return authed(id, token).then(function (r) { return { status: r.status, slug: r.slug, plan: r.plan, data: r.data }; });
    },
    /* نفس منطق get_story_public في SQL بالظبط */
    getPublic: function (slug, answer) {
      return findBySlug(slug).then(function (r) {
        if (!r || r.status !== 'paid') return null;
        var d = r.data, full = r.plan === 'full', herN = d.herEn || d.her;
        if (full && d.lock && d.lock.on && d.lock.at && new Date(d.lock.at) > new Date()) return { locked: true, at: d.lock.at, her: herN, him: d.him, theme: d.theme };
        if (full && d.secret && d.secret.on && d.secret.h && answer !== d.secret.h) return { secret: true, q: d.secret.q, hint: d.secret.hint, wrong: answer != null, her: herN, theme: d.theme };
        var out = JSON.parse(JSON.stringify(d)); if (out.secret) delete out.secret.h;
        return { plan: r.plan, data: out };
      });
    }
  };

  /* ================= LIVE (Supabase + Paymob) ================= */
  function keyHeaders() {
    var h = { apikey: CFG.supabaseAnonKey };
    if (/^eyJ/.test(CFG.supabaseAnonKey)) h.Authorization = 'Bearer ' + CFG.supabaseAnonKey; /* المفاتيح القديمة (JWT) بس */
    return h;
  }
  function sb(path, body) {
    return fetch(CFG.supabaseUrl + path, {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, keyHeaders()),
      body: JSON.stringify(body || {})
    }).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {}
        if (!r.ok) throw new Error((j && (j.message || j.error)) || ('HTTP ' + r.status));
        return j;
      });
    });
  }
  function rpc(fn, args) { return sb('/rest/v1/rpc/' + fn, args); }
  function fx(fn, args) { return sb('/functions/v1/' + fn, args); }

  var Live = {
    createDraft: function (info) {
      return rpc('create_story', { p_buyer: info.buyer, p_phone: info.phone, p_her: info.her }).then(function (r) { return { id: r.id, token: r.token }; });
    },
    saveDraft: function (id, token, data) { return rpc('save_story', { p_id: id, p_token: token, p_data: data }); },
    loadDraft: function (id, token) { return rpc('get_story_edit', { p_id: id, p_token: token }); },
    upload: function (id, token, blob, kind) {
      var ext = kind === 'audio' ? (blob.type.indexOf('mp4') > -1 ? 'm4a' : blob.type.indexOf('ogg') > -1 ? 'ogg' : 'webm') : 'jpg';
      return fx('upload-url', { id: id, token: token, kind: kind, ext: ext }).then(function (u) {
        return fetch(u.signedUrl, { method: 'PUT', headers: Object.assign({ 'Content-Type': blob.type || 'application/octet-stream', 'x-upsert': 'false', 'cache-control': 'max-age=31536000' }, keyHeaders()), body: blob })
          .then(function (r) { if (!r.ok) throw new Error('upload ' + r.status); return u.publicUrl; });
      });
    },
    mediaUrl: function (u) { return Promise.resolve(u); },
    startPayment: function (id, token, plan, email) { return fx('create-payment', { id: id, token: token, plan: plan, email: email }); },
    getStatus: function (id, token) { return rpc('get_story_edit', { p_id: id, p_token: token }); },
    getPublic: function (slug, answer) { return rpc('get_story_public', { p_slug: slug, p_answer: answer == null ? null : answer }); }
  };

  window.OS_API = Object.assign({ live: !!LIVE, session: Session, uuid: uuid }, LIVE ? Live : Demo);
})();
