(function () {
  "use strict";

  /* ================================================================
   * <equation-trig-widget> — atelier interactif : résout trig(ax+b) = k en
   * direct (sin, cos ou tan), curseurs a, b (en multiples de π), k.
   * Panneau cercle trigonométrique (u = ax+b) reprenant exactement la
   * convention des illustrations statiques de cette section (points reliés,
   * ligne de repère horizontale/verticale) — le cercle NE DÉPEND JAMAIS de
   * a ni b, seule la traduction finale en x en dépend, ce qui matérialise le
   * piège de la section (diviser TOUT — constante et période — par a). Web
   * Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var DEFAUT = { fn: "cos", a: 3, bMult: -0.25, k: 0.5 };
  var BORNES_A = { min: 1, max: 3, step: 0.5 };
  var BORNES_B_MULT = { min: -1, max: 1, step: 1 / 12 };
  var BORNES_K_SINCOS = { min: -1.3, max: 1.3, step: 0.05 };
  var BORNES_K_TAN = { min: -5, max: 5, step: 0.25 };

  var C_TAILLE = 240, C_CX = 120, C_CY = 120, C_R = 84;

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
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:240px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.corde{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:4 3;opacity:0.8;}' +
    '.repere{stroke:var(--bad,#b23a3a);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.point-u{fill:var(--accent,#a8471f);}' +
    '.etiquette-u{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-repere{font-size:11px;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.message-vide{font-size:13px;font-weight:600;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.solution{text-align:center;font-family:var(--mono,monospace);font-size:0.92rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;line-height:1.7;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:64px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><span class="formule" id="formule"></span>' +
    '<select id="fn">' +
    '<option value="sin">sin(u)</option>' +
    '<option value="cos">cos(u)</option>' +
    '<option value="tan">tan(u)</option>' +
    '</select><span class="formule">= k</span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="solution" id="solution"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b (multiple de π)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B_MULT.min + '" max="' + BORNES_B_MULT.max + '" step="' + BORNES_B_MULT.step + '" value="' + DEFAUT.bMult + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="k">k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K_SINCOS.min + '" max="' + BORNES_K_SINCOS.max + '" step="' + BORNES_K_SINCOS.step + '" value="' + DEFAUT.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class EquationTrigWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  EquationTrigWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._fn = DEFAUT.fn;
    this._a = DEFAUT.a;
    this._bMult = DEFAUT.bMult;
    this._k = DEFAUT.k;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectFn = shadow.getElementById("fn");
    this._solution = shadow.getElementById("solution");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputK = shadow.getElementById("k");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurK = shadow.getElementById("k-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectFn.value = this._fn;
  };

  EquationTrigWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onInputB = function () { self._bMult = parseFloat(self._inputB.value); self._rendre(); };
    this._onInputK = function () { self._k = parseFloat(self._inputK.value); self._rendre(); };
    this._onChangeFn = function () {
      self._fn = self._selectFn.value;
      // Bornes de k : [-1,3;1,3] pour sin/cos (la borne dépasse légèrement 1 exprès — glisser k
      // au-delà de 1 montre explicitement "aucune solution"), [-5;5] pour tan (aucune restriction).
      var bornesK = self._fn === "tan" ? BORNES_K_TAN : BORNES_K_SINCOS;
      self._inputK.min = String(bornesK.min);
      self._inputK.max = String(bornesK.max);
      self._inputK.step = String(bornesK.step);
      self._k = Math.max(bornesK.min, Math.min(bornesK.max, self._k));
      self._inputK.value = String(self._k);
      self._rendre();
    };
    this._onReset = function () {
      self._fn = DEFAUT.fn; self._a = DEFAUT.a; self._bMult = DEFAUT.bMult; self._k = DEFAUT.k;
      self._selectFn.value = DEFAUT.fn;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.bMult);
      self._inputK.min = String(BORNES_K_SINCOS.min);
      self._inputK.max = String(BORNES_K_SINCOS.max);
      self._inputK.step = String(BORNES_K_SINCOS.step);
      self._inputK.value = String(DEFAUT.k);
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputK.addEventListener("input", this._onInputK);
    this._selectFn.addEventListener("change", this._onChangeFn);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  EquationTrigWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputK.removeEventListener("input", this._onInputK);
    this._selectFn.removeEventListener("change", this._onChangeFn);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  EquationTrigWidgetClass.prototype._pointCercle = function (u) {
    return [C_CX + C_R * Math.cos(u), C_CY - C_R * Math.sin(u)];
  };

  EquationTrigWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte) {
    var procheDroite = px > C_TAILLE - 60;
    var procheHaut = py < 24;
    var procheBas = py > C_TAILLE - 20;
    var ancre = procheDroite ? "end" : "start";
    var dx = procheDroite ? -9 : 9;
    var dy = procheHaut ? 16 : procheBas ? -8 : -9;
    var t = svgEl(ns, "text", { x: (px + dx).toFixed(2), y: (py + dy).toFixed(2), "text-anchor": ancre, class: "etiquette-u" });
    t.textContent = texte;
    svg.appendChild(t);
  };

  EquationTrigWidgetClass.prototype._dessinerCercle = function (fn, k, points, aucuneSolution) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 18, x2: C_CX + C_R + 18, y1: C_CY, y2: C_CY, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY + C_R + 18, y2: C_CY - C_R - 18, class: "axe", "marker-end": "url(#fleche)" }));

    if (aucuneSolution) {
      var msg = svgEl(ns, "text", { x: C_CX, y: C_CY, "text-anchor": "middle", class: "message-vide" });
      msg.textContent = "|k| > 1 : aucune solution";
      svg.appendChild(msg);
      return;
    }

    // Ligne de repère : horizontale (y=k) pour sin, verticale (x=k) pour cos — reprend exactement
    // la convention des illustrations statiques de cette section. Rien pour tan (pas de repère
    // simple à une seule coordonnée).
    if (fn === "sin") {
      var yRepere = C_CY - k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 10, x2: C_CX + C_R + 10, y1: yRepere.toFixed(2), y2: yRepere.toFixed(2), class: "repere" }));
      var etRep = svgEl(ns, "text", { x: (C_CX + C_R + 12).toFixed(2), y: (yRepere + 4).toFixed(2), class: "etiquette-repere" });
      etRep.textContent = "y=k";
      svg.appendChild(etRep);
    } else if (fn === "cos") {
      var xRepere = C_CX + k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: xRepere.toFixed(2), x2: xRepere.toFixed(2), y1: C_CY - C_R - 10, y2: C_CY + C_R + 10, class: "repere" }));
      var etRep2 = svgEl(ns, "text", { x: (xRepere + 4).toFixed(2), y: (C_CY - C_R - 14).toFixed(2), "text-anchor": "middle", class: "etiquette-repere" });
      etRep2.textContent = "x=k";
      svg.appendChild(etRep2);
    }

    if (points.length === 2) {
      var p0 = self._pointCercle(points[0].u), p1 = self._pointCercle(points[1].u);
      svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "corde" }));
    }
    points.forEach(function (pt) {
      var p = self._pointCercle(pt.u);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: "point-u" }));
      self._etiquettePoint(svg, ns, p[0], p[1], pt.label);
    });
  };

  var FORMULE_FN = { sin: "sin", cos: "cos", tan: "tan" };

  EquationTrigWidgetClass.prototype._rendre = function () {
    var fn = this._fn, a = this._a, k = this._k;
    var b = this._bMult * PI;

    this._formule.textContent = FORMULE_FN[fn] + "(" + formatNombreFr(a, 1) + "x " + (b >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(this._bMult), 2) + "π)";
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(this._bMult, 2) + "π";
    this._valeurK.textContent = formatNombreFr(k, 2);

    var points = [];
    var aucuneSolution = false;
    var texteSolution;

    if (fn === "sin") {
      if (Math.abs(k) > 1) {
        aucuneSolution = true;
        texteSolution = "Aucune solution : |k| > 1, or sin(u) ∈ [−1 ; 1].";
      } else {
        var alphaS = Math.asin(k);
        points = [
          { u: alphaS, label: "α" },
          { u: PI - alphaS, label: "π−α" },
        ];
        var periodeS = (2 * PI) / a;
        var x1s = (alphaS - b) / a, x2s = (PI - alphaS - b) / a;
        texteSolution =
          "α = " + formatNombreFr(alphaS, 3) + " rad (asin(k))\n" +
          "x₁ = " + formatNombreFr(x1s, 3) + " + " + formatNombreFr(periodeS, 3) + "·m\n" +
          "x₂ = " + formatNombreFr(x2s, 3) + " + " + formatNombreFr(periodeS, 3) + "·m   (m∈ℤ)";
      }
    } else if (fn === "cos") {
      if (Math.abs(k) > 1) {
        aucuneSolution = true;
        texteSolution = "Aucune solution : |k| > 1, or cos(u) ∈ [−1 ; 1].";
      } else {
        var alphaC = Math.acos(k);
        points = [
          { u: alphaC, label: "α" },
          { u: -alphaC, label: "−α" },
        ];
        var periodeC = (2 * PI) / a;
        var x1c = (alphaC - b) / a, x2c = (-alphaC - b) / a;
        texteSolution =
          "α = " + formatNombreFr(alphaC, 3) + " rad (acos(k))\n" +
          "x₁ = " + formatNombreFr(x1c, 3) + " + " + formatNombreFr(periodeC, 3) + "·m\n" +
          "x₂ = " + formatNombreFr(x2c, 3) + " + " + formatNombreFr(periodeC, 3) + "·m   (m∈ℤ)";
      }
    } else {
      var alphaT = Math.atan(k);
      points = [
        { u: alphaT, label: "α" },
        { u: alphaT + PI, label: "π+α" },
      ];
      var periodeT = PI / a;
      var xT = (alphaT - b) / a;
      texteSolution =
        "α = " + formatNombreFr(alphaT, 3) + " rad (atan(k)) — une seule famille (période π)\n" +
        "x = " + formatNombreFr(xT, 3) + " + " + formatNombreFr(periodeT, 3) + "·m   (m∈ℤ)";
    }

    this._solution.innerHTML = texteSolution.split("\n").map(function (ligne) {
      return "<span>" + ligne.replace(/</g, "&lt;") + "</span>";
    }).join("<br>");

    this._dessinerCercle(fn, k, points, aucuneSolution);
  };

  if (!customElements.get("equation-trig-widget")) {
    customElements.define("equation-trig-widget", EquationTrigWidgetClass);
  }
})();
