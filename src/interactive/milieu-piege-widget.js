(function () {
  "use strict";

  /* ================================================================
   * <milieu-piege-widget> — atelier interactif « points liés à un
   * vecteur », trois modes :
   *  - « Milieu » : A et u déplaçables, B = A + u calculé — le vrai
   *    milieu M (moyenne, vert) affiché à côté du faux « milieu » du
   *    piège (la différence des coordonnées, qui vaut toujours u).
   *    Défaut A(1;1), u(4;2) → B(5;3), M(3;2) : l'exemple résolu.
   *  - « AM = k·AB » : A et B déplaçables, curseur k (crans 0, 1/3,
   *    1/2, 2/3, 1) — M glisse sur la droite (AB). Défaut A(1;1),
   *    B(7;4), k = 2/3 → M(5;3).
   *  - « Symétrique » : A′ symétrique de A par rapport à B (B milieu de
   *    [AA′]). Défaut A(1;2), B(4;3) → A′(7;4).
   * Fenêtre fixe, même échelle sur les deux axes. Web Component
   * (Shadow DOM).
   * ================================================================ */

  var MODES = {
    milieu: { label: "Milieu" },
    relation: { label: "<span class=vec>AM</span> = k·<span class=vec>AB</span>" },
    symetrique: { label: "Symétrique" },
  };
  var DEFAUTS = {
    milieu: { xA: 1, yA: 1, xu: 4, yu: 2 },
    relation: { xA: 1, yA: 1, xB: 7, yB: 4, k12: 8 },
    symetrique: { xA: 1, yA: 2, xB: 4, yB: 3 },
  };
  var BORNES_P = { min: 0, max: 7, step: 0.5 };
  var BORNES_U = { min: -4, max: 4, step: 0.5 };
  var BORNES_K12 = { min: -12, max: 24, step: 1 }; // k = k12 / 12
  var CRANS_K = [[0, "0"], [4, "1/3"], [6, "1/2"], [8, "2/3"], [12, "1"]];

  var BORNES_PM = { min: 0, max: 6, step: 0.5 }; // A en mode « Milieu »
  // Fenêtre fixe PAR MODE (jamais recalculée depuis un curseur), même échelle sur les deux axes :
  // « Milieu » : B = A + u reste dans [−4 ; 10] ; les deux autres modes atteignent [−7 ; 14].
  var FENETRES = { milieu: [-5, 11], relation: [-7, 14], symetrique: [-7, 14] };
  var X_MIN = -7, X_MAX = 14, Y_MIN = -7, Y_MAX = 14;
  function fenetre(mode) { var f = FENETRES[mode]; X_MIN = Y_MIN = f[0]; X_MAX = Y_MAX = f[1]; }
  var LARGEUR = 420, HAUTEUR = 420, MARGE = 28;
  var NS = "http://www.w3.org/2000/svg";

  function moins(s) { return s.replace(/-/g, "−"); }

  /** Nombre « propre » : entier ou 2 décimales au plus ; sinon arrondi au centième précédé de ≈. */
  function nb(n) {
    var r2 = Math.round(n * 100) / 100;
    if (Object.is(r2, -0)) r2 = 0;
    var exact = Math.abs(n - r2) < 1e-9;
    var t = String(Math.abs(r2 - Math.round(r2)) < 1e-9 ? Math.round(r2) : r2).replace(".", ",");
    return { texte: moins(t), exact: exact };
  }
  function nbTexte(n) { var v = nb(n); return (v.exact ? "" : "≈ ") + v.texte; }
  function nbPar(n) { var t = nb(n).texte; return n < 0 ? "(" + t + ")" : t; }

  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function fractionK(k12) {
    if (k12 === 0) return "0";
    var g = pgcd(k12, 12), num = k12 / g, den = 12 / g;
    var s = den === 1 ? String(Math.abs(num)) : Math.abs(num) + "/" + den;
    return (num < 0 ? "−" : "") + s;
  }

  /** Petite flèche de vecteur tracée au-dessus d'un <text> SVG déjà inséré (le caractère combinant
   * U+20D7 n'est pas rendu par toutes les polices). */
  function flecheSur(svg, texte, classe) {
    var bb;
    try { bb = texte.getBBox(); } catch (e) { return; }
    if (!bb || !bb.width) return;
    var y = bb.y + 1.2, x1 = bb.x + 0.5, x2 = bb.x + bb.width + 1.5;
    var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
    l.setAttribute("x1", x1.toFixed(2)); l.setAttribute("x2", (x2 - 3).toFixed(2));
    l.setAttribute("y1", y.toFixed(2)); l.setAttribute("y2", y.toFixed(2));
    l.setAttribute("class", "vf " + classe);
    svg.appendChild(l);
    var p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", "M" + x2.toFixed(2) + " " + y.toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y - 2.6).toFixed(2) + " L" + (x2 - 5).toFixed(2) + " " + (y + 2.6).toFixed(2) + " Z");
    p.setAttribute("class", "vf-tete " + classe);
    svg.appendChild(p);
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-bottom:12px;}' +
    '.modes button{flex:1 1 0;min-width:96px;max-width:180px;min-height:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);touch-action:none;}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.6;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.graduation{fill:var(--ink-soft,#6b6055);font-size:10px;font-family:var(--sans,sans-serif);}' +
    '.fl-axe{fill:var(--ink-soft,#6b6055);}' +
    '.fl-accent{fill:var(--accent,#a8471f);}' +
    '.fl-good{fill:var(--good,#2f7a4f);}' +
    '.fl-bad{fill:var(--bad,#b23a3a);}' +
    '.vec-accent{stroke:var(--accent,#a8471f);stroke-width:2.2;}' +
    '.vec-good{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.vec-bad{stroke:var(--bad,#b23a3a);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.droite{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.marque{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.point-ink{fill:var(--ink,#241f1a);}' +
    '.point-accent{fill:var(--accent,#a8471f);}' +
    '.point-good{fill:var(--good,#2f7a4f);}' +
    '.point-bad{fill:var(--bad,#b23a3a);}' +
    '.poignee{fill:transparent;cursor:grab;}' +
    '.etiquette{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.et-ink{fill:var(--ink,#241f1a);}' +
    '.et-accent{fill:var(--accent-ink,#7a3212);}' +
    '.et-good{fill:var(--good,#2f7a4f);}' +
    '.et-bad{fill:var(--bad,#b23a3a);}' +
    '.vec{position:relative;display:inline-block;padding-top:0.18em;line-height:1.1;}' +
    '.vec::before{content:"";position:absolute;left:0.04em;right:0.12em;top:0.04em;border-top:1.5px solid currentColor;}' +
    '.vec::after{content:"";position:absolute;right:-0.06em;top:calc(0.04em + 0.75px - 0.21em);border-top:0.21em solid transparent;border-bottom:0.21em solid transparent;border-left:0.34em solid currentColor;}' +
    '.vf{stroke-width:1.5;}' +
    '.vf-accent{stroke:var(--accent-ink,#7a3212);fill:var(--accent-ink,#7a3212);}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 16px;font-variant-numeric:tabular-nums;}' +
    '.ligne{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.9rem;line-height:1.5;}' +
    '.ligne b{font-weight:700;}' +
    '.vrai{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.faux{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.info{color:var(--ink-soft,#6b6055);}' +
    '.controles{display:flex;flex-direction:column;gap:10px;}' +
    '.curseur{display:flex;flex-direction:column;gap:2px;}' +
    '.curseur label{font-weight:700;color:var(--accent-ink,#7a3212);font-size:0.9rem;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.crans{display:flex;flex-wrap:wrap;gap:6px;}' +
    '.crans button{min-width:52px;min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:700;cursor:pointer;font-family:inherit;font-size:0.9rem;}' +
    '.crans button[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '</style>' +
    '<div class="modes" id="modes" role="group" aria-label="Choix du mode"></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Repère avec les points"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles" id="controles"></div>';

  class MilieuPiegeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  MilieuPiegeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._shadow = shadow;
    this._mode = "milieu";
    this._etats = {};
    for (var m in DEFAUTS) this._etats[m] = Object.assign({}, DEFAUTS[m]);
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._modes = shadow.getElementById("modes");
    this._controles = shadow.getElementById("controles");
    var self = this;
    Object.keys(MODES).forEach(function (m) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-mode", m);
      b.innerHTML = MODES[m].label;
      self._modes.appendChild(b);
    });
  };

  MilieuPiegeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onMode = function (e) {
      var b = e.target.closest("button[data-mode]");
      if (!b) return;
      self._mode = b.getAttribute("data-mode");
      self._construireControles();
      self._rendre();
    };
    this._onInput = function (e) {
      var id = e.target && e.target.id;
      if (!id || !e.target.matches('input[type="range"]')) return;
      self._etats[self._mode][id] = parseFloat(e.target.value);
      self._rendre();
    };
    this._onClic = function (e) {
      var cran = e.target.closest("button[data-k12]");
      if (cran) {
        self._etats.relation.k12 = parseInt(cran.getAttribute("data-k12"), 10);
        self._syncCurseurs();
        self._rendre();
        return;
      }
      if (e.target.closest("#reset")) {
        self._etats[self._mode] = Object.assign({}, DEFAUTS[self._mode]);
        self._syncCurseurs();
        self._rendre();
      }
    };
    this._onDown = function (e) {
      var p = e.target.closest("[data-poignee]");
      if (!p) return;
      self._glisse = p.getAttribute("data-poignee");
      try { self._svg.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      e.preventDefault();
    };
    this._onMove = function (e) {
      if (!self._glisse) return;
      var pt = self._versMath(e.clientX, e.clientY);
      var et = self._etats[self._mode];
      var cle = self._glisse; // "A", "B" ou "U"
      if (cle === "U") {
        et.xu = self._borner(Math.round((pt[0] - et.xA) * 2) / 2, BORNES_U);
        et.yu = self._borner(Math.round((pt[1] - et.yA) * 2) / 2, BORNES_U);
      } else {
        var bp = self._mode === "milieu" ? BORNES_PM : BORNES_P;
        et["x" + cle] = self._borner(Math.round(pt[0] * 2) / 2, bp);
        et["y" + cle] = self._borner(Math.round(pt[1] * 2) / 2, bp);
      }
      self._syncCurseurs();
      self._rendre();
    };
    this._onUp = function () { self._glisse = null; };
    this._modes.addEventListener("click", this._onMode);
    this._controles.addEventListener("input", this._onInput);
    this._controles.addEventListener("click", this._onClic);
    this._svg.addEventListener("pointerdown", this._onDown);
    this._svg.addEventListener("pointermove", this._onMove);
    this._svg.addEventListener("pointerup", this._onUp);
    this._svg.addEventListener("pointercancel", this._onUp);
    this._construireControles();
    this._rendre();
  };

  MilieuPiegeWidgetClass.prototype.disconnectedCallback = function () {
    this._modes.removeEventListener("click", this._onMode);
    this._controles.removeEventListener("input", this._onInput);
    this._controles.removeEventListener("click", this._onClic);
    this._svg.removeEventListener("pointerdown", this._onDown);
    this._svg.removeEventListener("pointermove", this._onMove);
    this._svg.removeEventListener("pointerup", this._onUp);
    this._svg.removeEventListener("pointercancel", this._onUp);
  };

  MilieuPiegeWidgetClass.prototype._borner = function (v, b) { return Math.max(b.min, Math.min(b.max, v)); };

  MilieuPiegeWidgetClass.prototype._curseur = function (id, label, b, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + b.min + '" max="' + b.max + '" step="' + b.step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  };

  MilieuPiegeWidgetClass.prototype._construireControles = function () {
    var et = this._etats[this._mode], h = "";
    if (this._mode === "milieu") {
      h += this._curseur("xA", "Abscisse de A", BORNES_PM, et.xA) + this._curseur("yA", "Ordonnée de A", BORNES_PM, et.yA) +
        this._curseur("xu", "1re composante de <span class=vec>u</span>", BORNES_U, et.xu) + this._curseur("yu", "2e composante de <span class=vec>u</span>", BORNES_U, et.yu);
    } else {
      h += this._curseur("xA", "Abscisse de A", BORNES_P, et.xA) + this._curseur("yA", "Ordonnée de A", BORNES_P, et.yA) +
        this._curseur("xB", "Abscisse de B", BORNES_P, et.xB) + this._curseur("yB", "Ordonnée de B", BORNES_P, et.yB);
      if (this._mode === "relation") {
        h += this._curseur("k12", "Coefficient k", BORNES_K12, et.k12);
        h += '<div class="crans" role="group" aria-label="Valeurs remarquables de k">' + CRANS_K.map(function (c) {
          return '<button type="button" data-k12="' + c[0] + '">k = ' + c[1] + '</button>';
        }).join("") + '</div>';
      }
    }
    h += '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';
    this._controles.innerHTML = h;
  };

  MilieuPiegeWidgetClass.prototype._syncCurseurs = function () {
    var et = this._etats[this._mode], sh = this._shadow;
    Object.keys(et).forEach(function (cle) {
      var i = sh.getElementById(cle);
      if (i) i.value = String(et[cle]);
    });
  };

  MilieuPiegeWidgetClass.prototype._toPx = function (x, y) {
    return [
      MARGE + (x - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE),
      HAUTEUR - MARGE - (y - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE),
    ];
  };

  MilieuPiegeWidgetClass.prototype._versMath = function (cx, cy) {
    fenetre(this._mode);
    var r = this._svg.getBoundingClientRect();
    var sx = (cx - r.left) / r.width * LARGEUR, sy = (cy - r.top) / r.height * HAUTEUR;
    return [
      X_MIN + (sx - MARGE) / (LARGEUR - 2 * MARGE) * (X_MAX - X_MIN),
      Y_MIN + (HAUTEUR - MARGE - sy) / (HAUTEUR - 2 * MARGE) * (Y_MAX - Y_MIN),
    ];
  };

  MilieuPiegeWidgetClass.prototype._fond = function () {
    var svg = this._svg;
    svg.innerHTML = "";
    var defs = svgEl("defs", {});
    [["fl-axe", "fl-axe"], ["fl-accent", "fl-accent"], ["fl-good", "fl-good"], ["fl-bad", "fl-bad"]].forEach(function (f) {
      var mk = svgEl("marker", { id: f[0], markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto", markerUnits: "userSpaceOnUse" });
      mk.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: f[1] }));
      defs.appendChild(mk);
    });
    svg.appendChild(defs);
    for (var g = X_MIN + 1; g < X_MAX; g++) {
      var px = this._toPx(g, 0)[0];
      svg.appendChild(svgEl("line", { x1: px.toFixed(1), x2: px.toFixed(1), y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
    }
    for (var h = Y_MIN + 1; h < Y_MAX; h++) {
      var py = this._toPx(0, h)[1];
      svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: py.toFixed(1), y2: py.toFixed(1), class: "grille" }));
    }
    var o = this._toPx(0, 0);
    svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE + 6, y1: o[1].toFixed(1), y2: o[1].toFixed(1), class: "axe", "marker-end": "url(#fl-axe)" }));
    svg.appendChild(svgEl("line", { x1: o[0].toFixed(1), x2: o[0].toFixed(1), y1: HAUTEUR - MARGE, y2: MARGE - 6, class: "axe", "marker-end": "url(#fl-axe)" }));
    [-5, 5, 10].forEach(function (v) {
      var p = this._toPx(v, 0), q = this._toPx(0, v);
      var tx = svgEl("text", { x: p[0].toFixed(1), y: (o[1] + 13).toFixed(1), "text-anchor": "middle", class: "graduation" });
      tx.textContent = moins(String(v));
      svg.appendChild(tx);
      var ty = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (q[1] + 4).toFixed(1), "text-anchor": "end", class: "graduation" });
      ty.textContent = moins(String(v));
      svg.appendChild(ty);
    }, this);
    var t0 = svgEl("text", { x: (o[0] - 5).toFixed(1), y: (o[1] + 13).toFixed(1), "text-anchor": "end", class: "graduation" });
    t0.textContent = "0";
    svg.appendChild(t0);
  };

  MilieuPiegeWidgetClass.prototype._vecteur = function (a, b, classe, fleche) {
    var pa = this._toPx(a[0], a[1]), pb = this._toPx(b[0], b[1]);
    if (Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) < 2) return;
    var attrs = { x1: pa[0].toFixed(2), y1: pa[1].toFixed(2), x2: pb[0].toFixed(2), y2: pb[1].toFixed(2), class: classe };
    if (fleche) attrs["marker-end"] = "url(#" + fleche + ")";
    this._svg.appendChild(svgEl("line", attrs));
  };

  /** Point + étiquette placée côté opposé au centre du cadre (jamais rognée). */
  MilieuPiegeWidgetClass.prototype._point = function (x, y, classe, texte, classeEt, poignee, decalY) {
    var p = this._toPx(x, y), svg = this._svg;
    svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: classe }));
    var aDroite = p[0] < LARGEUR - 120;
    var dy = decalY !== undefined ? decalY : (p[1] < 40 ? 18 : -9);
    var et = svgEl("text", { x: (p[0] + (aDroite ? 9 : -9)).toFixed(2), y: (p[1] + dy).toFixed(2), "text-anchor": aDroite ? "start" : "end", class: "etiquette " + classeEt });
    et.textContent = texte;
    svg.appendChild(et);
    if (poignee) svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 18, class: "poignee", "data-poignee": poignee }));
  };

  MilieuPiegeWidgetClass.prototype._marques = function (a, b, n) {
    // petites marques d'égalité au milieu du segment [ab]
    var pa = this._toPx(a[0], a[1]), pb = this._toPx(b[0], b[1]);
    var mx = (pa[0] + pb[0]) / 2, my = (pa[1] + pb[1]) / 2;
    var dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy);
    if (L < 20) return;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    for (var i = 0; i < n; i++) {
      var off = (i - (n - 1) / 2) * 5;
      var cx = mx + ux * off, cy = my + uy * off;
      this._svg.appendChild(svgEl("line", { x1: (cx - nx * 6).toFixed(2), y1: (cy - ny * 6).toFixed(2), x2: (cx + nx * 6).toFixed(2), y2: (cy + ny * 6).toFixed(2), class: "marque" }));
    }
  };

  MilieuPiegeWidgetClass.prototype._rendre = function () {
    var mode = this._mode, et = this._etats[mode], sh = this._shadow;
    Array.prototype.forEach.call(this._modes.querySelectorAll("button"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-mode") === mode ? "true" : "false");
    });
    ["xA", "yA", "xB", "yB", "xu", "yu"].forEach(function (c) {
      var s = sh.getElementById(c + "-valeur");
      if (s) s.textContent = nb(et[c]).texte;
    });
    fenetre(mode);
    this._fond();
    if (mode === "milieu") this._rendreMilieu(et);
    else if (mode === "relation") this._rendreRelation(et);
    else this._rendreSymetrique(et);
  };

  MilieuPiegeWidgetClass.prototype._rendreMilieu = function (et) {
    var xA = et.xA, yA = et.yA, xu = et.xu, yu = et.yu;
    var xB = xA + xu, yB = yA + yu;
    var xM = (xA + xB) / 2, yM = (yA + yB) / 2;
    var xF = xB - xA, yF = yB - yA;
    this._vecteur([xA, yA], [xB, yB], "vec-accent", "fl-accent");
    this._vecteur([0, 0], [xF, yF], "vec-bad", "fl-bad");
    var pA = this._toPx(xA, yA), pB = this._toPx(xB, yB);
    var ddx = pB[0] - pA[0], ddy = pB[1] - pA[1], LL = Math.hypot(ddx, ddy) || 1;
    var nx = ddy / LL, ny = -ddx / LL; // normale
    if (ny > 0 || (Math.abs(ny) < 1e-9 && nx > 0)) { nx = -nx; ny = -ny; } // côté haut (ou gauche)
    var et2 = svgEl("text", { x: (pA[0] + 0.3 * ddx + nx * 13).toFixed(1), y: (pA[1] + 0.3 * ddy + ny * 13 + 4).toFixed(1), "text-anchor": "middle", class: "etiquette et-accent" });
    et2.textContent = "u";
    this._svg.appendChild(et2);
    flecheSur(this._svg, et2, "vf-accent");
    this._point(xA, yA, "point-ink", "A", "et-ink", "A");
    this._point(xB, yB, "point-accent", "B", "et-accent", "U");
    this._point(xM, yM, "point-good", "M (vrai milieu)", "et-good", null, -9);
    this._point(xF, yF, "point-bad", "faux « milieu »", "et-bad", null, 20);
    this._lecture.innerHTML =
      '<div class="ligne">B = A + <span class=vec>u</span> : (' + nb(xA).texte + ' + ' + nbPar(xu) + ' ; ' + nb(yA).texte + ' + ' + nbPar(yu) + ') = <b>(' + nb(xB).texte + ' ; ' + nb(yB).texte + ')</b></div>' +
      '<div class="ligne vrai">Vrai milieu M : ((' + nb(xA).texte + ' + ' + nbPar(xB) + ')/2 ; (' + nb(yA).texte + ' + ' + nbPar(yB) + ')/2) = (' + nb(xM).texte + ' ; ' + nb(yM).texte + ') — la moyenne des coordonnées</div>' +
      '<div class="ligne faux">Piège — la différence (' + nb(xB).texte + ' − ' + nbPar(xA) + ' ; ' + nb(yB).texte + ' − ' + nbPar(yA) + ') = (' + nb(xF).texte + ' ; ' + nb(yF).texte + ') : ce sont les composantes de <span class=vec>u</span>, pas un milieu !</div>';
  };

  MilieuPiegeWidgetClass.prototype._rendreRelation = function (et) {
    var xA = et.xA, yA = et.yA, xB = et.xB, yB = et.yB, k12 = et.k12, k = k12 / 12;
    var dx = xB - xA, dy = yB - yA;
    var xM = xA + k * dx, yM = yA + k * dy;
    var confondus = dx === 0 && dy === 0;
    var sh = this._shadow;
    var kv = sh.getElementById("k12-valeur");
    if (kv) kv.textContent = fractionK(k12);
    Array.prototype.forEach.call(this._controles.querySelectorAll("button[data-k12]"), function (b) {
      b.setAttribute("aria-pressed", parseInt(b.getAttribute("data-k12"), 10) === k12 ? "true" : "false");
    });
    if (!confondus) {
      // droite (AB) prolongée jusqu'aux bords
      var t0 = -40, t1 = 40;
      var p0 = this._toPx(xA + t0 * dx, yA + t0 * dy), p1 = this._toPx(xA + t1 * dx, yA + t1 * dy);
      this._svg.appendChild(svgEl("line", { x1: p0[0].toFixed(1), y1: p0[1].toFixed(1), x2: p1[0].toFixed(1), y2: p1[1].toFixed(1), class: "droite", "clip-path": "url(#cadre)" }));
      var clip = svgEl("clipPath", { id: "cadre" });
      clip.appendChild(svgEl("rect", { x: MARGE, y: MARGE, width: LARGEUR - 2 * MARGE, height: HAUTEUR - 2 * MARGE }));
      this._svg.querySelector("defs").appendChild(clip);
      this._vecteur([xA, yA], [xB, yB], "vec-accent", "fl-accent");
      if (k12 !== 0) this._vecteur([xA, yA], [xM, yM], "vec-good", "fl-good");
    }
    var kTexte = fractionK(k12), kPar = k12 < 0 ? "(" + kTexte + ")" : kTexte;
    var memeAB = Math.abs(xM - xB) < 1e-9 && Math.abs(yM - yB) < 1e-9;
    var memeA = Math.abs(xM - xA) < 1e-9 && Math.abs(yM - yA) < 1e-9;
    this._point(xA, yA, "point-ink", "A", "et-ink", "A", memeA ? 20 : undefined);
    this._point(xB, yB, "point-accent", "B", "et-accent", "B", memeAB ? 20 : undefined);
    this._point(xM, yM, "point-good", "M", "et-good", null);
    var position;
    if (confondus) position = '<span class="faux">A et B sont confondus : <span class=vec>AB</span> est le vecteur nul, M reste en A quel que soit k.</span>';
    else if (k12 === 0) position = "k = 0 : M est en A.";
    else if (k12 === 12) position = "k = 1 : M est en B.";
    else if (k12 === 6) position = "k = 1/2 : M est le milieu de [AB].";
    else if (k12 > 0 && k12 < 12) position = "0 < k < 1 : M est sur le segment [AB], entre A et B.";
    else if (k12 > 12) position = "k > 1 : M est sur la droite (AB), au-delà de B.";
    else position = "k < 0 : M est sur la droite (AB), du côté opposé à B par rapport à A.";
    this._lecture.innerHTML =
      '<div class="ligne"><span class=vec>AB</span> = (' + nb(xB).texte + ' − ' + nbPar(xA) + ' ; ' + nb(yB).texte + ' − ' + nbPar(yA) + ') = (' + nb(dx).texte + ' ; ' + nb(dy).texte + ') et k = ' + kTexte + '</div>' +
      '<div class="ligne">Abscisse de M : ' + nb(xA).texte + ' + ' + kPar + ' × ' + nbPar(dx) + ' = ' + nbTexte(xM) + '<br>Ordonnée de M : ' + nb(yA).texte + ' + ' + kPar + ' × ' + nbPar(dy) + ' = ' + nbTexte(yM) + '</div>' +
      '<div class="ligne vrai">M(' + nbTexte(xM) + ' ; ' + nbTexte(yM) + ')</div>' +
      '<div class="ligne info">' + position + '</div>';
  };

  MilieuPiegeWidgetClass.prototype._rendreSymetrique = function (et) {
    var xA = et.xA, yA = et.yA, xB = et.xB, yB = et.yB;
    var xS = 2 * xB - xA, yS = 2 * yB - yA;
    var confondus = xA === xB && yA === yB;
    if (!confondus) {
      this._vecteur([xA, yA], [xB, yB], "vec-accent", "fl-accent");
      this._vecteur([xB, yB], [xS, yS], "vec-good", "fl-good");
      this._marques([xA, yA], [xB, yB], 2);
      this._marques([xB, yB], [xS, yS], 2);
    }
    this._point(xA, yA, "point-ink", "A", "et-ink", "A");
    this._point(xB, yB, "point-accent", "B", "et-accent", "B", 20);
    this._point(xS, yS, "point-good", "A′", "et-good", null);
    this._lecture.innerHTML =
      '<div class="ligne">B est le milieu de [AA′], donc A′ = B + <span class=vec>AB</span> et <span class=vec>AB</span> = <span class=vec>BA′</span>.</div>' +
      '<div class="ligne">Abscisse de A′ : 2 × ' + nbPar(xB) + ' − ' + nbPar(xA) + ' = ' + nb(xS).texte + '<br>Ordonnée de A′ : 2 × ' + nbPar(yB) + ' − ' + nbPar(yA) + ' = ' + nb(yS).texte + '</div>' +
      '<div class="ligne vrai">A′(' + nb(xS).texte + ' ; ' + nb(yS).texte + ')</div>' +
      '<div class="ligne info">Vérification : milieu de [AA′] = ((' + nb(xA).texte + ' + ' + nbPar(xS) + ')/2 ; (' + nb(yA).texte + ' + ' + nbPar(yS) + ')/2) = (' + nb((xA + xS) / 2).texte + ' ; ' + nb((yA + yS) / 2).texte + ') = B ✓' +
      (confondus ? ' — A et B sont confondus : A′ = A.' : '') + '</div>';
  };

  if (!customElements.get("milieu-piege-widget")) {
    customElements.define("milieu-piege-widget", MilieuPiegeWidgetClass);
  }
})();
