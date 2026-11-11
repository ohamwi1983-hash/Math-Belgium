(function () {
  "use strict";

  /* ================================================================
   * <rectangle-valeur-moyenne-widget> — atelier interactif : la valeur
   * moyenne de f sur [a ; b] est la hauteur m du rectangle de base [a ; b]
   * qui a la MÊME aire que la région sous f (6e, chapitre 4, section 3).
   * On règle m ; quand les deux aires sont égales, le rectangle passe au
   * vert et les points r où f(r) = m sont marqués (théorème de la
   * moyenne). Fenêtres FIXES par fonction. Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI, E = Math.E;
  var NS = "http://www.w3.org/2000/svg";
  var LARGEUR = 340, HAUTEUR = 250, MARGE = 28;

  var FONCTIONS = {
    lin: {
      label: "f(x) = x sur [0 ; 4]",
      formule: "f(x) = x sur [0 ; 4]",
      a: 0, b: 4, f: function (x) { return x; },
      integrale: 8, moyenne: 2, moyenneTxt: "2",
      r: function (m) { return m >= 0 && m <= 4 ? [m] : []; },
      rTxt: ["2"],
      curseur: { min: 0, max: 4.5, pas: 0.01 }, m0: 1,
      fen: { xMin: -0.5, xMax: 4.7, yMin: -0.6, yMax: 4.8 },
      ticksX: [1, 2, 3, 4], ticksY: [1, 2, 3, 4], nomsX: { "4": "4" }
    },
    sin: {
      label: "f(x) = sin(x) sur [0 ; π]",
      formule: "f(x) = sin(x) sur [0 ; π]",
      a: 0, b: PI, f: Math.sin,
      integrale: 2, moyenne: 2 / PI, moyenneTxt: "2/π ≈ 0,637",
      r: function (m) { if (m < 0 || m > 1) return []; var s = Math.asin(m); return Math.abs(s - PI / 2) < 1e-9 ? [s] : [s, PI - s]; },
      rTxt: ["arcsin(2/π) ≈ 0,690", "π − arcsin(2/π) ≈ 2,451"],
      curseur: { min: 0, max: 1.2, pas: 0.005 }, m0: 0.3,
      fen: { xMin: -0.3, xMax: 3.55, yMin: -0.15, yMax: 1.3 },
      ticksX: [PI / 2, PI], ticksY: [0.5, 1], tickLabels: { "1.5708": "π/2", "3.1416": "π" }
    },
    car: {
      label: "f(x) = x² sur [0 ; 3]",
      formule: "f(x) = x² sur [0 ; 3]",
      a: 0, b: 3, f: function (x) { return x * x; },
      integrale: 9, moyenne: 3, moyenneTxt: "3",
      r: function (m) { return m >= 0 && m <= 9 ? [Math.sqrt(m)] : []; },
      rTxt: ["√3 ≈ 1,732"],
      curseur: { min: 0, max: 9.5, pas: 0.01 }, m0: 6,
      fen: { xMin: -0.4, xMax: 3.5, yMin: -1, yMax: 10 },
      ticksX: [1, 2, 3], ticksY: [3, 6, 9]
    },
    exp: {
      label: "f(x) = eˣ sur [0 ; 1]",
      formule: "f(x) = eˣ sur [0 ; 1]",
      a: 0, b: 1, f: Math.exp,
      integrale: E - 1, moyenne: E - 1, moyenneTxt: "e − 1 ≈ 1,718",
      r: function (m) { return m >= 1 && m <= E ? [Math.log(m)] : []; },
      rTxt: ["ln(e − 1) ≈ 0,541"],
      curseur: { min: 0, max: 3, pas: 0.005 }, m0: 2.4,
      fen: { xMin: -0.15, xMax: 1.2, yMin: -0.3, yMax: 3.1 },
      ticksX: [0.5, 1], ticksY: [1, 2, 3]
    }
  };
  var ORDRE = ["lin", "sin", "car", "exp"];

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
    '.sous-f{fill:var(--plan,#5b4ea3);fill-opacity:0.22;stroke:none;}' +
    '.rect{fill:var(--accent,#a8471f);fill-opacity:0.18;stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.rect.egal{fill:var(--good,#2f7a4f);fill-opacity:0.22;stroke:var(--good,#2f7a4f);}' +
    '.repere{stroke:var(--good,#2f7a4f);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.point-r{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiq-m{font-size:11px;font-weight:700;font-family:var(--mono,monospace);fill:var(--accent-ink,#7a3212);}' +
    '.etiq-m.egal{fill:var(--good,#2f7a4f);}' +
    '.etiq-r{font-size:10px;font-family:var(--mono,monospace);fill:var(--good,#2f7a4f);font-weight:700;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-weight:600;margin:0 0 10px;}' +
    '.stats{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0 8px;}' +
    '.stat{flex:1 1 95px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;color:var(--ink-faint,#9c9083);margin-bottom:4px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:1rem;font-weight:700;}' +
    '.message{margin:6px 0 0;padding:8px 12px;border-radius:var(--radius,3px);font-size:0.92rem;line-height:1.5;border-left:3px solid var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);}' +
    '.message.egal{border-left-color:var(--good,#2f7a4f);background:var(--good-soft,#dcefe2);}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;margin-top:8px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;height:44px;accent-color:var(--accent,#a8471f);}' +
    '.val{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;}' +
    '.boutons{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}' +
    'button{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-family:inherit;font-size:0.88rem;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '</style>' +
    '<div class="choix"><label for="fn">Fonction et intervalle</label><select id="fn"></select></div>' +
    '<div class="graphe"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" role="img" aria-label="Rectangle de même aire que la région sous f"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">aire sous f</span><span class="stat-value" id="v-f"></span></div>' +
    '<div class="stat"><span class="stat-label">aire du rectangle</span><span class="stat-value" id="v-r"></span></div>' +
    '<div class="stat"><span class="stat-label">écart</span><span class="stat-value" id="v-e"></span></div>' +
    '</div>' +
    '<p class="message" id="message" aria-live="polite"></p>' +
    '<div class="curseur"><label for="m">m — hauteur du rectangle</label><div class="curseur-row"><input type="range" id="m"><span class="val" id="m-val"></span></div></div>' +
    '<div class="boutons"><button type="button" id="montrer">Montrer la valeur moyenne</button><button type="button" id="reset">Réinitialiser</button></div>';

  class RectangleValeurMoyenneWidget extends HTMLElement {
    constructor() {
      super();
      var sh = this.attachShadow({ mode: "open" });
      sh.appendChild(TEMPLATE.content.cloneNode(true));
      this._sh = sh;
      this._cle = "lin";
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
      this._inM = sh.getElementById("m");
      this._sel.addEventListener("change", function () { self._choisir(self._sel.value); });
      this._inM.addEventListener("input", function () { self._m = parseFloat(self._inM.value); self._rendre(); });
      sh.getElementById("montrer").addEventListener("click", function () {
        var cfg = FONCTIONS[self._cle];
        self._m = cfg.moyenne; self._inM.value = String(cfg.moyenne); self._rendre();
      });
      sh.getElementById("reset").addEventListener("click", function () { self._choisir(self._cle); });
      this._choisir(this._cle);
    }

    _choisir(cle) {
      var cfg = FONCTIONS[cle];
      this._cle = cle;
      this._sel.value = cle;
      this._inM.min = String(cfg.curseur.min);
      this._inM.max = String(cfg.curseur.max);
      this._inM.step = String(cfg.curseur.pas);
      this._m = cfg.m0;
      this._inM.value = String(cfg.m0);
      this._rendre();
    }

    _px(cfg, x, y) {
      var px = MARGE + (x - cfg.fen.xMin) / (cfg.fen.xMax - cfg.fen.xMin) * (LARGEUR - 2 * MARGE);
      var py = HAUTEUR - MARGE + 8 - (y - cfg.fen.yMin) / (cfg.fen.yMax - cfg.fen.yMin) * (HAUTEUR - 2 * MARGE + 8);
      return [px, py];
    }

    _rendre() {
      var sh = this._sh, cfg = FONCTIONS[this._cle], m = this._m, self = this;
      var aireR = m * (cfg.b - cfg.a);
      var egal = Math.abs(m - cfg.moyenne) <= cfg.curseur.pas * 0.6;
      var mAff = egal ? cfg.moyenne : m;
      sh.getElementById("m-val").textContent = fmt(m, 3);

      var svg = sh.getElementById("svg");
      svg.innerHTML = "";
      var defs = el("defs", {}, svg);
      var mk = el("marker", { id: "fl", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" }, defs);
      el("path", { d: "M0,0 L8,4 L0,8 Z", "class": "fleche" }, mk);
      // région sous f
      var n = 120, p0 = this._px(cfg, cfg.a, 0), d = "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " ";
      for (var i = 0; i <= n; i++) {
        var x = cfg.a + (cfg.b - cfg.a) * i / n;
        var p = this._px(cfg, x, cfg.f(x));
        d += "L" + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      }
      var p1 = this._px(cfg, cfg.b, 0);
      d += "L" + p1[0].toFixed(2) + " " + p1[1].toFixed(2) + " Z";
      el("path", { d: d, "class": "sous-f" }, svg);
      // rectangle de hauteur m
      var hautG = this._px(cfg, cfg.a, Math.min(m, cfg.fen.yMax)), basD = this._px(cfg, cfg.b, 0);
      el("rect", { x: hautG[0], y: hautG[1], width: basD[0] - hautG[0], height: Math.max(0, basD[1] - hautG[1]), "class": "rect" + (egal ? " egal" : "") }, svg);
      // axes
      var o = this._px(cfg, 0, 0);
      var g = this._px(cfg, cfg.fen.xMin, 0)[0], dr = this._px(cfg, cfg.fen.xMax, 0)[0];
      var bas = this._px(cfg, 0, cfg.fen.yMin)[1], haut = this._px(cfg, 0, cfg.fen.yMax)[1];
      el("line", { x1: g, y1: o[1], x2: dr, y2: o[1], "class": "axe", "marker-end": "url(#fl)" }, svg);
      el("line", { x1: o[0], y1: bas, x2: o[0], y2: haut, "class": "axe", "marker-end": "url(#fl)" }, svg);
      var tx = el("text", { x: dr - 2, y: o[1] - 6, "class": "tick-label", "text-anchor": "end" }, svg);
      tx.textContent = "x";
      cfg.ticksX.forEach(function (v) {
        var q = self._px(cfg, v, 0);
        el("line", { x1: q[0], y1: q[1] - 3, x2: q[0], y2: q[1] + 3, "class": "tick" }, svg);
        var t = el("text", { x: q[0], y: q[1] + 13, "class": "tick-label", "text-anchor": "middle" }, svg);
        var cle = v.toFixed(4);
        t.textContent = (cfg.tickLabels && cfg.tickLabels[cle]) || fmt(v, 2);
      });
      cfg.ticksY.forEach(function (v) {
        var q = self._px(cfg, 0, v);
        el("line", { x1: q[0] - 3, y1: q[1], x2: q[0] + 3, y2: q[1], "class": "tick" }, svg);
        var t = el("text", { x: q[0] - 6, y: q[1] + 3, "class": "tick-label", "text-anchor": "end" }, svg);
        t.textContent = fmt(v, 2);
      });
      // courbe
      var dc = "", nc = 160;
      for (var k = 0; k <= nc; k++) {
        var xx = cfg.fen.xMin + 0.05 + (cfg.fen.xMax - cfg.fen.xMin - 0.12) * k / nc;
        var yy = cfg.f(xx);
        if (yy > cfg.fen.yMax || yy < cfg.fen.yMin) continue;
        var pc = this._px(cfg, xx, yy);
        dc += (dc === "" ? "M" : "L") + pc[0].toFixed(2) + " " + pc[1].toFixed(2) + " ";
      }
      el("path", { d: dc.trim(), "class": "courbe" }, svg);
      // étiquette m
      var em = el("text", { x: basD[0] + 5, y: hautG[1] + 4, "class": "etiq-m" + (egal ? " egal" : "") }, svg);
      em.textContent = "m";
      // points r
      if (egal) {
        cfg.r(mAff).forEach(function (r, idx) {
          var q = self._px(cfg, r, mAff), q0 = self._px(cfg, r, 0);
          el("line", { x1: q0[0], y1: q0[1], x2: q[0], y2: q[1], "class": "repere" }, svg);
          el("circle", { cx: q[0], cy: q[1], r: 5.5, "class": "point-r" }, svg);
          var t = el("text", { x: q[0], y: q[1] - 9, "class": "etiq-r", "text-anchor": "middle" }, svg);
          t.textContent = "r" + (cfg.r(mAff).length > 1 ? (idx === 0 ? "₁" : "₂") : "");
        });
      }

      // textes
      sh.getElementById("v-f").textContent = fmt(cfg.integrale, 3);
      sh.getElementById("v-r").textContent = fmt(egal ? cfg.integrale : aireR, 3);
      sh.getElementById("v-e").textContent = fmt(egal ? 0 : aireR - cfg.integrale, 3);
      var msg = sh.getElementById("message");
      if (egal) {
        msg.className = "message egal";
        var rs = cfg.rTxt.map(function (t, i) { return (cfg.rTxt.length > 1 ? "r" + (i === 0 ? "₁" : "₂") + " = " : "r = ") + t; }).join(" et ");
        msg.textContent = "Les deux aires sont égales : m = valeur moyenne de f = " + cfg.moyenneTxt +
          ". f atteint sa valeur moyenne en " + rs + " — les parties de la région au-dessus du rectangle compensent exactement les vides en dessous.";
      } else {
        msg.className = "message";
        msg.textContent = aireR < cfg.integrale
          ? "Le rectangle est trop bas : son aire (" + fmt(aireR, 3) + ") est plus petite que l'aire sous f. Monte m."
          : "Le rectangle est trop haut : son aire (" + fmt(aireR, 3) + ") dépasse l'aire sous f. Descends m.";
      }
    }
  }

  if (!customElements.get("rectangle-valeur-moyenne-widget")) {
    customElements.define("rectangle-valeur-moyenne-widget", RectangleValeurMoyenneWidget);
  }
})();
