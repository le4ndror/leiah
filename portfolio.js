(function () {
  'use strict';
  var root = document.querySelector('.jk');
  if (!root) return;
  var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };

  /* marquee: repete os cartões 3x e recua a linha 1 um conjunto */
  var row1 = document.getElementById('row1'), row2 = document.getElementById('row2'), marquee = document.getElementById('marquee');
  var n1 = row1.children.length;
  [row1, row2].forEach(function (r) { r.innerHTML = r.innerHTML + r.innerHTML + r.innerHTML; });
  row1.style.marginLeft = (-n1 * (420 + 12)) + 'px';

  /* texto que acende letra por letra */
  var animP = document.getElementById('animated-text');
  var text = animP.getAttribute('data-text'), total = text.length, chars = [], idx = 0;
  text.split(' ').forEach(function (word, wi, arr) {
    var w = document.createElement('span'); w.className = 'word';
    word.split('').forEach(function (ch) {
      var c = document.createElement('span'); c.className = 'char';
      var ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = ch;
      var an = document.createElement('span'); an.className = 'an'; an.textContent = ch;
      c.appendChild(ph); c.appendChild(an); w.appendChild(c);
      chars.push({ el: an, i: idx }); idx++;
    });
    animP.appendChild(w);
    if (wi < arr.length - 1) { animP.appendChild(document.createTextNode(' ')); idx++; }
  });

  /* fade in */
  var fades = root.querySelectorAll('.fade');
  fades.forEach(function (el) {
    var d = el.dataset;
    el.style.setProperty('--x', (d.x || 0) + 'px');
    el.style.setProperty('--y', (d.y !== undefined ? d.y : 30) + 'px');
    el.style.setProperty('--d', (d.duration || 0.7) + 's');
    el.style.setProperty('--delay', (d.delay || 0) + 's');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '50px' });
    fades.forEach(function (el) { io.observe(el); });
  } else fades.forEach(function (el) { el.classList.add('in'); });

  /* ímã na cabeça */
  root.querySelectorAll('[data-magnet]').forEach(function (wrap) {
    var inner = wrap.querySelector('.magnet-inner');
    var pad = parseFloat(wrap.dataset.padding) || 150, str = parseFloat(wrap.dataset.strength) || 3, on = false;
    var set = function (v) { if (v !== on) { on = v; inner.classList.toggle('active', v); } };
    window.addEventListener('mousemove', function (e) {
      var r = wrap.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      if (Math.abs(cx - e.clientX) < r.width / 2 + pad && Math.abs(cy - e.clientY) < r.height / 2 + pad) {
        set(true);
        inner.style.transform = 'translate3d(' + ((e.clientX - cx) / str) + 'px,' + ((e.clientY - cy) / str) + 'px,0)';
      } else { set(false); inner.style.transform = 'translate3d(0,0,0)'; }
    });
  });

  /* efeitos ligados ao scroll */
  var groups = [].map.call(root.querySelectorAll('.cards'), function (c) {
    return { el: c, cards: [].slice.call(c.querySelectorAll('.card')) };
  });
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight, sy = window.scrollY;
    var top = marquee.getBoundingClientRect().top + sy;
    var off = (sy - top + vh) * 0.3;
    row1.style.transform = 'translateX(' + (off - 200) + 'px)';
    row2.style.transform = 'translateX(' + (-(off - 200)) + 'px)';

    var pr = animP.getBoundingClientRect();
    var p = clamp01((0.8 * vh - pr.top) / (0.6 * vh + pr.height));
    for (var k = 0; k < chars.length; k++) {
      var s = chars[k].i / total, e = (chars[k].i + 1) / total;
      chars[k].el.style.opacity = (0.2 + 0.8 * clamp01((p - s) / (e - s))).toFixed(3);
    }

    groups.forEach(function (g) {
      var cr = g.el.getBoundingClientRect(), sc = cr.height - vh;
      var prog = sc > 0 ? clamp01(-cr.top / sc) : 0, n = g.cards.length;
      g.cards.forEach(function (card, i) {
        var target = 1 - (n - 1 - i) * 0.03, start = i * 0.25;
        var t = clamp01((prog - start) / (1 - start));
        card.style.transform = 'scale(' + (1 + (target - 1) * t).toFixed(4) + ')';
      });
    });
  }
  var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* a fonte Kanit muda as alturas: recalcula os gatilhos do GSAP */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { update(); if (window.ScrollTrigger) ScrollTrigger.refresh(); });
  }
})();
