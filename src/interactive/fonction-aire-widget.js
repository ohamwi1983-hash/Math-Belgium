(function () {
  "use strict";

  /* ================================================================
   * <fonction-aire-widget> — atelier interactif du théorème fondamental
   * (6e, chapitre 4, section 3). En haut : f et l'aire hachurée de a à x
   * (verte si elle compte positivement, rouge sinon). En bas : la fonction
   * aire A(x) = ∫ₐˣ f(t) dt, qui se dessine au fur et à mesure que x est
   * déplacé, avec sa tangente au point courant — dont la pente vaut f(x).
   * Encart optionnel : la mince bande A(x + h) − A(x) comparée au rectangle
   * f(x)·h. Fenêtres FIXES par fonction (jamais recalculées). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 340, HAUT_F = 210, HAUT_A = 190, MARGE = 28;

  var FONCTIONS = {
    lin: {
      label: "f(x) = x",
      formule: "f(x) = x ; a = 0 ; A(x) = x²/2",
      a: 0, xMin: 0, xMax: 4, pas: 0.01, x0: 1,
      f: function (x) { return x; },
      A: function (x) { return x * x / 2; },
      fen: { xMin: -0.5, xMax: 4.6 }, fenF: { yMin: -1, yMax: 4.6 }, fenA: { yMin: -0.8, yMax: 8.6 },
      ticksX: [1, 2, 3, 4], ticksF: [1, 2, 3, 4], ticksA: [2, 4, 6, 8],
      remarquables: [{ x: 2, txt: "x = 2" }, { x: 4, txt: "x = 4" }]
    },
    cos: {
      label: "f(x) = cos(x)",
      formule: "f(x) = cos(x) ; a = 0 ; A(x) = sin(x)",
      a: 0, xMin: 0, xMax: 2 * PI, pas: 0.01, x0: 1,
      f: Math.cos,
      A: Math.sin,
      fen: { xMin: -0.45, xMax: 6.9 }, fenF: { yMin: -1.45, yMax: 1.45 }, fenA: { yMin: -1.45, yMax: 1.45 },
      ticksX: [PI / 2, PI, 3 * PI / 2, 2 * PI], ticksF: [-1, 1], ticksA: [-1, 1],
      tickLabels: { "1.5708": "π/2", "3.1416": "π", "4.7124": "3π/2", "6.2832": "2π" },
      remarquables: [{ x: PI / 2, txt: "x = π/2" }, { x: PI, txt: "x = π" }, { x: 3 * PI / 2, txt: "x = 3π/2" }]
    },
    dec: {
      label: "f(x) = 2 − x",
      formule: "f(x) = 2 − x ; a = 0 ; A(x) = 2x − x²/2",
      a: 0, xMin: 0, xMax: 4, pas: 0.01, x0: 1,
      f: function (x) { return 2 - x; },
      A: function (x) { return 2 * x - x * x / 2; },
      fen: { xMin: -0.5, xMax: 4.6 }, fenF: { yMin: -2.5, yMax: 2.5 }, fenA: { yMin: -0.6, yMax: 2.6 },
      ticksX: [1, 2, 3, 4], ticksF: [-2, -1, 1, 2], ticksA: [1, 2],
      remarquables: [{ x: 2, txt: "x = 2" }, { x: 4, txt: "x = 4" }]
    },
    inv: {
      label: "f(x) = 1/x",
      formule: "f(x) = 1/x ; a = 1 ; A(x) = ln(x)",
      a: 1, xMin: 0.25, xMax: 4.5, pas: 0.01, x0: 2,
      f: function (x) { return 1 / x; },
      A: Math.log,
      fen: { xMin: -0.35, xMax: 4.9 }, fenF: { yMin: -0.45, yMax: 4.4 }, fenA: { yMin: -1.65, yMax: 1.8 },
      ticksX: [1, 2, 3, 4], ticksF: [1, 2, 3, 4], ticksA: [-1, 1],
      remarquables: [{ x: Math.E, txt: "x = e" }, { x: 1, txt: "x = 1" }, { x: 0.5, txt: "x = 0,5" }]
    }
  };
  var ORDRE = ["lin", "cos", "dec", "inv"];

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

  function labelTick(cfg, v) {
    if (cfg.tickLabels) {
      var cle = v.toFixed(4);
      if (cfg.tickLabels[cle]) return cfg.tickLabels[cle];
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-weight:600;margin:0 0 10px;}' +
    '.graphes{display:flex;flex-direction:column;align-items:center;gap:6px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:9.5px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.titre{font-size:12px;font-weight:700;}' +
    '.titre-f{fill:var(--accent-ink,#7a3212);}' +
    '.titre-a{fill:var(--plan-ink,#443a80);}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.2;fill:none;}' +
    '.courbe-a{stroke:var(--plan,#5b4ea3);stroke-width:2.4;fill:none;}' +
    '.fantome{stroke:var(--plan,#5b4ea3);stroke-width:1.4;fill:none;opacity:0.22;stroke-dasharray:3 3;}' +
    '.zone-pos{fill:url(#hach-pos);stroke:none;}' +
    '.zone-neg{fill:url(#hach-neg);stroke:none;}' +
    '.hach-pos-trait{stroke:var(--good,#2f7a4f);stroke-width:1.6;}' +
    '.hach-neg-trait{stroke:var(--bad,#b23a3a);stroke-width:1.6;}' +
    '.hach-fond-pos{fill:var(--good,#2f7a4f);fill-opacity:0.12;}' +
    '.hach-fond-neg{fill:var(--bad,#b23a3a);fill-opacity:0.12;}' +
    '.repere{stroke:var(--ink-soft,#6b6055);stroke-width:1;stroke-dasharray:3 3;}' +
    '.point-f{fill:var(--accent,#a8471f);}' +
    '.point-a{fill:var(--plan,#5b4ea3);}' +
    '.tangente{stroke:var(--plan-ink,#443a80);stroke-width:2;stroke-dasharray:6 3;}' +
    '.bande{fill:var(--plan,#5b4ea3);fill-opacity:0.45;stroke:var(--plan,#5b4ea3);stroke-width:1;}' +
    '.rect-h{fill:none;stroke:var(--ink,#241f1a);stroke-width:1.3;stroke-dasharray:4 2;}' +
    '.etiq-a{font-size:10.5px;font-family:var(--mono,monospace);fill:var(--ink-soft,#6b6055);}' +
    '.lecture{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);background:var(--surface,#fff);padding:10px 12px;margin:10px 0;font-size:0.93rem;line-height:1.5;}' +
    '.lecture b{font-variant-numeric:tabular-nums;}' +
    '.pente{color:var(--plan-ink,#443a80);font-weight:700;}' +
    '.neg{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.posi{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.encart{border:1px dashed var(--plan,#5b4ea3);border-radius:var(--radius,3px);padding:8px 12px;margin:8px 0;font-size:0.9rem;line-height:1.5;background:var(--plan-soft,#ece9f7);}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-top:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;height:44px;accent-color:var(--accent,#a8471f);}' +
    '.val{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;}' +
    '.case{display:flex;align-items:center;gap:10px;min-height:44px;cursor:pointer;}' +
    '.case input{width:22px;height:22px;accent-color:var(--plan,#5b4ea3);}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;}' +
    'button{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.88rem;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="fn">Fonction étudiée</label><select id="fn"></select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphes">' +
    '<svg id="svg-f" viewBox="0 0 ' + LARGEUR + ' ' + HAUT_F + '" role="img" aria-label="Graphique de f et aire de a à x"></svg>' +
    '<svg id="svg-a" viewBox="0 0 ' + LARGEUR + ' ' + HAUT_A + '" role="img" aria-label="Graphique de la fonction aire A"></svg>' +
    '</div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="curseur"><label for="x">x — fais glisser la borne de droite</label>' +
    '<div class="curseur-row"><input type="range" id="x"><span class="val" id="x-val"></span></div></div>' +
    '<div class="boutons" id="remarquables"></div>' +
    '<label class="case"><input type="checkbox" id="toute"> Montrer toute la courbe de A</label>' +
    '<label class="case"><input type="checkbox" id="zoom"> Zoom sur A(x + h) − A(x)</label>' +
    '<div id="bloc-h" hidden>' +
    '<div class="curseur"><label for="h">h — largeur de la bande</label>' +
    '<div class="curseur-row"><input type="range" id="h" min="0.02" max="1" step="0.01" value="0.5"><span class="val" id="h-val"></span></div></div>' +
    '<div class="encart" id="encart"></div></div>' +
    '<div class="boutons"><button type="button" id="effacer">Effacer la trace</button><button type="button" id="reset">Réinitialiser</button></div>';

  class FonctionAireWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._cle = "lin";
      this._x = FONCTIONS.lin.x0;
      this._h = 0.5;
      var sel = sh.getElementById("fn");
      ORDRE.forEach(function (c) {
        var o = document.createElement("option");
        o.value = c; o.textContent = FONCTIONS[c].label;
        sel.appendChild(o);
      });
    }

    connectedCallback() {
      var self = this, sh = this._sh;
      this._selFn = sh.getElementById("fn");
      this._inX = sh.getElementById("x");
      this._inH = sh.getElementById("h");
      this._toute = sh.getElementById("toute");
      this._zoom = sh.getElementById("zoom");
      this._blocH = sh.getElementById("bloc-h");
      this._selFn.addEventListener("change", function () { self._choisir(self._selFn.value); });
      this._inX.addEventListener("input", function () { self._allerA(parseFloat(self._inX.value)); });
      this._inH.addEventListener("input", function () { self._h = parseFloat(self._inH.value); self._rendre(); });
      this._toute.addEventListener("change", function () { self._rendre(); });
      this._zoom.addEventListener("change", function () { self._blocH.hidden = !self._zoom.checked; self._rendre(); });
      sh.getElementById("effacer").addEventListener("click", function () {
        var cfg = FONCTIONS[self._cle];
        self._lo = Math.min(cfg.a, self._x); self._hi = Math.max(cfg.a, self._x);
        self._rendre();
      });
      sh.getElementById("reset").addEventListener("click", function () {
        self._toute.checked = false; self._zoom.checked = false; self._blocH.hidden = true;
        self._h = 0.5; self._inH.value = "0.5";
        self._choisir(self._cle);
      });
      this._choisir(this._cle);
    }

    _choisir(cle) {
      var cfg = FONCTIONS[cle];
      this._cle = cle;
      this._selFn.value = cle;
      this._inX.min = String(cfg.xMin);
      this._inX.max = String(cfg.xMax);
      this._inX.step = String(cfg.pas);
      this._x = cfg.x0;
      this._inX.value = String(cfg.x0);
      this._lo = Math.min(cfg.a, cfg.x0);
      this._hi = Math.max(cfg.a, cfg.x0);
      var self = this, zone = this._sh.getElementById("remarquables");
      zone.innerHTML = "";
      cfg.remarquables.forEach(function (r) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = r.txt;
        b.addEventListener("click", function () { self._inX.value = String(r.x); self._allerA(r.x); });
        zone.appendChild(b);
      });
      this._rendre();
    }

    _allerA(x) {
      var cfg = FONCTIONS[this._cle];
      x = Math.max(cfg.xMin, Math.min(cfg.xMax, x));
      this._x = x;
      if (x < this._lo) this._lo = x;
      if (x > this._hi) this._hi = x;
      this._rendre();
    }

    _px(cfg, fenY, haut, x, y) {
      var px = MARGE + (x - cfg.fen.xMin) / (cfg.fen.xMax - cfg.fen.xMin) * (LARGEUR - 2 * MARGE);
      var py = haut - MARGE + 6 - (y - fenY.yMin) / (fenY.yMax - fenY.yMin) * (haut - 2 * MARGE + 6);
      return [px, py];
    }

    _repere(svg, cfg, fenY, haut, titre, classeTitre, ticksY, idSuffixe) {
      var self = this;
      var defs = el("defs", {}, svg);
      var m = el("marker", { id: "fl-" + idSuffixe, markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", "class": "fleche" }, m);
      if (idSuffixe === "f") {
        ["pos", "neg"].forEach(function (s) {
          var p = el("pattern", { id: "hach-" + s, patternUnits: "userSpaceOnUse", width: "7", height: "7", patternTransform: "rotate(45)" }, defs);
          el("rect", { x: "0", y: "0", width: "7", height: "7", "class": "hach-fond-" + s }, p);
          el("line", { x1: "0", y1: "0", x2: "0", y2: "7", "class": "hach-" + s + "-trait" }, p);
        });
      }
      var o = self._px(cfg, fenY, haut, 0, 0);
      var gauche = self._px(cfg, fenY, haut, cfg.fen.xMin, 0)[0];
      var droite = self._px(cfg, fenY, haut, cfg.fen.xMax, 0)[0];
      var bas = self._px(cfg, fenY, haut, 0, fenY.yMin)[1];
      var haute = self._px(cfg, fenY, haut, 0, fenY.yMax)[1];
      el("line", { x1: gauche, y1: o[1], x2: droite, y2: o[1], "class": "axe", "marker-end": "url(#fl-" + idSuffixe + ")" }, svg);
      el("line", { x1: o[0], y1: bas, x2: o[0], y2: haute, "class": "axe", "marker-end": "url(#fl-" + idSuffixe + ")" }, svg);
      var tx = el("text", { x: droite - 2, y: o[1] - 6, "class": "tick-label", "text-anchor": "end" }, svg);
      tx.textContent = "x";
      cfg.ticksX.forEach(function (v) {
        var p = self._px(cfg, fenY, haut, v, 0);
        el("line", { x1: p[0], y1: p[1] - 3, x2: p[0], y2: p[1] + 3, "class": "tick" }, svg);
        var t = el("text", { x: p[0], y: p[1] + 13, "class": "tick-label", "text-anchor": "middle" }, svg);
        t.textContent = labelTick(cfg, v);
      });
      ticksY.forEach(function (v) {
        var p = self._px(cfg, fenY, haut, 0, v);
        el("line", { x1: p[0] - 3, y1: p[1], x2: p[0] + 3, y2: p[1], "class": "tick" }, svg);
        var t = el("text", { x: p[0] - 6, y: p[1] + 3, "class": "tick-label", "text-anchor": "end" }, svg);
        t.textContent = fmt(v, 2);
      });
      var tt = el("text", { x: o[0] + 6, y: haute + 10, "class": "titre " + classeTitre }, svg);
      tt.textContent = titre;
    }

    _chemin(cfg, fenY, haut, fn, x1, x2) {
      var d = "", n = 160, enCours = false;
      for (var i = 0; i <= n; i++) {
        var x = x1 + (x2 - x1) * i / n;
        var y = fn(x);
        if (!isFinite(y) || y > fenY.yMax + 0.05 || y < fenY.yMin - 0.05) { enCours = false; continue; }
        var p = this._px(cfg, fenY, haut, x, y);
        d += (enCours ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
        enCours = true;
      }
      return d.trim();
    }

    _zone(svg, cfg, fenY, haut, x1, x2, classe) {
      if (Math.abs(x2 - x1) < 1e-9) return;
      var n = 80, d = "";
      var p0 = this._px(cfg, fenY, haut, x1, 0);
      d += "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " ";
      for (var i = 0; i <= n; i++) {
        var x = x1 + (x2 - x1) * i / n;
        var y = Math.max(fenY.yMin, Math.min(fenY.yMax, cfg.f(x)));
        var p = this._px(cfg, fenY, haut, x, y);
        d += "L" + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      }
      var p1 = this._px(cfg, fenY, haut, x2, 0);
      d += "L" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " Z";
      el("path", { d: d, "class": classe }, svg);
    }

    _racines(cfg, x1, x2) {
      // zéros de f entre x1 et x2 (balayage + bissection) — f est continue sur le domaine
      var r = [], n = 400, lo = Math.min(x1, x2), hi = Math.max(x1, x2);
      var prec = cfg.f(lo);
      for (var i = 1; i <= n; i++) {
        var x = lo + (hi - lo) * i / n, v = cfg.f(x);
        if (prec === 0) { r.push(lo + (hi - lo) * (i - 1) / n); }
        else if (prec * v < 0) {
          var a = lo + (hi - lo) * (i - 1) / n, b = x;
          for (var k = 0; k < 50; k++) { var mm = (a + b) / 2; if (cfg.f(a) * cfg.f(mm) <= 0) b = mm; else a = mm; }
          r.push((a + b) / 2);
        }
        prec = v;
      }
      return r.filter(function (z) { return z > lo + 1e-9 && z < hi - 1e-9; });
    }

    _rendre() {
      var sh = this._sh, cfg = FONCTIONS[this._cle], x = this._x, a = cfg.a;
      var fx = cfg.f(x), Ax = cfg.A(x) - cfg.A(a);
      sh.getElementById("formule").textContent = cfg.formule;
      sh.getElementById("x-val").textContent = fmt(x, 2);
      sh.getElementById("h-val").textContent = fmt(this._h, 2);

      // ---- graphique de f
      var svgF = sh.getElementById("svg-f");
      svgF.innerHTML = "";
      this._repere(svgF, cfg, cfg.fenF, HAUT_F, "f", "titre-f", cfg.ticksF, "f");
      var lo = Math.min(a, x), hi = Math.max(a, x), sens = x >= a ? 1 : -1;
      var bornes = [lo].concat(this._racines(cfg, lo, hi)).concat([hi]);
      for (var i = 0; i < bornes.length - 1; i++) {
        var milieu = (bornes[i] + bornes[i + 1]) / 2;
        var signe = (cfg.f(milieu) >= 0 ? 1 : -1) * sens;
        this._zone(svgF, cfg, cfg.fenF, HAUT_F, bornes[i], bornes[i + 1], signe > 0 ? "zone-pos" : "zone-neg");
      }
      if (this._zoom.checked) {
        var hEff = Math.min(this._h, cfg.xMax - x);
        if (hEff > 0.005) {
          var pb = [], n = 30;
          var q0 = this._px(cfg, cfg.fenF, HAUT_F, x, 0);
          var d = "M" + q0[0].toFixed(2) + " " + q0[1].toFixed(2) + " ";
          for (var k = 0; k <= n; k++) {
            var xx = x + hEff * k / n;
            var q = this._px(cfg, cfg.fenF, HAUT_F, xx, Math.max(cfg.fenF.yMin, Math.min(cfg.fenF.yMax, cfg.f(xx))));
            d += "L" + q[0].toFixed(2) + " " + q[1].toFixed(2) + " ";
          }
          var q1 = this._px(cfg, cfg.fenF, HAUT_F, x + hEff, 0);
          d += "L" + q1[0].toFixed(2) + " " + q1[1].toFixed(2) + " Z";
          el("path", { d: d, "class": "bande" }, svgF);
          var r0 = this._px(cfg, cfg.fenF, HAUT_F, x, Math.max(cfg.fenF.yMin, Math.min(cfg.fenF.yMax, fx)));
          var y0 = q0[1];
          el("rect", { x: r0[0], y: Math.min(r0[1], y0), width: Math.max(0.5, q1[0] - q0[0]), height: Math.abs(y0 - r0[1]), "class": "rect-h" }, svgF);
        }
      }
      el("path", { d: this._chemin(cfg, cfg.fenF, HAUT_F, cfg.f, Math.max(cfg.fen.xMin, cfg.xMin - (this._cle === "inv" ? 0.02 : 0.3)), cfg.fen.xMax - 0.05), "class": "courbe-f" }, svgF);
      var pa = this._px(cfg, cfg.fenF, HAUT_F, a, 0);
      var ta = el("text", { x: pa[0], y: pa[1] + 24, "class": "etiq-a", "text-anchor": "middle" }, svgF);
      ta.textContent = "a";
      if (Math.abs(x - a) > 1e-9) {
        var px0 = this._px(cfg, cfg.fenF, HAUT_F, x, 0);
        var pxf = this._px(cfg, cfg.fenF, HAUT_F, x, Math.max(cfg.fenF.yMin, Math.min(cfg.fenF.yMax, fx)));
        el("line", { x1: px0[0], y1: px0[1], x2: pxf[0], y2: pxf[1], "class": "repere" }, svgF);
      }
      var pf = this._px(cfg, cfg.fenF, HAUT_F, x, Math.max(cfg.fenF.yMin, Math.min(cfg.fenF.yMax, fx)));
      el("circle", { cx: pf[0], cy: pf[1], r: 5, "class": "point-f" }, svgF);

      // ---- graphique de A
      var svgA = sh.getElementById("svg-a");
      svgA.innerHTML = "";
      this._repere(svgA, cfg, cfg.fenA, HAUT_A, "A(x) = ∫ₐˣ f(t) dt", "titre-a", cfg.ticksA, "a");
      var Afn = function (t) { return cfg.A(t) - cfg.A(a); };
      el("path", { d: this._chemin(cfg, cfg.fenA, HAUT_A, Afn, cfg.xMin, cfg.xMax), "class": "fantome" }, svgA);
      var x1 = this._toute.checked ? cfg.xMin : this._lo, x2 = this._toute.checked ? cfg.xMax : this._hi;
      if (x2 - x1 > 1e-6) el("path", { d: this._chemin(cfg, cfg.fenA, HAUT_A, Afn, x1, x2), "class": "courbe-a" }, svgA);
      var pA = this._px(cfg, cfg.fenA, HAUT_A, x, Ax);
      // tangente : demi-longueur fixe (en pixels) dans la direction de pente fx
      var sx = (LARGEUR - 2 * MARGE) / (cfg.fen.xMax - cfg.fen.xMin);
      var sy = (HAUT_A - 2 * MARGE + 6) / (cfg.fenA.yMax - cfg.fenA.yMin);
      var dxp = 1, dyp = -fx * sy / sx, norme = Math.sqrt(dxp * dxp + dyp * dyp), L = 44;
      el("line", { x1: pA[0] - L * dxp / norme, y1: pA[1] - L * dyp / norme, x2: pA[0] + L * dxp / norme, y2: pA[1] + L * dyp / norme, "class": "tangente" }, svgA);
      el("circle", { cx: pA[0], cy: pA[1], r: 5, "class": "point-a" }, svgA);

      // ---- lecture
      var txtSigne, droite = x >= a;
      if (Math.abs(fx) < 0.005) txtSigne = "f(x) = 0 : la tangente à A est horizontale, A atteint un extremum.";
      else if (fx > 0) txtSigne = "f(x) > 0 : A est <span class=\"posi\">croissante</span> autour de ce x" + (droite ? " — l'aire ajoutée compte positivement." : ".");
      else txtSigne = "f(x) < 0 : A est <span class=\"neg\">décroissante</span> autour de ce x" + (droite ? " — l'aire ajoutée compte négativement (hachures rouges)." : ".");
      var ligneSens = droite ? "" : "<br>x < a : l'intervalle [x ; a] est parcouru à l'envers, A(x) = −∫ₓᵃ f(t) dt est négatif (hachures rouges).";
      var nomX = fmt(x, 2);
      cfg.remarquables.forEach(function (r) { if (Math.abs(r.x - x) < 1e-9) nomX = r.txt.replace("x = ", ""); });
      sh.getElementById("x-val").textContent = nomX;
      sh.getElementById("lecture").innerHTML =
        "x = <b>" + nomX + "</b> ; A(x) = <b>" + fmt(Ax, 3) + "</b><br>" +
        "<span class=\"pente\">pente de A en x = f(x) = " + fmt(fx, 3) + "</span><br>" + txtSigne + ligneSens;
      if (this._zoom.checked) {
        var hE = Math.min(this._h, cfg.xMax - x);
        var enc = sh.getElementById("encart");
        if (hE <= 0.005) enc.textContent = "Rapproche x de la gauche pour laisser la place à la bande de largeur h.";
        else {
          var dA = cfg.A(x + hE) - cfg.A(x);
          enc.innerHTML = "A(x + h) − A(x) = <b>" + fmt(dA, 4) + "</b> (bande violette)<br>" +
            "f(x)·h = <b>" + fmt(fx * hE, 4) + "</b> (rectangle en pointillés)<br>" +
            "[A(x + h) − A(x)] ÷ h = <b>" + fmt(dA / hE, 4) + "</b> → f(x) = " + fmt(fx, 4) + " quand h → 0 : c'est A′(x) = f(x).";
        }
      }
    }
  }

  if (!customElements.get("fonction-aire-widget")) {
    customElements.define("fonction-aire-widget", FonctionAireWidget);
  }
})();
