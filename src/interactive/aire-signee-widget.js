(function () {
  "use strict";

  /* ================================================================
   * <aire-signee-widget> — atelier interactif : intégrale (somme SIGNÉE)
   * contre aire (somme des valeurs absolues) pour une fonction qui change
   * de signe (6e, chapitre 4, section 4 — « piège central du chapitre »).
   * Bornes a et b réglables ; parties au-dessus de l'axe en vert, en
   * dessous en rouge ; découpage aux racines affiché morceau par morceau.
   * Fenêtres FIXES par fonction. Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 340, HAUTEUR = 250, MARGE = 28;

  var FONCTIONS = {
    sin: {
      label: "f(x) = sin(x)",
      f: Math.sin,
      F: function (x) { return -Math.cos(x); },
      racines: function (lo, hi) {
        var r = [];
        for (var k = Math.ceil(lo / PI - 1e-9); k * PI < hi + 1e-9; k++) r.push(k * PI);
        return r;
      },
      nomRacine: function (r) {
        var k = Math.round(r / PI);
        return k === 0 ? "0" : k === 1 ? "π" : k === -1 ? "−π" : (k < 0 ? "−" : "") + Math.abs(k) + "π";
      },
      bornes: { min: 0, max: 2 * PI, pas: 0.01 }, defaut: [0, 2 * PI],
      nomsBornes: { "0": "0", "3.1416": "π", "6.2832": "2π", "1.5708": "π/2", "4.7124": "3π/2" },
      fen: { xMin: -0.45, xMax: 6.9, yMin: -1.4, yMax: 1.4 },
      ticksX: [PI / 2, PI, 3 * PI / 2, 2 * PI], ticksY: [-1, 1],
      tickLabels: { "1.5708": "π/2", "3.1416": "π", "4.7124": "3π/2", "6.2832": "2π" },
      presets: [{ txt: "[0 ; 2π]", a: 0, b: 2 * PI }, { txt: "[0 ; π]", a: 0, b: PI }, { txt: "[π/2 ; 3π/2]", a: PI / 2, b: 3 * PI / 2 }]
    },
    cub: {
      label: "f(x) = x³ − x",
      f: function (x) { return x * x * x - x; },
      F: function (x) { return x * x * x * x / 4 - x * x / 2; },
      racines: function () { return [-1, 0, 1]; },
      nomRacine: function (r) { return r === 0 ? "0" : r < 0 ? "−1" : "1"; },
      bornes: { min: -1.6, max: 1.6, pas: 0.01 }, defaut: [-1, 1],
      fen: { xMin: -1.85, xMax: 1.95, yMin: -2.7, yMax: 2.7 },
      ticksX: [-1, 1], ticksY: [-2, -1, 1, 2],
      presets: [{ txt: "[−1 ; 1]", a: -1, b: 1 }, { txt: "[0 ; 1]", a: 0, b: 1 }, { txt: "[−1 ; 1,5]", a: -1, b: 1.5 }]
    },
    lin: {
      label: "f(x) = x",
      f: function (x) { return x; },
      F: function (x) { return x * x / 2; },
      racines: function () { return [0]; },
      nomRacine: function () { return "0"; },
      bornes: { min: -3, max: 4, pas: 0.05 }, defaut: [-2, 3],
      fen: { xMin: -3.4, xMax: 4.5, yMin: -3.4, yMax: 4.4 },
      ticksX: [-3, -2, -1, 1, 2, 3, 4], ticksY: [-3, -2, -1, 1, 2, 3, 4],
      presets: [{ txt: "[−2 ; 3] (exemple du cours)", a: -2, b: 3 }, { txt: "[−3 ; 3]", a: -3, b: 3 }]
    },
    par: {
      label: "f(x) = x² − 4",
      f: function (x) { return x * x - 4; },
      F: function (x) { return x * x * x / 3 - 4 * x; },
      racines: function () { return [-2, 2]; },
      nomRacine: function (r) { return r < 0 ? "−2" : "2"; },
      bornes: { min: -3.2, max: 3.2, pas: 0.05 }, defaut: [-3, 3],
      fen: { xMin: -3.6, xMax: 3.7, yMin: -4.8, yMax: 6.8 },
      ticksX: [-3, -2, -1, 1, 2, 3], ticksY: [-4, -2, 2, 4, 6],
      presets: [{ txt: "[−3 ; 3]", a: -3, b: 3 }, { txt: "[−2 ; 2]", a: -2, b: 2 }, { txt: "[0 ; 3]", a: 0, b: 3 }]
    }
  };
  var ORDRE = ["sin", "cub", "lin", "par"];

  function fmt(n, dec) {
    if (dec === undefined) dec = 3;
    if (Math.abs(n) < 0.5 * Math.pow(10, -dec)) n = 0;
    var s = n.toFixed(dec);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function nomBorne(cfg, v) {
    if (cfg.nomsBornes) {
      var cle = v.toFixed(4);
      if (cfg.nomsBornes[cle]) return cfg.nomsBornes[cle];
    }
    return fmt(v, 2);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.choix{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;}' +
    '.choix label{font-family:var(--mono,monospace);font-size:11px;color:var(--ink-faint,#9c9083);}' +
    'select{min-height:44px;font:inherit;font-size:0.95rem;padding:6px 10px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.graphe{display:flex;justify-content:center;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.2;fill:none;}' +
    '.zone-pos{fill:var(--good,#2f7a4f);fill-opacity:0.38;stroke:var(--good,#2f7a4f);stroke-width:1;}' +
    '.zone-neg{fill:var(--bad,#b23a3a);fill-opacity:0.38;stroke:var(--bad,#b23a3a);stroke-width:1;}' +
    '.borne{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:5 3;}' +
    '.borne-label{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--accent-ink,#7a3212);}' +
    '.racine{fill:var(--surface,#fff);stroke:var(--ink,#241f1a);stroke-width:1.6;}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 8px;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10.5px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1.05rem;font-weight:700;}' +
    '.v-int{color:var(--plan-ink,#443a80);}' +
    '.v-aire{color:var(--accent-ink,#7a3212);}' +
    '.detail{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;font-size:0.92rem;line-height:1.55;}' +
    '.detail ul{margin:4px 0 0;padding-left:18px;}' +
    '.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.neg{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.message{margin:8px 0 0;padding:8px 12px;border-radius:var(--radius,3px);font-size:0.92rem;line-height:1.5;}' +
    '.message.alerte{background:var(--bad-soft,#f6dede);color:var(--ink,#241f1a);border-left:3px solid var(--bad,#b23a3a);}' +
    '.message.ok{background:var(--good-soft,#dcefe2);color:var(--ink,#241f1a);border-left:3px solid var(--good,#2f7a4f);}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-top:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;height:44px;accent-color:var(--accent,#a8471f);}' +
    '.val{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}' +
    'button{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.88rem;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="fn">Fonction</label><select id="fn"></select></div>' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Aire signée entre a et b"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label" id="lab-int">intégrale</span><span class="stat-value v-int" id="v-int"></span></div>' +
    '<div class="stat"><span class="stat-label">aire (valeurs absolues)</span><span class="stat-value v-aire" id="v-aire"></span></div>' +
    '</div>' +
    '<div class="detail" id="detail" aria-live="polite"></div>' +
    '<p class="message" id="message"></p>' +
    '<div class="curseur"><label for="a">a — borne de gauche</label><div class="curseur-row"><input type="range" id="a"><span class="val" id="a-val"></span></div></div>' +
    '<div class="curseur"><label for="b">b — borne de droite</label><div class="curseur-row"><input type="range" id="b"><span class="val" id="b-val"></span></div></div>' +
    '<div class="boutons" id="presets"></div>';

  class AireSigneeWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._cle = "sin";
      var sel = sh.getElementById("fn");
      ORDRE.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c; o.textContent = FONCTIONS[c].label;
        sel.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      this._sel = sh.getElementById("fn");
      this._inA = sh.getElementById("a");
      this._inB = sh.getElementById("b");
      this._sel.addEventListener("change", function () { self._choisir(self._sel.value); });
      this._inA.addEventListener("input", function () {
        var cfg = FONCTIONS[self._cle], v = parseFloat(self._inA.value);
        var ecart = cfg.bornes.pas * 2;
        if (v > self._b - ecart) v = self._b - ecart;
        self._a = v; self._inA.value = String(v);
        self._rendre();
      });
      this._inB.addEventListener("input", function () {
        var cfg = FONCTIONS[self._cle], v = parseFloat(self._inB.value);
        var ecart = cfg.bornes.pas * 2;
        if (v < self._a + ecart) v = self._a + ecart;
        self._b = v; self._inB.value = String(v);
        self._rendre();
      });
      this._choisir(this._cle);
    }

    _choisir(cle) {
      var cfg = FONCTIONS[cle], self = this;
      this._cle = cle;
      this._sel.value = cle;
      [this._inA, this._inB].forEach(function (inp) {
        inp.min = String(cfg.bornes.min); inp.max = String(cfg.bornes.max); inp.step = String(cfg.bornes.pas);
      });
      this._fixer(cfg.defaut[0], cfg.defaut[1]);
      var zone = this._sh.getElementById("presets");
      zone.innerHTML = "";
      cfg.presets.forEach(function (p) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = p.txt;
        b.addEventListener("click", function () { self._fixer(p.a, p.b); });
        zone.appendChild(b);
      });
    }

    _fixer(a, b) {
      this._a = a; this._b = b;
      this._inA.value = String(a); this._inB.value = String(b);
      this._rendre();
    }

    _px(cfg, x, y) {
      var px = MARGE + (x - cfg.fen.xMin) / (cfg.fen.xMax - cfg.fen.xMin) * (LARGEUR - 2 * MARGE);
      var py = HAUTEUR - MARGE + 8 - (y - cfg.fen.yMin) / (cfg.fen.yMax - cfg.fen.yMin) * (HAUTEUR - 2 * MARGE + 8);
      return [px, py];
    }

    _zone(svg, cfg, x1, x2, classe) {
      var n = 60, p0 = this._px(cfg, x1, 0), d = "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " ";
      for (var i = 0; i <= n; i++) {
        var x = x1 + (x2 - x1) * i / n;
        var y = Math.max(cfg.fen.yMin, Math.min(cfg.fen.yMax, cfg.f(x)));
        var p = this._px(cfg, x, y);
        d += "L" + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      }
      var p1 = this._px(cfg, x2, 0);
      d += "L" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " Z";
      el("path", { d: d, "class": classe }, svg);
    }

    _rendre() {
      var sh = this._sh, cfg = FONCTIONS[this._cle], a = this._a, b = this._b, self = this;
      sh.getElementById("a-val").textContent = nomBorne(cfg, a);
      sh.getElementById("b-val").textContent = nomBorne(cfg, b);

      var racines = cfg.racines(a, b).filter(function (r) { return r > a + 1e-9 && r < b - 1e-9; });
      var coupes = [a].concat(racines).concat([b]);
      var morceaux = [];
      for (var i = 0; i < coupes.length - 1; i++) {
        var v = cfg.F(coupes[i + 1]) - cfg.F(coupes[i]);
        morceaux.push({ x1: coupes[i], x2: coupes[i + 1], v: v });
      }
      var integrale = cfg.F(b) - cfg.F(a);
      var aire = morceaux.reduce(function (s, m) { return s + Math.abs(m.v); }, 0);

      // ---- dessin
      var svg = sh.getElementById("svg");
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", "class": "fleche" }, mk);
      morceaux.forEach(function (m) {
        var milieu = (m.x1 + m.x2) / 2;
        self._zone(svg, cfg, m.x1, m.x2, cfg.f(milieu) >= 0 ? "zone-pos" : "zone-neg");
      });
      var o = this._px(cfg, 0, 0);
      var g = this._px(cfg, cfg.fen.xMin, 0)[0], dr = this._px(cfg, cfg.fen.xMax, 0)[0];
      var bas = this._px(cfg, 0, cfg.fen.yMin)[1], haut = this._px(cfg, 0, cfg.fen.yMax)[1];
      el("line", { x1: g, y1: o[1], x2: dr, y2: o[1], "class": "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: bas, x2: o[0], y2: haut, "class": "axe", "marker-end": "url(#fl)" }, svg);
      var tx = el("text", { x: dr - 2, y: o[1] - 6, "class": "tick-label", "text-anchor": "end" }, svg);
      tx.textContent = "x";
      var ty = el("text", { x: o[0] + 6, y: haut + 10, "class": "tick-label" }, svg);
      ty.textContent = "y";
      cfg.ticksX.forEach(function (v) {
        var p = self._px(cfg, v, 0);
        el("line", { x1: p[0], y1: p[1] - 3, x2: p[0], y2: p[1] + 3, "class": "tick" }, svg);
        var t = el("text", { x: p[0], y: p[1] + 13, "class": "tick-label", "text-anchor": "middle" }, svg);
        var cle = v.toFixed(4);
        t.textContent = (cfg.tickLabels && cfg.tickLabels[cle]) || fmt(v, 2);
      });
      cfg.ticksY.forEach(function (v) {
        var p = self._px(cfg, 0, v);
        el("line", { x1: p[0] - 3, y1: p[1], x2: p[0] + 3, y2: p[1], "class": "tick" }, svg);
        var t = el("text", { x: p[0] - 6, y: p[1] + 3, "class": "tick-label", "text-anchor": "end" }, svg);
        t.textContent = fmt(v, 2);
      });
      var d = "", n = 200;
      for (var k = 0; k <= n; k++) {
        var xx = cfg.fen.xMin + 0.05 + (cfg.fen.xMax - cfg.fen.xMin - 0.15) * k / n;
        var yy = cfg.f(xx);
        if (yy > cfg.fen.yMax || yy < cfg.fen.yMin) continue;
        var pp = this._px(cfg, xx, yy);
        d += (d === "" ? "M" : "L") + pp[0].toFixed(2) + " " + pp[1].toFixed(2) + " ";
      }
      el("path", { d: d.trim(), "class": "courbe" }, svg);
      [[a, "a"], [b, "b"]].forEach(function (c) {
        var p1 = self._px(cfg, c[0], cfg.fen.yMin + 0.05), p2 = self._px(cfg, c[0], cfg.fen.yMax - 0.05);
        el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], "class": "borne" }, svg);
        var t = el("text", { x: p1[0] + 4, y: p1[1] - 4, "class": "borne-label" }, svg);
        t.textContent = c[1];
      });
      racines.forEach(function (r) {
        var p = self._px(cfg, r, 0);
        el("circle", { cx: p[0], cy: p[1], r: 4, "class": "racine" }, svg);
      });

      // ---- textes
      sh.getElementById("lab-int").textContent = "intégrale ∫ₐᵇ f(x) dx";
      sh.getElementById("v-int").textContent = fmt(integrale, 3);
      sh.getElementById("v-aire").textContent = fmt(aire, 3);
      var lignes = morceaux.map(function (m) {
        var cls = m.v >= 0 ? "pos" : "neg";
        return "<li>sur [" + nomBorne(cfg, m.x1) + " ; " + nomBorne(cfg, m.x2) + "] : intégrale <span class=\"" + cls + "\">" + fmt(m.v, 3) + "</span>, aire " + fmt(Math.abs(m.v), 3) + "</li>";
      });
      var txtRacines = racines.length ? racines.map(function (r) { return cfg.nomRacine(r); }).join(" ; ") : "aucune";
      sh.getElementById("detail").innerHTML =
        "Racines de f dans ]a ; b[ : <b>" + txtRacines + "</b><ul>" + lignes.join("") + "</ul>";
      var msg = sh.getElementById("message");
      if (morceaux.length > 1 && Math.abs(Math.abs(integrale) - aire) > 1e-6) {
        msg.className = "message alerte";
        msg.textContent = "Les parties se compensent : l'intégrale (" + fmt(integrale, 3) + ") n'est pas l'aire (" + fmt(aire, 3) +
          "). Découpe aux racines, puis additionne les valeurs absolues des morceaux.";
      } else if (integrale < -1e-9) {
        msg.className = "message ok";
        msg.textContent = "f ≤ 0 sur [a ; b] : un seul morceau, sous l'axe. L'aire vaut l'opposé de l'intégrale : aire = −∫ₐᵇ f(x) dx.";
      } else {
        msg.className = "message ok";
        msg.textContent = "f ≥ 0 sur [a ; b] : un seul morceau, au-dessus de l'axe. Intégrale et aire coïncident.";
      }
    }
  }

  if (!customElements.get("aire-signee-widget")) {
    customElements.define("aire-signee-widget", AireSigneeWidget);
  }
})();
