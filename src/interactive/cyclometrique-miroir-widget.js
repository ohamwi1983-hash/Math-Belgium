(function () {
  "use strict";

  /* ================================================================
   * <cyclometrique-miroir-widget> — atelier interactif : instancie le miroir
   * f/f⁻¹ par rapport à y=x (reciproque-miroir-widget) au cas particulier des
   * fonctions cyclométriques. Sélecteur sin/cos/tan (restreint à l'intervalle
   * bijectif) + curseur x, point mobile sur la restriction et son symétrique
   * sur l'arcfonction. Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;

  // Fenêtre carrée PAR FONCTION (span identique en x et en y — indispensable pour
  // que y=x reste à 45° et que le symétrique se lise vraiment comme un miroir) ;
  // chaque fenêtre contient à la fois la restriction ET son arcfonction en entier.
  var FONCTIONS = {
    sin: {
      label: 'sin restreint à [−π/2 ; π/2]',
      labelReciproque: 'arcsin',
      f: Math.sin,
      fInv: Math.asin,
      xMin: -PI / 2, xMax: PI / 2,
      win: { xMin: -1.75, xMax: 1.75, yMin: -1.75, yMax: 1.75 },
    },
    cos: {
      label: 'cos restreint à [0 ; π]',
      labelReciproque: 'arccos',
      f: Math.cos,
      fInv: Math.acos,
      xMin: 0, xMax: PI,
      win: { xMin: -1.3, xMax: 3.6, yMin: -1.3, yMax: 3.6 },
    },
    tan: {
      label: 'tan restreint à ]−π/2 ; π/2[',
      labelReciproque: 'arctan',
      f: Math.tan,
      fInv: Math.atan,
      xMin: -1.3, xMax: 1.3, // troncature sûre, loin des asymptotes ±π/2≈1,5708
      win: { xMin: -3.8, xMax: 3.8, yMin: -3.8, yMax: 3.8 },
    },
  };

  var TAILLE = 340, MARGE = 30;

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
    '.select-row{display:flex;justify-content:center;margin-bottom:12px;}' +
    '.select-row select{font-family:inherit;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:340px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.diagonale{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-finv{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.guide-miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.75;}' +
    '.point-f{fill:var(--accent,#a8471f);}' +
    '.point-finv{fill:var(--good,#2f7a4f);}' +
    '.etiquette-point{font-size:11px;font-weight:600;font-family:var(--mono,monospace);}' +
    '.etiquette-point-f{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-point-finv{fill:var(--good,#2f7a4f);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-f{fill:var(--accent-ink,#7a3212);}' +
    '.legende-finv{fill:var(--good,#2f7a4f);}' +
    '.legende-diag{fill:var(--ink-faint,#9c9083);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:70px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="select-row"><select id="fonction">' +
    '<option value="sin">sin / arcsin</option>' +
    '<option value="cos">cos / arccos</option>' +
    '<option value="tan">tan / arctan</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + TAILLE + ' ' + TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">point sur la restriction</span><span class="stat-value" id="val-point-f"></span></div>' +
    '<div class="stat"><span class="stat-label">symétrique sur l\'arcfonction</span><span class="stat-value" id="val-point-finv"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="x">x</label><div class="curseur-row">' +
    '<input type="range" id="x" min="0" max="1" step="0.001" value="0.5">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>';

  class CyclometriqueMiroirWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CyclometriqueMiroirWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._cle = 'sin';
    this._svg = shadow.getElementById("svg");
    this._selectFonction = shadow.getElementById("fonction");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._valPointF = shadow.getElementById("val-point-f");
    this._valPointFinv = shadow.getElementById("val-point-finv");
    this._xNorm = 0.5;
  };

  CyclometriqueMiroirWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFonction = function () {
      self._cle = self._selectFonction.value;
      self._rendre();
    };
    this._onInputX = function () {
      self._xNorm = parseFloat(self._inputX.value);
      self._rendre();
    };
    this._selectFonction.addEventListener("change", this._onChangeFonction);
    this._inputX.addEventListener("input", this._onInputX);
    this._rendre();
  };

  CyclometriqueMiroirWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFonction.removeEventListener("change", this._onChangeFonction);
    this._inputX.removeEventListener("input", this._onInputX);
  };

  CyclometriqueMiroirWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.xMin) / (win.xMax - win.xMin) * (TAILLE - 2 * MARGE);
    var py = TAILLE - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (TAILLE - 2 * MARGE);
    return [px, py];
  };

  // Étiquette d'un point, ancrée à gauche ou à droite selon la proximité du bord
  // du cadre — évite le rognage (overflow:hidden implicite d'un <svg> racine).
  CyclometriqueMiroirWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte, classe) {
    var procheDroite = px > TAILLE - 70;
    var procheHaut = py < MARGE + 18;
    var ancre = procheDroite ? "end" : "start";
    var dx = procheDroite ? -8 : 8;
    var dy = procheHaut ? 16 : -8;
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  CyclometriqueMiroirWidgetClass.prototype._traceFonction = function (svg, ns, win, xMin, xMax, f, classe) {
    var self = this;
    var n = 200, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.yMin - 0.3 && yy <= win.yMax + 0.3;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.yMin, Math.min(win.yMax, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe }));
    });
  };

  CyclometriqueMiroirWidgetClass.prototype._rendre = function () {
    var def = FONCTIONS[this._cle];
    var win = def.win;
    var x = def.xMin + this._xNorm * (def.xMax - def.xMin);
    var y = def.f(x);

    this._valeurX.textContent = formatNombreFr(x, 3);
    this._valPointF.textContent = "(" + formatNombreFr(x, 3) + " ; " + formatNombreFr(y, 3) + ")";
    this._valPointFinv.textContent = "(" + formatNombreFr(y, 3) + " ; " + formatNombreFr(x, 3) + ")";

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    // Axes (à l'origine mathématique 0;0, même quand la fenêtre n'est pas centrée dessus)
    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: TAILLE - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: TAILLE - MARGE, class: "axe" }));

    // Diagonale y = x, tracée sur toute la fenêtre
    var lo = Math.max(win.xMin, win.yMin);
    var hi = Math.min(win.xMax, win.yMax);
    var pD0 = self._toPx(win, lo, lo);
    var pD1 = self._toPx(win, hi, hi);
    svg.appendChild(svgEl(ns, "line", { x1: pD0[0].toFixed(2), y1: pD0[1].toFixed(2), x2: pD1[0].toFixed(2), y2: pD1[1].toFixed(2), class: "diagonale" }));

    // f restreint et son arcfonction
    this._traceFonction(svg, ns, win, def.xMin, def.xMax, def.f, "courbe-f");
    this._traceFonction(svg, ns, win, win.yMin, win.yMax, def.fInv, "courbe-finv");

    // Guide pointillé reliant le point et son symétrique
    var pF = self._toPx(win, x, y);
    var pFinv = self._toPx(win, y, x);
    svg.appendChild(svgEl(ns, "line", { x1: pF[0].toFixed(2), y1: pF[1].toFixed(2), x2: pFinv[0].toFixed(2), y2: pFinv[1].toFixed(2), class: "guide-miroir" }));

    svg.appendChild(svgEl(ns, "circle", { cx: pF[0].toFixed(2), cy: pF[1].toFixed(2), r: 4.5, class: "point-f" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pFinv[0].toFixed(2), cy: pFinv[1].toFixed(2), r: 4.5, class: "point-finv" }));

    self._etiquettePoint(svg, ns, pF[0], pF[1], "(" + formatNombreFr(x, 2) + ";" + formatNombreFr(y, 2) + ")", "etiquette-point etiquette-point-f");
    self._etiquettePoint(svg, ns, pFinv[0], pFinv[1], "(" + formatNombreFr(y, 2) + ";" + formatNombreFr(x, 2) + ")", "etiquette-point etiquette-point-finv");

    // Légende
    var yLegende = MARGE + 4;
    var legF = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-f" });
    legF.textContent = def.label;
    svg.appendChild(legF);
    var legFinv = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-finv" });
    legFinv.textContent = def.labelReciproque;
    svg.appendChild(legFinv);
    var legDiag = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 30, class: "legende legende-diag" });
    legDiag.textContent = "y = x";
    svg.appendChild(legDiag);
  };

  if (!customElements.get("cyclometrique-miroir-widget")) {
    customElements.define("cyclometrique-miroir-widget", CyclometriqueMiroirWidgetClass);
  }
})();
