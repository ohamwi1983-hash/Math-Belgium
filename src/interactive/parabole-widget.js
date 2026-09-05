(function () {
  "use strict";

  /* ================================================================
   * <parabole-widget> — atelier interactif f(x) = ax² + bx + c.
   * Web Component (Shadow DOM) : aucun conflit avec les styles de la page,
   * couleurs empruntées aux variables CSS du chapitre (héritées à travers
   * la frontière du Shadow DOM) pour suivre le thème clair/sombre du lecteur.
   * ================================================================ */

  var DEFAUT = { a: 1, b: 0, c: 0 };
  var MIN = -3, MAX = 3, STEP = 0.1;
  // Fenêtre de base (zoom = 1, centre par défaut) : X centré sur 0, Y centré sur CENTRE_Y —
  // le zoom agrandit/réduit ces deux demi-portées d'un même facteur autour du centre courant,
  // et le glisser-déposer (pointerdown/move/up sur le SVG) déplace ce centre librement.
  var CENTRE_Y = 2, DEMI_X_BASE = 6, DEMI_Y_BASE = 8;
  var ZOOM_MIN = 0.4, ZOOM_MAX = 5, ZOOM_PAS = 1.3;
  var LARGEUR = 560, HAUTEUR = 420, MARGE = 30;

  function formatNombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    return arrondi.toString().replace(".", ",").replace("-", "−");
  }

  /** Arrondit un pas de grille brut vers 1, 2 ou 5 fois une puissance de 10 —
   * évite un nombre de graduations qui explose ou s'effondre en zoomant. */
  function pasAgreable(valeurBrute) {
    var exposant = Math.floor(Math.log10(valeurBrute));
    var fraction = valeurBrute / Math.pow(10, exposant);
    var pasFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
    return pasFraction * Math.pow(10, exposant);
  }

  function formatFonction(a, b, c) {
    var termes = [];
    if (a !== 0) {
      var coefA = Math.abs(a) === 1 ? "" : formatNombreFr(Math.abs(a));
      termes.push({ signe: a < 0 ? "−" : "", texte: coefA + "x²" });
    }
    if (b !== 0) {
      var coefB = Math.abs(b) === 1 ? "" : formatNombreFr(Math.abs(b));
      termes.push({ signe: b < 0 ? "−" : "+", texte: coefB + "x" });
    }
    if (c !== 0) {
      termes.push({ signe: c < 0 ? "−" : "+", texte: formatNombreFr(Math.abs(c)) });
    }
    if (termes.length === 0) return "0";
    var resultat = (termes[0].signe === "−" ? "−" : "") + termes[0].texte;
    for (var i = 1; i < termes.length; i++) resultat += " " + termes[i].signe + " " + termes[i].texte;
    return resultat;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.35rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;min-height:1.7rem;}' +
    '.zoom-bar{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-bottom:8px;}' +
    '.zoom-bar button{width:26px;height:26px;border-radius:3px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:15px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;padding:0;}' +
    '.zoom-bar button:hover:not(:disabled){border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);}' +
    '.zoom-bar button:disabled{opacity:.4;cursor:not-allowed;}' +
    '.zoom-bar .zoom-reset{font-size:13px;}' +
    '.zoom-valeur{font-variant-numeric:tabular-nums;font-size:.8rem;color:var(--ink-soft,#6b6055);min-width:38px;text-align:center;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;height:auto;max-width:100%;background:var(--surface-2,#faf6f0);border-radius:3px;cursor:grab;touch-action:none;}' +
    'svg.en-deplacement{cursor:grabbing;}' +
    '.controles{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap;}' +
    '.curseurs{flex:1 1 auto;min-width:220px;}' +
    '.ligne-curseur{display:grid;grid-template-columns:20px 1fr 52px;align-items:center;gap:10px;margin-bottom:10px;}' +
    '.ligne-curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.ligne-curseur input[type="range"]{width:100%;accent-color:var(--accent,#a8471f);}' +
    '.ligne-curseur .valeur{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-soft,#6b6055);font-size:0.92rem;}' +
    '.btn-reset{margin-top:8px;padding:8px 14px;border-radius:3px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.options{display:flex;flex-direction:column;gap:9px;padding-left:16px;border-left:1px solid var(--line,#e2d8c8);}' +
    '.options label{display:flex;align-items:center;gap:6px;font-size:0.88rem;color:var(--ink-soft,#6b6055);cursor:pointer;}' +
    '.options label.desactive{color:var(--ink-faint,#9c9083);cursor:not-allowed;}' +
    '.options input{accent-color:var(--accent,#a8471f);}' +
    '.math-label{font-family:var(--serif,serif);font-style:italic;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.axe-symetrie{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;stroke-dasharray:6 4;}' +
    '.point-sommet{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-oao{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.droite-lineaire{stroke:#3d72b4;stroke-width:2.2;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.graduation{font-size:9.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="zoom-bar">' +
    '<button type="button" id="zoom-out" aria-label="Dézoomer">−</button>' +
    '<span class="zoom-valeur" id="zoom-valeur">100 %</span>' +
    '<button type="button" id="zoom-in" aria-label="Zoomer">+</button>' +
    '<button type="button" id="zoom-reset" class="zoom-reset" aria-label="Réinitialiser le zoom">⟲</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="controles">' +
    '<div class="curseurs">' +
    '<div class="ligne-curseur"><label for="a">a</label><input type="range" id="a" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.a + '"><span class="valeur" id="a-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="b">b</label><input type="range" id="b" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.b + '"><span class="valeur" id="b-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="c">c</label><input type="range" id="c" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.c + '"><span class="valeur" id="c-valeur"></span></div>' +
    '<button class="btn-reset" id="reset" type="button">Fonction de référence</button>' +
    '</div>' +
    '<div class="options">' +
    '<label id="label-as"><input type="checkbox" id="as"> AS</label>' +
    '<label id="label-s"><input type="checkbox" id="s"> S</label>' +
    '<label id="label-oao"><input type="checkbox" id="oao"> OAO</label>' +
    '<label id="label-lineaire"><input type="checkbox" id="lineaire"> <span class="math-label">y = bx + c</span></label>' +
    '</div>' +
    '</div>';

  class ParaboleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ParaboleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a; this._b = DEFAUT.b; this._c = DEFAUT.c;
    this._zoom = 1;
    this._centreX = 0;
    this._centreY = CENTRE_Y;
    this._enDeplacement = false;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputC = shadow.getElementById("c");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurC = shadow.getElementById("c-valeur");
    this._checkAS = shadow.getElementById("as");
    this._checkS = shadow.getElementById("s");
    this._checkOAO = shadow.getElementById("oao");
    this._checkLineaire = shadow.getElementById("lineaire");
    this._labelAS = shadow.getElementById("label-as");
    this._labelS = shadow.getElementById("label-s");
    this._resetBtn = shadow.getElementById("reset");
    this._zoomIn = shadow.getElementById("zoom-in");
    this._zoomOut = shadow.getElementById("zoom-out");
    this._zoomReset = shadow.getElementById("zoom-reset");
    this._zoomValeur = shadow.getElementById("zoom-valeur");
  };

  ParaboleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._a = parseFloat(self._inputA.value);
      self._b = parseFloat(self._inputB.value);
      self._c = parseFloat(self._inputC.value);
      self._rendre();
    };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._c = DEFAUT.c;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputC.value = String(DEFAUT.c);
      self._rendre();
    };
    this._onChange = function () { self._rendre(); };
    this._onZoomIn = function () { self._appliquerZoom(self._zoom / ZOOM_PAS); };
    this._onZoomOut = function () { self._appliquerZoom(self._zoom * ZOOM_PAS); };
    this._onZoomReset = function () {
      self._zoom = 1; self._centreX = 0; self._centreY = CENTRE_Y;
      self._rendre();
    };
    this._onPointerDown = function (event) {
      self._enDeplacement = true;
      self._svg.classList.add("en-deplacement");
      self._svg.setPointerCapture(event.pointerId);
      self._dernierClientX = event.clientX;
      self._dernierClientY = event.clientY;
      event.preventDefault();
    };
    this._onPointerMove = function (event) {
      if (!self._enDeplacement) return;
      var rect = self._svg.getBoundingClientRect();
      var echelleX = LARGEUR / rect.width, echelleY = HAUTEUR / rect.height;
      var deltaPxX = (event.clientX - self._dernierClientX) * echelleX;
      var deltaPxY = (event.clientY - self._dernierClientY) * echelleY;
      self._dernierClientX = event.clientX;
      self._dernierClientY = event.clientY;
      var xSpan = self._xMax - self._xMin, ySpan = self._yMax - self._yMin;
      var wPx = LARGEUR - 2 * MARGE, hPx = HAUTEUR - 2 * MARGE;
      self._centreX -= deltaPxX * (xSpan / wPx);
      self._centreY += deltaPxY * (ySpan / hPx);
      self._rendre();
    };
    this._onPointerUp = function () {
      self._enDeplacement = false;
      self._svg.classList.remove("en-deplacement");
    };
    this._inputA.addEventListener("input", this._onInput);
    this._inputB.addEventListener("input", this._onInput);
    this._inputC.addEventListener("input", this._onInput);
    this._resetBtn.addEventListener("click", this._onReset);
    this._checkAS.addEventListener("change", this._onChange);
    this._checkS.addEventListener("change", this._onChange);
    this._checkOAO.addEventListener("change", this._onChange);
    this._checkLineaire.addEventListener("change", this._onChange);
    this._zoomIn.addEventListener("click", this._onZoomIn);
    this._zoomOut.addEventListener("click", this._onZoomOut);
    this._zoomReset.addEventListener("click", this._onZoomReset);
    this._svg.addEventListener("pointerdown", this._onPointerDown);
    this._svg.addEventListener("pointermove", this._onPointerMove);
    this._svg.addEventListener("pointerup", this._onPointerUp);
    this._svg.addEventListener("pointercancel", this._onPointerUp);
    this._rendre();
  };

  ParaboleWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInput);
    this._inputB.removeEventListener("input", this._onInput);
    this._inputC.removeEventListener("input", this._onInput);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._checkAS.removeEventListener("change", this._onChange);
    this._checkS.removeEventListener("change", this._onChange);
    this._checkOAO.removeEventListener("change", this._onChange);
    this._checkLineaire.removeEventListener("change", this._onChange);
    this._zoomIn.removeEventListener("click", this._onZoomIn);
    this._zoomOut.removeEventListener("click", this._onZoomOut);
    this._zoomReset.removeEventListener("click", this._onZoomReset);
    this._svg.removeEventListener("pointerdown", this._onPointerDown);
    this._svg.removeEventListener("pointermove", this._onPointerMove);
    this._svg.removeEventListener("pointerup", this._onPointerUp);
    this._svg.removeEventListener("pointercancel", this._onPointerUp);
  };

  ParaboleWidgetClass.prototype._appliquerZoom = function (nouveauZoom) {
    this._zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nouveauZoom));
    this._rendre();
  };

  ParaboleWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - this._xMin) / (this._xMax - this._xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - this._yMin) / (this._yMax - this._yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ParaboleWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b, c = this._c;
    this._valeurA.textContent = formatNombreFr(a);
    this._valeurB.textContent = formatNombreFr(b);
    this._valeurC.textContent = formatNombreFr(c);
    this._formule.textContent = "f(x) = " + formatFonction(a, b, c);

    var degenere = a === 0;
    this._labelAS.classList.toggle("desactive", degenere);
    this._labelS.classList.toggle("desactive", degenere);
    this._checkAS.disabled = degenere;
    this._checkS.disabled = degenere;

    var demiX = DEMI_X_BASE * this._zoom;
    var demiY = DEMI_Y_BASE * this._zoom;
    this._xMin = this._centreX - demiX; this._xMax = this._centreX + demiX;
    this._yMin = this._centreY - demiY; this._yMax = this._centreY + demiY;
    this._zoomValeur.textContent = Math.round(100 / this._zoom) + " %";
    this._zoomIn.disabled = this._zoom <= ZOOM_MIN + 1e-9;
    this._zoomOut.disabled = this._zoom >= ZOOM_MAX - 1e-9;

    var X_MIN = this._xMin, X_MAX = this._xMax, Y_MIN = this._yMin, Y_MAX = this._yMax;
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var pasX = pasAgreable((X_MAX - X_MIN) / 8);
    var pasY = pasAgreable((Y_MAX - Y_MIN) / 8);
    var origineY0 = self._toPx(0, 0)[1];
    var origineX0 = self._toPx(0, 0)[0];

    for (var kx = Math.ceil(X_MIN / pasX); kx * pasX <= X_MAX; kx++) {
      var xVal = kx * pasX;
      var pxg = self._toPx(xVal, 0)[0];
      var lg = document.createElementNS(ns, "line");
      lg.setAttribute("x1", pxg); lg.setAttribute("x2", pxg);
      lg.setAttribute("y1", MARGE); lg.setAttribute("y2", HAUTEUR - MARGE);
      lg.setAttribute("class", "grille");
      svg.appendChild(lg);
      if (kx !== 0) {
        var etiqGx = document.createElementNS(ns, "text");
        etiqGx.setAttribute("x", pxg); etiqGx.setAttribute("y", origineY0 + 13);
        etiqGx.setAttribute("text-anchor", "middle");
        etiqGx.setAttribute("class", "graduation");
        etiqGx.textContent = formatNombreFr(xVal);
        svg.appendChild(etiqGx);
      }
    }
    for (var ky = Math.ceil(Y_MIN / pasY); ky * pasY <= Y_MAX; ky++) {
      var yVal = ky * pasY;
      var pyg = self._toPx(0, yVal)[1];
      var lg2 = document.createElementNS(ns, "line");
      lg2.setAttribute("x1", MARGE); lg2.setAttribute("x2", LARGEUR - MARGE);
      lg2.setAttribute("y1", pyg); lg2.setAttribute("y2", pyg);
      lg2.setAttribute("class", "grille");
      svg.appendChild(lg2);
      if (ky !== 0) {
        var etiqGy = document.createElementNS(ns, "text");
        etiqGy.setAttribute("x", origineX0 - 6); etiqGy.setAttribute("y", pyg + 3);
        etiqGy.setAttribute("text-anchor", "end");
        etiqGy.setAttribute("class", "graduation");
        etiqGy.textContent = formatNombreFr(yVal);
        svg.appendChild(etiqGy);
      }
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
    etiqY.setAttribute("x", origine[0] + 6); etiqY.setAttribute("y", MARGE - 8);
    etiqY.setAttribute("class", "etiquette"); etiqY.textContent = "y";
    svg.appendChild(etiqY);

    var n = 240, d = "";
    for (var i = 0; i <= n; i++) {
      var xx = X_MIN + (i / n) * (X_MAX - X_MIN);
      var yy = a * xx * xx + b * xx + c;
      var pt = self._toPx(xx, Math.max(Y_MIN - 2, Math.min(Y_MAX + 2, yy)));
      d += (i === 0 ? "M" : "L") + pt[0].toFixed(2) + " " + pt[1].toFixed(2) + " ";
    }
    var chemin = document.createElementNS(ns, "path");
    chemin.setAttribute("d", d.trim());
    chemin.setAttribute("class", "courbe");
    svg.appendChild(chemin);

    if (this._checkLineaire.checked) {
      var pL1 = self._toPx(X_MIN, b * X_MIN + c);
      var pL2 = self._toPx(X_MAX, b * X_MAX + c);
      var ligneAB = document.createElementNS(ns, "line");
      ligneAB.setAttribute("x1", pL1[0]); ligneAB.setAttribute("y1", pL1[1]);
      ligneAB.setAttribute("x2", pL2[0]); ligneAB.setAttribute("y2", pL2[1]);
      ligneAB.setAttribute("class", "droite-lineaire");
      svg.appendChild(ligneAB);
    }

    if (!degenere && this._checkAS.checked) {
      var xS = -b / (2 * a);
      if (xS >= X_MIN && xS <= X_MAX) {
        var pxS = self._toPx(xS, 0)[0];
        var las = document.createElementNS(ns, "line");
        las.setAttribute("x1", pxS); las.setAttribute("x2", pxS);
        las.setAttribute("y1", MARGE); las.setAttribute("y2", HAUTEUR - MARGE);
        las.setAttribute("class", "axe-symetrie");
        svg.appendChild(las);
        var etiqAS = document.createElementNS(ns, "text");
        etiqAS.setAttribute("x", pxS + 4); etiqAS.setAttribute("y", MARGE + 12);
        etiqAS.setAttribute("class", "etiquette");
        etiqAS.textContent = "x = " + formatNombreFr(xS);
        svg.appendChild(etiqAS);
      }
    }

    if (!degenere && this._checkS.checked) {
      var xS2 = -b / (2 * a);
      var yS2 = a * xS2 * xS2 + b * xS2 + c;
      if (xS2 >= X_MIN && xS2 <= X_MAX && yS2 >= Y_MIN && yS2 <= Y_MAX) {
        var ptS = self._toPx(xS2, yS2);
        var cS = document.createElementNS(ns, "circle");
        cS.setAttribute("cx", ptS[0]); cS.setAttribute("cy", ptS[1]); cS.setAttribute("r", 5);
        cS.setAttribute("class", "point-sommet");
        svg.appendChild(cS);
        var etiqS = document.createElementNS(ns, "text");
        etiqS.setAttribute("x", ptS[0] + 8); etiqS.setAttribute("y", ptS[1] - 8);
        etiqS.setAttribute("class", "etiquette");
        etiqS.textContent = "S(" + formatNombreFr(xS2) + " ; " + formatNombreFr(yS2) + ")";
        svg.appendChild(etiqS);
      }
    }

    if (this._checkOAO.checked && c >= Y_MIN && c <= Y_MAX) {
      var ptO = self._toPx(0, c);
      var cO = document.createElementNS(ns, "circle");
      cO.setAttribute("cx", ptO[0]); cO.setAttribute("cy", ptO[1]); cO.setAttribute("r", 5);
      cO.setAttribute("class", "point-oao");
      svg.appendChild(cO);
      var etiqO = document.createElementNS(ns, "text");
      etiqO.setAttribute("x", ptO[0] + 8); etiqO.setAttribute("y", ptO[1] + 16);
      etiqO.setAttribute("class", "etiquette");
      etiqO.textContent = "(0 ; " + formatNombreFr(c) + ")";
      svg.appendChild(etiqO);
    }
  };

  if (!customElements.get("parabole-widget")) {
    customElements.define("parabole-widget", ParaboleWidgetClass);
  }
})();
