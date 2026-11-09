// AK Prestige Cleaning - site scripts
(function () {
  // mobile nav
  var b = document.querySelector('.burger'), m = document.querySelector('.mnav');
  if (b && m) {
    b.addEventListener('click', function () { m.classList.add('open'); });
    m.querySelector('.close').addEventListener('click', function () { m.classList.remove('open'); });
    m.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { m.classList.remove('open'); }); });
  }

  // reveal on scroll
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // before / after slider
  document.querySelectorAll('.ba').forEach(function (ba) {
    var r = ba.querySelector('input'), w = ba.querySelector('.after-wrap'), h = ba.querySelector('.handle');
    function set(v) { w.style.clipPath = 'inset(0 0 0 ' + v + '%)'; h.style.left = v + '%'; }
    r.addEventListener('input', function () { set(r.value); });
    set(r.value);
  });

  // services tabs: highlight current section
  var tabs = document.querySelectorAll('.svc-tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    var map = {};
    tabs.forEach(function (t) { var s = document.querySelector(t.getAttribute('href')); if (s) map[s.id] = t; });
    var tio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { tabs.forEach(function (t) { t.classList.remove('on'); }); map[e.target.id].classList.add('on'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { tio.observe(document.getElementById(id)); });
  }

  // quote forms: compose an email to the business with the details entered
  document.querySelectorAll('form.quote-form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var lines = [], fd = new FormData(f), seen = {};
      fd.forEach(function (v, k) {
        if (!v) return;
        if (seen[k] !== undefined) { lines[seen[k]] += ', ' + v; return; }
        seen[k] = lines.length; lines.push(k + ': ' + v);
      });
      var body = encodeURIComponent('Hi AK Prestige Cleaning,\n\nI would like a free quote.\n\n' + lines.join('\n'));
      window.location.href = 'mailto:Bailey@akprestigecleaningau.com?subject=' + encodeURIComponent('Free Quote Request') + '&body=' + body;
      var ok = f.querySelector('.form-ok'); if (ok) ok.classList.add('show');
    });
  });

  // review pop-ups: show up to 2 Google reviews once per visit
  (function () {
    var box = document.getElementById('rtoast'), R = window.AK_REVIEWS || [];
    if (!box || !R.length) return;
    try { if (sessionStorage.getItem('akRevShown')) return; sessionStorage.setItem('akRevShown', '1'); } catch (e) {}
    var order = R.slice().sort(function () { return Math.random() - .5; }).slice(0, 2), i = 0, closed = false, t;
    function fill(r) {
      box.querySelector('.rt-name').textContent = r.n;
      box.querySelector('.rt-when').textContent = r.w;
      box.querySelector('.rt-av').textContent = r.n.charAt(0);
      box.querySelector('.rt-text').textContent = '“' + r.t + '”';
    }
    function hide(next) { box.classList.remove('show'); setTimeout(function () { box.hidden = true; if (next) next(); }, 450); }
    function show() {
      if (closed || i >= order.length) return;
      fill(order[i++]); box.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('show'); }); });
      t = setTimeout(function () { hide(function () { t = setTimeout(show, 6000); }); }, 8000);
    }
    box.querySelector('.rt-x').addEventListener('click', function () { closed = true; clearTimeout(t); hide(); });
    setTimeout(show, 5000);
  })();

  // free quote wizard
  (function () {
    var f = document.getElementById('wizard'); if (!f) return;
    var sel = {}, money = function (n) { return '$' + n; };
    function render() {
      var ul = document.getElementById('sumList'), tot = 0, html = '';
      Object.keys(sel).forEach(function (k) {
        var it = sel[k]; if (!it.q) return;
        var line = it.p * it.q; tot += line;
        html += '<li><span>' + it.l + (it.q > 1 ? ' &times; ' + it.q : '') + '</span><span>' + money(line) + '</span></li>';
      });
      ul.innerHTML = html;
      document.getElementById('sumEmpty').hidden = !!html;
      document.getElementById('sumTot').hidden = !html;
      document.getElementById('totVal').textContent = money(tot);
    }
    f.querySelectorAll('.qty').forEach(function (q) {
      var k = q.dataset.key, o = q.querySelector('output');
      function set(n) { n = Math.max(0, n); o.textContent = n; sel[k] = { l: q.dataset.label, p: +q.dataset.price, q: n }; render(); }
      q.querySelector('.q-p').addEventListener('click', function () { set(+o.textContent + 1); });
      q.querySelector('.q-m').addEventListener('click', function () { set(+o.textContent - 1); });
    });
    f.querySelectorAll('.pick').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = !b.classList.contains('sel');
        f.querySelectorAll('.pick[data-group="' + b.dataset.group + '"]').forEach(function (x) { x.classList.remove('sel'); x.textContent = 'Select'; delete sel[x.dataset.key]; });
        if (on) { b.classList.add('sel'); b.textContent = 'Selected'; sel[b.dataset.key] = { l: b.dataset.label + (b.dataset.key.indexOf('bond') === 0 ? ' (Bond Clean)' : ' (Regular Clean)'), p: +b.dataset.price, q: 1 }; }
        render();
      });
    });
    f.querySelectorAll('.tog').forEach(function (b) {
      b.addEventListener('click', function () {
        var on = b.classList.toggle('sel'); b.textContent = on ? 'Added' : 'Add to quote';
        if (on) sel[b.dataset.key] = { l: b.dataset.label, p: +b.dataset.price, q: 1 }; else delete sel[b.dataset.key];
        render();
      });
    });
    var steps = f.querySelectorAll('.wstep'), dots = document.querySelectorAll('#steps li'), cur = 1;
    function go(n) {
      cur = n;
      steps.forEach(function (s) { s.classList.toggle('on', +s.dataset.step === n); });
      dots.forEach(function (d) { var i = +d.dataset.s; d.classList.toggle('on', i === n); d.classList.toggle('done', i < n); });
      if (n === 4) review();
      var top = document.getElementById('steps').getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    function valid(n) {
      var ok = true, step = f.querySelector('.wstep[data-step="' + n + '"]');
      if (n === 1 && !Object.keys(sel).some(function (k) { return sel[k].q; })) {
        alertBox('Please choose at least one service or add-on to continue.'); return false;
      }
      step.querySelectorAll('[required]').forEach(function (el) {
        var bad = !el.value || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
        el.closest('.field').classList.toggle('err', bad); if (bad) ok = false;
      });
      if (!ok) { var e = step.querySelector('.err input,.err select'); if (e) e.focus(); }
      return ok;
    }
    function alertBox(msg) {
      var b = f.querySelector('.w-msg');
      if (!b) { b = document.createElement('p'); b.className = 'qnote w-msg'; b.style.borderRadius = '14px'; b.style.marginBottom = '16px'; f.querySelector('.wstep[data-step="1"] .wnav').before(b); }
      b.textContent = msg;
    }
    function data() {
      var fd = new FormData(f), out = [];
      var items = Object.keys(sel).filter(function (k) { return sel[k].q; }).map(function (k) { var i = sel[k]; return i.l + (i.q > 1 ? ' x ' + i.q : '') + ' (' + money(i.p * i.q) + ')'; });
      out.push(['Services', items.join('; ')]);
      out.push(['Estimated from', document.getElementById('totVal').textContent]);
      fd.forEach(function (v, k) { if (v) out.push([k, v]); });
      return out;
    }
    function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function review() {
      document.getElementById('review').innerHTML = '<div class="review-list">' + data().map(function (r) { return '<div><span>' + esc(r[0]) + '</span><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>';
    }
    f.querySelectorAll('.w-next').forEach(function (b) { b.addEventListener('click', function () { if (valid(cur)) { var m = f.querySelector('.w-msg'); if (m) m.remove(); go(cur + 1); } }); });
    f.querySelectorAll('.w-back').forEach(function (b) { b.addEventListener('click', function () { go(cur - 1); }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var body = 'Hi AK Prestige Cleaning,\n\nI would like a free quote.\n\n' + data().map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
      window.location.href = 'mailto:Bailey@akprestigecleaningau.com?subject=' + encodeURIComponent('Free Quote Request') + '&body=' + encodeURIComponent(body);
      document.getElementById('sent').classList.add('show');
    });
    // preselect from ?service= is not needed; start at step 1
  })();

  // service tabs
  document.querySelectorAll('.stabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.stabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('.tpanel').forEach(function (p) { p.classList.toggle('on', p.id === b.dataset.t); });
    });
  });

  // pricing toggle (regular / bond)
  var pt = document.querySelector('.p2-toggle');
  if (pt) pt.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      var m = b.dataset.mode;
      pt.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      pt.classList.toggle('bond', m === 'bond');
      document.querySelectorAll('.pricing2 [data-res]').forEach(function (el) {
        el.classList.add('flip');
        setTimeout(function () { el.textContent = el.dataset[m]; el.classList.remove('flip'); }, 180);
      });
      var h = document.querySelector('.pricing2 h2');
      if (h) h.innerHTML = m === 'bond' ? 'Bond Cleaning <em class="accent">Price List</em>' : 'Residential Cleaning <em class="accent">Price List</em>';
    });
  });

  var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
})();
