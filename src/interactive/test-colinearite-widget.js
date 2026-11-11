(function () {
  "use strict";

  /* ================================================================
   * <test-colinearite-widget> — atelier interactif : A(0;0) et B(2;1)
   * fixes, C déplaçable (curseurs x_C, y_C), sélecteur colinéarité/
   * orthogonalité — matérialise en direct le piège de la section : les
   * deux formules (déterminant pour la colinéarité, produit scalaire
   * pour l'orthogonalité) se ressemblent mais testent deux relations
   * très différentes, appliquées ici aux mêmes vecteurs AB, AC. En
   * colinéarité, k tel que AC = k·AB est affiché (fraction exacte) ; en
   * orthogonalité, marqueur d'angle droit et vérification Pythagore.
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
    return arrondi.toFixed(decimales).replace(".", ",").replace(/-/g, "−");
  }

  /** Nombre exact (pas 0,5 → au plus 2 décimales) sans zéros inutiles. */
  function nb(n) {
    var r = Math.round(n * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    return String(r).replace(".", ",").replace(/-/g, "−");
  }
  function nbPar(n) { return n < 0 ? "(" + nb(n) + ")" : nb(n); }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  /** k = num/den avec num, den entiers → fraction irréductible. */
  function fraction(num, den) {
    if (den < 0) { num = -num; den = -den; }
    if (num === 0) return "0";
    var g = pgcd(num, den); num /= g; den /= g;
    return (num < 0 ? "−" : "") + (den === 1 ? Math.abs(num) : Math.abs(num) + "/" + den);
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
    '.mode-row button{flex:1 1 0;max-width:190px;min-height:44px;padding:8px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);font-weight:700;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.mode-row button[aria-pressed="true"]{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:#fff;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.droite-ab{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.vecteur-ab{stroke:var(--good,#2f7a4f);stroke-width:2.2;}' +
    '.vecteur-ac{stroke:var(--accent,#a8471f);stroke-width:2.2;}' +
    '.segment-bc{stroke:var(--ink-faint,#9c9083);stroke-width:1.2;stroke-dasharray:2 3;}' +
    '.fl-good{fill:var(--good,#2f7a4f);}' +
    '.fl-accent{fill:var(--accent,#a8471f);}' +
    '.angle-droit{stroke:var(--good,#2f7a4f);stroke-width:1.6;fill:none;}' +
    '.etiquette-vec{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.ev-good{fill:var(--good,#2f7a4f);}' +
    '.ev-accent{fill:var(--accent-ink,#7a3212);}' +
    '.point{fill:var(--ink,#241f1a);}' +
    '.point-verifie{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:13px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink,#241f1a);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.etiquette-vec{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.ligne-formule{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.88rem;line-height:1.5;}' +
    '.ligne-k{padding:9px 12px;border-radius:var(--radius,3px);border:1px solid var(--good,#2f7a4f);font-size:0.9rem;font-weight:700;color:var(--good,#2f7a4f);line-height:1.5;}' +
    '.ligne-pyth{padding:9px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);font-size:0.88rem;line-height:1.5;}' +
    '.ligne-pyth.vrai{border-color:var(--good,#2f7a4f);color:var(--good,#2f7a4f);font-weight:700;}' +
    '.ligne-active{font-weight:700;}' +
    '.ligne-active.vrai{color:var(--good,#2f7a4f);}' +
    '.ligne-active.faux{color:var(--ink-soft,#6b6055);}' +
    '.ligne-inactive{color:var(--ink-faint,#9c9083);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    'button:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="mode-row" id="mode" role="group" aria-label="Choix du test">' +
    '<button type="button" data-mode="colinearite">Tester la colinéarité</button>' +
    '<button type="button" data-mode="orthogonalite">Tester l\'orthogonalité</button>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="lecture" id="lecture" aria-live="polite"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="cx">Abscisse de C</label><div class="curseur-row">' +
    '<input type="range" id="cx" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.cx + '">' +
    '<span class="curseur-valeur" id="cx-valeur"></span></div></div>' +
    '<div class="curseur"><label for="cy">Ordonnée de C</label><div class="curseur-row">' +
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
      btn.setAttribute("aria-pressed", btn.getAttribute("data-mode") === mode ? "true" : "false");
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
    [["fleche", "fleche"], ["fl-good", "fl-good"], ["fl-accent", "fl-accent"]].forEach(function (f) {
      var mk = svgEl(ns, "marker", { id: f[0], markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto", markerUnits: "userSpaceOnUse" });
      mk.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: f[1] }));
      defs.appendChild(mk);
    });
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));

    var pA = self._toPx(A.x, A.y), pB = self._toPx(B.x, B.y), pC = self._toPx(cx, cy);

    var pDroite0 = self._toPx(A.x - 5 * abx, A.y - 5 * aby), pDroite1 = self._toPx(A.x + 5 * abx, A.y + 5 * aby);
    svg.appendChild(svgEl(ns, "line", { x1: pDroite0[0].toFixed(2), y1: pDroite0[1].toFixed(2), x2: pDroite1[0].toFixed(2), y2: pDroite1[1].toFixed(2), class: "droite-ab" }));

    var cEnA = Math.abs(acx) < 1e-9 && Math.abs(acy) < 1e-9;
    if (mode === "orthogonalite" && !cEnA) {
      svg.appendChild(svgEl(ns, "line", { x1: pB[0].toFixed(2), y1: pB[1].toFixed(2), x2: pC[0].toFixed(2), y2: pC[1].toFixed(2), class: "segment-bc" }));
    }
    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pB[0].toFixed(2), y2: pB[1].toFixed(2), class: "vecteur-ab", "marker-end": "url(#fl-good)" }));
    if (!cEnA) svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pC[0].toFixed(2), y2: pC[1].toFixed(2), class: "vecteur-ac", "marker-end": "url(#fl-accent)" }));

    var estVerifie = mode === "colinearite" ? Math.abs(determinant) < EPS : Math.abs(produitScalaire) < EPS;

    if (mode === "orthogonalite" && estVerifie && !cEnA) {
      // marqueur d'angle droit en A, le long de AB et AC (en pixels)
      var u1 = [pB[0] - pA[0], pB[1] - pA[1]], u2 = [pC[0] - pA[0], pC[1] - pA[1]];
      var n1 = Math.hypot(u1[0], u1[1]), n2 = Math.hypot(u2[0], u2[1]), t = 11;
      var q1 = [pA[0] + u1[0] / n1 * t, pA[1] + u1[1] / n1 * t], q2 = [pA[0] + u2[0] / n2 * t, pA[1] + u2[1] / n2 * t];
      var q3 = [q1[0] + u2[0] / n2 * t, q1[1] + u2[1] / n2 * t];
      svg.appendChild(svgEl(ns, "path", { d: "M" + q1[0].toFixed(2) + " " + q1[1].toFixed(2) + " L" + q3[0].toFixed(2) + " " + q3[1].toFixed(2) + " L" + q2[0].toFixed(2) + " " + q2[1].toFixed(2), class: "angle-droit" }));
    }

    function etVec(p0, p1, texte, classe, cote) {
      var mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy) || 1;
      var nx = -dy / L * cote, ny = dx / L * cote;
      var e = svgEl(ns, "text", { x: (mx + nx * 14).toFixed(2), y: (my + ny * 14 + 4).toFixed(2), "text-anchor": "middle", class: "etiquette-vec " + classe });
      e.textContent = texte;
      svg.appendChild(e);
    }
    etVec(pA, pB, "AB⃗", "ev-good", 1);
    if (!cEnA && Math.hypot(pC[0] - pA[0], pC[1] - pA[1]) > 30) etVec(pA, pC, "AC⃗", "ev-accent", -1);

    [["A", pA, "point"], ["B", pB, "point"], ["C", pC, estVerifie ? "point-verifie" : "point"]].forEach(function (t) {
      svg.appendChild(svgEl(ns, "circle", { cx: t[1][0].toFixed(2), cy: t[1][1].toFixed(2), r: 5, class: t[2] }));
      var et = svgEl(ns, "text", { x: (t[1][0] + 9).toFixed(2), y: (t[1][1] - 9).toFixed(2), class: "etiquette" });
      et.textContent = t[0];
      svg.appendChild(et);
    });

    var detNul = Math.abs(determinant) < EPS, psNul = Math.abs(produitScalaire) < EPS;
    var ligneVecteurs = "u⃗ = AB⃗(" + nb(abx) + " ; " + nb(aby) + ") et v⃗ = AC⃗(" + nb(acx) + " ; " + nb(acy) + ")";
    var ligneColinearite =
      "Déterminant : xᵤ·yᵥ − yᵤ·xᵥ = " + nb(abx) + " × " + nbPar(acy) + " − " + nb(aby) + " × " + nbPar(acx) +
      " = " + nb(determinant) + (detNul ? " → colinéaires : A, B, C alignés" : " ≠ 0 → pas colinéaires");
    var ligneOrtho =
      "Produit scalaire : xᵤ·xᵥ + yᵤ·yᵥ = " + nb(abx) + " × " + nbPar(acx) + " + " + nb(aby) + " × " + nbPar(acy) +
      " = " + nb(produitScalaire) + (psNul ? " → orthogonaux" : " ≠ 0 → pas orthogonaux");

    var extra = "";
    if (mode === "colinearite" && detNul) {
      // AB = (2 ; 1) : k = x_AC / x_AB, calculé en demi-unités pour rester exact
      var k = cEnA ? "0" : fraction(Math.round(acx * 2), Math.round(abx * 2));
      extra = '<div class="ligne-k">' + (cEnA
        ? "C est confondu avec A : AC⃗ est le vecteur nul, colinéaire à tout vecteur (AC⃗ = 0·AB⃗)."
        : "AC⃗ = k·AB⃗ avec k = " + k + " : (" + nb(acx) + " ; " + nb(acy) + ") = " + k + " × (" + nb(abx) + " ; " + nb(aby) + ")") + '</div>';
    } else if (mode === "orthogonalite") {
      var ab2 = abx * abx + aby * aby, ac2 = acx * acx + acy * acy;
      var bcx = cx - B.x, bcy = cy - B.y, bc2 = bcx * bcx + bcy * bcy;
      var egal = Math.abs(ab2 + ac2 - bc2) < 1e-9;
      extra = '<div class="ligne-pyth' + (egal && !cEnA ? " vrai" : "") + '">' + (cEnA
        ? "C est confondu avec A : il n'y a pas de triangle ABC."
        : "Pythagore : AB² + AC² = " + nb(ab2) + " + " + nb(ac2) + " = " + nb(ab2 + ac2) + " et BC² = " + nb(bc2) +
          (egal ? " → égalité : le triangle ABC est rectangle en A, exactement quand le produit scalaire est nul."
                : " → pas d'égalité : le triangle ABC n'est pas rectangle en A (et le produit scalaire n'est pas nul).")) + '</div>';
    }

    this._lecture.innerHTML =
      '<div class="ligne-formule">' + ligneVecteurs + '</div>' +
      '<div class="ligne-formule ' + (mode === "colinearite" ? "ligne-active " + (detNul ? "vrai" : "faux") : "ligne-inactive") + '">' + ligneColinearite + '</div>' +
      '<div class="ligne-formule ' + (mode === "orthogonalite" ? "ligne-active " + (psNul ? "vrai" : "faux") : "ligne-inactive") + '">' + ligneOrtho + '</div>' +
      extra;
  };

  if (!customElements.get("test-colinearite-widget")) {
    customElements.define("test-colinearite-widget", TestColinariteWidgetClass);
  }
})();
