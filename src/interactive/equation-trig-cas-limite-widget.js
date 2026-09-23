(function () {
  "use strict";

  /* ================================================================
   * <equation-trig-cas-limite-widget> — atelier interactif : sélecteur
   * sin/cos/tan, curseur k — matérialise en direct le callout « cas
   * limites » de la section : pour sin/cos, les 2 solutions se
   * rapprochent puis fusionnent en UNE seule quand k→±1 ; pour tan, il y
   * a TOUJOURS exactement 2 solutions sur [0°;360°[, quel que soit k.
   * Réglage par défaut (cos α=−1/2) reproduit exactement l'exemple
   * résolu (α=120° ou 240°). Le cercle de référence ne dépend JAMAIS de
   * k au niveau de sa fenêtre (rayon fixe) — seuls les points bougent.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var D2R = Math.PI / 180;
  var DEFAUT = { fn: "cos", k: -0.5 };
  var BORNES_K_SINCOS = { min: -1, max: 1, step: 0.01 };
  var BORNES_K_TAN = { min: -4, max: 4, step: 0.05 };

  var C_TAILLE = 240, C_CX = 120, C_CY = 120, C_R = 84;

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
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:240px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.corde{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:4 3;opacity:0.85;}' +
    '.repere{stroke:var(--bad,#b23a3a);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.point-u{fill:var(--accent,#a8471f);}' +
    '.point-limite{fill:var(--good,#2f7a4f);}' +
    '.etiquette-u{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-repere{font-size:11px;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-normal{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.verdict-limite{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-tan{color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><select id="fn">' +
    '<option value="sin">sin α</option>' +
    '<option value="cos">cos α</option>' +
    '<option value="tan">tan α</option>' +
    '</select><span class="formule">= k</span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="k">k</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K_SINCOS.min + '" max="' + BORNES_K_SINCOS.max + '" step="' + BORNES_K_SINCOS.step + '" value="' + DEFAUT.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class EquationTrigCasLimiteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  EquationTrigCasLimiteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._fn = DEFAUT.fn;
    this._k = DEFAUT.k;
    this._svg = shadow.getElementById("svg");
    this._selectFn = shadow.getElementById("fn");
    this._verdict = shadow.getElementById("verdict");
    this._inputK = shadow.getElementById("k");
    this._valeurK = shadow.getElementById("k-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectFn.value = this._fn;
  };

  EquationTrigCasLimiteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputK = function () { self._k = parseFloat(self._inputK.value); self._rendre(); };
    this._onChangeFn = function () {
      self._fn = self._selectFn.value;
      var bornesK = self._fn === "tan" ? BORNES_K_TAN : BORNES_K_SINCOS;
      self._inputK.min = String(bornesK.min);
      self._inputK.max = String(bornesK.max);
      self._inputK.step = String(bornesK.step);
      self._k = Math.max(bornesK.min, Math.min(bornesK.max, self._k));
      self._inputK.value = String(self._k);
      self._rendre();
    };
    this._onReset = function () {
      self._fn = DEFAUT.fn;
      self._k = DEFAUT.k;
      self._selectFn.value = DEFAUT.fn;
      self._inputK.min = String(BORNES_K_SINCOS.min);
      self._inputK.max = String(BORNES_K_SINCOS.max);
      self._inputK.step = String(BORNES_K_SINCOS.step);
      self._inputK.value = String(DEFAUT.k);
      self._rendre();
    };
    this._inputK.addEventListener("input", this._onInputK);
    this._selectFn.addEventListener("change", this._onChangeFn);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  EquationTrigCasLimiteWidgetClass.prototype.disconnectedCallback = function () {
    this._inputK.removeEventListener("input", this._onInputK);
    this._selectFn.removeEventListener("change", this._onChangeFn);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  EquationTrigCasLimiteWidgetClass.prototype._pointCercle = function (thetaRad) {
    return [C_CX + C_R * Math.cos(thetaRad), C_CY - C_R * Math.sin(thetaRad)];
  };

  EquationTrigCasLimiteWidgetClass.prototype._etiquettePoint = function (svg, ns, px, py, texte) {
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

  EquationTrigCasLimiteWidgetClass.prototype._rendre = function () {
    var fn = this._fn, k = this._k;
    this._valeurK.textContent = formatNombreFr(k, 2);

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

    var points = [];
    var casLimite = false;

    if (fn === "sin") {
      var yRepere = C_CY - k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 10, x2: C_CX + C_R + 10, y1: yRepere.toFixed(2), y2: yRepere.toFixed(2), class: "repere" }));
      var etRep = svgEl(ns, "text", { x: (C_CX + C_R + 12).toFixed(2), y: (yRepere + 4).toFixed(2), class: "etiquette-repere" });
      etRep.textContent = "y=k";
      svg.appendChild(etRep);

      var alphaS = Math.asin(k);
      casLimite = Math.abs(Math.abs(k) - 1) < 1e-6;
      if (casLimite) {
        points = [{ theta: alphaS, label: k > 0 ? "α=90°" : "α=270°" }];
      } else {
        points = [
          { theta: alphaS, label: "α₁=" + formatNombreFr(alphaS / D2R, 1) + "°" },
          { theta: Math.PI - alphaS, label: "α₂=" + formatNombreFr((Math.PI - alphaS) / D2R, 1) + "°" },
        ];
      }
    } else if (fn === "cos") {
      var xRepere = C_CX + k * C_R;
      svg.appendChild(svgEl(ns, "line", { x1: xRepere.toFixed(2), x2: xRepere.toFixed(2), y1: C_CY - C_R - 10, y2: C_CY + C_R + 10, class: "repere" }));
      var etRep2 = svgEl(ns, "text", { x: (xRepere + 4).toFixed(2), y: (C_CY - C_R - 14).toFixed(2), "text-anchor": "middle", class: "etiquette-repere" });
      etRep2.textContent = "x=k";
      svg.appendChild(etRep2);

      var alphaC = Math.acos(k);
      casLimite = Math.abs(Math.abs(k) - 1) < 1e-6;
      if (casLimite) {
        points = [{ theta: alphaC, label: k > 0 ? "α=0°" : "α=180°" }];
      } else {
        var deg1 = formatNombreFr(alphaC / D2R, 1), deg2 = formatNombreFr((2 * Math.PI - alphaC) / D2R, 1);
        points = [
          { theta: alphaC, label: "α₁=" + deg1 + "°" },
          { theta: 2 * Math.PI - alphaC, label: "α₂=" + deg2 + "°" },
        ];
      }
    } else {
      var alphaT = Math.atan(k);
      var theta1 = alphaT < 0 ? alphaT + 2 * Math.PI : alphaT;
      var theta2 = theta1 + Math.PI > 2 * Math.PI - 1e-9 ? theta1 - Math.PI : theta1 + Math.PI;
      points = [
        { theta: theta1, label: "α₁=" + formatNombreFr((theta1 / D2R + 360) % 360, 1) + "°" },
        { theta: theta2, label: "α₂=" + formatNombreFr((theta2 / D2R + 360) % 360, 1) + "°" },
      ];
    }

    if (points.length === 2) {
      var p0 = self._pointCercle(points[0].theta), p1 = self._pointCercle(points[1].theta);
      svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "corde" }));
    }
    points.forEach(function (pt) {
      var p = self._pointCercle(pt.theta);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 5, class: casLimite ? "point-limite" : "point-u" }));
      self._etiquettePoint(svg, ns, p[0], p[1], pt.label);
    });

    var fnTexte = fn === "sin" ? "sin" : fn === "cos" ? "cos" : "tan";
    if (fn === "tan") {
      this._verdict.className = "verdict verdict-tan";
      this._verdict.textContent = "tan α = " + formatNombreFr(k, 2) + " → TOUJOURS 2 solutions sur [0°;360°[ (" + points[0].label + ", " + points[1].label + "), quel que soit k — la tangente couvre sa période 2 fois.";
    } else if (casLimite) {
      this._verdict.className = "verdict verdict-limite";
      this._verdict.textContent = fnTexte + " α = " + formatNombreFr(k, 2) + " (cas limite, |k|=1) → les 2 solutions fusionnent en UNE seule : " + points[0].label + ".";
    } else {
      this._verdict.className = "verdict verdict-normal";
      this._verdict.textContent = fnTexte + " α = " + formatNombreFr(k, 2) + " → 2 solutions : " + points[0].label + " et " + points[1].label + ".";
    }
  };

  if (!customElements.get("equation-trig-cas-limite-widget")) {
    customElements.define("equation-trig-cas-limite-widget", EquationTrigCasLimiteWidgetClass);
  }
})();
