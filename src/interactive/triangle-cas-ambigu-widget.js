(function () {
  "use strict";

  /* ================================================================
   * <triangle-cas-ambigu-widget> — atelier interactif : curseurs Â
   * (angle non compris), b (côté adjacent connu), a (côté opposé à Â,
   * SWINGUÉ depuis C) — matérialise en direct le « cas ambigu » SSA
   * mentionné dans la section (loi des sinus) : selon la longueur de a
   * comparée à h=b·sinÂ et à b, il y a 0, 1 ou 2 triangles possibles.
   * A est fixé à l'origine, [AB] sur l'axe horizontal (B à déterminer),
   * C = b·(cos Â ; sin Â) fixe pour un Â et un b donnés ; le cercle de
   * rayon a centré en C coupe (ou non) l'axe horizontal en 0, 1 ou 2
   * points d'abscisse positive. Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { angleA: 30, b: 8, a: 5 };
  var BORNES_ANGLE = { min: 15, max: 165, step: 1 };
  var BORNES_B = { min: 4, max: 9, step: 0.1 };
  var BORNES_A = { min: 2, max: 10, step: 0.1 };

  var X_MIN = -2, X_MAX = 19, Y_MIN = -1.5, Y_MAX = 10.5;
  var LARGEUR = 420, HAUTEUR = 260, MARGE = 30;

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
    '.cote-fixe{stroke:var(--ink-soft,#6b6055);stroke-width:1.8;}' +
    '.hauteur{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.triangle-1{stroke:var(--good,#2f7a4f);stroke-width:2;fill:var(--good,#2f7a4f);fill-opacity:0.08;}' +
    '.triangle-2{stroke:var(--accent,#a8471f);stroke-width:2;fill:var(--accent,#a8471f);fill-opacity:0.08;}' +
    '.cercle-a{stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-dasharray:3 3;fill:none;opacity:0.7;}' +
    '.sommet{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.etiquette-h{font-size:11px;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-0{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.verdict-1{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.verdict-2{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
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
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="angle">Â</label><div class="curseur-row">' +
    '<input type="range" id="angle" min="' + BORNES_ANGLE.min + '" max="' + BORNES_ANGLE.max + '" step="' + BORNES_ANGLE.step + '" value="' + DEFAUT.angleA + '">' +
    '<span class="curseur-valeur" id="angle-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b (côté AC)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="a">a (côté BC, opposé à Â)</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TriangleCasAmbiguWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TriangleCasAmbiguWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._angleA = DEFAUT.angleA;
    this._b = DEFAUT.b;
    this._a = DEFAUT.a;
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputAngle = shadow.getElementById("angle");
    this._inputB = shadow.getElementById("b");
    this._inputA = shadow.getElementById("a");
    this._valeurAngle = shadow.getElementById("angle-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurA = shadow.getElementById("a-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  TriangleCasAmbiguWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputAngle = function () { self._angleA = parseFloat(self._inputAngle.value); self._rendre(); };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onReset = function () {
      self._angleA = DEFAUT.angleA; self._b = DEFAUT.b; self._a = DEFAUT.a;
      self._inputAngle.value = String(DEFAUT.angleA);
      self._inputB.value = String(DEFAUT.b);
      self._inputA.value = String(DEFAUT.a);
      self._rendre();
    };
    this._inputAngle.addEventListener("input", this._onInputAngle);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputA.addEventListener("input", this._onInputA);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  TriangleCasAmbiguWidgetClass.prototype.disconnectedCallback = function () {
    this._inputAngle.removeEventListener("input", this._onInputAngle);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputA.removeEventListener("input", this._onInputA);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  TriangleCasAmbiguWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  TriangleCasAmbiguWidgetClass.prototype._dessinerTriangle = function (svg, ns, bx, classe) {
    var A = this._toPx(0, 0);
    var C = this._toPx(this._Cx, this._Cy);
    var B = this._toPx(bx, 0);
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + A[0].toFixed(2) + " " + A[1].toFixed(2) + " L" + B[0].toFixed(2) + " " + B[1].toFixed(2) + " L" + C[0].toFixed(2) + " " + C[1].toFixed(2) + " Z",
      class: classe,
    }));
    svg.appendChild(svgEl(ns, "circle", { cx: B[0].toFixed(2), cy: B[1].toFixed(2), r: 4, class: "sommet" }));
    var etB = svgEl(ns, "text", { x: B[0].toFixed(2), y: (B[1] + 18).toFixed(2), "text-anchor": "middle", class: "etiquette" });
    etB.textContent = "B (" + formatNombreFr(bx, 1) + ")";
    svg.appendChild(etB);
  };

  TriangleCasAmbiguWidgetClass.prototype._rendre = function () {
    var angleDeg = this._angleA, b = this._b, a = this._a;
    this._valeurAngle.textContent = formatNombreFr(angleDeg, 0) + "°";
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurA.textContent = formatNombreFr(a, 1);

    var angleRad = angleDeg * D2R;
    var Cx = b * Math.cos(angleRad), Cy = b * Math.sin(angleRad);
    this._Cx = Cx;
    this._Cy = Cy;
    var h = b * Math.sin(angleRad);

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

    // Hauteur h = b·sinÂ, pied du triangle perpendiculaire à l'axe horizontal depuis C.
    var pC = self._toPx(Cx, Cy), pPied = self._toPx(Cx, 0);
    svg.appendChild(svgEl(ns, "line", { x1: pC[0].toFixed(2), y1: pC[1].toFixed(2), x2: pPied[0].toFixed(2), y2: pPied[1].toFixed(2), class: "hauteur" }));
    var etH = svgEl(ns, "text", { x: (pPied[0] + 5).toFixed(2), y: ((pC[1] + pPied[1]) / 2).toFixed(2), class: "etiquette-h" });
    etH.textContent = "h=" + formatNombreFr(h, 2);
    svg.appendChild(etH);

    var discriminant = a * a - h * h;
    var solutions = [];
    if (discriminant > 1e-6) {
      var delta = Math.sqrt(discriminant);
      var x1 = Cx - delta, x2 = Cx + delta;
      if (x1 > 1e-6) solutions.push(x1);
      if (x2 > 1e-6) solutions.push(x2);
    } else if (Math.abs(discriminant) <= 1e-6 && Cx > 1e-6) {
      solutions.push(Cx);
    }

    solutions.forEach(function (bx, i) {
      self._dessinerTriangle(svg, ns, bx, i === 0 ? "triangle-1" : "triangle-2");
    });

    svg.appendChild(svgEl(ns, "circle", { cx: pC[0].toFixed(2), cy: pC[1].toFixed(2), r: 4, class: "sommet" }));
    var etC = svgEl(ns, "text", { x: pC[0].toFixed(2), y: (pC[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette" });
    etC.textContent = "C";
    svg.appendChild(etC);
    var etA = svgEl(ns, "text", { x: (origine[0] - 4).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": "end", class: "etiquette" });
    etA.textContent = "A";
    svg.appendChild(etA);

    if (solutions.length === 0) {
      this._verdict.className = "verdict verdict-0";
      this._verdict.textContent = "a=" + formatNombreFr(a, 1) + " < h=" + formatNombreFr(h, 2) + " → AUCUN triangle possible (le cercle de rayon a ne touche pas la base).";
    } else if (solutions.length === 1) {
      var raison = Math.abs(discriminant) <= 1e-6 ? "cas limite a=h (angle droit en B)" : "a ≥ b : un seul point d'intersection est du bon côté (x>0)";
      this._verdict.className = "verdict verdict-1";
      this._verdict.textContent = "1 SEUL triangle possible — " + raison + ".";
    } else {
      this._verdict.className = "verdict verdict-2";
      this._verdict.textContent = "h=" + formatNombreFr(h, 2) + " < a=" + formatNombreFr(a, 1) + " < b=" + formatNombreFr(b, 1) + " → CAS AMBIGU : 2 triangles possibles (B aigu en vert, B obtus en orange).";
    }
  };

  if (!customElements.get("triangle-cas-ambigu-widget")) {
    customElements.define("triangle-cas-ambigu-widget", TriangleCasAmbiguWidgetClass);
  }
})();
