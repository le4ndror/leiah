/* =========================== Tela inicial (LEIAH) =========================== */
(function () {
/* ---------- configuração ---------- */
const CONFIG = { wordmark: "Leiah", seed: 102 };
// cores das bolhas (a primeira é o fundo da palavra)
const colors = ["#b3001b","#7a0012","#d90429","#ef233c","#ff4d5e","#ff8a94","#4d000b","#9d0f26","#e5384f","#ffb3ba"];
const FONT_DISPLAY = '"Poppins","Montserrat","Avenir Next",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';

/* ---------- utilidades ---------- */
const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBubbles(seed, w, h, nColors, density = 1, scale = 1) {
  const rnd = mulberry32(seed);
  const unit = Math.max(6, Math.min(w, h) * 0.12 * scale);
  const n = Math.round(clamp(((w * h) / (unit * unit * 1.25)) * density, 12, 1400));
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = unit * (0.22 + 1.3 * Math.pow(rnd(), 2.3));
    out.push({
      x: rnd() * (w + r) - r / 2, y: rnd() * (h + r) - r / 2, r,
      c: 1 + Math.floor(rnd() * Math.max(1, nColors - 1)),
      ph: rnd() * Math.PI * 2, amp: 1 + rnd() * 3.5, sp: 0.25 + rnd() * 0.6,
      ox: 0, oy: 0, s: 1,
    });
  }
  return out.sort((a, b) => b.r - a.r);
}

/* ---------- órbita com pontinhos ---------- */
(function () {
  const g = $("#orbit2");
  const NS = "http://www.w3.org/2000/svg";
  const add = (cx, cy, r, opacity) => {
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", r);
    c.setAttribute("fill", "var(--aa-blue)");
    if (opacity != null) c.setAttribute("opacity", opacity);
    g.appendChild(c);
  };
  add(50, 1, 1.4);
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * 0.62 + i * 0.075;
    add(50 + Math.cos(a) * 44, 50 + Math.sin(a) * 44, 0.35 + (14 - i) * 0.06, 0.4 + (14 - i) / 28);
  }
})();

/* ---------- agulha do logo segue o ponteiro ---------- */
(function () {
  const svg = $("#logo"), parts = document.querySelectorAll(".aa-rot");
  if (reduced) parts.forEach((p) => (p.style.transition = "none"));
  let raf = 0, deg = -45, px = 0, py = 0;
  const unwrap = (prev, next) => {
    let d = (next - prev) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return prev + d;
  };
  const apply = () => {
    raf = 0;
    const r = svg.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.hypot(px - cx, py - cy) < r.width * 0.3) return;
    deg = unwrap(deg, (Math.atan2(py - cy, px - cx) * 180) / Math.PI);
    parts.forEach((p) => (p.style.transform = "rotate(" + deg.toFixed(1) + "deg)"));
  };
  addEventListener("pointermove", (e) => {
    px = e.clientX; py = e.clientY;
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });
})();

/* ---------- bolhas no canvas ---------- */
(function () {
  const cv = $("#cv"), ctx = cv.getContext("2d"), host = $("#wm");
  const rand = mulberry32(CONFIG.seed ^ 0x5bd1e995);
  const popsEl = $("#pops");
  let w = 0, h = 0, dpr = 1, list = [], sparks = [];
  let raf = 0, running = false, visible = true, textSize = 0, textW = 0, textFor = "", pops = 0;
  const ptr = { x: -1e4, y: -1e4, on: false, dx: 0, dy: 0 };
  const FIT = 0.8; // largura da palavra em relação ao quadro (diminua para a palavra ficar menor)

  const draw = (t) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = colors[0];
    ctx.fillRect(0, 0, w, h);
    const ts = t / 1000;
    const R = Math.max(70, Math.min(h, w) * 0.34);

    for (const b of list) {
      let tx = 0, ty = 0;
      if (ptr.on) {
        const dx = b.x + b.ox - ptr.x, dy = b.y + b.oy - ptr.y;
        const d = Math.hypot(dx, dy) || 1;
        const reach = R + b.r;
        if (d < reach) {
          const f = 1 - d / reach;
          const push = f * f * R * 0.6;
          tx = (dx / d) * push + ptr.dx * f * 0.6;
          ty = (dy / d) * push + ptr.dy * f * 0.6;
        }
      }
      if (reduced) { b.ox = tx; b.oy = ty; b.s = 1; }
      else {
        b.ox += (tx - b.ox) * 0.09;
        b.oy += (ty - b.oy) * 0.09;
        b.s += (1 - b.s) * 0.07;
      }
      const wx = reduced ? 0 : Math.sin(ts * b.sp + b.ph) * b.amp;
      const wy = reduced ? 0 : Math.cos(ts * b.sp * 0.8 + b.ph) * b.amp;
      ctx.fillStyle = colors[b.c % colors.length];
      ctx.beginPath();
      ctx.arc(b.x + b.ox + wx, b.y + b.oy + wy, Math.max(0.1, b.r * b.s), 0, Math.PI * 2);
      ctx.fill();
    }
    ptr.dx *= 0.85; ptr.dy *= 0.85;

    if (sparks.length) {
      for (const s of sparks) {
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.94; s.vy = s.vy * 0.94 - 0.05;
        s.life -= 0.022;
        if (s.life <= 0) continue;
        ctx.fillStyle = colors[s.c % colors.length];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      sparks = sparks.filter((s) => s.life > 0);
    }

    // a palavra recorta o campo de bolhas (centralizada no quadro)
    const key = w + "|" + h;
    if (key !== textFor) {
      ctx.font = "800 100px " + FONT_DISPLAY;
      const mw = ctx.measureText(CONFIG.wordmark).width || 1;
      textSize = Math.min((100 * w * FIT) / mw, h * 1.1);
      textW = (mw * textSize) / 100;
      textFor = key;
    }
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#000";
    ctx.font = "800 " + textSize.toFixed(1) + "px " + FONT_DISPLAY;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(CONFIG.wordmark, (w - textW) / 2, h / 2 + textSize * 0.36);
  };

  const loop = (t) => { draw(t); raf = requestAnimationFrame(loop); };
  const start = () => {
    if (running || reduced || !visible || !w) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  const resize = () => {
    if (!cv.clientWidth || !cv.clientHeight) return;
    w = cv.clientWidth; h = cv.clientHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    list = buildBubbles(CONFIG.seed, w, h, colors.length, 2, 0.4);
    textFor = "";
    draw(performance.now());
    start();
  };

  const local = (e) => {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  host.addEventListener("pointermove", (e) => {
    const [x, y] = local(e);
    if (ptr.on) {
      ptr.dx = clamp(x - ptr.x, -40, 40);
      ptr.dy = clamp(y - ptr.y, -40, 40);
    }
    ptr.x = x; ptr.y = y;
    ptr.on = x >= -40 && y >= -40 && x <= w + 40 && y <= h + 40;
    if (!running) draw(performance.now());
  }, { passive: true });
  host.addEventListener("pointerleave", () => { ptr.on = false; if (!running) draw(performance.now()); });

  let downAt = [0, 0];
  host.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; });
  host.addEventListener("pointerup", (e) => {
    if (Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
    const [x, y] = local(e);
    if (x < 0 || y < 0 || x > w || y > h) return;
    // só estoura o que está visível: o pixel sob o ponteiro precisa estar pintado
    const px = ctx.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
    if (px[3] < 10) return;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (Math.hypot(b.x + b.ox - x, b.y + b.oy - y) > b.r * b.s + 2) continue;
      const n = colors.length, old = b.c;
      b.c = 1 + ((b.c + Math.floor(rand() * (n - 2))) % Math.max(1, n - 1));
      b.s = reduced ? 1 : 0;
      if (!reduced) {
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * Math.PI * 2 + rand() * 0.5;
          const sp = 2 + rand() * 4;
          sparks.push({ x: b.x + b.ox, y: b.y + b.oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: b.r * (0.18 + rand() * 0.22), c: old, life: 1 });
        }
      }
      pops++;
      popsEl.textContent = pops + " estouradas";
      if (!running) draw(performance.now());
      break;
    }
  });

  resize();
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver((es) => {
    visible = es.some((e) => e.isIntersecting);
    visible ? start() : stop();
  }).observe(cv);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { textFor = ""; if (!running) draw(performance.now()); });
  }
})();

/* ---------- efeitos da logo: rede de pontos, brilhos e bolinhas vermelhas ---------- */
(function () {
  const cv = $("#fx"), ctx = cv.getContext("2d");
  let w = 0, h = 0, dpr = 1, raf = 0, running = false, visible = true, last = 0;
  const rnd = mulberry32(7);
  const g = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  // poucos pontos, concentrados em volta da cabeça (um pouco mais à esquerda, onde ela se desfaz)
  const nodes = Array.from({ length: 22 }, () => ({
    x: clamp(0.46 + g() * 0.3, 0.12, 0.88), y: clamp(0.5 + g() * 0.3, 0.14, 0.86),
    vx: (rnd() - 0.5) * 0.00004, vy: (rnd() - 0.5) * 0.00004,
    tw: rnd() * 6.28, s: 0.7 + rnd() * 0.8, big: rnd() < 0.18,
  }));
  const dots = Array.from({ length: 8 }, () => ({
    x: 0.3 + rnd() * 0.4, y: 0.4 + rnd() * 0.6, v: 0.00003 + rnd() * 0.00006, r: 1.2 + rnd() * 2.6,
    c: colors[1 + Math.floor(rnd() * (colors.length - 1))], ph: rnd() * 6.28,
  }));

  const draw = (t, dt) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx * dt; n.y += n.vy * dt;
      if (n.x < 0.1 || n.x > 0.9) n.vx *= -1;
      if (n.y < 0.12 || n.y > 0.88) n.vy *= -1;
    }
    const L = Math.min(w, h) * 0.24;
    ctx.lineWidth = 0.7;
    for (let i = 0; i < nodes.length; i++) {
      for (let k = i + 1; k < nodes.length; k++) {
        const d = Math.hypot((nodes[i].x - nodes[k].x) * w, (nodes[i].y - nodes[k].y) * h);
        if (d > L) continue;
        ctx.strokeStyle = "rgba(170,185,235," + ((1 - d / L) * 0.26).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
        ctx.lineTo(nodes[k].x * w, nodes[k].y * h);
        ctx.stroke();
      }
    }
    ctx.shadowColor = "#b8c4f0";
    for (const n of nodes) {
      const a = 0.6 + 0.4 * Math.sin(t * 0.0009 + n.tw);
      ctx.globalAlpha = 0.55 * a;
      ctx.shadowBlur = n.big ? 8 : 3;
      ctx.fillStyle = "#dfe7ff";
      ctx.beginPath();
      ctx.arc(n.x * w, n.y * h, n.big ? n.s * 1.6 : n.s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    for (const d of dots) {
      d.y -= d.v * dt;
      if (d.y < 0.5) { d.y = 1; d.x = 0.3 + rnd() * 0.4; }
      ctx.globalAlpha = clamp((d.y - 0.5) * 1.4, 0, 0.5);
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.arc((d.x + Math.sin(t * 0.0006 + d.ph) * 0.01) * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const loop = (t) => { draw(t, Math.min(50, t - last || 16)); last = t; raf = requestAnimationFrame(loop); };
  const start = () => { if (running || reduced || !visible || !w) return; running = true; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const resize = () => {
    if (!cv.clientWidth) return;
    w = cv.clientWidth; h = cv.clientHeight;
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    draw(performance.now(), 0);
    start();
  };
  resize();
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); visible ? start() : stop(); }).observe(cv);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();

  // se existir fundo.jpeg na pasta, ele aparece atrás da tela de vidro (sem ele, fica o fundo roxo)
  const probe = new Image();
  probe.onload = () => $("#root").classList.add("has-bg");
  probe.src = "fundo.jpeg";

  // o botão "Sobre o laboratório" desce até a timeline
  const go = document.querySelector(".aa-btn-light");
  const target = document.getElementById("journey");
  if (go && target) go.addEventListener("click", () => target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
})();

/* ================== Timeline horizontal com scroll (GSAP) ================== */
(function () {
  if (!(window.gsap && window.ScrollTrigger && window.SplitText)) return; // sem GSAP, a timeline não aparece

    gsap.registerPlugin(ScrollTrigger, SplitText);

    /* ===================== Configuração (equivale às props) ===================== */
    const config = {
      title: "De 2020 até aqui",
      periodLabel: "2020 — 2026 · O laboratório não começou com um plano de pesquisa formal. Começou com uma impressora 3D, uma pandemia e cinco estudantes dispostos a levar um projeto até o fim.",
      activeColor: "#ef233c",
      textColor: "#f2f0ff",
      mutedTextColor: "#c4bde8",
      backgroundColor: "#000000",
      imageUrl: "https://cdn.21st.dev/assets/mirror/b0/b0c41784074f76ac5fb6b447da87780c901135841317a096241371f24bc13ddd.jpg",
      imageAlt: "Team at work in a bright studio",
      duration: 1.4 // segundos
    };

    const topJourneyData = [
      { id: "2020-pandemia", year: "2020", month: "Nasceu na pandemia", content: "Cinco estudantes imprimem 100 protetores faciais em 3D para a rede de saúde de Maranguape." },
      { id: "2023-safra", year: "2023", month: "A safra que consolidou", content: "Sete projetos de PIBIC Jr em paralelo, como Vamos Merendar?, SiRaL, InfoMarket e Capistrano." },
      { id: "2024-registro", year: "2024", month: "Registro e projeção", content: "A experiência do laboratório vai ao Computer on the Beach; segunda edição do Power4Girls." },
      { id: "2026-ciclo", year: "2026", month: "O ciclo atual", content: "Sete frentes de set/2025 a ago/2026, com apoio de CNPq e FUNCAP." }
    ];

    const bottomJourneyData = [
      { id: "2021-retomada", year: "2021", month: "Pausa e retomada", content: "Atividades presenciais suspensas de fevereiro a abril; em novembro o laboratório volta com nova turma." },
      { id: "2023-fora", year: "2023", month: "Fora dos muros", content: "Semifinal do Desafio Liga Jovem, ENICIT 2023 e classificação para a FEBRACE 2023–24." },
      { id: "2025-sala", year: "2025", month: "Sala, desfile e ENICIT", content: "Quase 190 visitantes no Universo IFCE, primeiro desfile no 7 de Setembro e ENICIT 2025 no campus." }
    ];

    const monthOrder = {
      January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
      July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
    };

    // Todos os itens em ordem cronológica
    const allJourneyItems = [...topJourneyData, ...bottomJourneyData].sort((a, b) => {
      const yearDiff = Number(a.year) - Number(b.year);
      if (yearDiff !== 0) return yearDiff;
      return monthOrder[a.month] - monthOrder[b.month];
    });

    /* ===================== Aplicar cores ===================== */
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--active-color", config.activeColor);
    rootStyle.setProperty("--color-foreground", config.textColor);
    rootStyle.setProperty("--color-muted-foreground", config.mutedTextColor);
    rootStyle.setProperty("--color-background", config.backgroundColor);

    /* ===================== Montagem do HTML ===================== */
    const section = document.getElementById("journey");

    function itemTop(item) {
      return `
        <div class="item">
          <div class="stem-wrap">
            <div class="dot jd-${item.id}"></div>
            <div class="stem jl-${item.id}"></div>
          </div>
          <div class="text-top">
            <h4 class="title-${item.id}">${item.year} ${item.month}</h4>
            <p class="desc description-${item.id}">${item.content}</p>
          </div>
        </div>`;
    }

    function itemBottom(item) {
      return `
        <div class="item">
          <div class="stem-wrap">
            <div class="stem jl-${item.id}"></div>
            <div class="dot jd-${item.id}"></div>
          </div>
          <div class="text-bottom">
            <h4 class="title-${item.id}">${item.year} ${item.month}</h4>
            <p class="desc description-${item.id}">${item.content}</p>
          </div>
        </div>`;
    }

    section.innerHTML = `
      <div class="sticky">
        <div class="slider" id="wholeSlider">
          <div class="cover">
            <img src="${config.imageUrl}" alt="${config.imageAlt}" draggable="false" />
          </div>

          <div class="track">
            <div class="axis">
              <div class="axis-dot"></div>
              <div class="journey-line"></div>
              <div class="axis-dot"></div>
            </div>

            <div class="row row-top">
              <div class="head-col"><h2>${config.title}</h2></div>
              <div class="items items-top">${topJourneyData.map(itemTop).join("")}</div>
            </div>

            <div class="row row-bottom">
              <div class="period-col"><p>${config.periodLabel}</p></div>
              <div class="items items-bottom">${bottomJourneyData.map(itemBottom).join("")}</div>
            </div>
          </div>
        </div>
      </div>`;

    /* ===================== Animações ===================== */
    const wholeSlider = document.getElementById("wholeSlider");
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const normalizedDuration = Math.max(0.2, config.duration);

    let ctx = null;
    let splits = [];
    let wasMobile = null;

    function setupAnimations() {
      // Limpa tudo antes de recriar
      splits.forEach((s) => s.revert());
      splits = [];
      if (ctx) ctx.revert();

      const isMobile = window.innerWidth < 600;
      const reducedMotion = reducedMotionQuery.matches;
      wasMobile = isMobile;

      ctx = gsap.context(() => {
        const slidePercent = isMobile ? -57 : -65;
        const lineWidth = isMobile ? "65%" : "98%";
        const lineStart = isMobile ? "top 30%" : "top 25%";
        const slideEnd = isMobile ? "82% 50%" : "92% bottom";
        const lineEnd = isMobile ? "80% 50%" : "92% bottom";

        /* --- 1) Deslize horizontal da trilha + linha central --- */
        gsap.timeline({
          scrollTrigger: { trigger: section, start: "top top", end: slideEnd, scrub: true },
          defaults: { ease: "none" }
        }).fromTo(wholeSlider, { xPercent: 0 }, { xPercent: slidePercent });

        if (reducedMotion) {
          gsap.set(".journey-line", { width: lineWidth });
        } else {
          gsap.to(".journey-line", {
            width: lineWidth,
            ease: "none",
            scrollTrigger: { trigger: section, start: lineStart, end: lineEnd, scrub: true }
          });
        }

        /* --- 2) Revelação de cada marco --- */
        if (reducedMotion) {
          allJourneyItems.forEach((item) => {
            gsap.set(`.jl-${item.id}`, { scaleY: 1 });
            gsap.set(`.jd-${item.id}`, { scale: 1 });
          });
          return;
        }

        allJourneyItems.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 0 });
          gsap.set(`.jd-${item.id}`, { scale: 0 });
        });

        const titleSplits = {};
        const descriptionSplits = {};

        allJourneyItems.forEach((item) => {
          titleSplits[item.id] = new SplitText(`.title-${item.id}`, { type: "chars, words, lines", mask: "lines" });
          descriptionSplits[item.id] = new SplitText(`.description-${item.id}`, { type: "chars, words, lines", mask: "lines" });
          splits.push(titleSplits[item.id], descriptionSplits[item.id]);
        });

        const positions = isMobile
          ? [[22, 32], [28, 38], [36, 46], [45, 55], [52, 62], [60, 70], [69, 79]]
          : [[6, 26], [16, 36], [26, 46], [35, 55], [45, 65], [55, 75], [65, 85]];

        allJourneyItems.forEach((item, index) => {
          const [startPos, endPos] = positions[index];
          const isTop = topJourneyData.some((t) => t.id === item.id);

          const lineSelector = `.jl-${item.id}`;
          const dotSelector = `.jd-${item.id}`;

          // Haste: cresce de baixo para cima (topo) ou de cima para baixo (base)
          gsap.set(lineSelector, { transformOrigin: isTop ? "bottom" : "top" });

          gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: `${startPos}% 30%`,
              end: `${endPos}% 50%`,
              scrub: true
            }
          })
            .to(lineSelector, { scaleY: 1, duration: normalizedDuration * 0.4 })
            .to(dotSelector, { scale: 1, duration: normalizedDuration * 0.4 }, "<")
            .fromTo(
              titleSplits[item.id].lines,
              { y: 100 },
              { y: 0, delay: -0.8 * normalizedDuration, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" }
            )
            .fromTo(
              descriptionSplits[item.id].lines,
              { y: 100 },
              { y: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
              "<"
            );
        });
      }, section);
    }

    // espera a fonte carregar: o SplitText mede as linhas, e a fonte reserva muda a quebra delas
    let lastWidth = window.innerWidth;
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { setupAnimations(); ScrollTrigger.refresh(); });
    } else {
      setupAnimations();
    }

    // Se a largura mudar, as linhas quebram diferente: refaz o SplitText. Só a altura mudando (barra do navegador) apenas recalcula
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          setupAnimations();
        } else {
          ScrollTrigger.refresh();
        }
      }, 150);
    });

    // Reage a mudanças na preferência de movimento reduzido
    reducedMotionQuery.addEventListener("change", setupAnimations);
})();


/* ================== Scroll to scale: zoom na palavra "Leiah" ==================
   Enquanto a pessoa rola, a tela inicial fica fixa: o conteúdo some e a palavra
   vermelha cresce e vai para o centro. Quando está muito perto, uma camada
   vermelha cobre tudo e a próxima tela entra (transição abaixo).
   ===================================================================== */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return;
  gsap.registerPlugin(ScrollTrigger);

  const first = document.querySelector("[data-flow-section]");
  const root = document.querySelector("#root");
  const wm = document.querySelector("#wm");
  const wash = document.querySelector(".aa-zoom-wash");
  if (!(first && root && wm && wash)) return;

  /* ---------- ajustes ---------- */
  const ZOOM = {
    scale: 22,          // quanto a palavra cresce (maior = chega mais perto)
    distance: "+=220%", // quanto de scroll dura o zoom (maior = mais lento)
    scrub: 0.6          // suavidade (0 = colado no scroll)
  };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // tudo que não é a palavra some no começo do zoom
    const chrome = root.querySelectorAll(".aa-top, .aa-copy, .aa-head-img, .aa-hint, .aa-info, .aa-bg");

    // leva o centro da palavra para o centro da tela
    const dx = () => {
      const r = wm.getBoundingClientRect();
      return innerWidth / 2 - (r.left + r.width / 2 - gsap.getProperty(wm, "x"));
    };
    const dy = () => {
      const r = wm.getBoundingClientRect();
      return innerHeight / 2 - (r.top + r.height / 2 - gsap.getProperty(wm, "y"));
    };

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: first,
        start: "top top",
        end: ZOOM.distance,
        scrub: ZOOM.scrub,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => root.classList.toggle("aa-zooming", self.isActive)
      }
    });

    tl.to(chrome, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
      .to(wm, { x: dx, y: dy, duration: 0.45, ease: "power2.inOut" }, 0)
      .to(wm, { scale: ZOOM.scale, duration: 1, ease: "power3.in" }, 0)
      .to(wash, { opacity: 1, duration: 0.25, ease: "power1.in" }, 0.75);

    return () => root.classList.remove("aa-zooming");
  });
})();

/* ================== Transições entre telas (scroll) ==================
   Efeito "full screen scroll FX": quando a próxima tela chega, a atual some
   (fade + leve deslocamento para cima) e a nova aparece (fade + escala 1.04 → 1).
   A animação é por tempo (não acompanha o scroll) e volta ao rolar para cima.
   ===================================================================== */
(function () {
  if (!(window.gsap && window.ScrollTrigger)) return; // sem GSAP, as telas só rolam normalmente

  gsap.registerPlugin(ScrollTrigger);

  const sections = gsap.utils.toArray("[data-flow-section]");
  if (sections.length < 2) return;

  /* ---------- ajustes ---------- */
  const FX = {
    mode: "fade",     // "fade" ou "wipe" (a nova tela abre de baixo para cima)
    change: 0.7,      // duração da troca (segundos)
    parallax: 4,      // % da altura da tela que a tela que sai desloca
    trigger: "top 80%" // quando a próxima tela começa a trocar
  };

  const mm = gsap.matchMedia();

  // com "movimento reduzido" ligado, nenhuma transição é criada
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const entering = [];

    sections.forEach((section, i) => {
      gsap.set(section, { zIndex: i + 1 });

      // a tela atual fica fixada enquanto a próxima passa por cima dela
      if (i > 0 && i < sections.length - 1) {
        ScrollTrigger.create({
          trigger: section,
          start: "bottom bottom",
          end: () => "+=" + window.innerHeight,
          pin: true,
          pinSpacing: false,
        });
      }

      if (i === 0) return;

      const prevInner = sections[i - 1].querySelector("[data-flow-inner]");
      const inner = section.querySelector("[data-flow-inner]");
      if (!prevInner || !inner) return;
      entering.push(inner);

      const vh = () => window.innerHeight;
      const tl = gsap.timeline({
        defaults: { duration: FX.change },
        scrollTrigger: {
          trigger: section,
          start: FX.trigger,
          toggleActions: "play none none reverse",
        },
      });

      if (FX.mode === "wipe") {
        tl.fromTo(inner, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", ease: "power3.out" }, 0)
          .to(prevInner, { opacity: 0, duration: FX.change * 0.8, ease: "power2.out" }, 0);
      } else {
        tl.fromTo(
          inner,
          { opacity: 0, scale: 1.04, y: () => vh() * 0.01 },
          { opacity: 1, scale: 1, y: 0, ease: "power2.out" },
          0
        ).to(prevInner, { opacity: 0, y: () => -vh() * (FX.parallax / 100), ease: "power2.out" }, 0);
      }
    });

    // o eixo da escala fica no meio da primeira "altura de tela"
    // (telas altas, como a timeline, não escalam a partir do centro da seção inteira)
    const setOrigin = () => {
      entering.forEach((inner) => {
        const h = Math.min(inner.offsetHeight, window.innerHeight);
        gsap.set(inner, { transformOrigin: "50% " + h / 2 + "px" });
      });
    };
    setOrigin();
    ScrollTrigger.addEventListener("refreshInit", setOrigin);

    ScrollTrigger.refresh();

    return () => ScrollTrigger.removeEventListener("refreshInit", setOrigin);
  });
})();