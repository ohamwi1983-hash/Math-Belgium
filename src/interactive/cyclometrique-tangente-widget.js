(function () {
  "use strict";

  /* ================================================================
   * <cyclometrique-tangente-widget> — atelier interactif : point mobile sur
   * arcsin/arccos/arctan, sa tangente et sa pente affichée en direct — pour
   * rendre concrètes les 3 formules de dérivée du tableau juste au-dessus.
   * Sélecteur de fonction + curseur x. Web Component (Shadow DOM), sur le
   * modèle de tangente-exponentielle-widget (fenêtre fixe, tangente en trait
   * plein, clippée proprement au cadre plutôt que coupée net).
   * ================================================================ */

  // Bornes de curseur volontairement OUVERTES pour arcsin/arccos (jamais ±1 pile) :
  // la pente y explose (dérivée non définie en ±1, démontré plus loin dans cette
  // section) — l'utilisateur peut s'en approcher et voir la tangente devenir
  // presque verticale, sans jamais tomber sur une division par 0 exacte.
  var FONCTIONS = {
    arcsin: {
      label: 'arcsin(x)',
      formuleLabel: "arcsin'(x) = 1 / √(1−x²)",
      f: Math.asin,
      derivee: function (x) { return 1 / Math.sqrt(1 - x * x); },
      xMin: -0.99, xMax: 0.99, step: 0.001,
      win: { xMin: -1.5, xMax: 1.5, yMin: -2.6, yMax: 2.6 },
    },
    arccos: {
      label: 'arccos(x)',
      formuleLabel: "arccos'(x) = −1 / √(1−x²)",
      f: Math.acos,
      derivee: function (x) { return -1 / Math.sqrt(1 - x * x); },
      xMin: -0.99, xMax: 0.99, step: 0.001,
      win: { xMin: -1.5, xMax: 1.5, yMin: -1.1, yMax: 4.4 },
    },
    arctan: {
      label: 'arctan(x)',
      formuleLabel: "arctan'(x) = 1 / (1+x²)",
      f: Math.atan,
      derivee: function (x) { return 1 / (1 + x * x); },
      xMin: -6, xMax: 6, step: 0.01,
      win: { xMin: -6.5, xMax: 6.5, yMin: -2.6, yMax: 2.6 },
    },
  };

  var LARGEUR = 400, HAUTEUR = 300, MARGE = 32;

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
    '.select-row{display:flex;justify-content:center;margin-bottom:10px;}' +
    '.select-row select{font-family:inherit;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;}' +
    '.formule{text-align:center;font-family:var(--mono,monospace);font-size:0.92rem;color:var(--ink-soft,#6b6055);margin:0 0 14px;min-height:1.3rem;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:400px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-f{fill:var(--accent-ink,#7a3212);}' +
    '.legende-tangente{fill:var(--plan,#5b4ea3);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:60px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="select-row"><select id="fonction">' +
    '<option value="arcsin">arcsin</option>' +
    '<option value="arccos">arccos</option>' +
    '<option value="arctan">arctan</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">x</span><span class="stat-value" id="val-x"></span></div>' +
    '<div class="stat"><span class="stat-label">pente de la tangente</span><span class="stat-value" id="val-pente"></span></div>' +
    '</div>' +
    '<div class="curseur"><label for="x">x</label><div class="curseur-row">' +
    '<input type="range" id="x" min="-1" max="1" step="0.001" value="0">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>';

  class CyclometriqueTangenteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CyclometriqueTangenteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._cle = 'arcsin';
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectFonction = shadow.getElementById("fonction");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._valX = shadow.getElementById("val-x");
    this._valPente = shadow.getElementById("val-pente");
    this._x = 0;
  };

  CyclometriqueTangenteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFonction = function () {
      self._cle = self._selectFonction.value;
      var def = FONCTIONS[self._cle];
      self._inputX.min = String(def.xMin);
      self._inputX.max = String(def.xMax);
      self._inputX.step = String(def.step);
      self._x = 0 > def.xMin && 0 < def.xMax ? 0 : (def.xMin + def.xMax) / 2;
      self._inputX.value = String(self._x);
      self._rendre();
    };
    this._onInputX = function () {
      self._x = parseFloat(self._inputX.value);
      self._rendre();
    };
    this._selectFonction.addEventListener("change", this._onChangeFonction);
    this._inputX.addEventListener("input", this._onInputX);
    this._onChangeFonction();
  };

  CyclometriqueTangenteWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFonction.removeEventListener("change", this._onChangeFonction);
    this._inputX.removeEventListener("input", this._onInputX);
  };

  CyclometriqueTangenteWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.xMin) / (win.xMax - win.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  CyclometriqueTangenteWidgetClass.prototype._traceFonction = function (svg, ns, win, xMin, xMax, f, classe) {
    var self = this;
    var n = 300, segments = [], courant = "", dernierValide = false;
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

  // Clippe la tangente (droite y = y0 + m·(x-x0)) au rectangle de la fenêtre, en
  // paramétrant par t (x = x0+t, y = y0+m·t) — nécessaire ici car la pente peut
  // devenir très grande près de x=±1 (arcsin/arccos) et sortirait sinon du cadre.
  CyclometriqueTangenteWidgetClass.prototype._segmentTangente = function (win, x0, y0, m) {
    var tXmin = win.xMin - x0, tXmax = win.xMax - x0;
    var tA = (win.yMin - y0) / m, tB = (win.yMax - y0) / m;
    var tYmin = Math.min(tA, tB), tYmax = Math.max(tA, tB);
    var tMin = Math.max(tXmin, tYmin), tMax = Math.min(tXmax, tYmax);
    if (tMin > tMax) return null;
    return [
      [x0 + tMin, y0 + m * tMin],
      [x0 + tMax, y0 + m * tMax],
    ];
  };

  CyclometriqueTangenteWidgetClass.prototype._rendre = function () {
    var def = FONCTIONS[this._cle];
    var win = def.win;
    var x = this._x;
    var y = def.f(x);
    var pente = def.derivee(x);

    this._formule.textContent = def.formuleLabel;
    this._valeurX.textContent = formatNombreFr(x, 3);
    this._valX.textContent = formatNombreFr(x, 3);
    this._valPente.textContent = formatNombreFr(pente, 3);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    // Axes
    var origine = self._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "axe" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 10, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    // Tangente (trait plein, clippée au cadre) — dessinée avant la courbe pour
    // que celle-ci reste au premier plan si les deux se superposent.
    var seg = self._segmentTangente(win, x, y, pente);
    if (seg) {
      var pT0 = self._toPx(win, seg[0][0], seg[0][1]);
      var pT1 = self._toPx(win, seg[1][0], seg[1][1]);
      svg.appendChild(svgEl(ns, "line", { x1: pT0[0].toFixed(2), y1: pT0[1].toFixed(2), x2: pT1[0].toFixed(2), y2: pT1[1].toFixed(2), class: "tangente" }));
    }

    // Courbe de la fonction
    this._traceFonction(svg, ns, win, def.xMin, def.xMax, def.f, "courbe-f");

    // Point mobile
    var pF = self._toPx(win, x, y);
    svg.appendChild(svgEl(ns, "circle", { cx: pF[0].toFixed(2), cy: pF[1].toFixed(2), r: 4.5, class: "point" }));

    // Légende
    var yLegende = MARGE + 4;
    var legF = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-f" });
    legF.textContent = "y = " + def.label;
    svg.appendChild(legF);
    var legT = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-tangente" });
    legT.textContent = "tangente";
    svg.appendChild(legT);
  };

  if (!customElements.get("cyclometrique-tangente-widget")) {
    customElements.define("cyclometrique-tangente-widget", CyclometriqueTangenteWidgetClass);
  }
})();
