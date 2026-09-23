(function () {
  "use strict";

  /* ================================================================
   * <modele-sinusoidal-widget> — atelier interactif : construit pas à pas
   * le modèle hauteur(t) = A sin(ωt+φ) + b d'une grande roue, à partir de 4
   * réglages concrets (rayon r, hauteur du centre h, période T, position de
   * départ) — reproduit exactement la méthode de la section (A,b depuis les
   * extrêmes ; ω depuis T ; φ depuis la condition initiale, jamais réglé
   * directement : il est DÉDUIT de la position de départ choisie). Panneau
   * cercle (position de départ sur la roue) + panneau courbe (hauteur(t)).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEUX_PI = 2 * Math.PI;
  var DEFAUT = { r: 15, h: 17, t: 8, position: "bas" };
  var BORNES_R = { min: 5, max: 15, step: 1 };
  var BORNES_H = { min: 15, max: 25, step: 1 };
  var BORNES_T = { min: 4, max: 12, step: 1 };

  var PHI_PAR_POSITION = {
    bas: -Math.PI / 2,
    haut: Math.PI / 2,
    montant: 0,
    descendant: Math.PI,
  };
  var LABEL_POSITION = {
    bas: "point le plus bas",
    haut: "point le plus haut",
    montant: "à mi-hauteur, en montant",
    descendant: "à mi-hauteur, en descendant",
  };

  // --- Panneau cercle (position de départ sur la roue) — même convention d'orientation que
  // cercle-trigo-widget : angle u standard, point = (cx + R cos u, cy − R sin u).
  var C_TAILLE = 220, C_CX = 110, C_CY = 110, C_R = 78;

  // --- Panneau courbe — fenêtre FIXE, jamais recalculée depuis r/h/T/position : x couvre 2×T_max
  // (24), y borné par le pire cas h_max+r_max=40 / h_min−r_max=0, avec marge.
  var X_MIN = 0, X_MAX = 24, Y_MIN = -2, Y_MAX = 42;
  var G_LARGEUR = 380, G_HAUTEUR = 260, G_MARGE_G = 34, G_MARGE_D = 14, G_MARGE_H = 16, G_MARGE_B = 30;

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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.panneaux{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;margin-bottom:14px;}' +
    '.panneau{background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);padding:6px;}' +
    '#svg-cercle{width:100%;max-width:220px;height:auto;display:block;}' +
    '#svg-graphe{width:100%;max-width:360px;height:auto;display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.roue{stroke:var(--ink-faint,#9c9083);stroke-width:1.6;fill:none;}' +
    '.rayon{stroke:var(--plan,#5b4ea3);stroke-width:1.8;}' +
    '.centre{fill:var(--ink-soft,#6b6055);}' +
    '.point-depart{fill:var(--accent,#a8471f);}' +
    '.etiquette-depart{font-size:11.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.courbe{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.ligne-extreme{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:5 4;}' +
    '.point-t0{fill:var(--accent,#a8471f);}' +
    '.point-verif{fill:var(--plan,#5b4ea3);}' +
    '.guide{stroke:var(--ink-faint,#c9beae);stroke-width:1;stroke-dasharray:3 3;}' +
    '.etiquette{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.legende-panneau{text-align:center;font-size:0.8rem;color:var(--ink-faint,#9c9083);margin:4px 0 0;font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:18px;}' +
    '.stat{flex:1 1 78px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 4px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.verif{text-align:center;font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:0 0 16px;padding:8px 12px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
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
    '<div class="ligne-select"><label for="position">Position de départ (t=0)</label>' +
    '<select id="position">' +
    '<option value="bas">point le plus bas</option>' +
    '<option value="haut">point le plus haut</option>' +
    '<option value="montant">mi-hauteur, en montant</option>' +
    '<option value="descendant">mi-hauteur, en descendant</option>' +
    '</select></div>' +
    '<div class="panneaux">' +
    '<div><div class="panneau"><svg id="svg-cercle" viewBox="0 0 ' + C_TAILLE + ' ' + C_TAILLE + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="legende-panneau">position de départ sur la roue</p></div>' +
    '<div><div class="panneau"><svg id="svg-graphe" viewBox="0 0 ' + G_LARGEUR + ' ' + G_HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="legende-panneau">hauteur(t)</p></div>' +
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">A</span><span class="stat-value" id="val-a"></span></div>' +
    '<div class="stat"><span class="stat-label">b</span><span class="stat-value" id="val-b"></span></div>' +
    '<div class="stat"><span class="stat-label">ω</span><span class="stat-value" id="val-omega"></span></div>' +
    '<div class="stat"><span class="stat-label">φ</span><span class="stat-value" id="val-phi"></span></div>' +
    '</div>' +
    '<p class="verif" id="verif"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r">r — rayon (m)</label><div class="curseur-row">' +
    '<input type="range" id="r" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r + '">' +
    '<span class="curseur-valeur" id="r-valeur"></span></div></div>' +
    '<div class="curseur"><label for="h">h — hauteur du centre (m)</label><div class="curseur-row">' +
    '<input type="range" id="h" min="' + BORNES_H.min + '" max="' + BORNES_H.max + '" step="' + BORNES_H.step + '" value="' + DEFAUT.h + '">' +
    '<span class="curseur-valeur" id="h-valeur"></span></div></div>' +
    '<div class="curseur"><label for="t">T — période (min)</label><div class="curseur-row">' +
    '<input type="range" id="t" min="' + BORNES_T.min + '" max="' + BORNES_T.max + '" step="' + BORNES_T.step + '" value="' + DEFAUT.t + '">' +
    '<span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ModeleSinusoidalWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ModeleSinusoidalWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._r = DEFAUT.r;
    this._h = DEFAUT.h;
    this._t = DEFAUT.t;
    this._position = DEFAUT.position;
    this._formule = shadow.getElementById("formule");
    this._selectPosition = shadow.getElementById("position");
    this._svgCercle = shadow.getElementById("svg-cercle");
    this._svgGraphe = shadow.getElementById("svg-graphe");
    this._valA = shadow.getElementById("val-a");
    this._valB = shadow.getElementById("val-b");
    this._valOmega = shadow.getElementById("val-omega");
    this._valPhi = shadow.getElementById("val-phi");
    this._verif = shadow.getElementById("verif");
    this._inputR = shadow.getElementById("r");
    this._inputH = shadow.getElementById("h");
    this._inputT = shadow.getElementById("t");
    this._valeurR = shadow.getElementById("r-valeur");
    this._valeurH = shadow.getElementById("h-valeur");
    this._valeurT = shadow.getElementById("t-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectPosition.value = this._position;
  };

  ModeleSinusoidalWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputR = function () { self._r = parseFloat(self._inputR.value); self._rendre(); };
    this._onInputH = function () { self._h = parseFloat(self._inputH.value); self._rendre(); };
    this._onInputT = function () { self._t = parseFloat(self._inputT.value); self._rendre(); };
    this._onChangePosition = function () { self._position = self._selectPosition.value; self._rendre(); };
    this._onReset = function () {
      self._r = DEFAUT.r; self._h = DEFAUT.h; self._t = DEFAUT.t; self._position = DEFAUT.position;
      self._inputR.value = String(DEFAUT.r);
      self._inputH.value = String(DEFAUT.h);
      self._inputT.value = String(DEFAUT.t);
      self._selectPosition.value = DEFAUT.position;
      self._rendre();
    };
    this._inputR.addEventListener("input", this._onInputR);
    this._inputH.addEventListener("input", this._onInputH);
    this._inputT.addEventListener("input", this._onInputT);
    this._selectPosition.addEventListener("change", this._onChangePosition);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ModeleSinusoidalWidgetClass.prototype.disconnectedCallback = function () {
    this._inputR.removeEventListener("input", this._onInputR);
    this._inputH.removeEventListener("input", this._onInputH);
    this._inputT.removeEventListener("input", this._onInputT);
    this._selectPosition.removeEventListener("change", this._onChangePosition);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ModeleSinusoidalWidgetClass.prototype._dessinerCercle = function (phi) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgCercle;
    svg.innerHTML = "";

    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: C_R, class: "roue" }));
    svg.appendChild(svgEl(ns, "circle", { cx: C_CX, cy: C_CY, r: 3, class: "centre" }));

    var px = C_CX + C_R * Math.cos(phi);
    var py = C_CY - C_R * Math.sin(phi);
    svg.appendChild(svgEl(ns, "line", { x1: C_CX, y1: C_CY, x2: px.toFixed(2), y2: py.toFixed(2), class: "rayon" }));
    svg.appendChild(svgEl(ns, "circle", { cx: px.toFixed(2), cy: py.toFixed(2), r: 5.5, class: "point-depart" }));

    var procheHaut = py < C_CY - C_R + 20;
    var procheBas = py > C_CY + C_R - 20;
    var dy = procheHaut ? 16 : procheBas ? -10 : -12;
    var et = svgEl(ns, "text", { x: px.toFixed(2), y: (py + dy).toFixed(2), "text-anchor": "middle", class: "etiquette-depart" });
    et.textContent = "t = 0";
    svg.appendChild(et);
  };

  ModeleSinusoidalWidgetClass.prototype._toPxGraphe = function (xMath, yMath) {
    var zoneL = G_LARGEUR - G_MARGE_G - G_MARGE_D;
    var zoneH = G_HAUTEUR - G_MARGE_H - G_MARGE_B;
    var px = G_MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * zoneL;
    var py = G_HAUTEUR - G_MARGE_B - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * zoneH;
    return [px, py];
  };

  ModeleSinusoidalWidgetClass.prototype._dessinerGraphe = function (f, A, b, tVerif) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svgGraphe;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPxGraphe(X_MIN, 0);
    svg.appendChild(svgEl(ns, "line", { x1: G_MARGE_G, x2: G_LARGEUR - G_MARGE_D, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: G_HAUTEUR - G_MARGE_B, y2: G_MARGE_H, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: G_LARGEUR - G_MARGE_D + 2, y: origine[1] + 12, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "t";
    svg.appendChild(etiqX);

    var pMax0 = self._toPxGraphe(X_MIN, b + A), pMax1 = self._toPxGraphe(X_MAX, b + A);
    var pMin0 = self._toPxGraphe(X_MIN, b - A), pMin1 = self._toPxGraphe(X_MAX, b - A);
    svg.appendChild(svgEl(ns, "line", { x1: pMax0[0].toFixed(2), y1: pMax0[1].toFixed(2), x2: pMax1[0].toFixed(2), y2: pMax1[1].toFixed(2), class: "ligne-extreme" }));
    svg.appendChild(svgEl(ns, "line", { x1: pMin0[0].toFixed(2), y1: pMin0[1].toFixed(2), x2: pMin1[0].toFixed(2), y2: pMin1[1].toFixed(2), class: "ligne-extreme" }));
    var etMax = svgEl(ns, "text", { x: G_MARGE_G + 4, y: (pMax0[1] - 5).toFixed(2), class: "etiquette" });
    etMax.textContent = "max = " + formatNombreFr(b + A, 0);
    svg.appendChild(etMax);
    var etMin = svgEl(ns, "text", { x: G_MARGE_G + 4, y: (pMin0[1] - 5).toFixed(2), class: "etiquette" });
    etMin.textContent = "min = " + formatNombreFr(b - A, 0);
    svg.appendChild(etMin);

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

    var p0 = self._toPxGraphe(0, f(0));
    var p0axe = self._toPxGraphe(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: p0[0].toFixed(2), y1: p0axe[1].toFixed(2), x2: p0[0].toFixed(2), y2: p0[1].toFixed(2), class: "guide" }));
    svg.appendChild(svgEl(ns, "circle", { cx: p0[0].toFixed(2), cy: p0[1].toFixed(2), r: 4.5, class: "point-t0" }));

    if (tVerif >= X_MIN && tVerif <= X_MAX) {
      var pv = self._toPxGraphe(tVerif, f(tVerif));
      var pvAxe = self._toPxGraphe(tVerif, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pv[0].toFixed(2), y1: pvAxe[1].toFixed(2), x2: pv[0].toFixed(2), y2: pv[1].toFixed(2), class: "guide" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pv[0].toFixed(2), cy: pv[1].toFixed(2), r: 4.5, class: "point-verif" }));
    }
  };

  ModeleSinusoidalWidgetClass.prototype._rendre = function () {
    var r = this._r, h = this._h, t = this._t, position = this._position;
    var A = r, b = h, omega = DEUX_PI / t, phi = PHI_PAR_POSITION[position];
    var f = function (x) { return A * Math.sin(omega * x + phi) + b; };

    this._formule.textContent = "hauteur(t) = " + formatNombreFr(A, 0) + " sin(" + formatNombreFr(omega, 3) + "t " + (phi >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(phi), 3) + ") + " + formatNombreFr(b, 0);
    this._valA.textContent = formatNombreFr(A, 0) + " m";
    this._valB.textContent = formatNombreFr(b, 0) + " m";
    this._valOmega.textContent = formatNombreFr(omega, 3);
    this._valPhi.textContent = formatNombreFr(phi, 3);
    this._valeurR.textContent = formatNombreFr(r, 0) + " m";
    this._valeurH.textContent = formatNombreFr(h, 0) + " m";
    this._valeurT.textContent = formatNombreFr(t, 0) + " min";

    // Vérification (astuce de la section) : un demi-tour après le départ (t=T/2), la nacelle est
    // à l'extrême opposé de celui de t=0.
    var tVerif = t / 2;
    this._verif.textContent =
      "vérification — départ : " + LABEL_POSITION[position] + " (hauteur(0) = " + formatNombreFr(f(0), 1) +
      " m) ; un demi-tour plus tard (t=" + formatNombreFr(tVerif, 1) + "), hauteur = " + formatNombreFr(f(tVerif), 1) + " m";

    this._dessinerCercle(phi);
    this._dessinerGraphe(f, A, b, tVerif);
  };

  if (!customElements.get("modele-sinusoidal-widget")) {
    customElements.define("modele-sinusoidal-widget", ModeleSinusoidalWidgetClass);
  }
})();
