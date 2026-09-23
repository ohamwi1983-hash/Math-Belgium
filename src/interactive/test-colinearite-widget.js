(function () {
  "use strict";

  /* ================================================================
   * <test-colinearite-widget> — atelier interactif : A(0;0) et B(2;1)
   * fixes, C déplaçable (curseurs x_C, y_C), sélecteur colinéarité/
   * orthogonalité — matérialise en direct le piège de la section : les
   * deux formules $x_u y_v - y_u x_v=0$ (colinéarité) et
   * $x_u x_v + y_u y_v=0$ (orthogonalité) se ressemblent mais testent
   * deux relations opposées, appliquées ici aux mêmes vecteurs AB, AC.
   * Réglage par défaut (C=(6;3), mode colinéarité) reproduit exactement
   * l'exemple résolu : déterminant nul, A/B/C alignés. Web Component
   * (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { cx: 6, cy: 3, mode: "colinearite" };
  var BORNES_C = { min: -2, max: 8, step: 0.5 };
  var A = { x: 0, y: 0 }, B = { x: 2, y: 1 };
  var EPS = 0.15;

  var X_MIN = -3, X_MAX = 9, Y_MIN = -3, Y_MAX = 7;
  var LARGEUR = 420, HAUTEUR = 340, MARGE = 32;

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
    '.mode-row{display:flex;justify-content:center;gap:8px;margin-bottom:12px;}' +
    '.mode-row button{flex:1 1 0;max-width:170px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.mode-row button.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.droite-ab{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.vecteur-ab{stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.vecteur-ac{stroke:var(--accent,#a8471f);stroke-width:2;}' +
    '.point{fill:var(--ink,#241f1a);}' +
    '.point-verifie{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#241f1a);}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.ligne-formule{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.86rem;}' +
    '.ligne-active{font-weight:700;}' +
    '.ligne-active.vrai{color:var(--good,#2f7a4f);}' +
    '.ligne-active.faux{color:var(--ink-soft,#6b6055);}' +
    '.ligne-inactive{color:var(--ink-faint,#9c9083);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="mode-row" id="mode">' +
    '<button type="button" data-mode="colinearite">tester colinéarité</button>' +
    '<button type="button" data-mode="orthogonalite">tester orthogonalité</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="cx">x_C</label><div class="curseur-row">' +
    '<input type="range" id="cx" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.cx + '">' +
    '<span class="curseur-valeur" id="cx-valeur"></span></div></div>' +
    '<div class="curseur"><label for="cy">y_C</label><div class="curseur-row">' +
    '<input type="range" id="cy" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.cy + '">' +
    '<span class="curseur-valeur" id="cy-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class TestColinariteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  TestColinariteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._cx = DEFAUT.cx; this._cy = DEFAUT.cy; this._mode = DEFAUT.mode;
    this._svg = shadow.getElementById("svg");
    this._modeWrap = shadow.getElementById("mode");
    this._lecture = shadow.getElementById("lecture");
    this._inputCx = shadow.getElementById("cx");
    this._inputCy = shadow.getElementById("cy");
    this._valeurCx = shadow.getElementById("cx-valeur");
    this._valeurCy = shadow.getElementById("cy-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  TestColinariteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputCx = function () { self._cx = parseFloat(self._inputCx.value); self._rendre(); };
    this._onInputCy = function () { self._cy = parseFloat(self._inputCy.value); self._rendre(); };
    this._onClickMode = function (evt) {
      var btn = evt.target.closest("button[data-mode]");
      if (!btn) return;
      self._mode = btn.getAttribute("data-mode");
      self._rendre();
    };
    this._onReset = function () {
      self._cx = DEFAUT.cx; self._cy = DEFAUT.cy; self._mode = DEFAUT.mode;
      self._inputCx.value = String(DEFAUT.cx);
      self._inputCy.value = String(DEFAUT.cy);
      self._rendre();
    };
    this._inputCx.addEventListener("input", this._onInputCx);
    this._inputCy.addEventListener("input", this._onInputCy);
    this._modeWrap.addEventListener("click", this._onClickMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  TestColinariteWidgetClass.prototype.disconnectedCallback = function () {
    this._inputCx.removeEventListener("input", this._onInputCx);
    this._inputCy.removeEventListener("input", this._onInputCy);
    this._modeWrap.removeEventListener("click", this._onClickMode);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  TestColinariteWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  TestColinariteWidgetClass.prototype._rendre = function () {
    var cx = this._cx, cy = this._cy, mode = this._mode;
    this._valeurCx.textContent = formatNombreFr(cx, 1);
    this._valeurCy.textContent = formatNombreFr(cy, 1);

    Array.prototype.forEach.call(this._modeWrap.querySelectorAll("button"), function (btn) {
      btn.className = btn.getAttribute("data-mode") === mode ? "actif" : "";
    });

    var abx = B.x - A.x, aby = B.y - A.y;
    var acx = cx - A.x, acy = cy - A.y;
    var determinant = abx * acy - aby * acx;
    var produitScalaire = abx * acx + aby * acy;

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

    var pA = self._toPx(A.x, A.y), pB = self._toPx(B.x, B.y), pC = self._toPx(cx, cy);

    var pDroite0 = self._toPx(A.x - 5 * abx, A.y - 5 * aby), pDroite1 = self._toPx(A.x + 5 * abx, A.y + 5 * aby);
    svg.appendChild(svgEl(ns, "line", { x1: pDroite0[0].toFixed(2), y1: pDroite0[1].toFixed(2), x2: pDroite1[0].toFixed(2), y2: pDroite1[1].toFixed(2), class: "droite-ab" }));

    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pB[0].toFixed(2), y2: pB[1].toFixed(2), class: "vecteur-ab" }));
    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pC[0].toFixed(2), y2: pC[1].toFixed(2), class: "vecteur-ac" }));

    var estVerifie = mode === "colinearite" ? Math.abs(determinant) < EPS : Math.abs(produitScalaire) < EPS;

    [["A", pA, "point"], ["B", pB, "point"], ["C", pC, estVerifie ? "point-verifie" : "point"]].forEach(function (t) {
      svg.appendChild(svgEl(ns, "circle", { cx: t[1][0].toFixed(2), cy: t[1][1].toFixed(2), r: 5, class: t[2] }));
      var et = svgEl(ns, "text", { x: (t[1][0] + 9).toFixed(2), y: (t[1][1] - 9).toFixed(2), class: "etiquette" });
      et.textContent = t[0];
      svg.appendChild(et);
    });

    var ligneColinearite =
      "x_u·y_v − y_u·x_v = " + formatNombreFr(abx, 1) + "×" + formatNombreFr(acy, 1) + " − " + formatNombreFr(aby, 1) + "×" + formatNombreFr(acx, 1) +
      " = " + formatNombreFr(determinant, 2) + (Math.abs(determinant) < EPS ? " = 0 → colinéaires (A,B,C alignés)" : " ≠ 0 → pas colinéaires");
    var ligneOrtho =
      "x_u·x_v + y_u·y_v = " + formatNombreFr(abx, 1) + "×" + formatNombreFr(acx, 1) + " + " + formatNombreFr(aby, 1) + "×" + formatNombreFr(acy, 1) +
      " = " + formatNombreFr(produitScalaire, 2) + (Math.abs(produitScalaire) < EPS ? " = 0 → orthogonaux" : " ≠ 0 → pas orthogonaux");

    this._lecture.innerHTML =
      '<div class="ligne-formule ' + (mode === "colinearite" ? "ligne-active " + (Math.abs(determinant) < EPS ? "vrai" : "faux") : "ligne-inactive") + '">' + ligneColinearite + '</div>' +
      '<div class="ligne-formule ' + (mode === "orthogonalite" ? "ligne-active " + (Math.abs(produitScalaire) < EPS ? "vrai" : "faux") : "ligne-inactive") + '">' + ligneOrtho + '</div>';
  };

  if (!customElements.get("test-colinearite-widget")) {
    customElements.define("test-colinearite-widget", TestColinariteWidgetClass);
  }
})();
