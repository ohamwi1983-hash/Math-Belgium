(function () {
  "use strict";

  /* ================================================================
   * <identite-signe-widget> — atelier interactif : curseur sin θ (donné),
   * sélecteur de quadrant parmi les 2 quadrants compatibles avec son signe
   * — matérialise en direct le piège de la section : cos θ = ±√(1−sin²θ)
   * a TOUJOURS deux candidats, un seul est correct selon le quadrant.
   * Réglage par défaut (sin θ=0,6, quadrant II) reproduit exactement
   * l'exemple résolu (cos θ=−0,8, tan θ=−0,75). Web Component (Shadow DOM).
   * ================================================================ */

  var PI = Math.PI;
  var DEFAUT = { sin: 0.6, quadrant: "II" };
  var BORNES_SIN = { min: -0.99, max: 0.99, step: 0.01 };
  var QUADRANTS_POSITIFS = ["I", "II"];
  var QUADRANTS_NEGATIFS = ["III", "IV"];
  var SIGNE_COS = { I: 1, II: -1, III: -1, IV: 1 };

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
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:240px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.projection{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.angle-arc{stroke:var(--accent,#a8471f);stroke-width:1.6;fill:none;}' +
    '.droite-om{stroke:var(--accent,#a8471f);stroke-width:1.8;}' +
    '.point-m{fill:var(--accent,#a8471f);}' +
    '.angle-droit{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;fill:none;}' +
    '.etiquette{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-theta{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.quadrants{display:flex;gap:8px;justify-content:center;margin-bottom:12px;}' +
    '.quadrants button{flex:1 1 0;padding:8px 4px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.9rem;font-family:inherit;}' +
    '.quadrants button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.quadrants button:disabled{opacity:0.3;cursor:not-allowed;}' +
    '.candidats{display:flex;gap:10px;justify-content:center;margin:0 0 12px;flex-wrap:wrap;}' +
    '.candidat{font-family:var(--mono,monospace);font-size:0.9rem;font-weight:700;padding:6px 10px;border-radius:var(--radius,3px);}' +
    '.candidat-bon{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.candidat-mauvais{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);text-decoration:line-through;opacity:0.75;}' +
    '.resultat{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);line-height:1.7;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="quadrants" id="quadrants">' +
    '<button type="button" data-q="I">I</button>' +
    '<button type="button" data-q="II">II</button>' +
    '<button type="button" data-q="III">III</button>' +
    '<button type="button" data-q="IV">IV</button>' +
    '</div>' +
    '<div class="candidats" id="candidats"></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="sin">sin θ (donné)</label><div class="curseur-row">' +
    '<input type="range" id="sin" min="' + BORNES_SIN.min + '" max="' + BORNES_SIN.max + '" step="' + BORNES_SIN.step + '" value="' + DEFAUT.sin + '">' +
    '<span class="curseur-valeur" id="sin-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class IdentiteSigneWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  IdentiteSigneWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._sin = DEFAUT.sin;
    this._quadrant = DEFAUT.quadrant;
    this._svg = shadow.getElementById("svg");
    this._quadrantsWrap = shadow.getElementById("quadrants");
    this._candidats = shadow.getElementById("candidats");
    this._resultat = shadow.getElementById("resultat");
    this._inputSin = shadow.getElementById("sin");
    this._valeurSin = shadow.getElementById("sin-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  IdentiteSigneWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputSin = function () {
      self._sin = parseFloat(self._inputSin.value);
      var quadrantsValides = self._sin >= 0 ? QUADRANTS_POSITIFS : QUADRANTS_NEGATIFS;
      if (quadrantsValides.indexOf(self._quadrant) === -1) self._quadrant = quadrantsValides[0];
      self._rendre();
    };
    this._onClickQuadrant = function (evt) {
      var btn = evt.target.closest("button[data-q]");
      if (!btn || btn.disabled) return;
      self._quadrant = btn.getAttribute("data-q");
      self._rendre();
    };
    this._onReset = function () {
      self._sin = DEFAUT.sin;
      self._quadrant = DEFAUT.quadrant;
      self._inputSin.value = String(DEFAUT.sin);
      self._rendre();
    };
    this._inputSin.addEventListener("input", this._onInputSin);
    this._quadrantsWrap.addEventListener("click", this._onClickQuadrant);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  IdentiteSigneWidgetClass.prototype.disconnectedCallback = function () {
    this._inputSin.removeEventListener("input", this._onInputSin);
    this._quadrantsWrap.removeEventListener("click", this._onClickQuadrant);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  IdentiteSigneWidgetClass.prototype._dessinerCercle = function (theta) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 18, x2: C_CX + C_R + 18, y1: C_CY, y2: C_CY, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY + C_R + 18, y2: C_CY - C_R - 18, class: "axe", "marker-end": "url(#fleche)" }));

    var mx = C_CX + C_R * Math.cos(theta), my = C_CY - C_R * Math.sin(theta);
    var px = mx, py = C_CY;

    svg.appendChild(svgEl(ns, "line", { x1: mx.toFixed(2), y1: my.toFixed(2), x2: px.toFixed(2), y2: py.toFixed(2), class: "projection" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: px.toFixed(2), y2: py.toFixed(2), class: "projection" }));

    var tailleAngleDroit = 7;
    var dxDroit = px > C_CX ? -tailleAngleDroit : tailleAngleDroit;
    var dyDroit = my < C_CY ? tailleAngleDroit : -tailleAngleDroit;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + px.toFixed(2) + " " + py.toFixed(2) + " L" + (px + dxDroit).toFixed(2) + " " + py.toFixed(2) +
        " L" + (px + dxDroit).toFixed(2) + " " + (py + dyDroit).toFixed(2),
      class: "angle-droit",
    }));

    var rArc = 22;
    var arcEndX = C_CX + rArc * Math.cos(theta), arcEndY = C_CY - rArc * Math.sin(theta);
    var grandArc = theta > PI ? 1 : 0;
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + (C_CX + rArc) + " " + C_CY + " A" + rArc + " " + rArc + " 0 " + grandArc + " 0 " + arcEndX.toFixed(2) + " " + arcEndY.toFixed(2),
      class: "angle-arc",
    }));

    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: mx.toFixed(2), y2: my.toFixed(2), class: "droite-om" }));
    svg.appendChild(svgEl(ns, "circle", { cx: mx.toFixed(2), cy: my.toFixed(2), r: 5, class: "point-m" }));

    var procheDroite = mx > C_TAILLE - 50;
    var etM = svgEl(ns, "text", { x: (mx + (procheDroite ? -9 : 9)).toFixed(2), y: (my - 8).toFixed(2), "text-anchor": procheDroite ? "end" : "start", class: "etiquette-theta" });
    etM.textContent = "M(θ)";
    svg.appendChild(etM);

    var etO = svgEl(ns, "text", { x: C_CX - 9, y: C_CY + 16, class: "etiquette" });
    etO.textContent = "O";
    svg.appendChild(etO);

    var etP = svgEl(ns, "text", { x: px.toFixed(2), y: (py + 16).toFixed(2), "text-anchor": "middle", class: "etiquette" });
    etP.textContent = "P";
    svg.appendChild(etP);
  };

  IdentiteSigneWidgetClass.prototype._rendre = function () {
    var sinVal = this._sin;
    var quadrant = this._quadrant;
    this._valeurSin.textContent = formatNombreFr(sinVal, 2);

    var quadrantsValides = sinVal >= 0 ? QUADRANTS_POSITIFS : QUADRANTS_NEGATIFS;
    Array.prototype.forEach.call(this._quadrantsWrap.querySelectorAll("button"), function (btn) {
      var q = btn.getAttribute("data-q");
      var valide = quadrantsValides.indexOf(q) !== -1;
      btn.disabled = !valide;
      btn.className = q === quadrant && valide ? "actif" : "";
    });

    var thetaRef = Math.asin(Math.min(1, Math.abs(sinVal)));
    var theta;
    if (quadrant === "I") theta = thetaRef;
    else if (quadrant === "II") theta = PI - thetaRef;
    else if (quadrant === "III") theta = PI + thetaRef;
    else theta = 2 * PI - thetaRef;

    var carreSin = sinVal * sinVal;
    var carreCos = 1 - carreSin;
    var racineCos = Math.sqrt(Math.max(0, carreCos));
    var signeCorrect = SIGNE_COS[quadrant];
    var cosCorrect = signeCorrect * racineCos;
    var cosIncorrect = -signeCorrect * racineCos;
    var tanTheta = cosCorrect !== 0 ? sinVal / cosCorrect : NaN;

    this._candidats.innerHTML = "";
    var candidatBon = document.createElement("span");
    candidatBon.className = "candidat candidat-bon";
    candidatBon.textContent = "✓ cos θ = " + formatNombreFr(cosCorrect, 2) + " (quadrant " + quadrant + ")";
    var candidatMauvais = document.createElement("span");
    candidatMauvais.className = "candidat candidat-mauvais";
    candidatMauvais.textContent = "✗ cos θ = " + formatNombreFr(cosIncorrect, 2);
    this._candidats.appendChild(candidatBon);
    this._candidats.appendChild(candidatMauvais);

    this._resultat.textContent =
      "cos²θ = 1 − " + formatNombreFr(carreSin, 2) + " = " + formatNombreFr(carreCos, 2) + "  →  cos θ = ±" + formatNombreFr(racineCos, 2) +
      "  →  quadrant " + quadrant + " ⇒ cos θ = " + formatNombreFr(cosCorrect, 2) +
      "  →  tan θ = " + formatNombreFr(sinVal, 2) + " / " + formatNombreFr(cosCorrect, 2) + " = " + (isFinite(tanTheta) ? formatNombreFr(tanTheta, 2) : "indéfini");

    this._dessinerCercle(theta);
  };

  if (!customElements.get("identite-signe-widget")) {
    customElements.define("identite-signe-widget", IdentiteSigneWidgetClass);
  }
})();
