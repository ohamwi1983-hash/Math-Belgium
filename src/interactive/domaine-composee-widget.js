(function () {
  "use strict";

  /* ================================================================
   * <domaine-composee-widget> — atelier interactif : la "double condition"
   * du domaine d'une composée, visualisée sur 3 droites graduées empilées
   * (dom de la fonction intérieure ; condition [intérieure](x)∈dom extérieure ;
   * intersection = dom de la composée). Un curseur x place un marqueur sur
   * les 3 droites à la fois, coloré selon que la condition de sa ligne est
   * vérifiée. Reprend les 2 exemples déjà résolus dans le contenu de cette
   * section. Web Component (Shadow DOM).
   * ================================================================ */

  var PRESETS = [
    {
      nom: "domaine non vide — (g∘f)(x), f(x)=√(−3x+6), g(x)=√(−2x+4)",
      labelInt: "f", labelExt: "g",
      xMin: -2, xMax: 5,
      // Traduction directe de l'algèbre déjà posée dans le contenu, valable pour tout réel x
      // (jamais dérivée d'une évaluation de fn(x), qui pourrait être NaN hors domaine).
      cond1: function (x) { return -3 * x + 6 >= 0; },           // x ∈ dom(f)  ⟺ x ≤ 2
      cond2: function (x) { return -3 * x + 6 <= 4; },           // f(x) ≤ 2, càd f(x) ∈ dom(g) ⟺ x ≥ 2/3
      resultat: "dom(g∘f) = [2/3 ; 2]",
    },
    {
      nom: "domaine vide — (f∘g)(x), f(x)=√(x−10), g(x)=−x²",
      labelInt: "g", labelExt: "f",
      xMin: -6, xMax: 6,
      cond1: function () { return true; },                       // dom(g) = ℝ
      cond2: function () { return false; },                       // −x² ≥ 10 : jamais vrai
      resultat: "dom(f∘g) = ∅",
    },
  ];

  var LARGEUR = 420, MARGE = 40, LIGNE_LARGEUR = LARGEUR - 2 * MARGE;
  var Y_LIGNES = [50, 130, 210];
  var HAUTEUR = 260;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(/\.0+$/, "").replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function xPx(xMin, xMax, x) {
    return MARGE + (x - xMin) / (xMax - xMin) * LIGNE_LARGEUR;
  }

  // Segments où le prédicat est vrai, sur [xMin,xMax], avec une frontière affinée par
  // bissection (précision largement suffisante pour un tracé, jamais une formule dérivée à la
  // main — les prédicats eux-mêmes sont l'algèbre exacte, fournie par preset).
  function segmentsVrais(predicat, xMin, xMax) {
    var n = 600;
    var segments = [];
    var debut = null;
    var precedent = predicat(xMin);
    if (precedent) debut = xMin;
    for (var i = 1; i <= n; i++) {
      var x = xMin + (i / n) * (xMax - xMin);
      var val = predicat(x);
      if (val && !precedent) {
        var xPrec = xMin + ((i - 1) / n) * (xMax - xMin);
        debut = affiner(predicat, xPrec, x, false);
      } else if (!val && precedent) {
        var xPrec2 = xMin + ((i - 1) / n) * (xMax - xMin);
        var fin = affiner(predicat, xPrec2, x, true);
        segments.push([debut, fin]);
        debut = null;
      }
      precedent = val;
    }
    if (debut !== null) segments.push([debut, xMax]);
    return segments;
  }

  function affiner(predicat, xFaux, xVrai, cherFaux) {
    for (var k = 0; k < 24; k++) {
      var mid = (xFaux + xVrai) / 2;
      var val = predicat(mid);
      if (val === !cherFaux) xVrai = mid; else xFaux = mid;
    }
    return cherFaux ? xFaux : xVrai;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.select-row{display:flex;justify-content:center;margin-bottom:14px;}' +
    '.select-row select{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;max-width:100%;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.ligne{stroke:var(--line,#e2d8c8);stroke-width:2;}' +
    '.fleche{fill:var(--line,#e2d8c8);}' +
    '.segment{stroke:var(--good,#2f7a4f);stroke-width:6;stroke-linecap:round;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1.2;}' +
    '.tick-label{font-size:10.5px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.ligne-label{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);font-weight:600;}' +
    '.marqueur{stroke:var(--surface,#fff);stroke-width:2;}' +
    '.marqueur.dedans{fill:var(--good,#2f7a4f);}' +
    '.marqueur.dehors{fill:var(--ink-faint,#9c9083);}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="select-row"><select id="preset"></select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="curseur"><label for="x">x à tester</label><div class="curseur-row">' +
    '<input type="range" id="x" min="-2" max="5" step="0.05" value="1">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>';

  class DomaineComposeeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  DomaineComposeeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._presetIndex = 0;
    this._svg = shadow.getElementById("svg");
    this._selectPreset = shadow.getElementById("preset");
    this._inputX = shadow.getElementById("x");
    this._valeurX = shadow.getElementById("x-valeur");
    this._resultat = shadow.getElementById("resultat");
    PRESETS.forEach(function (p, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = p.nom;
      shadow.getElementById("preset").appendChild(opt);
    });
    this._x = 1;
  };

  DomaineComposeeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangePreset = function () {
      self._presetIndex = parseInt(self._selectPreset.value, 10);
      var p = PRESETS[self._presetIndex];
      self._x = (p.xMin + p.xMax) / 2;
      self._inputX.min = String(p.xMin);
      self._inputX.max = String(p.xMax);
      self._inputX.value = String(self._x);
      self._rendre();
    };
    this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
    this._selectPreset.addEventListener("change", this._onChangePreset);
    this._inputX.addEventListener("input", this._onInputX);
    var p0 = PRESETS[0];
    this._inputX.min = String(p0.xMin);
    this._inputX.max = String(p0.xMax);
    this._x = (p0.xMin + p0.xMax) / 2;
    this._inputX.value = String(self._x);
    this._rendre();
  };

  DomaineComposeeWidgetClass.prototype.disconnectedCallback = function () {
    this._selectPreset.removeEventListener("change", this._onChangePreset);
    this._inputX.removeEventListener("input", this._onInputX);
  };

  DomaineComposeeWidgetClass.prototype._dessinerLigne = function (svg, ns, y, xMin, xMax, predicat, label, x) {
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: y, y2: y, class: "ligne", "marker-end": "url(#fleche)" }));
    var segs = segmentsVrais(predicat, xMin, xMax);
    segs.forEach(function (s) {
      var p0 = xPx(xMin, xMax, s[0]), p1 = xPx(xMin, xMax, s[1]);
      svg.appendChild(svgEl(ns, "line", { x1: p0.toFixed(2), y1: y, x2: p1.toFixed(2), y2: y, class: "segment" }));
    });
    var debut = Math.ceil(xMin), fin = Math.floor(xMax);
    for (var t = debut; t <= fin; t++) {
      var px = xPx(xMin, xMax, t);
      svg.appendChild(svgEl(ns, "line", { x1: px.toFixed(2), x2: px.toFixed(2), y1: y - 4, y2: y + 4, class: "tick" }));
      var lab = svgEl(ns, "text", { x: px.toFixed(2), y: y + 16, "text-anchor": "middle", class: "tick-label" });
      lab.textContent = formatNombreFr(t, 0);
      svg.appendChild(lab);
    }
    var lbl = svgEl(ns, "text", { x: MARGE, y: y - 12, class: "ligne-label" });
    lbl.textContent = label;
    svg.appendChild(lbl);

    var dedans = predicat(x);
    var pxM = xPx(xMin, xMax, x);
    svg.appendChild(svgEl(ns, "circle", { cx: pxM.toFixed(2), cy: y, r: 6, class: "marqueur " + (dedans ? "dedans" : "dehors") }));
  };

  DomaineComposeeWidgetClass.prototype._rendre = function () {
    var preset = PRESETS[this._presetIndex];
    var x = this._x;
    this._valeurX.textContent = formatNombreFr(x, 2);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    this._dessinerLigne(svg, ns, Y_LIGNES[0], preset.xMin, preset.xMax, preset.cond1, "dom(" + preset.labelInt + ")", x);
    this._dessinerLigne(svg, ns, Y_LIGNES[1], preset.xMin, preset.xMax, preset.cond2, preset.labelInt + "(x) ∈ dom(" + preset.labelExt + ")", x);
    var intersection = function (v) { return preset.cond1(v) && preset.cond2(v); };
    this._dessinerLigne(svg, ns, Y_LIGNES[2], preset.xMin, preset.xMax, intersection, "intersection = dom(composée)", x);

    this._resultat.textContent = preset.resultat + (intersection(x) ? "  —  x=" + formatNombreFr(x, 2) + " convient" : "  —  x=" + formatNombreFr(x, 2) + " ne convient pas");
  };

  if (!customElements.get("domaine-composee-widget")) {
    customElements.define("domaine-composee-widget", DomaineComposeeWidgetClass);
  }
})();
