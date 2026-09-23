(function () {
  "use strict";

  /* ================================================================
   * <composition-machine-widget> — atelier interactif : deux graphes empilés
   * (même principe visuel que l'illustration statique compositionNumeric déjà
   * présente au-dessus), un curseur a, et un sélecteur d'ordre (f∘g)/(g∘f).
   * La valeur intermédiaire "rebondit" du graphe du haut vers celui du bas —
   * exactement la méthode "deux lectures, un report" enseignée dans la
   * section. Web Component (Shadow DOM).
   * ================================================================ */

  var PRESETS = [
    {
      nom: "f(x)=x+1, g(x)=x²",
      f: { expr: "x+1", fn: function (x) { return x + 1; } },
      g: { expr: "x²", fn: function (x) { return x * x; } },
      aMin: -3, aMax: 3, aDefaut: 2,
    },
    {
      nom: "f(x)=√x, g(x)=x−3",
      f: { expr: "√x", fn: function (x) { return x < 0 ? NaN : Math.sqrt(x); } },
      g: { expr: "x−3", fn: function (x) { return x - 3; } },
      aMin: -1, aMax: 8, aDefaut: 5,
    },
    {
      nom: "f(x)=2x−1, g(x)=|x|",
      f: { expr: "2x−1", fn: function (x) { return 2 * x - 1; } },
      g: { expr: "|x|", fn: function (x) { return Math.abs(x); } },
      aMin: -4, aMax: 4, aDefaut: 1.5,
    },
  ];

  var LARGEUR = 440, HAUTEUR = 340, X_LEFT = 70, X_RIGHT = 410;
  var TOP_Y0 = 150, TOP_Y1 = 30, BOT_Y0 = 320, BOT_Y1 = 200;

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

  // Étendue réellement atteinte par f sur [xMin, xMax] — échantillonnage, jamais une formule
  // dérivée à la main (fonctions interchangeables via les presets, y compris avec un domaine
  // restreint comme √x où certains échantillons sont invalides et doivent être ignorés).
  function etendue(fn, xMin, xMax) {
    var min = Infinity, max = -Infinity;
    var n = 200;
    for (var i = 0; i <= n; i++) {
      var x = xMin + (i / n) * (xMax - xMin);
      var y = fn(x);
      if (isFinite(y)) {
        if (y < min) min = y;
        if (y > max) max = y;
      }
    }
    if (min > max) { min = 0; max = 1; } // aucun échantillon valide (cas pathologique) — repli sûr
    var marge = Math.max(0.5, (max - min) * 0.12);
    return { min: min - marge, max: max + marge };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.controles-hauts{display:flex;flex-direction:column;gap:10px;align-items:center;margin-bottom:12px;}' +
    '.controles-hauts select{font-family:inherit;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;max-width:100%;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:2px 0 0;}' +
    '.formule .accent{color:var(--accent-ink,#7a3212);}' +
    '.formule .good{color:var(--good,#2f7a4f);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.4;fill:none;opacity:0.75;}' +
    '.guide-1{stroke:var(--accent,#a8471f);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.guide-2{stroke:var(--good,#2f7a4f);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.point-1{fill:var(--accent,#a8471f);}' +
    '.point-2{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:11.5px;font-family:var(--mono,monospace);}' +
    '.etiquette-1{fill:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.etiquette-2{fill:var(--good,#2f7a4f);font-weight:600;}' +
    '.etiquette-graphe{font-size:13px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}' +
    '.message{text-align:center;font-size:0.9rem;color:var(--bad,#a8322f);font-weight:600;margin:0 0 16px;padding:10px 14px;background:var(--bad-soft,#f8e2e0);border-radius:var(--radius,3px);}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="controles-hauts">' +
    '<select id="preset"></select>' +
    '<select id="ordre">' +
    '<option value="fg">(f∘g)(x) — g d\'abord, puis f</option>' +
    '<option value="gf">(g∘f)(x) — f d\'abord, puis g</option>' +
    '</select>' +
    '</div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div id="zone-resultat"></div>' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="-3" max="3" step="0.05" value="2">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>';

  class CompositionMachineWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CompositionMachineWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._presetIndex = 0;
    this._ordre = "fg";
    this._svg = shadow.getElementById("svg");
    this._selectPreset = shadow.getElementById("preset");
    this._selectOrdre = shadow.getElementById("ordre");
    this._inputA = shadow.getElementById("a");
    this._valeurA = shadow.getElementById("a-valeur");
    this._zoneResultat = shadow.getElementById("zone-resultat");
    PRESETS.forEach(function (p, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = p.nom;
      shadow.getElementById("preset").appendChild(opt);
    });
    this._a = PRESETS[0].aDefaut;
  };

  CompositionMachineWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangePreset = function () {
      self._presetIndex = parseInt(self._selectPreset.value, 10);
      var p = PRESETS[self._presetIndex];
      self._a = p.aDefaut;
      self._inputA.min = String(p.aMin);
      self._inputA.max = String(p.aMax);
      self._inputA.value = String(p.aDefaut);
      self._rendre();
    };
    this._onChangeOrdre = function () { self._ordre = self._selectOrdre.value; self._rendre(); };
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._selectPreset.addEventListener("change", this._onChangePreset);
    this._selectOrdre.addEventListener("change", this._onChangeOrdre);
    this._inputA.addEventListener("input", this._onInputA);
    var p0 = PRESETS[0];
    this._inputA.min = String(p0.aMin);
    this._inputA.max = String(p0.aMax);
    this._inputA.value = String(p0.aDefaut);
    this._rendre();
  };

  CompositionMachineWidgetClass.prototype.disconnectedCallback = function () {
    this._selectPreset.removeEventListener("change", this._onChangePreset);
    this._selectOrdre.removeEventListener("change", this._onChangeOrdre);
    this._inputA.removeEventListener("input", this._onInputA);
  };

  function toPx(xMin, xMax, y0Px, y1Px, yMin, yMax, xMath, yMath) {
    var px = X_LEFT + (xMath - xMin) / (xMax - xMin) * (X_RIGHT - X_LEFT);
    var py = y0Px - (yMath - yMin) / (yMax - yMin) * (y0Px - y1Px);
    return [px, py];
  }

  function traceCourbe(svg, ns, fn, xMin, xMax, yMin, yMax, y0Px, y1Px, classe) {
    var n = 220, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = fn(xx);
      var valide = isFinite(yy) && yy >= yMin && yy <= yMax;
      if (valide) {
        var p = toPx(xMin, xMax, y0Px, y1Px, yMin, yMax, xx, yy);
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: classe }));
    });
  }

  function dessinerAxes(svg, ns, xMin, xMax, yMin, yMax, y0Px, y1Px, label) {
    var origineY = toPx(xMin, xMax, y0Px, y1Px, yMin, yMax, xMin, Math.max(yMin, Math.min(yMax, 0)))[1];
    svg.appendChild(svgEl(ns, "line", { x1: X_LEFT, x2: X_RIGHT, y1: origineY.toFixed(2), y2: origineY.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    var origineX = toPx(xMin, xMax, y0Px, y1Px, yMin, yMax, Math.max(xMin, Math.min(xMax, 0)), yMin)[0];
    // Verticale dessinée du bas (y0Px) vers le haut (y1Px) pour que la flèche (marker-end)
    // pointe vers le haut plutôt que vers l'origine.
    svg.appendChild(svgEl(ns, "line", { x1: origineX.toFixed(2), x2: origineX.toFixed(2), y1: y0Px, y2: y1Px, class: "axe", "marker-end": "url(#fleche)" }));
    var et = svgEl(ns, "text", { x: X_LEFT, y: y1Px - 8, class: "etiquette-graphe" });
    et.textContent = label;
    svg.appendChild(et);
  }

  CompositionMachineWidgetClass.prototype._rendre = function () {
    var preset = PRESETS[this._presetIndex];
    var a = this._a;

    var estFG = this._ordre === "fg"; // (f∘g)(x) = f(g(x)) : g s'applique en premier
    var premiere = estFG ? preset.g : preset.f;
    var seconde = estFG ? preset.f : preset.g;
    var labelExt = estFG ? "f" : "g";
    var labelInt = estFG ? "g" : "f";

    this._valeurA.textContent = formatNombreFr(a, 2);

    var v1 = premiere.fn(a);
    var v2 = isFinite(v1) ? seconde.fn(v1) : NaN;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var yTop = etendue(premiere.fn, preset.aMin, preset.aMax);
    dessinerAxes(svg, ns, preset.aMin, preset.aMax, yTop.min, yTop.max, TOP_Y0, TOP_Y1, "C_" + labelInt);
    traceCourbe(svg, ns, premiere.fn, preset.aMin, preset.aMax, yTop.min, yTop.max, TOP_Y0, TOP_Y1, "courbe");

    var xBot = etendue(premiere.fn, preset.aMin, preset.aMax);
    var yBot = etendue(seconde.fn, xBot.min, xBot.max);
    dessinerAxes(svg, ns, xBot.min, xBot.max, yBot.min, yBot.max, BOT_Y0, BOT_Y1, "C_" + labelExt);
    traceCourbe(svg, ns, seconde.fn, xBot.min, xBot.max, yBot.min, yBot.max, BOT_Y0, BOT_Y1, "courbe");

    if (isFinite(v1)) {
      var pA = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, a, v1);
      var pAaxe = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, a, yTop.min);
      var pAy = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, preset.aMin, v1);
      svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pAaxe[1].toFixed(2), x2: pA[0].toFixed(2), y2: pA[1].toFixed(2), class: "guide-1" }));
      svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pAy[0].toFixed(2), y2: pA[1].toFixed(2), class: "guide-1" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pA[0].toFixed(2), cy: pA[1].toFixed(2), r: 4.5, class: "point-1" }));
      var et1 = svgEl(ns, "text", { x: (pA[0] + 8).toFixed(2), y: (pA[1] - 8).toFixed(2), class: "etiquette etiquette-1" });
      et1.textContent = labelInt + "(" + formatNombreFr(a, 2) + ")=" + formatNombreFr(v1, 2);
      svg.appendChild(et1);

      if (isFinite(v2)) {
        var pB = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, v1, v2);
        var pBaxe = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, v1, yBot.min);
        var pBy = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, xBot.min, v2);
        svg.appendChild(svgEl(ns, "line", { x1: pB[0].toFixed(2), y1: pBaxe[1].toFixed(2), x2: pB[0].toFixed(2), y2: pB[1].toFixed(2), class: "guide-2" }));
        svg.appendChild(svgEl(ns, "line", { x1: pB[0].toFixed(2), y1: pB[1].toFixed(2), x2: pBy[0].toFixed(2), y2: pB[1].toFixed(2), class: "guide-2" }));
        svg.appendChild(svgEl(ns, "circle", { cx: pB[0].toFixed(2), cy: pB[1].toFixed(2), r: 4.5, class: "point-2" }));
        var et2 = svgEl(ns, "text", { x: (pB[0] + 8).toFixed(2), y: (pB[1] - 8).toFixed(2), class: "etiquette etiquette-2" });
        et2.textContent = labelExt + "(" + formatNombreFr(v1, 2) + ")=" + formatNombreFr(v2, 2);
        svg.appendChild(et2);
      }
    }

    var notation = "(" + (estFG ? "f∘g" : "g∘f") + ")(" + formatNombreFr(a, 2) + ")";
    if (!isFinite(v1)) {
      this._zoneResultat.innerHTML = '<p class="message">' + notation + " n'existe pas : " + labelInt + "(" + formatNombreFr(a, 2) + ") n'est pas défini.</p>";
    } else if (!isFinite(v2)) {
      this._zoneResultat.innerHTML = '<p class="message">' + notation + " n'existe pas : " + labelExt + "(" + formatNombreFr(v1, 2) + ") n'est pas défini — la valeur intermédiaire sort du domaine de " + labelExt + ".</p>";
    } else {
      this._zoneResultat.innerHTML = '<p class="resultat">' + notation + " = " + labelExt + "(" + labelInt + "(" + formatNombreFr(a, 2) + ")) = " + labelExt + "(" + formatNombreFr(v1, 2) + ") = " + formatNombreFr(v2, 2) + "</p>";
    }
  };

  if (!customElements.get("composition-machine-widget")) {
    customElements.define("composition-machine-widget", CompositionMachineWidgetClass);
  }
})();
