(function () {
  "use strict";

  /* ================================================================
   * <pentes-inverses-widget> — atelier interactif (6e, ch. 1, § 1,
   * « Dérivée d'une fonction réciproque »). Un point A(a ; b) sur f avec sa
   * tangente, et son symétrique A′(b ; a) sur f⁻¹ avec la sienne. Le petit
   * triangle de pente (Δx, Δy) de f devient, après le miroir y = x, un
   * triangle aux côtés échangés (Δy, Δx) : les deux pentes sont inverses
   * l'une de l'autre, leur produit vaut 1. Quand f′(a) = 0, la tangente à
   * f⁻¹ devient verticale et (f⁻¹)′(b) n'existe pas. Repère orthonormé,
   * fenêtre carrée FIXE par fonction (jamais recalculée depuis le curseur).
   * Couleurs : f et tout ce qui la concerne en orange, f⁻¹ en vert.
   * ================================================================ */

  var PI = Math.PI;

  var FONCTIONS = [
    {
      option: "f(x) = x² sur [0 ; +∞[ et f⁻¹(x) = √x",
      f: function (x) { return x * x; }, fp: function (x) { return 2 * x; },
      fInv: function (x) { return Math.sqrt(x); },
      nomF: '<i>f</i>(<i>x</i>) = <i>x</i>²', nomInv: '<i>f</i>⁻¹(<i>x</i>) = <span class="rad">√<span class="sous"><i>x</i></span></span>',
      aMin: 0, aMax: 2, n: 40, aDefaut: 30,
      fDom: [0, 2.1], invDom: [0, 4.4],
      win: { min: -0.6, max: 4.4 }, ticks: [1, 2, 3, 4],
    },
    {
      option: "f(x) = x³ et f⁻¹(x) = ∛x",
      f: function (x) { return x * x * x; }, fp: function (x) { return 3 * x * x; },
      fInv: function (x) { return Math.cbrt(x); },
      nomF: '<i>f</i>(<i>x</i>) = <i>x</i>³', nomInv: '<i>f</i>⁻¹(<i>x</i>) = <span class="rad"><sup class="indice">3</sup>√<span class="sous"><i>x</i></span></span>',
      aMin: -1.5, aMax: 1.5, n: 60, aDefaut: 40,
      fDom: [-1.55, 1.55], invDom: [-3.6, 3.6],
      win: { min: -3.6, max: 3.6 }, ticks: [-3, -2, -1, 1, 2, 3],
    },
    {
      option: "f(x) = sin x sur [−π/2 ; π/2] et f⁻¹(x) = arcsin x",
      f: Math.sin, fp: Math.cos, fInv: Math.asin,
      nomF: '<i>f</i>(<i>x</i>) = sin <i>x</i>', nomInv: '<i>f</i>⁻¹(<i>x</i>) = arcsin <i>x</i>',
      aMin: -PI / 2, aMax: PI / 2, n: 48, aDefaut: 32, pi48: true,
      fDom: [-PI / 2, PI / 2], invDom: [-1, 1],
      win: { min: -1.9, max: 1.9 }, ticks: [-1, 1], ticksPi: true,
    },
  ];

  var T = 320, M = 26; // carré : orthonormé, y = x à 45°
  var NS = "http://www.w3.org/2000/svg";

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // k·π/48 sous forme lisible (texte) quand le dénominateur réduit est ≤ 12.
  function piTexte(k) {
    if (k === 0) return "0";
    var g = pgcd(k, 48), p = k / g, q = 48 / g;
    if (q > 12) return null;
    var s = (p < 0 ? "−" : "") + (Math.abs(p) === 1 ? "" : Math.abs(p)) + "π";
    return q === 1 ? s : s + "/" + q;
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#182430);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;}' +
    '.choix label{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);max-width:100%;}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:320px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.diagonale{stroke:var(--ink-faint,#8a97a1);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.courbe-f{stroke:var(--accent,#b65c1f);stroke-width:2.6;fill:none;}' +
    '.courbe-inv{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.tan-f{stroke:var(--accent,#b65c1f);stroke-width:1.6;stroke-dasharray:7 4;}' +
    '.tan-inv{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:7 4;}' +
    '.tri-f{stroke:var(--accent-ink,#7a3c11);stroke-width:2;fill:none;}' +
    '.tri-inv{stroke:var(--good,#2f7a4f);stroke-width:2;fill:none;}' +
    '.guide{stroke:var(--plan,#5b4ea3);stroke-width:1.1;stroke-dasharray:3 3;}' +
    '.pt-f{fill:var(--accent,#b65c1f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.pt-inv{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etq{font-size:11px;font-weight:600;paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.etq-f{fill:var(--accent-ink,#7a3c11);}' +
    '.etq-inv{fill:var(--good,#2f7a4f);}' +
    '.fm{font-family:var(--serif,Georgia,serif);white-space:nowrap;}' +
    '.fm i{margin-right:0.06em;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.9em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.rad{white-space:nowrap;}' +
    '.rad .sous{border-top:1px solid currentColor;padding:0 2px 0 1px;}' +
    '.rad .indice{font-size:0.62em;vertical-align:0.9em;margin-right:-0.35em;}' +
    '.legende{font-size:0.86rem;text-align:center;line-height:1.6;}' +
    '.leg-f{color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    '.leg-inv{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-d{color:var(--ink-soft,#51626f);}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:12px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3c11);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#b65c1f);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:86px;text-align:right;}' +
    '.stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;}' +
    '.stat{flex:1 1 140px;min-width:0;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-size:0.78rem;color:var(--ink-soft,#51626f);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;}' +
    '.stat-f .stat-value{color:var(--accent-ink,#7a3c11);}' +
    '.stat-inv .stat-value{color:var(--good,#2f7a4f);}' +
    '.lecture{margin-top:10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.7;text-align:center;}' +
    '.alerte{color:var(--bad,#b23a3a);font-weight:700;}' +
    'select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="fonction">Couple de fonctions réciproques</label><select id="fonction"></select></div>' +
    '<div class="figure">' +
    '<svg id="svg" viewBox="0 0 ' + T + ' ' + T + '" role="img" aria-label="f, sa réciproque et leurs tangentes"></svg>' +
    '<div class="legende" id="legende"></div>' +
    '</div>' +
    '<div class="curseur"><label for="a">a — abscisse du point A sur f</label><div class="curseur-row">' +
    '<input type="range" id="a" min="0" max="40" step="1" value="0"><span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="stats">' +
    '<div class="stat stat-f"><span class="stat-label">pente de la tangente à f en A</span><span class="stat-value fm" id="pente-f"></span></div>' +
    '<div class="stat stat-inv"><span class="stat-label">pente de la tangente à f⁻¹ en A′</span><span class="stat-value fm" id="pente-inv"></span></div>' +
    '</div>' +
    '<div class="lecture" aria-live="polite" id="lecture"></div>';

  class PentesInversesWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("fonction");
      this._input = shadow.getElementById("a");
      var self = this;
      FONCTIONS.forEach(function (fn, i) {
        var o = document.createElement("option");
        o.value = String(i);
        o.textContent = fn.option;
        self._select.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this;
      this._onSelect = function () { self._choisir(parseInt(self._select.value, 10)); };
      this._onA = function () { self._i = parseInt(self._input.value, 10); self._rendre(); };
      this._select.addEventListener("change", this._onSelect);
      this._input.addEventListener("input", this._onA);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._input.removeEventListener("input", this._onA);
    }

    _choisir(i) {
      var fn = FONCTIONS[i];
      this._fn = fn;
      this._select.value = String(i);
      this._input.max = String(fn.n);
      this._i = fn.aDefaut;
      this._input.value = String(this._i);
      this._s.getElementById("legende").innerHTML =
        '<span class="leg-f fm">' + fn.nomF + '</span> · <span class="leg-inv fm">' + fn.nomInv + '</span> · <span class="leg-d fm"><i>y</i> = <i>x</i></span> (pointillés)';
      this._rendre();
    }

    _px(x, y) {
      var w = this._fn.win, s = (T - 2 * M) / (w.max - w.min);
      return [M + (x - w.min) * s, T - M - (y - w.min) * s];
    }

    _chemin(f, lo, hi) {
      var w = this._fn.win, d = "", N = 300, ouvert = false;
      for (var i = 0; i <= N; i++) {
        var x = lo + (hi - lo) * i / N, y = f(x);
        if (!isFinite(y) || y < w.min - 0.5 || y > w.max + 0.5) { ouvert = false; continue; }
        var p = this._px(x, y);
        d += (ouvert ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
        ouvert = true;
      }
      return d.trim();
    }

    // Droite passant par (x0 ; y0) de direction (dx ; dy), coupée au carré de la fenêtre.
    _droite(x0, y0, dx, dy) {
      var w = this._fn.win, tMin = -Infinity, tMax = Infinity;
      [[x0, dx], [y0, dy]].forEach(function (c) {
        if (Math.abs(c[1]) < 1e-12) return;
        var t1 = (w.min - c[0]) / c[1], t2 = (w.max - c[0]) / c[1];
        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
      });
      var p = this._px(x0 + tMin * dx, y0 + tMin * dy), q = this._px(x0 + tMax * dx, y0 + tMax * dy);
      return { x1: p[0].toFixed(1), y1: p[1].toFixed(1), x2: q[0].toFixed(1), y2: q[1].toFixed(1) };
    }

    _repere(svg) {
      var fn = this._fn, self = this;
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: M, y: M, width: T - 2 * M, height: T - 2 * M }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var o = this._px(0, 0);
      var tous = fn.ticks.slice();
      if (fn.ticksPi) tous = tous.concat([-PI / 2, PI / 2]);
      tous.forEach(function (t) {
        var p = self._px(t, t);
        svg.appendChild(svgEl("line", { x1: M, x2: T - M, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: M, y2: T - M, class: "grille" }));
      });
      svg.appendChild(svgEl("line", { x1: M - 6, x2: T - 6, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: T - 6, y2: 6, class: "axe", "marker-end": "url(#fl)" }));
      tous.forEach(function (t) {
        var p = self._px(t, t);
        var txt = Math.abs(Math.abs(t) - PI / 2) < 1e-9 ? (t < 0 ? "−π/2" : "π/2") : fmt(t, 2);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 14).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = txt;
        svg.appendChild(tx);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var ty = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (p[1] + 3.5).toFixed(1), "text-anchor": "end", class: "tick-label" });
        ty.textContent = txt;
        svg.appendChild(ty);
      });
      var nx = svgEl("text", { x: T - 8, y: (o[1] - 7).toFixed(1), "text-anchor": "end", class: "tick-label" });
      nx.textContent = "x";
      svg.appendChild(nx);
      var ny = svgEl("text", { x: (o[0] + 8).toFixed(1), y: 14, class: "tick-label" });
      ny.textContent = "y";
      svg.appendChild(ny);
    }

    _etiquette(svg, x, y, texte, classe, autre) {
      // Étiquette placée du côté opposé à l'autre point (jamais sur lui), et rentrée dans le cadre.
      var p = this._px(x, y), q = this._px(autre[0], autre[1]);
      var droite = p[0] >= q[0];
      if (p[0] > T - 90) droite = false;
      if (p[0] < 90) droite = true;
      var haut = p[1] <= q[1];
      if (p[1] < M + 22) haut = false;
      if (p[1] > T - M - 16) haut = true;
      var t = svgEl("text", { x: (p[0] + (droite ? 8 : -8)).toFixed(1), y: (p[1] + (haut ? -9 : 17)).toFixed(1), "text-anchor": droite ? "start" : "end", class: "etq " + classe });
      t.textContent = texte;
      svg.appendChild(t);
    }

    _rendre() {
      var fn = this._fn, w = fn.win;
      var a = fn.aMin + (fn.aMax - fn.aMin) * this._i / fn.n;
      var b = fn.f(a), m = fn.fp(a);
      if (Math.abs(m) < 1e-9) m = 0;
      var svg = this._svg;
      svg.innerHTML = "";
      this._repere(svg);
      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);
      var d = this._px(w.min, w.min), d2 = this._px(w.max, w.max);
      g.appendChild(svgEl("line", { x1: d[0].toFixed(1), y1: d[1].toFixed(1), x2: d2[0].toFixed(1), y2: d2[1].toFixed(1), class: "diagonale" }));
      g.appendChild(svgEl("path", { d: this._chemin(fn.f, fn.fDom[0], fn.fDom[1]), class: "courbe-f" }));
      g.appendChild(svgEl("path", { d: this._chemin(fn.fInv, fn.invDom[0], fn.invDom[1]), class: "courbe-inv" }));

      // Tangentes : en A, direction (1 ; m) ; en A′, direction (m ; 1) — le miroir échange les composantes.
      g.appendChild(svgEl("line", Object.assign(this._droite(a, b, 1, m), { class: "tan-f" })));
      g.appendChild(svgEl("line", Object.assign(this._droite(b, a, m, 1), { class: "tan-inv" })));

      // Triangles de pente : Δx horizontal puis Δy vertical sur f ; côtés échangés sur f⁻¹.
      var span = w.max - w.min;
      var h = span * 0.13 / Math.max(1, Math.abs(m));
      if (a + h > fn.fDom[1] + 1e-9 && fn.fDom[1] - a < h) h = -h;
      var t1 = [this._px(a, b), this._px(a + h, b), this._px(a + h, b + m * h)];
      g.appendChild(svgEl("path", { d: "M" + t1.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L"), class: "tri-f" }));
      var t2 = [this._px(b, a), this._px(b, a + h), this._px(b + m * h, a + h)];
      g.appendChild(svgEl("path", { d: "M" + t2.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L"), class: "tri-inv" }));

      // Segment AA′, perpendiculaire à y = x.
      var pA = this._px(a, b), pB = this._px(b, a);
      g.appendChild(svgEl("line", { x1: pA[0].toFixed(1), y1: pA[1].toFixed(1), x2: pB[0].toFixed(1), y2: pB[1].toFixed(1), class: "guide" }));
      g.appendChild(svgEl("circle", { cx: pA[0].toFixed(1), cy: pA[1].toFixed(1), r: 5, class: "pt-f" }));
      g.appendChild(svgEl("circle", { cx: pB[0].toFixed(1), cy: pB[1].toFixed(1), r: 5, class: "pt-inv" }));
      var memePoint = Math.abs(a - b) < 1e-9;
      this._etiquette(svg, a, b, "A", "etq-f", memePoint ? [a + 1, b - 1] : [b, a]);
      this._etiquette(svg, b, a, "A′", "etq-inv", memePoint ? [b - 1, a + 1] : [a, b]);
      // Étiquettes de graduation au premier plan (jamais masquées par une courbe).
      svg.querySelectorAll("text.tick-label").forEach(function (t) { svg.appendChild(t); });

      // Textes.
      var k = Math.round(this._i - fn.n / 2);
      var aTxt = fmt(a, 2), aC = fmt(a, 3), bC = fmt(b, 3);
      if (fn.pi48) { var pt = piTexte(k); aTxt = pt ? (pt === "0" ? "0" : pt + " ≈ " + fmt(a, 2)) : "≈ " + fmt(a, 2); if (pt) aC = pt; }
      this._s.getElementById("a-valeur").textContent = "a = " + aTxt;
      var A = "(" + aC + " ; " + bC + ")", A2 = "(" + bC + " ; " + aC + ")";
      this._s.getElementById("pente-f").innerHTML = '<i>f</i> ′(' + aC + ') ' + (Math.abs(m - Math.round(m * 1000) / 1000) < 1e-9 ? "=" : "≈") + " " + fmt(m, 3);
      var lect = this._s.getElementById("lecture");
      if (m === 0) {
        this._s.getElementById("pente-inv").innerHTML = '<span class="alerte">tangente verticale</span>';
        lect.innerHTML = 'A' + A + ' sur <span class="fm"><i>f</i></span>, A′' + A2 + ' sur <span class="fm"><i>f</i>⁻¹</span>.<br>' +
          '<span class="alerte"><i>f</i> ′(' + aC + ') = 0</span> : la tangente à <span class="fm"><i>f</i></span> est horizontale, son reflet est vertical. ' +
          '<span class="fm">(<i>f</i>⁻¹)′(' + bC + ')</span> n’existe pas : le théorème exige <span class="fm"><i>f</i> ′(<i>f</i>⁻¹(<i>x</i>)) ≠ 0</span>.';
      } else {
        var inv = 1 / m;
        this._s.getElementById("pente-inv").innerHTML = '(<i>f</i>⁻¹)′(' + bC + ') ' + (Math.abs(inv - Math.round(inv * 1000) / 1000) < 1e-9 ? "=" : "≈") + " " + fmt(inv, 3);
        lect.innerHTML = 'A' + A + ' sur <span class="fm"><i>f</i></span>, A′' + A2 + ' sur <span class="fm"><i>f</i>⁻¹</span> : coordonnées échangées.<br>' +
          'Le triangle orange a pour côtés Δ<i>x</i> puis Δ<i>y</i> ; son reflet vert, Δ<i>y</i> puis Δ<i>x</i>. Pentes : ' +
          '<span class="fm"><span class="frac"><span>Δ<i>y</i></span><span>Δ<i>x</i></span></span></span> et ' +
          '<span class="fm"><span class="frac"><span>Δ<i>x</i></span><span>Δ<i>y</i></span></span></span>.<br>' +
          'Produit des pentes : <span class="fm">' + fmt(m, 3) + ' × ' + fmt(inv, 3) + ' = 1</span>, donc ' +
          '<span class="fm">(<i>f</i>⁻¹)′(' + bC + ') = <span class="frac"><span>1</span><span><i>f</i> ′(' + aC + ')</span></span></span>.';
      }
    }
  }

  if (!customElements.get("pentes-inverses-widget")) customElements.define("pentes-inverses-widget", PentesInversesWidget);
})();
