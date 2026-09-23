(function () {
  "use strict";

  /* ================================================================
   * <milieu-piege-widget> — atelier interactif : A(x_A;y_A) et
   * u(x_u;y_u) déplaçables, B=A+u calculé — matérialise en direct le
   * piège « Milieu ≠ différence de coordonnées » : le vrai milieu M
   * (moyenne, en vert) et le faux « milieu » que confond le piège — le
   * point de coordonnées (x_B−x_A ; y_B−y_A), qui vaut TOUJOURS
   * exactement (x_u ; y_u) puisque B=A+u — affichés côte à côte en
   * fantôme rouge. Réglage par défaut (A(1;1), u=(4;2)) reproduit
   * exactement l'exemple résolu : B(5;3), M(3;2). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { xA: 1, yA: 1, xu: 4, yu: 2 };
  var BORNES_A = { min: 0, max: 6, step: 0.5 };
  var BORNES_U = { min: -4, max: 4, step: 0.5 };

  var X_MIN = -5, X_MAX = 11, Y_MIN = -5, Y_MAX = 11;
  var LARGEUR = 420, HAUTEUR = 340, MARGE = 32;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.vecteur-u{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.pointille-milieu{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.point-a{fill:var(--ink,#241f1a);}' +
    '.point-b{fill:var(--accent,#a8471f);}' +
    '.point-m{fill:var(--good,#2f7a4f);}' +
    '.point-faux{fill:var(--bad,#b23a3a);}' +
    '.etiquette{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-ink{fill:var(--ink,#241f1a);}' +
    '.etiquette-accent{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-good{fill:var(--good,#2f7a4f);}' +
    '.etiquette-bad{fill:var(--bad,#b23a3a);}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.ligne-formule{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.86rem;font-weight:700;}' +
    '.ligne-vrai{color:var(--good,#2f7a4f);}' +
    '.ligne-faux{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="xa">x_A</label><div class="curseur-row">' +
    '<input type="range" id="xa" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.xA + '">' +
    '<span class="curseur-valeur" id="xa-valeur"></span></div></div>' +
    '<div class="curseur"><label for="ya">y_A</label><div class="curseur-row">' +
    '<input type="range" id="ya" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.yA + '">' +
    '<span class="curseur-valeur" id="ya-valeur"></span></div></div>' +
    '<div class="curseur"><label for="xu">x_u</label><div class="curseur-row">' +
    '<input type="range" id="xu" min="' + BORNES_U.min + '" max="' + BORNES_U.max + '" step="' + BORNES_U.step + '" value="' + DEFAUT.xu + '">' +
    '<span class="curseur-valeur" id="xu-valeur"></span></div></div>' +
    '<div class="curseur"><label for="yu">y_u</label><div class="curseur-row">' +
    '<input type="range" id="yu" min="' + BORNES_U.min + '" max="' + BORNES_U.max + '" step="' + BORNES_U.step + '" value="' + DEFAUT.yu + '">' +
    '<span class="curseur-valeur" id="yu-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class MilieuPiegeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  MilieuPiegeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._xA = DEFAUT.xA; this._yA = DEFAUT.yA; this._xu = DEFAUT.xu; this._yu = DEFAUT.yu;
    this._svg = shadow.getElementById("svg");
    this._lecture = shadow.getElementById("lecture");
    this._inputXa = shadow.getElementById("xa");
    this._inputYa = shadow.getElementById("ya");
    this._inputXu = shadow.getElementById("xu");
    this._inputYu = shadow.getElementById("yu");
    this._valeurXa = shadow.getElementById("xa-valeur");
    this._valeurYa = shadow.getElementById("ya-valeur");
    this._valeurXu = shadow.getElementById("xu-valeur");
    this._valeurYu = shadow.getElementById("yu-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  MilieuPiegeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputXa = function () { self._xA = parseFloat(self._inputXa.value); self._rendre(); };
    this._onInputYa = function () { self._yA = parseFloat(self._inputYa.value); self._rendre(); };
    this._onInputXu = function () { self._xu = parseFloat(self._inputXu.value); self._rendre(); };
    this._onInputYu = function () { self._yu = parseFloat(self._inputYu.value); self._rendre(); };
    this._onReset = function () {
      self._xA = DEFAUT.xA; self._yA = DEFAUT.yA; self._xu = DEFAUT.xu; self._yu = DEFAUT.yu;
      self._inputXa.value = String(DEFAUT.xA);
      self._inputYa.value = String(DEFAUT.yA);
      self._inputXu.value = String(DEFAUT.xu);
      self._inputYu.value = String(DEFAUT.yu);
      self._rendre();
    };
    this._inputXa.addEventListener("input", this._onInputXa);
    this._inputYa.addEventListener("input", this._onInputYa);
    this._inputXu.addEventListener("input", this._onInputXu);
    this._inputYu.addEventListener("input", this._onInputYu);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  MilieuPiegeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputXa.removeEventListener("input", this._onInputXa);
    this._inputYa.removeEventListener("input", this._onInputYa);
    this._inputXu.removeEventListener("input", this._onInputXu);
    this._inputYu.removeEventListener("input", this._onInputYu);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  MilieuPiegeWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  MilieuPiegeWidgetClass.prototype._rendre = function () {
    var xA = this._xA, yA = this._yA, xu = this._xu, yu = this._yu;
    this._valeurXa.textContent = formatNombreFr(xA, 1);
    this._valeurYa.textContent = formatNombreFr(yA, 1);
    this._valeurXu.textContent = formatNombreFr(xu, 1);
    this._valeurYu.textContent = formatNombreFr(yu, 1);

    var xB = xA + xu, yB = yA + yu;
    var xM = (xA + xB) / 2, yM = (yA + yB) / 2;
    var xFaux = xB - xA, yFaux = yB - yA;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    var pA = self._toPx(xA, yA), pB = self._toPx(xB, yB), pM = self._toPx(xM, yM), pFaux = self._toPx(xFaux, yFaux);

    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pB[0].toFixed(2), y2: pB[1].toFixed(2), class: "vecteur-u" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), y1: origine[1].toFixed(2), x2: pFaux[0].toFixed(2), y2: pFaux[1].toFixed(2), class: "pointille-milieu" }));

    function point(p, classe, texte, classeEtiquette, dy) {
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: classe }));
      var et = svgEl(ns, "text", { x: (p[0] + 9).toFixed(2), y: (p[1] + dy).toFixed(2), class: "etiquette " + classeEtiquette });
      et.textContent = texte;
      svg.appendChild(et);
    }
    // M et le point "faux milieu" peuvent coïncider en hauteur pixel (ex. réglage par défaut,
    // yM=yFaux=2) — étiquette de M toujours au-dessus, celle du piège toujours en dessous, pour
    // ne jamais se chevaucher même quand les deux points sont proches l'un de l'autre.
    point(pA, "point-a", "A", "etiquette-ink", -9);
    point(pB, "point-b", "B", "etiquette-accent", -9);
    point(pM, "point-m", "M (vrai milieu)", "etiquette-good", -9);
    point(pFaux, "point-faux", "faux « milieu »", "etiquette-bad", 20);

    this._lecture.innerHTML =
      '<div class="ligne-formule ligne-vrai">Vrai milieu M : ((' + formatNombreFr(xA, 1) + '+' + formatNombreFr(xB, 1) + ')/2 ; (' + formatNombreFr(yA, 1) + '+' + formatNombreFr(yB, 1) + ')/2) = (' + formatNombreFr(xM, 2) + ' ; ' + formatNombreFr(yM, 2) + ')</div>' +
      '<div class="ligne-formule ligne-faux">Piège — différence (x_B−x_A ; y_B−y_A) = (' + formatNombreFr(xFaux, 1) + ' ; ' + formatNombreFr(yFaux, 1) + ') — ce sont les composantes de u, PAS un milieu !</div>';
  };

  if (!customElements.get("milieu-piege-widget")) {
    customElements.define("milieu-piege-widget", MilieuPiegeWidgetClass);
  }
})();
