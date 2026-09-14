(function () {
  "use strict";

  /* ================================================================
   * <sinusoide-widget> — atelier interactif f(x) = A sin(ωx + φ) + b.
   * Web Component (Shadow DOM) : aucun conflit avec les styles de la page,
   * couleurs empruntées aux variables CSS du thème (héritées à travers la
   * frontière du Shadow DOM) pour suivre le thème clair/sombre du lecteur.
   * ================================================================ */

  var DEFAUT = { a: 2, omega: 1, phi: 0, b: 0 };
  var BORNES = {
    a: { min: 0.5, max: 4, step: 0.1 },
    omega: { min: 0.5, max: 3, step: 0.1 },
    phi: { min: -3.14, max: 3.14, step: 0.1 },
    b: { min: -3, max: 3, step: 0.1 },
  };
  // Bornes de T déduites de celles de ω (T=2π/ω, relation strictement décroissante) — T et ω sont
  // deux curseurs pour la MÊME grandeur sous-jacente, toujours synchronisés (voir _onInputT/
  // _onInputOmega) : bouger l'un recalcule et repositionne l'autre.
  BORNES.t = {
    min: +(2 * Math.PI / BORNES.omega.max).toFixed(2),
    max: +(2 * Math.PI / BORNES.omega.min).toFixed(2),
    step: 0.1,
  };
  var LARGEUR = 520, HAUTEUR = 360, MARGE = 34;
  // Fenêtres FIXES (indépendantes des paramètres courants) — piège vérifié en pratique : une
  // fenêtre qui se recadre automatiquement sur "la courbe actuelle" (ex. toujours N périodes
  // visibles, ou toujours cadrée exactement sur max/min) ANNULE VISUELLEMENT l'effet du paramètre
  // qu'elle compense. Repéré ainsi sur ce widget : la première version recalculait la fenêtre X
  // pour montrer TOUJOURS exactement 5 périodes quel que soit ω — le curseur ω semblait donc "ne
  // rien faire" (signalé par l'utilisateur), alors qu'il changeait bien `omega` en interne : le
  // zoom compensait exactement le changement de fréquence, rendu pixel par pixel identique. Fenêtre
  // X fixe = ±4π (assez large pour montrer une période entière de chaque côté même au T max, ~12,6)
  // ; fenêtre Y fixe = ±8 (couvre le pire cas b±A = ±3±4 = ±7, plus marge) — A et b restent
  // maintenant visibles dans leurs effets (courbe plus haute/basse, décalée) au lieu d'être
  // compensés par un cadrage automatique sur leurs propres valeurs.
  var X_DEMI = 4 * Math.PI;
  var Y_MIN = -8, Y_MAX = 8;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function formatFormule(a, omega, phi, b) {
    var sPhi = (phi >= 0 ? " + " : " − ") + formatNombreFr(Math.abs(phi), 2);
    var sB = b === 0 ? "" : (b > 0 ? " + " : " − ") + formatNombreFr(Math.abs(b), 1);
    return "f(x) = " + formatNombreFr(a, 1) + " sin(" + formatNombreFr(omega, 1) + "x" + sPhi + ")" + sB;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.25rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;min-height:1.6rem;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:520px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.periode-tick{stroke:var(--line,#e2d8c8);stroke-width:1;stroke-dasharray:4 3;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.ligne-b{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.ligne-extreme{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-extreme{font-size:11.5px;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etiquette-b{font-size:11.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:nowrap;margin-bottom:20px;}' +
    '.stat{flex:1 1 0;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;text-transform:uppercase;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.curseurs{display:flex;flex-direction:column;gap:14px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:14px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Maximum</span><span class="stat-value" id="val-max"></span></div>' +
    '<div class="stat"><span class="stat-label">Minimum</span><span class="stat-value" id="val-min"></span></div>' +
    '</div>' +
    '<div class="curseurs">' +
    '<div class="curseur"><label for="a">A — amplitude</label><div class="curseur-row"><input type="range" id="a" min="' + BORNES.a.min + '" max="' + BORNES.a.max + '" step="' + BORNES.a.step + '" value="' + DEFAUT.a + '"><span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="t">T — période</label><div class="curseur-row"><input type="range" id="t" min="' + BORNES.t.min + '" max="' + BORNES.t.max + '" step="' + BORNES.t.step + '"><span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<div class="curseur"><label for="omega">ω — pulsation</label><div class="curseur-row"><input type="range" id="omega" min="' + BORNES.omega.min + '" max="' + BORNES.omega.max + '" step="' + BORNES.omega.step + '" value="' + DEFAUT.omega + '"><span class="curseur-valeur" id="omega-valeur"></span></div></div>' +
    '<div class="curseur"><label for="phi">φ — déphasage</label><div class="curseur-row"><input type="range" id="phi" min="' + BORNES.phi.min + '" max="' + BORNES.phi.max + '" step="' + BORNES.phi.step + '" value="' + DEFAUT.phi + '"><span class="curseur-valeur" id="phi-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b — décalage vertical</label><div class="curseur-row"><input type="range" id="b" min="' + BORNES.b.min + '" max="' + BORNES.b.max + '" step="' + BORNES.b.step + '" value="' + DEFAUT.b + '"><span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SinusoideWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SinusoideWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a; this._omega = DEFAUT.omega; this._phi = DEFAUT.phi; this._b = DEFAUT.b;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputA = shadow.getElementById("a");
    this._inputT = shadow.getElementById("t");
    this._inputOmega = shadow.getElementById("omega");
    this._inputPhi = shadow.getElementById("phi");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurT = shadow.getElementById("t-valeur");
    this._valeurOmega = shadow.getElementById("omega-valeur");
    this._valeurPhi = shadow.getElementById("phi-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valMax = shadow.getElementById("val-max");
    this._valMin = shadow.getElementById("val-min");
    this._resetBtn = shadow.getElementById("reset");
  };

  SinusoideWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      self._a = parseFloat(self._inputA.value);
      self._rendre();
    };
    // T et ω partagent la même grandeur (T=2π/ω) : bouger l'un recalcule et repositionne l'autre,
    // plutôt que deux curseurs indépendants qui pourraient se contredire.
    this._onInputT = function () {
      var t = parseFloat(self._inputT.value);
      self._omega = clamp((2 * Math.PI) / t, BORNES.omega.min, BORNES.omega.max);
      self._inputOmega.value = String(self._omega);
      self._rendre();
    };
    this._onInputOmega = function () {
      self._omega = parseFloat(self._inputOmega.value);
      var t = clamp((2 * Math.PI) / self._omega, BORNES.t.min, BORNES.t.max);
      self._inputT.value = String(t);
      self._rendre();
    };
    this._onInputPhi = function () {
      self._phi = parseFloat(self._inputPhi.value);
      self._rendre();
    };
    this._onInputB = function () {
      self._b = parseFloat(self._inputB.value);
      self._rendre();
    };
    this._onReset = function () {
      self._a = DEFAUT.a; self._omega = DEFAUT.omega; self._phi = DEFAUT.phi; self._b = DEFAUT.b;
      self._inputA.value = String(DEFAUT.a);
      self._inputOmega.value = String(DEFAUT.omega);
      self._inputT.value = String((2 * Math.PI) / DEFAUT.omega);
      self._inputPhi.value = String(DEFAUT.phi);
      self._inputB.value = String(DEFAUT.b);
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputT.addEventListener("input", this._onInputT);
    this._inputOmega.addEventListener("input", this._onInputOmega);
    this._inputPhi.addEventListener("input", this._onInputPhi);
    this._inputB.addEventListener("input", this._onInputB);
    this._resetBtn.addEventListener("click", this._onReset);
    this._inputT.value = String((2 * Math.PI) / this._omega);
    this._rendre();
  };

  SinusoideWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputT.removeEventListener("input", this._onInputT);
    this._inputOmega.removeEventListener("input", this._onInputOmega);
    this._inputPhi.removeEventListener("input", this._onInputPhi);
    this._inputB.removeEventListener("input", this._onInputB);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SinusoideWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath + X_DEMI) / (2 * X_DEMI) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  SinusoideWidgetClass.prototype._rendre = function () {
    var a = this._a, omega = this._omega, phi = this._phi, b = this._b;
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurOmega.textContent = formatNombreFr(omega, 1);
    this._valeurPhi.textContent = formatNombreFr(phi, 2);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._formule.textContent = formatFormule(a, omega, phi, b);

    var T = (2 * Math.PI) / omega;
    this._valeurT.textContent = formatNombreFr(T, 2);
    var maxi = b + a, mini = b - a;
    this._valMax.textContent = formatNombreFr(maxi, 1);
    this._valMin.textContent = formatNombreFr(mini, 1);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    // Repères verticaux à chaque période (k·T), pour rendre la période directement lisible sur le
    // graphe — leur NOMBRE varie maintenant avec T (fenêtre X fixe), ce qui montre concrètement
    // que changer ω compresse/étire la courbe, au lieu d'un nombre de repères toujours constant.
    var kMin = Math.ceil(-X_DEMI / T), kMax = Math.floor(X_DEMI / T);
    for (var k = kMin; k <= kMax; k++) {
      if (k === 0) continue;
      var xk = k * T;
      var pxk = self._toPx(xk, 0)[0];
      var lt = document.createElementNS(ns, "line");
      lt.setAttribute("x1", pxk); lt.setAttribute("x2", pxk);
      lt.setAttribute("y1", MARGE); lt.setAttribute("y2", HAUTEUR - MARGE);
      lt.setAttribute("class", "periode-tick");
      svg.appendChild(lt);
      var origineY = self._toPx(0, 0)[1];
      var etk = document.createElementNS(ns, "text");
      etk.setAttribute("x", pxk); etk.setAttribute("y", Math.min(origineY + 16, HAUTEUR - MARGE + 16));
      etk.setAttribute("text-anchor", "middle");
      etk.setAttribute("class", "etiquette");
      etk.textContent = (k === 1 ? "T" : k === -1 ? "−T" : k + "T");
      svg.appendChild(etk);
    }

    var origine = self._toPx(0, 0);
    var axeX = document.createElementNS(ns, "line");
    axeX.setAttribute("x1", MARGE); axeX.setAttribute("x2", LARGEUR - MARGE);
    axeX.setAttribute("y1", origine[1]); axeX.setAttribute("y2", origine[1]);
    axeX.setAttribute("class", "axe");
    svg.appendChild(axeX);
    var axeY = document.createElementNS(ns, "line");
    axeY.setAttribute("x1", origine[0]); axeY.setAttribute("x2", origine[0]);
    axeY.setAttribute("y1", MARGE); axeY.setAttribute("y2", HAUTEUR - MARGE);
    axeY.setAttribute("class", "axe");
    svg.appendChild(axeY);

    var etiqX = document.createElementNS(ns, "text");
    etiqX.setAttribute("x", LARGEUR - MARGE + 6); etiqX.setAttribute("y", origine[1] + 4);
    etiqX.setAttribute("class", "etiquette"); etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = document.createElementNS(ns, "text");
    etiqY.setAttribute("x", origine[0] + 6); etiqY.setAttribute("y", MARGE - 10);
    etiqY.setAttribute("class", "etiquette"); etiqY.textContent = "y";
    svg.appendChild(etiqY);

    // Ligne moyenne y=b
    if (b >= Y_MIN && b <= Y_MAX) {
      var pB = self._toPx(0, b)[1];
      var ligneB = document.createElementNS(ns, "line");
      ligneB.setAttribute("x1", MARGE); ligneB.setAttribute("x2", LARGEUR - MARGE);
      ligneB.setAttribute("y1", pB); ligneB.setAttribute("y2", pB);
      ligneB.setAttribute("class", "ligne-b");
      svg.appendChild(ligneB);
      var etB = document.createElementNS(ns, "text");
      etB.setAttribute("x", MARGE + 4); etB.setAttribute("y", pB - 5);
      etB.setAttribute("class", "etiquette-b"); etB.textContent = "y = b";
      svg.appendChild(etB);
    }

    // Lignes max/min
    [["max", maxi], ["min", mini]].forEach(function (paire) {
      var y = paire[1];
      if (y < Y_MIN || y > Y_MAX) return;
      var py = self._toPx(0, y)[1];
      var lig = document.createElementNS(ns, "line");
      lig.setAttribute("x1", MARGE); lig.setAttribute("x2", LARGEUR - MARGE);
      lig.setAttribute("y1", py); lig.setAttribute("y2", py);
      lig.setAttribute("class", "ligne-extreme");
      svg.appendChild(lig);
      var et = document.createElementNS(ns, "text");
      et.setAttribute("x", LARGEUR - MARGE - 4); et.setAttribute("y", py - 5);
      et.setAttribute("text-anchor", "end");
      et.setAttribute("class", "etiquette-extreme");
      et.textContent = paire[0] + " = " + formatNombreFr(y, 1);
      svg.appendChild(et);
    });

    // Courbe f(x) = A sin(ωx+φ) + b
    var n = 500, d = "";
    for (var i = 0; i <= n; i++) {
      var xx = -X_DEMI + (i / n) * (2 * X_DEMI);
      var yy = a * Math.sin(omega * xx + phi) + b;
      var pt = self._toPx(xx, yy);
      d += (i === 0 ? "M" : "L") + pt[0].toFixed(2) + " " + pt[1].toFixed(2) + " ";
    }
    var chemin = document.createElementNS(ns, "path");
    chemin.setAttribute("d", d.trim());
    chemin.setAttribute("class", "courbe");
    svg.appendChild(chemin);
  };

  if (!customElements.get("sinusoide-widget")) {
    customElements.define("sinusoide-widget", SinusoideWidgetClass);
  }
})();
