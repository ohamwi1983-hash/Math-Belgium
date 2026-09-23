(function () {
  "use strict";

  /* ================================================================
   * <point-vide-ou-asymptote-widget> — atelier interactif : f(x)=(x−r1)
   * (x−r2)/(x+3), curseurs sur les 2 racines du numérateur — quand l'une
   * d'elles vaut −3 (= la racine du dénominateur, réglage par défaut),
   * ça se simplifie en une DROITE avec un point vide (petit rond creux,
   * « nid-de-poule rebouché ») ; sinon, c'est une vraie asymptote
   * verticale (ligne pointillée, « gouffre infranchissable »). Réglages
   * par défaut (r1=−3, r2=3) reproduisent exactement l'exemple résolu
   * (x²−9)/(x+3), limite=−6. Web Component (Shadow DOM).
   * ================================================================ */

  var A = -3; // racine fixe du dénominateur, x+3 — commune aux deux exemples résolus de la section
  var DEFAUT = { r1: -3, r2: 3 };
  var BORNES_R = { min: -6, max: 6, step: 1 };
  var TOLERANCE = 1e-9;

  var X_MIN = -8, X_MAX = 8, Y_MIN = -15, Y_MAX = 15;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.gouffre{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.point-vide{fill:var(--surface-2,#faf6f0);stroke:var(--good,#2f7a4f);stroke-width:2.6;}' +
    '.etiquette-gouffre{font-size:11px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette-vide{font-size:11px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-vide{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-gouffre{color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r1">r₁ — 1ère racine du numérateur</label><div class="curseur-row">' +
    '<input type="range" id="r1" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r1 + '">' +
    '<span class="curseur-valeur" id="r1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r2">r₂ — 2e racine du numérateur</label><div class="curseur-row">' +
    '<input type="range" id="r2" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r2 + '">' +
    '<span class="curseur-valeur" id="r2-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class PointVideOuAsymptoteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  PointVideOuAsymptoteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._r1 = DEFAUT.r1;
    this._r2 = DEFAUT.r2;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputR1 = shadow.getElementById("r1");
    this._inputR2 = shadow.getElementById("r2");
    this._valeurR1 = shadow.getElementById("r1-valeur");
    this._valeurR2 = shadow.getElementById("r2-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  PointVideOuAsymptoteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputR1 = function () { self._r1 = parseFloat(self._inputR1.value); self._rendre(); };
    this._onInputR2 = function () { self._r2 = parseFloat(self._inputR2.value); self._rendre(); };
    this._onReset = function () {
      self._r1 = DEFAUT.r1; self._r2 = DEFAUT.r2;
      self._inputR1.value = String(DEFAUT.r1);
      self._inputR2.value = String(DEFAUT.r2);
      self._rendre();
    };
    this._inputR1.addEventListener("input", this._onInputR1);
    this._inputR2.addEventListener("input", this._onInputR2);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  PointVideOuAsymptoteWidgetClass.prototype.disconnectedCallback = function () {
    this._inputR1.removeEventListener("input", this._onInputR1);
    this._inputR2.removeEventListener("input", this._onInputR2);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  PointVideOuAsymptoteWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  PointVideOuAsymptoteWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(260 * (xMax - xMin) / (X_MAX - X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= Y_MIN - 0.5 && yy <= Y_MAX + 0.5;
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
  };

  PointVideOuAsymptoteWidgetClass.prototype._rendre = function () {
    var r1 = this._r1, r2 = this._r2;
    var f = function (x) { return (x - r1) * (x - r2) / (x - A); };
    var numEnA = (A - r1) * (A - r2);
    var estPointVide = Math.abs(numEnA) < TOLERANCE;

    this._formule.textContent = "f(x) = (x " + (r1 >= 0 ? "− " + formatNombreFr(r1, 0) : "+ " + formatNombreFr(-r1, 0)) +
      ")(x " + (r2 >= 0 ? "− " + formatNombreFr(r2, 0) : "+ " + formatNombreFr(-r2, 0)) + ") / (x " +
      (A >= 0 ? "− " + formatNombreFr(A, 0) : "+ " + formatNombreFr(-A, 0)) + ")";
    this._valeurR1.textContent = formatNombreFr(r1, 0);
    this._valeurR2.textContent = formatNombreFr(r2, 0);

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
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    if (estPointVide) {
      this._traceIntervalle(svg, ns, X_MIN, X_MAX, f);
      var limite = A - (Math.abs(A - r1) < TOLERANCE ? r2 : r1); // l'autre racine, une fois le facteur commun simplifié
      var pVide = self._toPx(A, limite);
      svg.appendChild(svgEl(ns, "circle", { cx: pVide[0].toFixed(2), cy: pVide[1].toFixed(2), r: 5.5, class: "point-vide" }));
      var etVide = svgEl(ns, "text", { x: pVide[0].toFixed(2), y: (pVide[1] - 12).toFixed(2), "text-anchor": "middle", class: "etiquette-vide" });
      etVide.textContent = "point vide (" + formatNombreFr(A, 0) + ";" + formatNombreFr(limite, 0) + ")";
      svg.appendChild(etVide);
      this._verdict.className = "verdict verdict-vide";
      this._verdict.textContent =
        "Numérateur(" + A + ") = " + formatNombreFr(numEnA, 2) + " = 0 → POINT VIDE (nid-de-poule rebouché) : la limite existe et vaut " + formatNombreFr(limite, 2) + ".";
    } else {
      this._traceIntervalle(svg, ns, X_MIN, A - 0.03, f);
      this._traceIntervalle(svg, ns, A + 0.03, X_MAX, f);
      var pGouffre0 = self._toPx(A, Y_MIN), pGouffre1 = self._toPx(A, Y_MAX);
      svg.appendChild(svgEl(ns, "line", { x1: pGouffre0[0].toFixed(2), y1: pGouffre0[1].toFixed(2), x2: pGouffre1[0].toFixed(2), y2: pGouffre1[1].toFixed(2), class: "gouffre" }));
      var etGouffre = svgEl(ns, "text", { x: (pGouffre0[0] + 6).toFixed(2), y: (MARGE + 12).toFixed(2), class: "etiquette-gouffre" });
      etGouffre.textContent = "x=" + A + " : vraie asymptote";
      svg.appendChild(etGouffre);
      var signeAGauche = f(A - 0.1) > 0;
      this._verdict.className = "verdict verdict-gouffre";
      this._verdict.textContent =
        "Numérateur(" + A + ") = " + formatNombreFr(numEnA, 2) + " ≠ 0 → VRAIE ASYMPTOTE VERTICALE (gouffre infranchissable) : lim = " +
        (signeAGauche ? "+∞" : "−∞") + " à gauche, " + (signeAGauche ? "−∞" : "+∞") + " à droite.";
    }
  };

  if (!customElements.get("point-vide-ou-asymptote-widget")) {
    customElements.define("point-vide-ou-asymptote-widget", PointVideOuAsymptoteWidgetClass);
  }
})();
