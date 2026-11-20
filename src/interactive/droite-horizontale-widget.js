(function () {
  "use strict";

  /* ================================================================
   * <droite-horizontale-widget> — atelier interactif (6e, ch. 1, § 1,
   * test de la droite horizontale). Une horizontale y = k glisse sur le
   * graphique ; ses points d'intersection avec la courbe sont marqués et
   * comptés. On choisit ensuite une restriction du domaine : la partie
   * jetée passe en gris, seules les intersections sur la restriction
   * comptent, et le verdict dit si la restriction est injective (avec, si
   * elle ne l'est pas, une horizontale témoin qui la coupe deux fois).
   * Code couleur : points VERTS quand l'horizontale coupe au plus une fois,
   * ROUGES dès qu'elle coupe deux fois ou plus. Fenêtre FIXE par fonction,
   * jamais recalculée depuis le curseur. Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var INF = Infinity;

  var FONCTIONS = [
    {
      nom: '<i>f</i>(<i>x</i>) = <i>x</i>² − 2<i>x</i>',
      option: "f(x) = x² − 2x",
      f: function (x) { return x * x - 2 * x; },
      crit: [1],
      win: { xMin: -1.5, xMax: 3.5, yMin: -2, yMax: 4.5 },
      xTicks: [-1, 1, 2, 3], yTicks: [-1, 1, 2, 3, 4],
      kMin: -2, kMax: 4.4, pas: 0.05, kDefaut: 1.5,
      restrictions: [
        { a: -INF, b: INF, txt: "ℝ", injective: false, temoin: 1.5 },
        { a: -INF, b: 1, txt: "]−∞ ; 1]", injective: true, image: "[−1 ; +∞[", sens: "strictement décroissante" },
        { a: 1, b: INF, txt: "[1 ; +∞[", injective: true, image: "[−1 ; +∞[", sens: "strictement croissante" },
        { a: 0, b: 3, txt: "[0 ; 3]", injective: false, temoin: -0.5 },
        { a: 2, b: 3, txt: "[2 ; 3]", injective: true, image: "[0 ; 3]", sens: "strictement croissante" },
      ],
    },
    {
      nom: '<i>f</i>(<i>x</i>) = <i>x</i>³ − 3<i>x</i>',
      option: "f(x) = x³ − 3x",
      f: function (x) { return x * x * x - 3 * x; },
      crit: [-1, 1],
      win: { xMin: -2.6, xMax: 2.6, yMin: -4.2, yMax: 4.2 },
      xTicks: [-2, -1, 1, 2], yTicks: [-4, -2, 2, 4],
      kMin: -4, kMax: 4, pas: 0.05, kDefaut: 0,
      restrictions: [
        { a: -INF, b: INF, txt: "ℝ", injective: false, temoin: 0 },
        { a: -INF, b: -1, txt: "]−∞ ; −1]", injective: true, image: "]−∞ ; 2]", sens: "strictement croissante" },
        { a: -1, b: 1, txt: "[−1 ; 1]", injective: true, image: "[−2 ; 2]", sens: "strictement décroissante" },
        { a: 1, b: INF, txt: "[1 ; +∞[", injective: true, image: "[−2 ; +∞[", sens: "strictement croissante" },
        { a: 0, b: INF, txt: "[0 ; +∞[", injective: false, temoin: -1 },
      ],
    },
    {
      nom: '<i>f</i>(<i>x</i>) = sin <i>x</i>',
      option: "f(x) = sin x",
      f: Math.sin,
      crit: [-3 * PI / 2, -PI / 2, PI / 2, 3 * PI / 2],
      periodique: true,
      win: { xMin: -6.9, xMax: 6.9, yMin: -1.7, yMax: 1.7 },
      xTicks: [-2 * PI, -PI, PI, 2 * PI], xTickTxt: ["−2π", "−π", "π", "2π"],
      xPetits: [-3 * PI / 2, -PI / 2, PI / 2, 3 * PI / 2],
      yTicks: [-1, 1],
      kMin: -1.5, kMax: 1.5, pas: 0.05, kDefaut: 0.5,
      restrictions: [
        { a: -INF, b: INF, txt: "ℝ", injective: false, temoin: 0.5 },
        { a: -PI / 2, b: PI / 2, txt: "[−π/2 ; π/2]", injective: true, image: "[−1 ; 1]", sens: "strictement croissante" },
        { a: 0, b: PI, txt: "[0 ; π]", injective: false, temoin: 0.5 },
        { a: PI / 2, b: 3 * PI / 2, txt: "[π/2 ; 3π/2]", injective: true, image: "[−1 ; 1]", sens: "strictement décroissante" },
      ],
    },
    {
      nom: '<i>f</i>(<i>x</i>) = <span class="frac"><span><i>x</i>³</span><span>4</span></span>',
      option: "f(x) = x³/4",
      f: function (x) { return x * x * x / 4; },
      crit: [],
      win: { xMin: -2.7, xMax: 2.7, yMin: -4.6, yMax: 4.6 },
      xTicks: [-2, -1, 1, 2], yTicks: [-4, -2, 2, 4],
      kMin: -4.2, kMax: 4.2, pas: 0.05, kDefaut: 0.5,
      restrictions: [
        { a: -INF, b: INF, txt: "ℝ", injective: true, image: "ℝ", sens: "strictement croissante" },
        { a: 0, b: INF, txt: "[0 ; +∞[", injective: true, image: "[0 ; +∞[", sens: "strictement croissante" },
      ],
    },
  ];

  var W = 340, H = 270, ML = 30, MR = 14, MT = 14, MB = 24;
  var NS = "http://www.w3.org/2000/svg";
  var FI = '<span class="fm"><i>f</i></span>';

  function fmt(n, dec) {
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
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
    '.choix label,.groupe-titre{font-size:0.8rem;color:var(--ink-soft,#51626f);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#182430);}' +
    '.figure{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#f7f9fb);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#51626f);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#51626f);}' +
    '.grille{stroke:var(--line-soft,#dfe7ec);stroke-width:1;}' +
    '.tick{stroke:var(--ink-soft,#51626f);stroke-width:1;}' +
    '.tick-label{font-size:10px;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#51626f);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.courbe{stroke:var(--accent,#b65c1f);stroke-width:2.6;fill:none;}' +
    '.courbe-jetee{stroke:var(--ink-faint,#8a97a1);stroke-width:1.8;fill:none;stroke-dasharray:5 4;}' +
    '.horizontale{stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.restriction{stroke:var(--accent,#b65c1f);stroke-width:5;stroke-linecap:butt;opacity:0.55;}' +
    '.borne{fill:var(--accent,#b65c1f);}' +
    '.p-ok{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.p-ko{fill:var(--bad,#b23a3a);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiq-k{font-size:11px;font-weight:600;fill:var(--plan-ink,#443a80);paint-order:stroke;stroke:var(--surface-2,#f7f9fb);stroke-width:3px;}' +
    '.fm{font-family:var(--serif,Georgia,serif);font-size:1.05em;white-space:nowrap;}' +
    '.frac{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.15;font-size:0.9em;}' +
    '.frac>span:first-child{border-bottom:1px solid currentColor;padding:0 3px 1px;}' +
    '.frac>span:last-child{padding:1px 3px 0;}' +
    '.formule{text-align:center;font-size:1.02rem;margin:2px 0;}' +
    '.legende{font-size:0.82rem;color:var(--ink-soft,#51626f);text-align:center;line-height:1.5;}' +
    '.leg-ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.leg-ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.leg-h{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;margin-top:12px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--plan-ink,#443a80);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--plan,#5b4ea3);min-height:44px;}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#51626f);min-width:64px;text-align:right;}' +
    '.groupe-titre{margin-top:12px;margin-bottom:6px;text-align:center;}' +
    '.restrictions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}' +
    'button{min-height:44px;font:inherit;font-size:0.92rem;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#ccd8e0);background:var(--surface,#fff);color:var(--ink,#182430);cursor:pointer;}' +
    'button.actif{border-color:var(--accent,#b65c1f);background:var(--accent-soft,#f4e3d1);color:var(--accent-ink,#7a3c11);font-weight:700;}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent,#b65c1f);outline-offset:2px;}' +
    '.lecture{margin-top:12px;border:1px solid var(--line,#ccd8e0);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.93rem;line-height:1.5;}' +
    '.compte-ok{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.compte-ko{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.verdict{margin-top:8px;padding-top:8px;border-top:1px solid var(--line-soft,#dfe7ec);}' +
    '.temoin{margin-top:8px;}' +
    '</style>' +
    '<div class="choix"><label for="fonction">Fonction étudiée</label><select id="fonction"></select></div>' +
    '<div class="figure">' +
    '<div class="formule fm" id="formule"></div>' +
    '<svg id="svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Graphique de f et droite horizontale"></svg>' +
    '<div class="legende"><span class="leg-h">violet : la droite y = k</span><br>' +
    '<span class="leg-ok">vert : au plus une intersection</span> · <span class="leg-ko">rouge : deux intersections ou plus</span></div>' +
    '</div>' +
    '<div class="curseur"><label for="k">k — hauteur de la droite horizontale</label><div class="curseur-row">' +
    '<input type="range" id="k" min="0" max="100" step="1" value="0"><span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<div class="groupe-titre">Restriction du domaine</div>' +
    '<div class="restrictions" id="restrictions"></div>' +
    '<div class="lecture" aria-live="polite"><div id="compte"></div><div class="verdict" id="verdict"></div>' +
    '<div class="temoin" id="temoin-zone"><button type="button" id="temoin">Montrer une horizontale qui coupe deux fois</button></div></div>';

  class DroiteHorizontaleWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._s = shadow;
      this._svg = shadow.getElementById("svg");
      this._select = shadow.getElementById("fonction");
      this._inputK = shadow.getElementById("k");
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
      this._onK = function () { self._i = parseInt(self._inputK.value, 10); self._rendre(); };
      this._onTemoin = function () {
        var r = self._fn.restrictions[self._r];
        if (r.temoin == null) return;
        self._i = Math.round((r.temoin - self._fn.kMin) / self._fn.pas);
        self._inputK.value = String(self._i);
        self._rendre();
      };
      this._select.addEventListener("change", this._onSelect);
      this._inputK.addEventListener("input", this._onK);
      this._s.getElementById("temoin").addEventListener("click", this._onTemoin);
      this._choisir(0);
    }

    disconnectedCallback() {
      this._select.removeEventListener("change", this._onSelect);
      this._inputK.removeEventListener("input", this._onK);
      this._s.getElementById("temoin").removeEventListener("click", this._onTemoin);
    }

    _choisir(i) {
      var self = this, fn = FONCTIONS[i];
      this._fn = fn;
      this._select.value = String(i);
      this._r = 0;
      var n = Math.round((fn.kMax - fn.kMin) / fn.pas);
      this._inputK.max = String(n);
      this._i = Math.round((fn.kDefaut - fn.kMin) / fn.pas);
      this._inputK.value = String(this._i);
      this._s.getElementById("formule").innerHTML = fn.nom;
      var zone = this._s.getElementById("restrictions");
      zone.innerHTML = "";
      fn.restrictions.forEach(function (r, j) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "fm";
        b.textContent = r.txt;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () { self._r = j; self._rendre(); });
        zone.appendChild(b);
      });
      this._rendre();
    }

    _k() { var fn = this._fn; return Math.round((fn.kMin + this._i * fn.pas) * 1000) / 1000; }

    _px(x, y) {
      var w = this._fn.win;
      return [ML + (x - w.xMin) / (w.xMax - w.xMin) * (W - ML - MR), H - MB - (y - w.yMin) / (w.yMax - w.yMin) * (H - MT - MB)];
    }

    // Abscisses des intersections de y = f(x) et y = k sur [a ; b] ∩ fenêtre : changements de
    // signe de f − k (affinés par dichotomie) + points critiques où f vaut exactement k (contact).
    _intersections(k, a, b) {
      var fn = this._fn, w = fn.win;
      var lo = Math.max(a, w.xMin), hi = Math.min(b, w.xMax);
      var res = [], N = 3000, g = function (x) { return fn.f(x) - k; };
      var ajoute = function (x) {
        for (var i = 0; i < res.length; i++) if (Math.abs(res[i] - x) < 1e-6) return;
        res.push(x);
      };
      fn.crit.forEach(function (c) { if (c >= lo - 1e-12 && c <= hi + 1e-12 && Math.abs(g(c)) < 1e-9) ajoute(c); });
      if (Math.abs(g(lo)) < 1e-9) ajoute(lo);
      if (Math.abs(g(hi)) < 1e-9) ajoute(hi);
      var x0 = lo, g0 = g(lo);
      for (var i = 1; i <= N; i++) {
        var x1 = lo + (hi - lo) * i / N, g1 = g(x1);
        if (g0 * g1 < 0) {
          var u = x0, v = x1, gu = g0;
          for (var t = 0; t < 60; t++) {
            var m = (u + v) / 2, gm = g(m);
            if (gu * gm <= 0) v = m; else { u = m; gu = gm; }
          }
          ajoute((u + v) / 2);
        } else if (Math.abs(g1) < 1e-12) ajoute(x1);
        x0 = x1; g0 = g1;
      }
      return res.sort(function (p, q) { return p - q; });
    }

    _chemin(a, b) {
      var fn = this._fn, w = fn.win;
      var lo = Math.max(a, w.xMin), hi = Math.min(b, w.xMax);
      if (hi <= lo) return "";
      var d = "", N = 400;
      for (var i = 0; i <= N; i++) {
        var x = lo + (hi - lo) * i / N;
        var y = Math.max(w.yMin - 1, Math.min(w.yMax + 1, fn.f(x)));
        var p = this._px(x, y);
        d += (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1) + " ";
      }
      return d.trim();
    }

    _repere(svg) {
      var fn = this._fn, w = fn.win, self = this;
      var defs = svgEl("defs", {});
      var m = svgEl("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      m.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(m);
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: ML, y: MT, width: W - ML - MR, height: H - MT - MB }));
      defs.appendChild(clip);
      svg.appendChild(defs);
      var o = this._px(0, 0);
      fn.yTicks.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "grille" }));
      });
      (fn.xPetits || []).concat(fn.xTicks).forEach(function (t) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: MT, y2: H - MB, class: "grille" }));
      });
      svg.appendChild(svgEl("line", { x1: ML - 4, x2: W - 4, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl)" }));
      svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: H - 4, y2: 4, class: "axe", "marker-end": "url(#fl)" }));
      fn.xTicks.forEach(function (t, i) {
        var p = self._px(t, 0);
        svg.appendChild(svgEl("line", { x1: p[0].toFixed(1), x2: p[0].toFixed(1), y1: (o[1] - 3).toFixed(1), y2: (o[1] + 3).toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 14).toFixed(1), "text-anchor": "middle", class: "tick-label" });
        tx.textContent = fn.xTickTxt ? fn.xTickTxt[i] : fmt(t, 2);
        svg.appendChild(tx);
      });
      fn.yTicks.forEach(function (t) {
        var p = self._px(0, t);
        svg.appendChild(svgEl("line", { x1: (o[0] - 3).toFixed(1), x2: (o[0] + 3).toFixed(1), y1: p[1].toFixed(1), y2: p[1].toFixed(1), class: "tick" }));
        var tx = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (p[1] + 3.5).toFixed(1), "text-anchor": "end", class: "tick-label" });
        tx.textContent = fmt(t, 2);
        svg.appendChild(tx);
      });
      var nx = svgEl("text", { x: W - 8, y: (o[1] - 7).toFixed(1), "text-anchor": "end", class: "tick-label" });
      nx.textContent = "x";
      svg.appendChild(nx);
      var ny = svgEl("text", { x: (o[0] + 8).toFixed(1), y: 13, class: "tick-label" });
      ny.textContent = "y";
      svg.appendChild(ny);
    }

    _rendre() {
      var fn = this._fn, w = fn.win, r = fn.restrictions[this._r], self = this;
      var k = this._k();
      var svg = this._svg;
      svg.innerHTML = "";
      this._repere(svg);
      var g = svgEl("g", { "clip-path": "url(#cadre)" });
      svg.appendChild(g);

      // Courbe : partie gardée (orange), parties jetées (grises, pointillées).
      if (r.a > w.xMin) g.appendChild(svgEl("path", { d: this._chemin(-INF, r.a), class: "courbe-jetee" }));
      if (r.b < w.xMax) g.appendChild(svgEl("path", { d: this._chemin(r.b, INF), class: "courbe-jetee" }));
      g.appendChild(svgEl("path", { d: this._chemin(r.a, r.b), class: "courbe" }));

      // Restriction surlignée sur l'axe des abscisses (bornes finies marquées).
      var o = this._px(0, 0);
      var xa = this._px(Math.max(r.a, w.xMin), 0)[0], xb = this._px(Math.min(r.b, w.xMax), 0)[0];
      if (isFinite(r.a) || isFinite(r.b)) {
        g.appendChild(svgEl("line", { x1: xa.toFixed(1), x2: xb.toFixed(1), y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "restriction" }));
        [r.a, r.b].forEach(function (v) {
          if (!isFinite(v)) return;
          var p = self._px(v, 0);
          g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 3.5, class: "borne" }));
        });
      }

      // Horizontale y = k et intersections.
      var pk = this._px(0, k);
      g.appendChild(svgEl("line", { x1: ML, x2: W - MR, y1: pk[1].toFixed(1), y2: pk[1].toFixed(1), class: "horizontale" }));
      var xs = this._intersections(k, r.a, r.b);
      var ok = xs.length <= 1 && !(fn.periodique && r.a === -INF && xs.length > 0);
      xs.forEach(function (x) {
        var p = self._px(x, k);
        g.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 5, class: ok ? "p-ok" : "p-ko" }));
      });
      var procheHaut = pk[1] < MT + 16;
      var ek = svgEl("text", { x: W - MR - 4, y: (procheHaut ? pk[1] + 14 : pk[1] - 6).toFixed(1), "text-anchor": "end", class: "etiq-k" });
      ek.textContent = "y = " + fmt(k, 2);
      svg.appendChild(ek);

      // Boutons de restriction.
      var boutons = this._s.getElementById("restrictions").children;
      for (var j = 0; j < boutons.length; j++) {
        boutons[j].classList.toggle("actif", j === this._r);
        boutons[j].setAttribute("aria-pressed", j === this._r ? "true" : "false");
      }

      // Textes.
      this._s.getElementById("k-valeur").textContent = "k = " + fmt(k, 2);
      var n = xs.length;
      var compte;
      var liste = xs.map(function (x) { return fmt(x, 2); }).join(" ; ");
      if (fn.periodique && r.a === -INF && n > 0) {
        compte = 'Sur ℝ, la droite <span class="fm"><i>y</i> = ' + fmt(k, 2) + '</span> coupe le graphe en <span class="compte-ko">une infinité de points</span> (sin est périodique) ; tu en vois ' + n + " dans la fenêtre.";
      } else if (n === 0) {
        compte = 'La droite <span class="fm"><i>y</i> = ' + fmt(k, 2) + '</span> ne coupe pas le graphe sur <span class="fm">' + r.txt + '</span> : <span class="compte-ok">0 intersection</span>.';
      } else {
        compte = 'La droite <span class="fm"><i>y</i> = ' + fmt(k, 2) + '</span> coupe le graphe sur <span class="fm">' + r.txt + '</span> en <span class="' + (ok ? "compte-ok" : "compte-ko") + '">' + n + " point" + (n > 1 ? "s" : "") + "</span> (<span class=\"fm\"><i>x</i></span> ≈ " + liste + ").";
      }
      this._s.getElementById("compte").innerHTML = compte;
      var verdict;
      if (r.injective) {
        verdict = 'Sur <span class="fm">' + r.txt + "</span>, " + FI + " est " + r.sens + " : toute horizontale la coupe <b>au plus une fois</b>, " + FI + " est <b>injective</b>. " +
          'Avec l’image comme ensemble d’arrivée, <span class="fm"><i>f</i> : ' + r.txt + " → " + r.image + "</span> est bijective : elle a une réciproque.";
      } else {
        verdict = 'Sur <span class="fm">' + r.txt + "</span>, " + FI + " n’est <b>pas injective</b> : la droite " +
          '<span class="fm"><i>y</i> = ' + fmt(r.temoin, 2) + "</span> la coupe " + (fn.periodique && r.a === -INF ? "une infinité de fois" : "plusieurs fois") + ". Choisis une autre restriction.";
      }
      this._s.getElementById("verdict").innerHTML = verdict;
      this._s.getElementById("temoin-zone").hidden = !!r.injective;
    }
  }

  if (!customElements.get("droite-horizontale-widget")) customElements.define("droite-horizontale-widget", DroiteHorizontaleWidget);
})();
