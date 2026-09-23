(function () {
  "use strict";

  /* ================================================================
   * <extremums-sinusoide-widget> — atelier interactif : curseurs A, ω, φ, b
   * pour f(x)=A sin(ωx+φ)+b, sélecteur maximums/minimums/réunis, et un
   * cercle trigonométrique reliant les deux familles à leur position FIXE
   * sur le cercle (u=π/2 pour les maximums, u=−π/2 pour les minimums,
   * toujours à π l'un de l'autre) — le piège central de la section : la
   * période effective des extremums réunis est divisée par deux. Web
   * Component (Shadow DOM), même langage visuel que cercle-trigo-widget
   * (2 panneaux SVG côte à côte).
   * ================================================================ */

  var DEUX_PI = 2 * Math.PI;
  var DEFAUT = { a: 2, omega: 1, phi: 0, b: 0, mode: "reunis" };
  var BORNES_A = { min: 1, max: 3, step: 0.5 };
  var BORNES_OMEGA = { min: 0.5, max: 2, step: 0.25 };
  var BORNES_PHI = { min: -Math.PI, max: Math.PI, step: 0.1 };
  var BORNES_B = { min: -2, max: 2, step: 0.5 };

  // --- Panneau cercle (u-espace, TOUJOURS le même cercle unité, jamais déformé) ---
  var C_TAILLE = 220, C_CX = 110, C_CY = 110, C_R = 78;

  // --- Panneau graphe (x-espace) — fenêtre FIXE, jamais recalculée depuis A/ω/φ/b : sinon les
  // axes bougeraient avec le curseur qu'on est justement en train de faire varier. Y borné par le
  // pire cas A_max+|b|_max = 3+2 = 5, avec marge.
  var X_MIN = -10, X_MAX = 10, Y_MIN = -6, Y_MAX = 6;
  var G_LARGEUR = 380, G_HAUTEUR = 260, G_MARGE_G = 30, G_MARGE_D = 14, G_MARGE_H = 16, G_MARGE_B = 30;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.panneaux{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:14px;}' +
    '.panneau{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;}' +
    '#svg-cercle{width:100%;max-width:220px;height:auto;display:block;}' +
    '#svg-graphe{width:100%;max-width:360px;height:auto;display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.cercle-ref{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;fill:none;}' +
    '.diametre{stroke:var(--plan,#5b4ea3);stroke-width:1.6;stroke-dasharray:4 3;opacity:0.7;}' +
    '.point-max{fill:var(--accent,#a8471f);}' +
    '.point-min{fill:var(--good,#2f7a4f);}' +
    '.point-estompe{fill:var(--ink-faint,#c9beae);}' +
    '.etiquette-max{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.etiquette-min{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etiquette-estompe{font-size:11px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette-pi{font-size:11.5px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--accent-ink,#7a3212);stroke-width:2.4;fill:none;}' +
    '.guide-extremum{stroke:var(--ink-faint,#c9beae);stroke-width:1;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.legende-panneau{text-align:center;font-size:0.8rem;color:var(--ink-faint,#9c9083);margin:4px 0 0;font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 0;min-width:96px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.98rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
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
    '<div class="ligne-select"><label for="mode">Montrer</label>' +
    '<select id="mode">' +
    '<option value="max">les maximums seuls</option>' +
    '<option value="min">les minimums seuls</option>' +
    '<option value="reunis">tous les extremums réunis</option>' +
    '</select></div>' +
    '<div class="panneaux">' +
    '<div><div class="panneau"><svg id="svg-cercle" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="legende-panneau">position fixe de u sur le cercle</p></div>' +
    '<div><div class="panneau"><svg id="svg-graphe" viewBox="0 0 ' + G_LARGEUR + ' ' + G_HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="legende-panneau">extremums de f sur le graphe</p></div>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">période effective</span><span class="stat-value" id="val-periode"></span></div>' +
    '</div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">A — amplitude</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="omega">ω — pulsation</label><div class="curseur-row">' +
    '<input type="range" id="omega" min="' + BORNES_OMEGA.min + '" max="' + BORNES_OMEGA.max + '" step="' + BORNES_OMEGA.step + '" value="' + DEFAUT.omega + '">' +
    '<span class="curseur-valeur" id="omega-valeur"></span></div></div>' +
    '<div class="curseur"><label for="phi">φ — déphasage</label><div class="curseur-row">' +
    '<input type="range" id="phi" min="' + BORNES_PHI.min + '" max="' + BORNES_PHI.max + '" step="' + BORNES_PHI.step + '" value="' + DEFAUT.phi + '">' +
    '<span class="curseur-valeur" id="phi-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b — décalage vertical</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ExtremumsSinusoideWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ExtremumsSinusoideWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._omega = DEFAUT.omega;
    this._phi = DEFAUT.phi;
    this._b = DEFAUT.b;
    this._mode = DEFAUT.mode;
    this._formule = shadow.getElementById("formule");
    this._selectMode = shadow.getElementById("mode");
    this._svgCercle = shadow.getElementById("svg-cercle");
    this._svgGraphe = shadow.getElementById("svg-graphe");
    this._valPeriode = shadow.getElementById("val-periode");
    this._inputA = shadow.getElementById("a");
    this._inputOmega = shadow.getElementById("omega");
    this._inputPhi = shadow.getElementById("phi");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurOmega = shadow.getElementById("omega-valeur");
    this._valeurPhi = shadow.getElementById("phi-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectMode.value = this._mode;
  };

  ExtremumsSinusoideWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._onInputOmega = function () { self._omega = parseFloat(self._inputOmega.value); self._rendre(); };
    this._onInputPhi = function () { self._phi = parseFloat(self._inputPhi.value); self._rendre(); };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._omega = DEFAUT.omega; self._phi = DEFAUT.phi; self._b = DEFAUT.b; self._mode = DEFAUT.mode;
      self._inputA.value = String(DEFAUT.a);
      self._inputOmega.value = String(DEFAUT.omega);
      self._inputPhi.value = String(DEFAUT.phi);
      self._inputB.value = String(DEFAUT.b);
      self._selectMode.value = DEFAUT.mode;
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputOmega.addEventListener("input", this._onInputOmega);
    this._inputPhi.addEventListener("input", this._onInputPhi);
    this._inputB.addEventListener("input", this._onInputB);
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ExtremumsSinusoideWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputOmega.removeEventListener("input", this._onInputOmega);
    this._inputPhi.removeEventListener("input", this._onInputPhi);
    this._inputB.removeEventListener("input", this._onInputB);
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  // Panneau cercle : les DEUX points (u=π/2 et u=−π/2) sont TOUJOURS aux mêmes deux positions,
  // quels que soient A/ω/φ/b — c'est tout le principe montré ici : en u, la condition
  // sin(u)=±1 ne dépend d'aucun de ces 4 paramètres, seule sa TRADUCTION en x en dépend (panneau
  // de droite). Le mode choisi ne fait qu'éclaircir/estomper les points, jamais déplacer le cercle.
  ExtremumsSinusoideWidgetClass.prototype._dessinerCercle = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgCercle;
    svg.innerHTML = "";
    var mode = this._mode;
    var montrerMax = mode === "max" || mode === "reunis";
    var montrerMin = mode === "min" || mode === "reunis";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "cercle-ref" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX - C_R - 16, x2: C_CX + C_R + 16, y1: C_CY, y2: C_CY, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, x2: C_CX, y1: C_CY + C_R + 16, y2: C_CY - C_R - 16, class: "axe", "marker-end": "url(#fleche)" }));

    var pMax = { x: C_CX, y: C_CY - C_R };
    var pMin = { x: C_CX, y: C_CY + C_R };

    // Diamètre reliant les deux points quand ils sont réunis : exactement π rad d'écart, jamais
    // plus ni moins — c'est cette moitié de tour qui devient la période effective π/ω en x.
    if (mode === "reunis") {
      svg.appendChild(svgEl(ns, "line", { x1: pMax.x, y1: pMax.y, x2: pMin.x, y2: pMin.y, class: "diametre" }));
      var etPi = svgEl(ns, "text", { x: C_CX + 8, y: C_CY + 4, class: "etiquette-pi" });
      etPi.textContent = "π rad";
      svg.appendChild(etPi);
    }

    svg.appendChild(svgEl(ns, "circle", { cx: pMax.x, cy: pMax.y, r: 5, class: montrerMax ? "point-max" : "point-estompe" }));
    var etMax = svgEl(ns, "text", { x: pMax.x, y: pMax.y - 10, "text-anchor": "middle", class: montrerMax ? "etiquette-max" : "etiquette-estompe" });
    etMax.textContent = "max : sin(u)=1";
    svg.appendChild(etMax);

    svg.appendChild(svgEl(ns, "circle", { cx: pMin.x, cy: pMin.y, r: 5, class: montrerMin ? "point-min" : "point-estompe" }));
    var etMin = svgEl(ns, "text", { x: pMin.x, y: pMin.y + 18, "text-anchor": "middle", class: montrerMin ? "etiquette-min" : "etiquette-estompe" });
    etMin.textContent = "min : sin(u)=−1";
    svg.appendChild(etMin);
  };

  ExtremumsSinusoideWidgetClass.prototype._toPxGraphe = function (xMath, yMath) {
    var zoneL = G_LARGEUR - G_MARGE_G - G_MARGE_D;
    var zoneH = G_HAUTEUR - G_MARGE_H - G_MARGE_B;
    var px = G_MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * zoneL;
    var py = G_HAUTEUR - G_MARGE_B - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * zoneH;
    return [px, py];
  };

  ExtremumsSinusoideWidgetClass.prototype._dessinerGraphe = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgGraphe;
    svg.innerHTML = "";
    var self = this;
    var a = this._a, omega = this._omega, phi = this._phi, b = this._b, mode = this._mode;
    var f = function (x) { return a * Math.sin(omega * x + phi) + b; };

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche2", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPxGraphe(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: G_LARGEUR - G_MARGE_D, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche2)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: G_HAUTEUR - G_MARGE_B, y2: G_MARGE_H, class: "axe", "marker-end": "url(#fleche2)" }));
    var etiqX = svgEl(ns, "text", { x: G_LARGEUR - G_MARGE_D + 2, y: origine[1] + 12, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    var n = 500, courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = f(xx);
      var valide = yy >= Y_MIN - 0.3 && yy <= Y_MAX + 0.3;
      if (valide) {
        var p = self._toPxGraphe(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      }
      dernierValide = valide;
    }
    if (courant) svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: "courbe" }));

    // Marqueurs d'extremums : u = π/2 + kπ (réunis), ou seulement les k pairs (max) / impairs
    // (min) selon le mode — kMin/kMax élargis pour couvrir toute la fenêtre visible même au ω
    // le plus petit.
    var kMin = Math.floor((omega * X_MIN + phi - Math.PI / 2) / Math.PI) - 1;
    var kMax = Math.ceil((omega * X_MAX + phi - Math.PI / 2) / Math.PI) + 1;
    for (var k = kMin; k <= kMax; k++) {
      var estMax = k % 2 === 0; // k pair -> u=π/2+2mπ (max) ; k impair -> u=3π/2+2mπ (min)
      if (mode === "max" && !estMax) continue;
      if (mode === "min" && estMax) continue;
      var xExt = (Math.PI / 2 + k * Math.PI - phi) / omega;
      if (xExt < X_MIN || xExt > X_MAX) continue;
      var yExt = f(xExt);
      if (yExt < Y_MIN || yExt > Y_MAX) continue;
      var pExt = self._toPxGraphe(xExt, yExt);
      var pAxe = self._toPxGraphe(xExt, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pExt[0].toFixed(2), y1: pAxe[1].toFixed(2), x2: pExt[0].toFixed(2), y2: pExt[1].toFixed(2), class: "guide-extremum" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pExt[0].toFixed(2), cy: pExt[1].toFixed(2), r: 4.5, class: estMax ? "point-max" : "point-min" }));
    }
  };

  ExtremumsSinusoideWidgetClass.prototype._rendre = function () {
    var a = this._a, omega = this._omega, phi = this._phi, b = this._b, mode = this._mode;
    this._formule.textContent = "f(x) = " + formatNombreFr(a, 1) + " sin(" + formatNombreFr(omega, 2) + "x " + (phi >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(phi), 2) + ") " + (b >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(b), 1);
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurOmega.textContent = formatNombreFr(omega, 2);
    this._valeurPhi.textContent = formatNombreFr(phi, 2);
    this._valeurB.textContent = formatNombreFr(b, 1);

    var periode = mode === "reunis" ? Math.PI / omega : DEUX_PI / omega;
    this._valPeriode.textContent = formatNombreFr(periode, 2) + (mode === "reunis" ? " (= π/ω)" : " (= 2π/ω)");

    this._dessinerCercle();
    this._dessinerGraphe();
  };

  if (!customElements.get("extremums-sinusoide-widget")) {
    customElements.define("extremums-sinusoide-widget", ExtremumsSinusoideWidgetClass);
  }
})();
