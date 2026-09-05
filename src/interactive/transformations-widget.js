(function () {
  "use strict";

  /* ================================================================
   * <transformations-widget> — atelier interactif f(x) = a(x − TH)² + TV,
   * a = EV/CV selon |a|≥1. Même mécanique que <parabole-widget> (zoom, pan,
   * couleurs héritées des variables CSS du chapitre), sommet trivial (TH, TV)
   * puisque les curseurs paramètrent directement la forme canonique.
   * ================================================================ */

  var DEFAUT = { th: 0, ev: 1, tv: 0 };
  var MIN = -3, MAX = 3, STEP = 0.1;
  var CENTRE_Y = 2, DEMI_X_BASE = 6, DEMI_Y_BASE = 8;
  var ZOOM_MIN = 0.4, ZOOM_MAX = 5, ZOOM_PAS = 1.3;
  var LARGEUR = 560, HAUTEUR = 420, MARGE = 30;

  function formatNombreFr(n) {
    var arrondi = Math.round(n * 100) / 100;
    return arrondi.toString().replace(".", ",").replace("-", "−");
  }

  function pasAgreable(valeurBrute) {
    var exposant = Math.floor(Math.log10(valeurBrute));
    var fraction = valeurBrute / Math.pow(10, exposant);
    var pasFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
    return pasFraction * Math.pow(10, exposant);
  }

  /** f(x) = a(x − TH)² + TV, forme canonique — gère a=±1 (coefficient omis),
   * TH=0 (parenthèse réduite à x²) et le cas dégénéré a=0 (droite horizontale). */
  function formatCanonique(a, p, q) {
    if (a === 0) return q === 0 ? "0" : formatNombreFr(q);
    var coefA = Math.abs(a) === 1 ? "" : formatNombreFr(Math.abs(a));
    var signeA = a < 0 ? "−" : "";
    var interieur = p === 0 ? "x²" : (p > 0 ? "(x − " + formatNombreFr(p) + ")²" : "(x + " + formatNombreFr(-p) + ")²");
    var corps = signeA + coefA + interieur;
    if (q === 0) return corps;
    return corps + " " + (q < 0 ? "−" : "+") + " " + formatNombreFr(Math.abs(q));
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
    '.ligne-curseur{display:grid;grid-template-columns:32px 1fr 52px;align-items:center;gap:10px;margin-bottom:10px;}' +
    '.ligne-curseur label{font-family:var(--mono,monospace);font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;font-size:.82rem;}' +
    '.ligne-curseur input[type="range"]{width:100%;accent-color:var(--accent,#a8471f);}' +
    '.ligne-curseur .valeur{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink-soft,#6b6055);font-size:0.92rem;}' +
    '.btn-reset{margin-top:8px;padding:8px 14px;border-radius:3px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '.options{display:flex;flex-direction:column;gap:9px;padding-left:16px;border-left:1px solid var(--line,#e2d8c8);}' +
    '.options label{display:flex;align-items:center;gap:6px;font-size:0.88rem;color:var(--ink-soft,#6b6055);cursor:pointer;}' +
    '.options label.desactive{color:var(--ink-faint,#9c9083);cursor:not-allowed;}' +
    '.options input{accent-color:var(--accent,#a8471f);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.grille{stroke:var(--line-soft,#ede5d7);stroke-width:1;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.axe-symetrie{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;stroke-dasharray:6 4;}' +
    '.point-sommet{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-oao{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
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
    '<div class="ligne-curseur"><label for="th">TH</label><input type="range" id="th" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.th + '"><span class="valeur" id="th-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="ev" id="label-ev">EV</label><input type="range" id="ev" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.ev + '"><span class="valeur" id="ev-valeur"></span></div>' +
    '<div class="ligne-curseur"><label for="tv">TV</label><input type="range" id="tv" min="' + MIN + '" max="' + MAX + '" step="' + STEP + '" value="' + DEFAUT.tv + '"><span class="valeur" id="tv-valeur"></span></div>' +
    '<button class="btn-reset" id="reset" type="button">Fonction de référence</button>' +
    '</div>' +
    '<div class="options">' +
    '<label id="label-as"><input type="checkbox" id="as"> AS</label>' +
    '<label id="label-s"><input type="checkbox" id="s"> S</label>' +
    '<label id="label-oao"><input type="checkbox" id="oao"> OAO</label>' +
    '</div>' +
    '</div>';

  class TransformationsWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TransformationsWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._th = DEFAUT.th; this._ev = DEFAUT.ev; this._tv = DEFAUT.tv;
    this._zoom = 1;
    this._centreX = 0;
    this._centreY = CENTRE_Y;
    this._enDeplacement = false;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputTH = shadow.getElementById("th");
    this._inputEV = shadow.getElementById("ev");
    this._inputTV = shadow.getElementById("tv");
    this._valeurTH = shadow.getElementById("th-valeur");
    this._valeurEV = shadow.getElementById("ev-valeur");
    this._valeurTV = shadow.getElementById("tv-valeur");
    this._labelEV = shadow.getElementById("label-ev");
    this._checkAS = shadow.getElementById("as");
    this._checkS = shadow.getElementById("s");
    this._checkOAO = shadow.getElementById("oao");
    this._labelAS = shadow.getElementById("label-as");
    this._labelS = shadow.getElementById("label-s");
    this._resetBtn = shadow.getElementById("reset");
    this._zoomIn = shadow.getElementById("zoom-in");
    this._zoomOut = shadow.getElementById("zoom-out");
    this._zoomReset = shadow.getElementById("zoom-reset");
    this._zoomValeur = shadow.getElementById("zoom-valeur");
  };

  TransformationsWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInput = function () {
      self._th = parseFloat(self._inputTH.value);
      self._ev = parseFloat(self._inputEV.value);
      self._tv = parseFloat(self._inputTV.value);
      self._rendre();
    };
    this._onReset = function () {
      self._th = DEFAUT.th; self._ev = DEFAUT.ev; self._tv = DEFAUT.tv;
      self._inputTH.value = String(DEFAUT.th);
      self._inputEV.value = String(DEFAUT.ev);
      self._inputTV.value = String(DEFAUT.tv);
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
    this._inputTH.addEventListener("input", this._onInput);
    this._inputEV.addEventListener("input", this._onInput);
    this._inputTV.addEventListener("input", this._onInput);
    this._resetBtn.addEventListener("click", this._onReset);
    this._checkAS.addEventListener("change", this._onChange);
    this._checkS.addEventListener("change", this._onChange);
    this._checkOAO.addEventListener("change", this._onChange);
    this._zoomIn.addEventListener("click", this._onZoomIn);
    this._zoomOut.addEventListener("click", this._onZoomOut);
    this._zoomReset.addEventListener("click", this._onZoomReset);
    this._svg.addEventListener("pointerdown", this._onPointerDown);
    this._svg.addEventListener("pointermove", this._onPointerMove);
    this._svg.addEventListener("pointerup", this._onPointerUp);
    this._svg.addEventListener("pointercancel", this._onPointerUp);
    this._rendre();
  };

  TransformationsWidgetClass.prototype.disconnectedCallback = function () {
    this._inputTH.removeEventListener("input", this._onInput);
    this._inputEV.removeEventListener("input", this._onInput);
    this._inputTV.removeEventListener("input", this._onInput);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._checkAS.removeEventListener("change", this._onChange);
    this._checkS.removeEventListener("change", this._onChange);
    this._checkOAO.removeEventListener("change", this._onChange);
    this._zoomIn.removeEventListener("click", this._onZoomIn);
    this._zoomOut.removeEventListener("click", this._onZoomOut);
    this._zoomReset.removeEventListener("click", this._onZoomReset);
    this._svg.removeEventListener("pointerdown", this._onPointerDown);
    this._svg.removeEventListener("pointermove", this._onPointerMove);
    this._svg.removeEventListener("pointerup", this._onPointerUp);
    this._svg.removeEventListener("pointercancel", this._onPointerUp);
  };

  TransformationsWidgetClass.prototype._appliquerZoom = function (nouveauZoom) {
    this._zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nouveauZoom));
    this._rendre();
  };

  TransformationsWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - this._xMin) / (this._xMax - this._xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - this._yMin) / (this._yMax - this._yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  TransformationsWidgetClass.prototype._rendre = function () {
    var th = this._th, ev = this._ev, tv = this._tv;
    this._valeurTH.textContent = formatNombreFr(th);
    this._valeurEV.textContent = formatNombreFr(ev);
    this._valeurTV.textContent = formatNombreFr(tv);
    this._labelEV.textContent = Math.abs(ev) >= 1 ? "EV" : "CV";
    this._formule.textContent = "f(x) = " + formatCanonique(ev, th, tv);

    var degenere = ev === 0;
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
      var yy = ev * (xx - th) * (xx - th) + tv;
      var pt = self._toPx(xx, Math.max(Y_MIN - 2, Math.min(Y_MAX + 2, yy)));
      d += (i === 0 ? "M" : "L") + pt[0].toFixed(2) + " " + pt[1].toFixed(2) + " ";
    }
    var chemin = document.createElementNS(ns, "path");
    chemin.setAttribute("d", d.trim());
    chemin.setAttribute("class", "courbe");
    svg.appendChild(chemin);

    var xS = th, yS = tv; // forme canonique : sommet direct, aucun calcul -b/(2a) nécessaire

    if (!degenere && this._checkAS.checked) {
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
      if (xS >= X_MIN && xS <= X_MAX && yS >= Y_MIN && yS <= Y_MAX) {
        var ptS = self._toPx(xS, yS);
        var cS = document.createElementNS(ns, "circle");
        cS.setAttribute("cx", ptS[0]); cS.setAttribute("cy", ptS[1]); cS.setAttribute("r", 5);
        cS.setAttribute("class", "point-sommet");
        svg.appendChild(cS);
        var etiqS = document.createElementNS(ns, "text");
        etiqS.setAttribute("x", ptS[0] + 8); etiqS.setAttribute("y", ptS[1] - 8);
        etiqS.setAttribute("class", "etiquette");
        etiqS.textContent = "S(" + formatNombreFr(xS) + " ; " + formatNombreFr(yS) + ")";
        svg.appendChild(etiqS);
      }
    }

    if (this._checkOAO.checked) {
      var yOAO = ev * (0 - th) * (0 - th) + tv;
      if (yOAO >= Y_MIN && yOAO <= Y_MAX) {
        var ptO = self._toPx(0, yOAO);
        var cO = document.createElementNS(ns, "circle");
        cO.setAttribute("cx", ptO[0]); cO.setAttribute("cy", ptO[1]); cO.setAttribute("r", 5);
        cO.setAttribute("class", "point-oao");
        svg.appendChild(cO);
        var etiqO = document.createElementNS(ns, "text");
        etiqO.setAttribute("x", ptO[0] + 8); etiqO.setAttribute("y", ptO[1] + 16);
        etiqO.setAttribute("class", "etiquette");
        etiqO.textContent = "(0 ; " + formatNombreFr(yOAO) + ")";
        svg.appendChild(etiqO);
      }
    }
  };

  if (!customElements.get("transformations-widget")) {
    customElements.define("transformations-widget", TransformationsWidgetClass);
  }
})();
