(function () {
  "use strict";

  /* ================================================================
   * <tangente-exponentielle-widget> — atelier interactif f(x) = a^x, curseur a de 1
   * à 3 (pas très fin, 0,0001), avec 2 cases à cocher : tangente en x=0, et f'(x).
   * Web Component (Shadow DOM), couleurs empruntées aux variables CSS du thème.
   * ================================================================ */

  var DEFAUT_A = 2;
  var BORNES_A = { min: 1, max: 3, step: 0.0001 };
  var LARGEUR = 460, HAUTEUR = 320, MARGE = 34;
  // Fenêtre FIXE (indépendante de a) — piège déjà rencontré plusieurs fois cette session : un
  // cadrage qui se recale sur la valeur courante annulerait l'effet visible du curseur. Bornes
  // choisies pour contenir a^x, sa tangente en (0;1) et f'(x)=ln(a)·a^x sur tout [1;3].
  var X_MIN = -2.2, X_MAX = 2.2;
  var Y_MIN = -2, Y_MAX = 9;

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
    '.courbe-f{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.courbe-derivee{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.tangente{stroke:var(--plan,#5b4ea3);stroke-width:2.2;stroke-dasharray:6 4;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.legende{font-size:11.5px;font-weight:600;font-family:var(--sans,sans-serif);}' +
    '.legende-f{fill:var(--accent-ink,#7a3212);}' +
    '.legende-tangente{fill:var(--plan,#5b4ea3);}' +
    '.legende-derivee{fill:var(--good,#2f7a4f);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:14px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:76px;text-align:right;font-size:0.92rem;}' +
    '.cases{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;}' +
    '.case{display:flex;align-items:center;gap:7px;font-weight:600;font-size:0.92rem;cursor:pointer;}' +
    '.case input[type="checkbox"]{width:16px;height:16px;cursor:pointer;}' +
    '.case-tangente{color:var(--plan,#5b4ea3);accent-color:var(--plan,#5b4ea3);}' +
    '.case-derivee{color:var(--good,#2f7a4f);accent-color:var(--good,#2f7a4f);}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">a</span><span class="stat-value" id="val-a"></span></div>' +
    '<div class="stat"><span class="stat-label">f\'(0) = ln(a)</span><span class="stat-value" id="val-fprime0"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT_A + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="cases">' +
    '<label class="case case-tangente"><input type="checkbox" id="case-tangente">Tangente en x=0</label>' +
    '<label class="case case-derivee"><input type="checkbox" id="case-derivee">f\'(x)</label>' +
    '</div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TangenteExponentielleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TangenteExponentielleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT_A;
    this._tangenteVisible = false;
    this._deriveeVisible = false;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputA = shadow.getElementById("a");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valA = shadow.getElementById("val-a");
    this._valFprime0 = shadow.getElementById("val-fprime0");
    this._caseTangente = shadow.getElementById("case-tangente");
    this._caseDerivee = shadow.getElementById("case-derivee");
    this._resetBtn = shadow.getElementById("reset");
  };

  TangenteExponentielleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      self._a = parseFloat(self._inputA.value);
      self._rendre();
    };
    this._onToggleTangente = function () {
      self._tangenteVisible = self._caseTangente.checked;
      self._rendre();
    };
    this._onToggleDerivee = function () {
      self._deriveeVisible = self._caseDerivee.checked;
      self._rendre();
    };
    this._onReset = function () {
      self._a = DEFAUT_A;
      self._tangenteVisible = false;
      self._deriveeVisible = false;
      self._inputA.value = String(DEFAUT_A);
      self._caseTangente.checked = false;
      self._caseDerivee.checked = false;
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._caseTangente.addEventListener("change", this._onToggleTangente);
    this._caseDerivee.addEventListener("change", this._onToggleDerivee);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  TangenteExponentielleWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._caseTangente.removeEventListener("change", this._onToggleTangente);
    this._caseDerivee.removeEventListener("change", this._onToggleDerivee);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  TangenteExponentielleWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  // Trace une fonction f sur [X_MIN, X_MAX], en excluant proprement les portions qui sortent de
  // la fenêtre Y (plutôt que de les couper net) — mêmes principe que les autres widgets du site.
  TangenteExponentielleWidgetClass.prototype._traceFonction = function (svg, ns, f, classe) {
    var self = this;
    var n = 300, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = f(xx);
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
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe }));
    });
  };

  TangenteExponentielleWidgetClass.prototype._rendre = function () {
    var a = this._a;
    var lnA = Math.log(a);
    this._formule.textContent = "f(x) = " + formatNombreFr(a, 4) + "^x";
    this._valeurA.textContent = formatNombreFr(a, 4);
    this._valA.textContent = formatNombreFr(a, 4);
    this._valFprime0.textContent = formatNombreFr(lnA, 4);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    // Axes
    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "axe" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 10, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    // f'(x) = ln(a)·a^x, si la case est cochée — dessinée AVANT f pour que la courbe de f reste
    // visible par-dessus si les deux se superposent (ex. proche de a=e, où f'≈f).
    if (this._deriveeVisible) {
      this._traceFonction(svg, ns, function (x) { return lnA * Math.pow(a, x); }, "courbe-derivee");
    }

    // Tangente en x=0 : y = 1 + f'(0)·x = 1 + ln(a)·x — droite entière sur la fenêtre.
    if (this._tangenteVisible) {
      var pTan0 = self._toPx(X_MIN, 1 + lnA * X_MIN);
      var pTan1 = self._toPx(X_MAX, 1 + lnA * X_MAX);
      svg.appendChild(svgEl(ns, "line", { x1: pTan0[0].toFixed(2), y1: pTan0[1].toFixed(2), x2: pTan1[0].toFixed(2), y2: pTan1[1].toFixed(2), class: "tangente" }));
    }

    // f(x) = a^x — toujours visible, dessinée en dernier pour rester au premier plan.
    this._traceFonction(svg, ns, function (x) { return Math.pow(a, x); }, "courbe-f");

    // Point (0;1), toujours présent.
    var p01 = self._toPx(0, 1);
    svg.appendChild(svgEl(ns, "circle", { cx: p01[0].toFixed(2), cy: p01[1].toFixed(2), r: 4.5, class: "point" }));

    // Légende (couleurs), affichée seulement pour ce qui est visible.
    var yLegende = MARGE + 4;
    var legF = svgEl(ns, "text", { x: MARGE + 4, y: yLegende, class: "legende legende-f" });
    legF.textContent = "f(x) = aˣ";
    svg.appendChild(legF);
    if (this._tangenteVisible) {
      var legT = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + 15, class: "legende legende-tangente" });
      legT.textContent = "tangente en x=0";
      svg.appendChild(legT);
    }
    if (this._deriveeVisible) {
      var legD = svgEl(ns, "text", { x: MARGE + 4, y: yLegende + (this._tangenteVisible ? 30 : 15), class: "legende legende-derivee" });
      legD.textContent = "f'(x)";
      svg.appendChild(legD);
    }
  };

  if (!customElements.get("tangente-exponentielle-widget")) {
    customElements.define("tangente-exponentielle-widget", TangenteExponentielleWidgetClass);
  }
})();
