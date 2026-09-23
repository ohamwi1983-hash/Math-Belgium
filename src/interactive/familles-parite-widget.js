(function () {
  "use strict";

  /* ================================================================
   * <familles-parite-widget> — atelier interactif : sélecteur de famille
   * (les 6 fonctions de référence), curseur t>0 qui place un point (t;f(t))
   * et son symétrique automatique en −t — miroir vertical (axe Oy) pour les
   * familles paires, rotation de 180° (symétrie centrale) pour les
   * impaires. Pour la racine carrée (domaine à sens unique), montre
   * explicitement qu'aucun symétrique n'existe. Reprend l'image du texte :
   * « un miroir sur l'axe Oy » / « une rotation d'un demi-tour ». Web
   * Component (Shadow DOM).
   * ================================================================ */

  var FAMILLES = {
    carre: { symbole: "x²", g: function (u) { return u * u; }, parite: "paire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -1, Y_MAX: 10 },
    cube: { symbole: "x³", g: function (u) { return u * u * u; }, parite: "impaire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -28, Y_MAX: 28 },
    racine: { symbole: "√x", g: function (u) { return u < 0 ? NaN : Math.sqrt(u); }, parite: "aucune", t: { min: 0.3, max: 8, step: 0.1, defaut: 4 }, X_MIN: -1, X_MAX: 9, Y_MIN: -1, Y_MAX: 3.5 },
    racineCubique: { symbole: "∛x", g: function (u) { return (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1 / 3); }, parite: "impaire", t: { min: 0.3, max: 7, step: 0.1, defaut: 3.5 }, X_MIN: -8, X_MAX: 8, Y_MIN: -2, Y_MAX: 2 },
    inverse: { symbole: "1/x", g: function (u) { return Math.abs(u) < 1e-9 ? NaN : 1 / u; }, parite: "impaire", t: { min: 0.5, max: 3, step: 0.1, defaut: 1 }, X_MIN: -4, X_MAX: 4, Y_MIN: -5, Y_MAX: 5 },
    valeurAbsolue: { symbole: "|x|", g: function (u) { return Math.abs(u); }, parite: "paire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -1, Y_MAX: 4 },
  };
  var DEFAUT_FAMILLE = "cube";

  var LARGEUR = 400, HAUTEUR = 300, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:400px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.guide{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;opacity:0.8;}' +
    '.point-t{fill:var(--accent,#a8471f);}' +
    '.point-symetrique{fill:var(--plan,#5b4ea3);}' +
    '.origine{fill:var(--ink,#241f1a);}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;font-family:var(--mono,monospace);}' +
    '.etiquette-point-t{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-point-sym{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-vide{font-size:12px;font-weight:600;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.verdict.aucune{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="famille">Famille</label>' +
    '<select id="famille">' +
    '<option value="carre">carrée — x²</option>' +
    '<option value="cube">cube — x³</option>' +
    '<option value="racine">racine carrée — √x</option>' +
    '<option value="racineCubique">racine cubique — ∛x</option>' +
    '<option value="inverse">inverse — 1/x</option>' +
    '<option value="valeurAbsolue">valeur absolue — |x|</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="t">t</label><div class="curseur-row">' +
    '<input type="range" id="t" min="0" max="3" step="0.1" value="1.5">' +
    '<span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class FamillesPariteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  FamillesPariteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._famille = DEFAUT_FAMILLE;
    this._t = FAMILLES[DEFAUT_FAMILLE].t.defaut;
    this._selectFamille = shadow.getElementById("famille");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputT = shadow.getElementById("t");
    this._valeurT = shadow.getElementById("t-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectFamille.value = this._famille;
  };

  FamillesPariteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFamille = function () {
      self._famille = self._selectFamille.value;
      var bornesT = FAMILLES[self._famille].t;
      self._inputT.min = String(bornesT.min);
      self._inputT.max = String(bornesT.max);
      self._inputT.step = String(bornesT.step);
      self._t = bornesT.defaut;
      self._inputT.value = String(bornesT.defaut);
      self._rendre();
    };
    this._onInputT = function () { self._t = parseFloat(self._inputT.value); self._rendre(); };
    this._onReset = function () {
      self._famille = DEFAUT_FAMILLE;
      self._selectFamille.value = DEFAUT_FAMILLE;
      var bornesT = FAMILLES[DEFAUT_FAMILLE].t;
      self._inputT.min = String(bornesT.min);
      self._inputT.max = String(bornesT.max);
      self._inputT.step = String(bornesT.step);
      self._t = bornesT.defaut;
      self._inputT.value = String(bornesT.defaut);
      self._rendre();
    };
    this._selectFamille.addEventListener("change", this._onChangeFamille);
    this._inputT.addEventListener("input", this._onInputT);
    this._resetBtn.addEventListener("click", this._onReset);
    this._onChangeFamille();
  };

  FamillesPariteWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFamille.removeEventListener("change", this._onChangeFamille);
    this._inputT.removeEventListener("input", this._onInputT);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  FamillesPariteWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.X_MIN) / (win.X_MAX - win.X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.Y_MIN) / (win.Y_MAX - win.Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  FamillesPariteWidgetClass.prototype._traceIntervalle = function (svg, ns, win, xMin, xMax, f) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(220 * (xMax - xMin) / (win.X_MAX - win.X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.Y_MIN - 0.3 && yy <= win.Y_MAX + 0.3;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.Y_MIN, Math.min(win.Y_MAX, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: "courbe" }));
    });
  };

  FamillesPariteWidgetClass.prototype._rendre = function () {
    var famille = this._famille, t = this._t;
    var def = FAMILLES[famille];
    var win = def;
    var f = def.g;
    var ft = f(t);

    this._valeurT.textContent = formatNombreFr(t, 1);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    if (famille === "racine") this._traceIntervalle(svg, ns, win, 0, win.X_MAX, f);
    else this._traceIntervalle(svg, ns, win, win.X_MIN, win.X_MAX, f);

    var pT = self._toPx(win, t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, ft)));
    svg.appendChild(svgEl(ns, "circle", { cx: pT[0].toFixed(2), cy: pT[1].toFixed(2), r: 5, class: "point-t" }));
    var etT = svgEl(ns, "text", { x: pT[0].toFixed(2), y: (pT[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-t" });
    etT.textContent = "(" + formatNombreFr(t, 1) + ";" + formatNombreFr(ft, 2) + ")";
    svg.appendChild(etT);

    if (def.parite === "aucune") {
      this._verdict.className = "verdict aucune";
      this._verdict.textContent = "√x n'a ni parité ni imparité : le domaine [0;+∞[ ne contient pas −t, donc aucun symétrique n'existe.";
      var xVideMath = -t;
      if (xVideMath >= win.X_MIN) {
        var pVide = self._toPx(win, xVideMath, 0);
        var etVide = svgEl(ns, "text", { x: pVide[0].toFixed(2), y: (origine[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-vide" });
        etVide.textContent = "x=−t : hors domaine";
        svg.appendChild(etVide);
      }
    } else if (def.parite === "paire") {
      // Miroir vertical (axe Oy) : (−t;f(t)) — même ordonnée, symétrique en x.
      var pSym = self._toPx(win, -t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, ft)));
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "miroir" }));
      svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pT[1].toFixed(2), x2: pSym[0].toFixed(2), y2: pSym[1].toFixed(2), class: "guide" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pSym[0].toFixed(2), cy: pSym[1].toFixed(2), r: 5, class: "point-symetrique" }));
      var etSym = svgEl(ns, "text", { x: pSym[0].toFixed(2), y: (pSym[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-sym" });
      etSym.textContent = "(−" + formatNombreFr(t, 1) + ";" + formatNombreFr(ft, 2) + ")";
      svg.appendChild(etSym);
      this._verdict.className = "verdict";
      this._verdict.textContent = "f(−t) = f(t) = " + formatNombreFr(ft, 2) + " : fonction PAIRE — miroir vertical sur l'axe Oy.";
    } else {
      // Symétrie centrale (rotation 180°) : (−t;−f(t)) — droite passant par l'origine.
      var pSym2 = self._toPx(win, -t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, -ft)));
      svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pT[1].toFixed(2), x2: pSym2[0].toFixed(2), y2: pSym2[1].toFixed(2), class: "miroir" }));
      svg.appendChild(svgEl(ns, "circle", { cx: origine[0].toFixed(2), cy: origine[1].toFixed(2), r: 3, class: "origine" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pSym2[0].toFixed(2), cy: pSym2[1].toFixed(2), r: 5, class: "point-symetrique" }));
      var etSym2 = svgEl(ns, "text", { x: pSym2[0].toFixed(2), y: (pSym2[1] + (ft >= 0 ? 16 : -10)).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-sym" });
      etSym2.textContent = "(−" + formatNombreFr(t, 1) + ";" + formatNombreFr(-ft, 2) + ")";
      svg.appendChild(etSym2);
      this._verdict.className = "verdict";
      this._verdict.textContent = "f(−t) = −f(t) = " + formatNombreFr(-ft, 2) + " : fonction IMPAIRE — symétrie centrale (rotation de 180° autour de l'origine).";
    }
  };

  if (!customElements.get("familles-parite-widget")) {
    customElements.define("familles-parite-widget", FamillesPariteWidgetClass);
  }
})();
