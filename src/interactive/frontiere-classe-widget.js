(function () {
  "use strict";

  /* ================================================================
   * <frontiere-classe-widget> — atelier interactif : une valeur x
   * déplaçable sur une droite graduée portant les 4 classes de l'exemple
   * résolu ([0;2[, [2;4[, [4;6[, [6;8]), qui montre en direct dans quelle
   * classe x tombe — matérialise le piège : une donnée exactement sur une
   * frontière appartient à la classe SUIVANTE (sauf la toute dernière
   * classe, qui inclut sa borne supérieure). Web Component (Shadow DOM).
   * ================================================================ */

  var CLASSES = [
    { debut: 0, fin: 2, label: "[0;2[" },
    { debut: 2, fin: 4, label: "[2;4[" },
    { debut: 4, fin: 6, label: "[4;6[" },
    { debut: 6, fin: 8, label: "[6;8]" },
  ];
  var X_MIN = -0.5, X_MAX = 8.5;
  var DEFAUT_X = 3.5;
  var BORNES_X = { min: X_MIN, max: X_MAX, step: 0.1 };
  var LARGEUR = 420, HAUTEUR = 140, MARGE_G = 30, MARGE_D = 30;
  var Y_LIGNE = 70;
  var EPSILON_FRONTIERE = 0.05;

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

  function xPx(xMath) {
    return MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D);
  }

  function classeDe(x) {
    // Une classe [debut;fin[ contient sa borne inférieure, jamais sa borne supérieure — sauf la
    // toute dernière classe du tableau, qui inclut aussi sa borne supérieure (pour ne perdre
    // aucune donnée). Une valeur pile sur une frontière appartient donc à la classe SUIVANTE.
    for (var i = 0; i < CLASSES.length; i++) {
      var c = CLASSES[i];
      var estDerniere = i === CLASSES.length - 1;
      if (x >= c.debut && (estDerniere ? x <= c.fin : x < c.fin)) return i;
    }
    return -1;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.ligne{stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.tick-frontiere{stroke:var(--ink,#241f1a);stroke-width:2;}' +
    '.segment-classe{stroke-width:6;stroke-linecap:butt;}' +
    '.segment-active{stroke:var(--good,#2f7a4f);}' +
    '.segment-inactive{stroke:var(--line,#e2d8c8);}' +
    '.point-x{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:2;}' +
    '.point-frontiere{fill:var(--bad,#b23a3a);}' +
    '.etiquette-tick{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-classe{font-size:11px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette-x{font-size:12.5px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--mono,monospace);}' +
    '.verdict{text-align:center;font-size:0.92rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-normal{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-frontiere{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x">x — donnée</label><div class="curseur-row">' +
    '<input type="range" id="x" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT_X + '">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class FrontiereClasseWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  FrontiereClasseWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._x = DEFAUT_X;
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  FrontiereClasseWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._onReset = function () {
      self._x = DEFAUT_X;
      self._inputX.value = String(DEFAUT_X);
      self._rendre();
    };
    this._inputX.addEventListener("input", this._onInputX);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  FrontiereClasseWidgetClass.prototype.disconnectedCallback = function () {
    this._inputX.removeEventListener("input", this._onInputX);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  FrontiereClasseWidgetClass.prototype._rendre = function () {
    var x = this._x;
    this._valeurX.textContent = formatNombreFr(x, 1);
    var indexClasse = classeDe(x);
    var surFrontiere = CLASSES.some(function (c) { return Math.abs(x - c.debut) < EPSILON_FRONTIERE || Math.abs(x - c.fin) < EPSILON_FRONTIERE; });

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    svg.appendChild(svgEl(ns, "line", { x1: xPx(X_MIN), x2: xPx(X_MAX) + 10, y1: Y_LIGNE, y2: Y_LIGNE, class: "ligne", "marker-end": "url(#fleche)" }));

    CLASSES.forEach(function (c, i) {
      var estActive = i === indexClasse;
      svg.appendChild(svgEl(ns, "line", {
        x1: xPx(c.debut).toFixed(2), x2: xPx(c.fin).toFixed(2), y1: Y_LIGNE, y2: Y_LIGNE,
        class: "segment-classe " + (estActive ? "segment-active" : "segment-inactive"),
      }));
      var etC = svgEl(ns, "text", { x: ((xPx(c.debut) + xPx(c.fin)) / 2).toFixed(2), y: Y_LIGNE - 14, "text-anchor": "middle", class: "etiquette-classe" });
      etC.textContent = c.label;
      svg.appendChild(etC);
    });

    [0, 2, 4, 6, 8].forEach(function (t) {
      var px = xPx(t);
      svg.appendChild(svgEl(ns, "line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: Y_LIGNE - 8, y2: Y_LIGNE + 8, class: "tick-frontiere" }));
      var etT = svgEl(ns, "text", { x: px.toFixed(2), y: Y_LIGNE + 24, "text-anchor": "middle", class: "etiquette-tick" });
      etT.textContent = String(t);
      svg.appendChild(etT);
    });

    var pX = xPx(x);
    svg.appendChild(svgEl(ns, "circle", { cx: pX.toFixed(2), cy: Y_LIGNE, r: 6.5, class: surFrontiere ? "point-frontiere" : "point-x" }));
    var etX = svgEl(ns, "text", { x: pX.toFixed(2), y: Y_LIGNE - 26, "text-anchor": "middle", class: "etiquette-x" });
    etX.textContent = "x=" + formatNombreFr(x, 1);
    svg.appendChild(etX);

    var derniereClasse = CLASSES[CLASSES.length - 1];
    var surBorneFinale = Math.abs(x - derniereClasse.fin) < EPSILON_FRONTIERE;

    if (indexClasse === -1) {
      this._verdict.className = "verdict verdict-frontiere";
      this._verdict.textContent = "x = " + formatNombreFr(x, 1) + " est hors des classes du tableau.";
    } else if (surBorneFinale) {
      this._verdict.className = "verdict verdict-frontiere";
      this._verdict.textContent =
        "x = " + formatNombreFr(x, 1) + " tombe sur la borne supérieure de la DERNIÈRE classe (" +
        derniereClasse.label + ") → exception : elle lui appartient quand même, pour ne perdre aucune donnée.";
    } else if (surFrontiere) {
      this._verdict.className = "verdict verdict-frontiere";
      this._verdict.textContent =
        "x = " + formatNombreFr(x, 1) + " tombe PILE sur une frontière → appartient à la classe " +
        CLASSES[indexClasse].label + " (la classe qui COMMENCE ici, jamais celle qui se termine ici) !";
    } else {
      this._verdict.className = "verdict verdict-normal";
      this._verdict.textContent = "x = " + formatNombreFr(x, 1) + " appartient à la classe " + CLASSES[indexClasse].label + ".";
    }
  };

  if (!customElements.get("frontiere-classe-widget")) {
    customElements.define("frontiere-classe-widget", FrontiereClasseWidgetClass);
  }
})();
