(function () {
  "use strict";

  /* ================================================================
   * <exponentielle-widget> — atelier interactif f(x) = a^x, curseur a de 0 à 4.
   * Web Component (Shadow DOM), couleurs empruntées aux variables CSS du thème.
   * ================================================================ */

  var DEFAUT_A = 2;
  var BORNES_A = { min: 0, max: 4, step: 0.1 };
  var LARGEUR = 460, HAUTEUR = 320, MARGE = 34;
  // Fenêtre FIXE (indépendante de a) — même piège déjà rencontré deux fois cette session : un
  // cadrage qui se recale sur la valeur courante annulerait l'effet visible du curseur. Reprend
  // exactement la fenêtre des deux graphes statiques juste au-dessus dans le chapitre (a=2 et
  // a=0,5), pour que ce widget s'insère visuellement à leur suite sans saut d'échelle.
  var X_MIN = -3, X_MAX = 3;
  var Y_MIN = -0.5, Y_MAX = 9;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.25rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;min-height:1.6rem;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.asymptote{stroke:var(--line,#e2d8c8);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.guide{stroke:var(--ink-faint,#9c9083);stroke-width:1.1;stroke-dasharray:4 3;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-point{font-size:12.5px;font-weight:600;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-guide{font-size:11.5px;font-weight:600;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseurs{display:flex;flex-direction:column;gap:14px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Type</span><span class="stat-value" id="val-type"></span></div>' +
    '<div class="stat"><span class="stat-label">Point (1;a)</span><span class="stat-value" id="val-point"></span></div>' +
    '</div>' +
    '<div class="curseurs">' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT_A + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ExponentielleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ExponentielleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT_A;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputA = shadow.getElementById("a");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valType = shadow.getElementById("val-type");
    this._valPoint = shadow.getElementById("val-point");
    this._resetBtn = shadow.getElementById("reset");
  };

  ExponentielleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      self._a = parseFloat(self._inputA.value);
      self._rendre();
    };
    this._onReset = function () {
      self._a = DEFAUT_A;
      self._inputA.value = String(DEFAUT_A);
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ExponentielleWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ExponentielleWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ExponentielleWidgetClass.prototype._rendre = function () {
    var a = this._a;
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._formule.textContent = "f(x) = " + formatNombreFr(a, 1) + "ˣ";
    this._valType.textContent = a > 1 ? "croissante (a>1)" : a === 1 ? "constante (a=1)" : "décroissante (0≤a<1)";
    this._valPoint.textContent = "(1;" + formatNombreFr(a, 1) + ")";

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    // Asymptote horizontale y=0
    var pAsympt0 = self._toPx(X_MIN, 0), pAsympt1 = self._toPx(X_MAX, 0);
    var ligneAsympt = svgEl(ns, "line", { x1: pAsympt0[0].toFixed(2), x2: pAsympt1[0].toFixed(2), y1: pAsympt0[1].toFixed(2), y2: pAsympt1[1].toFixed(2), class: "asymptote" });
    svg.appendChild(ligneAsympt);
    var etAsympt = svgEl(ns, "text", { x: (pAsympt0[0] + 4).toFixed(2), y: (pAsympt0[1] - 6).toFixed(2), class: "etiquette" });
    etAsympt.textContent = "asymptote y=0";
    svg.appendChild(etAsympt);

    // Axes
    var origine = self._toPx(0, 0);
    var axeX = svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" });
    svg.appendChild(axeX);
    var axeY = svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "axe" });
    svg.appendChild(axeY);
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 10, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    // Courbe f(x) = a^x, tracée en excluant les portions hors fenêtre (ex. a=0 pour x<0, où
    // a^x explose vers l'infini plutôt que de produire NaN) — même technique de découpage par
    // segments déjà utilisée pour les asymptotes de tan(x) dans le widget du cercle trigonométrique.
    var n = 400, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = Math.pow(a, xx);
      var valide = isFinite(yy) && yy >= Y_MIN - 0.001 && yy <= Y_MAX + 0.001;
      if (valide) {
        var p = self._toPx(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
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

    // Point (1;a) : guides pointillés vers les deux axes, avec la valeur affichée à chaque
    // intersection — "préciser les valeurs des coordonnées sur les axes X et Y".
    if (a >= Y_MIN && a <= Y_MAX) {
      var pPoint = self._toPx(1, a);
      var pAxeX1 = self._toPx(1, 0);
      var pAxeY1 = self._toPx(0, a);
      svg.appendChild(svgEl(ns, "line", { x1: pPoint[0].toFixed(2), y1: pPoint[1].toFixed(2), x2: pAxeX1[0].toFixed(2), y2: pAxeX1[1].toFixed(2), class: "guide" }));
      svg.appendChild(svgEl(ns, "line", { x1: pPoint[0].toFixed(2), y1: pPoint[1].toFixed(2), x2: pAxeY1[0].toFixed(2), y2: pAxeY1[1].toFixed(2), class: "guide" }));

      var etX1 = svgEl(ns, "text", { x: pAxeX1[0].toFixed(2), y: (origine[1] + 16).toFixed(2), "text-anchor": "middle", class: "etiquette-guide" });
      etX1.textContent = "1";
      svg.appendChild(etX1);
      var etY1 = svgEl(ns, "text", { x: (origine[0] - 6).toFixed(2), y: (pAxeY1[1] + 4).toFixed(2), "text-anchor": "end", class: "etiquette-guide" });
      etY1.textContent = formatNombreFr(a, 1);
      svg.appendChild(etY1);

      svg.appendChild(svgEl(ns, "circle", { cx: pPoint[0].toFixed(2), cy: pPoint[1].toFixed(2), r: 4.5, class: "point" }));
      var etPoint = svgEl(ns, "text", { x: (pPoint[0] + 8).toFixed(2), y: (pPoint[1] - 8).toFixed(2), class: "etiquette-point" });
      etPoint.textContent = "(1;" + formatNombreFr(a, 1) + ")";
      svg.appendChild(etPoint);
    }

    // Point (0;1), toujours présent (a^0 = 1 quel que soit a > 0, et Math.pow(0,0)=1 en JS).
    var pOrigine1 = self._toPx(0, 1);
    svg.appendChild(svgEl(ns, "circle", { cx: pOrigine1[0].toFixed(2), cy: pOrigine1[1].toFixed(2), r: 4.5, class: "point" }));
    var etOrigine1 = svgEl(ns, "text", { x: (pOrigine1[0] + 8).toFixed(2), y: (pOrigine1[1] - 8).toFixed(2), class: "etiquette-point" });
    etOrigine1.textContent = "(0;1)";
    svg.appendChild(etOrigine1);
  };

  if (!customElements.get("exponentielle-widget")) {
    customElements.define("exponentielle-widget", ExponentielleWidgetClass);
  }
})();
