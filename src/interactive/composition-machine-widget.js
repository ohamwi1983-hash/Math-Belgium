(function () {
  "use strict";

  /* ================================================================
   * <composition-machine-widget> — atelier interactif : deux graphes empilés
   * (même principe visuel que l'illustration statique compositionNumeric déjà
   * présente au-dessus), un curseur a, et un sélecteur d'ordre (f∘g)/(g∘f).
   * La valeur intermédiaire "rebondit" du graphe du haut vers celui du bas —
   * exactement la méthode "deux lectures, un report" enseignée dans la
   * section. Web Component (Shadow DOM).
   *
   * Mode « un seul repère + droite y = x » (audit de contenu 5e ch. 1) : f et g
   * tracées dans le MÊME repère carré avec la diagonale ; la valeur intermédiaire
   * se reporte en rebondissant sur y = x (verticale jusqu'à la 1re courbe,
   * horizontale jusqu'à la diagonale, verticale jusqu'à la 2e courbe, lecture
   * sur l'axe des y) — la méthode graphique classique du report.
   *
   * Chaque fonction peut avoir une `portion` TRACÉE plus petite que son domaine :
   * une valeur intermédiaire hors de la portion tracée (mais dans le domaine)
   * donne « pas lisible sur ce graphique », distinct de « n'existe pas » (hors
   * du domaine).
   *
   * <composition-graphique-widget> (section « Lire une composée sur un
   * graphique ») : même composant, ouvert directement en mode diagonale.
   * ================================================================ */

  var PRESETS = [
    {
      nom: "f(x)=x+1, g(x)=x²",
      f: { expr: "x+1", fn: function (x) { return x + 1; } },
      g: { expr: "x²", fn: function (x) { return x * x; } },
      aMin: -3, aMax: 3, aDefaut: 2,
    },
    {
      nom: "hors domaine — f(x)=√x, g(x)=x−3",
      f: { expr: "√x", fn: function (x) { return x < 0 ? NaN : Math.sqrt(x); } },
      g: { expr: "x−3", fn: function (x) { return x - 3; } },
      aMin: -1, aMax: 8, aDefaut: 5,
    },
    {
      nom: "hors portion tracée — f(x)=x−1, g(x)=2x",
      f: { expr: "x−1", fn: function (x) { return x - 1; }, portion: [-3, 3] },
      g: { expr: "2x", fn: function (x) { return 2 * x; }, portion: [-3, 3] },
      aMin: -3, aMax: 3, aDefaut: 2,
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
  // Mode diagonale : repère CARRÉ (même échelle sur les deux axes, sinon y = x n'est pas à 45°).
  var D_LEFT = 92, D_RIGHT = 402, D_TOP = 22, D_BOTTOM = 332;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (arrondi === 0) arrondi = 0; // jamais « −0 »
    return arrondi.toFixed(decimales).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1").replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  // Une fonction est-elle TRACÉE en x ? (définie, et dans sa portion dessinée s'il y en a une)
  function estTracee(fonc, x) {
    if (!isFinite(fonc.fn(x))) return false;
    if (fonc.portion && (x < fonc.portion[0] - 1e-9 || x > fonc.portion[1] + 1e-9)) return false;
    return true;
  }

  // Étendue réellement atteinte par f sur [xMin, xMax] — échantillonnage, jamais une formule
  // dérivée à la main (fonctions interchangeables via les presets, y compris avec un domaine
  // restreint comme √x où certains échantillons sont invalides et doivent être ignorés).
  function etendueBrute(fn, xMin, xMax) {
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
    return { min: min, max: max };
  }

  function etendue(fn, xMin, xMax) {
    var e = etendueBrute(fn, xMin, xMax);
    var marge = Math.max(0.5, (e.max - e.min) * 0.12);
    return { min: e.min - marge, max: e.max + marge };
  }

  // Intervalle tracé d'une fonction dans une fenêtre [xMin, xMax].
  function bornesTrace(fonc, xMin, xMax) {
    if (!fonc.portion) return [xMin, xMax];
    return [Math.max(xMin, fonc.portion[0]), Math.min(xMax, fonc.portion[1])];
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.controles-hauts{display:flex;flex-direction:column;gap:10px;align-items:center;margin-bottom:12px;}' +
    '.controles-hauts select{font-family:inherit;font-size:0.92rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;max-width:100%;min-width:0;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:440px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);-webkit-user-select:none;user-select:none;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--ink,#241f1a);stroke-width:2.4;fill:none;opacity:0.75;}' +
    '.courbe-int{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-ext{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.diagonale{stroke:var(--ink-faint,#9c9083);stroke-width:1.4;stroke-dasharray:6 4;fill:none;}' +
    '.tick{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.tick-label{font-size:10px;fill:var(--ink-faint,#9c9083);font-family:var(--mono,monospace);}' +
    '.guide-1{stroke:var(--accent,#a8471f);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.guide-2{stroke:var(--good,#2f7a4f);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.point-1{fill:var(--accent,#a8471f);}' +
    '.point-2{fill:var(--good,#2f7a4f);}' +
    '.point-d{fill:var(--surface,#fff);stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.point-hors{fill:var(--surface,#fff);stroke:var(--bad,#a8322f);stroke-width:2;}' +
    '.etiquette{font-size:11.5px;font-family:var(--mono,monospace);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;stroke-linejoin:round;}' +
    '.etiquette-1{fill:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.etiquette-2{fill:var(--good,#2f7a4f);font-weight:600;}' +
    '.etiquette-d{fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-hors{fill:var(--bad,#a8322f);font-weight:600;}' +
    '.etiquette-graphe{font-size:13px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}' +
    '.legende{font-size:12px;font-family:var(--serif,serif);font-style:italic;}' +
    '.legende-int{fill:var(--accent-ink,#7a3212);font-weight:600;}' +
    '.legende-ext{fill:var(--good,#2f7a4f);font-weight:600;}' +
    '.legende-d{fill:var(--ink-faint,#9c9083);}' +
    '.message{text-align:center;font-size:0.9rem;color:var(--bad,#a8322f);font-weight:600;margin:0 0 16px;padding:10px 14px;background:var(--bad-soft,#f8e2e0);border-radius:var(--radius,3px);}' +
    '.message-info{text-align:center;font-size:0.9rem;color:var(--ink,#241f1a);font-weight:600;margin:0 0 16px;padding:10px 14px;background:var(--surface,#fff);border:1px dashed var(--line,#e2d8c8);border-radius:var(--radius,3px);}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;overflow-wrap:anywhere;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);text-align:center;}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '</style>' +
    '<div class="controles-hauts">' +
    '<select id="preset" aria-label="Choix des fonctions"></select>' +
    '<select id="ordre" aria-label="Ordre de la composition">' +
    '<option value="fg">(f∘g)(x) — g d\'abord, puis f</option>' +
    '<option value="gf">(g∘f)(x) — f d\'abord, puis g</option>' +
    '</select>' +
    '<select id="mode" aria-label="Présentation des graphes">' +
    '<option value="empile">deux graphes empilés</option>' +
    '<option value="diagonale">un seul repère + droite y = x</option>' +
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

  CompositionMachineWidgetClass.modeInitial = "empile";

  CompositionMachineWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._presetIndex = 0;
    this._ordre = "fg";
    this._mode = this.constructor.modeInitial || "empile";
    this._svg = shadow.getElementById("svg");
    this._selectPreset = shadow.getElementById("preset");
    this._selectOrdre = shadow.getElementById("ordre");
    this._selectMode = shadow.getElementById("mode");
    this._inputA = shadow.getElementById("a");
    this._valeurA = shadow.getElementById("a-valeur");
    this._zoneResultat = shadow.getElementById("zone-resultat");
    PRESETS.forEach(function (p, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = p.nom;
      shadow.getElementById("preset").appendChild(opt);
    });
    this._selectMode.value = this._mode;
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
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._rendre(); };
    this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
    this._selectPreset.addEventListener("change", this._onChangePreset);
    this._selectOrdre.addEventListener("change", this._onChangeOrdre);
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._inputA.addEventListener("input", this._onInputA);
    var p0 = PRESETS[this._presetIndex];
    this._inputA.min = String(p0.aMin);
    this._inputA.max = String(p0.aMax);
    this._inputA.value = String(this._a);
    this._rendre();
  };

  CompositionMachineWidgetClass.prototype.disconnectedCallback = function () {
    this._selectPreset.removeEventListener("change", this._onChangePreset);
    this._selectOrdre.removeEventListener("change", this._onChangeOrdre);
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._inputA.removeEventListener("input", this._onInputA);
  };

  function toPx(xMin, xMax, y0Px, y1Px, yMin, yMax, xMath, yMath) {
    var px = X_LEFT + (xMath - xMin) / (xMax - xMin) * (X_RIGHT - X_LEFT);
    var py = y0Px - (yMath - yMin) / (yMax - yMin) * (y0Px - y1Px);
    return [px, py];
  }

  // `toPxFn(x, y)` → [px, py] : tracé générique (empilé OU diagonale), coupé hors de la fenêtre.
  function traceCourbeGen(svg, ns, fn, xA, xB, yMin, yMax, toPxFn, classe) {
    if (!(xB > xA)) return;
    var n = 220, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xA + (i / n) * (xB - xA);
      var yy = fn(xx);
      var valide = isFinite(yy) && yy >= yMin && yy <= yMax;
      if (valide) {
        var p = toPxFn(xx, yy);
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
    ajouterC(et, ns, label);
    svg.appendChild(et);
  }

  // Étiquette jamais rognée : ancrée à gauche du point quand il est près du bord droit, et
  // repoussée sous le point quand il est près du haut.
  function etiquette(svg, ns, px, py, texte, classe) {
    var aDroite = px > LARGEUR - 130;
    var y = py - 8 < 14 ? py + 18 : py - 8;
    var t = svgEl(ns, "text", { x: (aDroite ? px - 8 : px + 8).toFixed(2), y: y.toFixed(2), "text-anchor": aDroite ? "end" : "start", class: "etiquette " + classe });
    t.textContent = texte;
    svg.appendChild(t);
  }

  // « C » + indice (f ou g) en vrai indice SVG — jamais « C_f » écrit avec un tiret bas.
  function ajouterC(parent, ns, lettre, classe, dx) {
    var attrs = classe ? { class: classe } : {};
    if (dx) attrs.dx = dx;
    var t = svgEl(ns, "tspan", attrs);
    t.textContent = "C";
    parent.appendChild(t);
    var sub = svgEl(ns, "tspan", { "baseline-shift": "sub", "font-size": "75%" });
    if (classe) sub.setAttribute("class", classe);
    sub.textContent = lettre;
    parent.appendChild(sub);
  }

  function pasGraduation(etendueMath) {
    if (etendueMath <= 8) return 1;
    if (etendueMath <= 16) return 2;
    if (etendueMath <= 40) return 5;
    return 10;
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
    var v1Lisible = estTracee(premiere, a);
    var v2 = isFinite(v1) ? seconde.fn(v1) : NaN;
    // Valeur intermédiaire dans le domaine de la 2e fonction, mais hors de sa portion tracée.
    var horsPortion = isFinite(v1) && isFinite(v2) && !estTracee(seconde, v1);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";

    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var ctx = { preset: preset, a: a, premiere: premiere, seconde: seconde, labelInt: labelInt, labelExt: labelExt, v1: v1, v2: v2, v1Lisible: v1Lisible, horsPortion: horsPortion };
    if (this._mode === "diagonale") this._rendreDiagonale(svg, ns, ctx);
    else this._rendreEmpile(svg, ns, ctx);

    var notation = "(" + (estFG ? "f∘g" : "g∘f") + ")(" + formatNombreFr(a, 2) + ")";
    if (!isFinite(v1)) {
      this._zoneResultat.innerHTML = '<p class="message">' + notation + " n'existe pas : " + labelInt + "(" + formatNombreFr(a, 2) + ") n'est pas défini.</p>";
    } else if (!isFinite(v2)) {
      this._zoneResultat.innerHTML = '<p class="message">' + notation + " n'existe pas : " + labelExt + "(" + formatNombreFr(v1, 2) + ") n'est pas défini — la valeur intermédiaire sort du domaine de " + labelExt + ".</p>";
    } else if (horsPortion) {
      var portion = seconde.portion;
      this._zoneResultat.innerHTML = '<p class="message-info">' + notation + " n'est pas lisible sur ce graphique : " + labelInt + "(" + formatNombreFr(a, 2) + ") = " + formatNombreFr(v1, 2) +
        " tombe hors de la portion tracée de C<sub>" + labelExt + "</sub> (de " + formatNombreFr(portion[0], 2) + " à " + formatNombreFr(portion[1], 2) + "). " +
        labelExt + "(" + formatNombreFr(v1, 2) + ") existe pourtant (la formule donne " + formatNombreFr(v2, 2) + ") : ne réponds pas « n'existe pas ».</p>";
    } else {
      this._zoneResultat.innerHTML = '<p class="resultat">' + notation + " = " + labelExt + "(" + labelInt + "(" + formatNombreFr(a, 2) + ")) = " + labelExt + "(" + formatNombreFr(v1, 2) + ") = " + formatNombreFr(v2, 2) + "</p>";
    }
  };

  CompositionMachineWidgetClass.prototype._rendreEmpile = function (svg, ns, c) {
    var preset = c.preset, a = c.a, v1 = c.v1, v2 = c.v2;
    var yTop = etendue(c.premiere.fn, preset.aMin, preset.aMax);
    dessinerAxes(svg, ns, preset.aMin, preset.aMax, yTop.min, yTop.max, TOP_Y0, TOP_Y1, c.labelInt);
    var bT = bornesTrace(c.premiere, preset.aMin, preset.aMax);
    traceCourbeGen(svg, ns, c.premiere.fn, bT[0], bT[1], yTop.min, yTop.max, function (x, y) { return toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, x, y); }, "courbe");

    var xBot = etendue(c.premiere.fn, preset.aMin, preset.aMax);
    var bB = bornesTrace(c.seconde, xBot.min, xBot.max);
    var yBot = etendue(c.seconde.fn, bB[0], bB[1]);
    dessinerAxes(svg, ns, xBot.min, xBot.max, yBot.min, yBot.max, BOT_Y0, BOT_Y1, c.labelExt);
    traceCourbeGen(svg, ns, c.seconde.fn, bB[0], bB[1], yBot.min, yBot.max, function (x, y) { return toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, x, y); }, "courbe");

    if (!isFinite(v1)) return;
    var pA = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, a, v1);
    var pAaxe = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, a, yTop.min);
    var pAy = toPx(preset.aMin, preset.aMax, TOP_Y0, TOP_Y1, yTop.min, yTop.max, preset.aMin, v1);
    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pAaxe[1].toFixed(2), x2: pA[0].toFixed(2), y2: pA[1].toFixed(2), class: "guide-1" }));
    svg.appendChild(svgEl(ns, "line", { x1: pA[0].toFixed(2), y1: pA[1].toFixed(2), x2: pAy[0].toFixed(2), y2: pA[1].toFixed(2), class: "guide-1" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pA[0].toFixed(2), cy: pA[1].toFixed(2), r: 4.5, class: "point-1" }));
    etiquette(svg, ns, pA[0], pA[1], c.labelInt + "(" + formatNombreFr(a, 2) + ")=" + formatNombreFr(v1, 2), "etiquette-1");

    if (c.horsPortion) {
      // La valeur intermédiaire arrive sur l'axe du 2e graphe, mais AUCUNE courbe n'est tracée
      // au-dessus : cercle creux sur l'axe, rien à lire.
      var origineY = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, v1, Math.max(yBot.min, Math.min(yBot.max, 0)));
      svg.appendChild(svgEl(ns, "circle", { cx: origineY[0].toFixed(2), cy: origineY[1].toFixed(2), r: 5, class: "point-hors" }));
      etiquette(svg, ns, origineY[0], origineY[1] + 26, "hors du tracé", "etiquette-hors");
      return;
    }
    if (!isFinite(v2)) return;
    var pB = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, v1, v2);
    var pBaxe = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, v1, yBot.min);
    var pBy = toPx(xBot.min, xBot.max, BOT_Y0, BOT_Y1, yBot.min, yBot.max, xBot.min, v2);
    svg.appendChild(svgEl(ns, "line", { x1: pB[0].toFixed(2), y1: pBaxe[1].toFixed(2), x2: pB[0].toFixed(2), y2: pB[1].toFixed(2), class: "guide-2" }));
    svg.appendChild(svgEl(ns, "line", { x1: pB[0].toFixed(2), y1: pB[1].toFixed(2), x2: pBy[0].toFixed(2), y2: pB[1].toFixed(2), class: "guide-2" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pB[0].toFixed(2), cy: pB[1].toFixed(2), r: 4.5, class: "point-2" }));
    etiquette(svg, ns, pB[0], pB[1], c.labelExt + "(" + formatNombreFr(v1, 2) + ")=" + formatNombreFr(v2, 2), "etiquette-2");
  };

  CompositionMachineWidgetClass.prototype._rendreDiagonale = function (svg, ns, c) {
    var preset = c.preset, a = c.a, v1 = c.v1, v2 = c.v2;
    // Fenêtre carrée FIXE pour un préréglage et un ordre donnés (jamais recalculée depuis a) :
    // elle couvre les abscisses de a, les valeurs de la 1re fonction et celles de la 2e sur la
    // partie tracée qui les reçoit.
    var bT = bornesTrace(c.premiere, preset.aMin, preset.aMax);
    var r1 = etendueBrute(c.premiere.fn, bT[0], bT[1]);
    var bS = bornesTrace(c.seconde, Math.min(r1.min, preset.aMin), Math.max(r1.max, preset.aMax));
    var r2 = etendueBrute(c.seconde.fn, bS[0], bS[1]);
    var lo = Math.min(preset.aMin, r1.min, r2.min, bS[0], 0);
    var hi = Math.max(preset.aMax, r1.max, r2.max, bS[1], 0);
    var marge = Math.max(0.5, (hi - lo) * 0.08);
    lo -= marge; hi += marge;
    var W = D_RIGHT - D_LEFT, H = D_BOTTOM - D_TOP;
    var px = function (x, y) {
      return [D_LEFT + (x - lo) / (hi - lo) * W, D_BOTTOM - (y - lo) / (hi - lo) * H];
    };

    // Graduations.
    var pas = pasGraduation(hi - lo);
    var origine = px(0, 0);
    for (var t = Math.ceil(lo / pas) * pas; t <= hi; t += pas) {
      if (Math.abs(t) < 1e-9) continue;
      var tx = px(t, 0)[0];
      if (tx > D_RIGHT - 14) continue;
      svg.appendChild(svgEl(ns, "line", { x1: tx.toFixed(2), x2: tx.toFixed(2), y1: (origine[1] - 3).toFixed(2), y2: (origine[1] + 3).toFixed(2), class: "tick" }));
      var lx = svgEl(ns, "text", { x: tx.toFixed(2), y: (origine[1] + 14).toFixed(2), "text-anchor": "middle", class: "tick-label" });
      lx.textContent = formatNombreFr(t, 0);
      svg.appendChild(lx);
      var ty = px(0, t)[1];
      if (ty < D_TOP + 14) continue;
      svg.appendChild(svgEl(ns, "line", { x1: (origine[0] - 3).toFixed(2), x2: (origine[0] + 3).toFixed(2), y1: ty.toFixed(2), y2: ty.toFixed(2), class: "tick" }));
      var ly = svgEl(ns, "text", { x: (origine[0] - 6).toFixed(2), y: (ty + 3.5).toFixed(2), "text-anchor": "end", class: "tick-label" });
      ly.textContent = formatNombreFr(t, 0);
      svg.appendChild(ly);
    }
    // Axes fléchés.
    svg.appendChild(svgEl(ns, "line", { x1: D_LEFT, x2: D_RIGHT, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: D_BOTTOM, y2: D_TOP, class: "axe", "marker-end": "url(#fleche)" }));

    // Diagonale y = x, puis les deux courbes.
    var d0 = px(lo, lo), d1 = px(hi, hi);
    svg.appendChild(svgEl(ns, "line", { x1: d0[0].toFixed(2), y1: d0[1].toFixed(2), x2: d1[0].toFixed(2), y2: d1[1].toFixed(2), class: "diagonale" }));
    var bInt = bornesTrace(c.premiere, lo, hi);
    var bExt = bornesTrace(c.seconde, lo, hi);
    traceCourbeGen(svg, ns, c.premiere.fn, bInt[0], bInt[1], lo, hi, px, "courbe-int");
    traceCourbeGen(svg, ns, c.seconde.fn, bExt[0], bExt[1], lo, hi, px, "courbe-ext");

    // Légende (coin haut gauche, hors du tracé des axes).
    var leg = svgEl(ns, "text", { x: 10, y: 16, class: "legende" });
    ajouterC(leg, ns, c.labelInt, "legende-int");
    var t1 = svgEl(ns, "tspan", { class: "legende-int" }); t1.textContent = " d'abord";
    leg.appendChild(t1);
    ajouterC(leg, ns, c.labelExt, "legende-ext", "14");
    var t2 = svgEl(ns, "tspan", { class: "legende-ext" }); t2.textContent = " ensuite";
    leg.appendChild(t2);
    var t3 = svgEl(ns, "tspan", { class: "legende-d", dx: "12" }); t3.textContent = "y = x";
    leg.appendChild(t3);
    svg.appendChild(leg);

    if (!isFinite(v1)) return;
    // 1. verticale depuis (a ; 0) jusqu'à la 1re courbe.
    var pAxe = px(a, 0), p1 = px(a, v1);
    svg.appendChild(svgEl(ns, "line", { x1: pAxe[0].toFixed(2), y1: pAxe[1].toFixed(2), x2: p1[0].toFixed(2), y2: p1[1].toFixed(2), class: "guide-1" }));
    svg.appendChild(svgEl(ns, "circle", { cx: p1[0].toFixed(2), cy: p1[1].toFixed(2), r: 4.5, class: "point-1" }));
    etiquette(svg, ns, p1[0], p1[1], c.labelInt + "(" + formatNombreFr(a, 2) + ")=" + formatNombreFr(v1, 2), "etiquette-1");
    // 2. horizontale jusqu'à la diagonale : le point (v1 ; v1) — v1 devient une ABSCISSE.
    var pD = px(v1, v1);
    svg.appendChild(svgEl(ns, "line", { x1: p1[0].toFixed(2), y1: p1[1].toFixed(2), x2: pD[0].toFixed(2), y2: pD[1].toFixed(2), class: "guide-1" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pD[0].toFixed(2), cy: pD[1].toFixed(2), r: 4, class: "point-d" }));

    if (c.horsPortion) {
      svg.appendChild(svgEl(ns, "circle", { cx: pD[0].toFixed(2), cy: pD[1].toFixed(2), r: 6, class: "point-hors" }));
      etiquette(svg, ns, pD[0], pD[1] + 22, "hors du tracé", "etiquette-hors");
      return;
    }
    if (!isFinite(v2)) {
      etiquette(svg, ns, pD[0], pD[1] + 22, c.labelExt + "(" + formatNombreFr(v1, 2) + ") n'existe pas", "etiquette-hors");
      return;
    }
    // 3. verticale depuis la diagonale jusqu'à la 2e courbe, 4. lecture sur l'axe des y.
    var p2 = px(v1, v2), pY = px(0, v2);
    svg.appendChild(svgEl(ns, "line", { x1: pD[0].toFixed(2), y1: pD[1].toFixed(2), x2: p2[0].toFixed(2), y2: p2[1].toFixed(2), class: "guide-2" }));
    svg.appendChild(svgEl(ns, "line", { x1: p2[0].toFixed(2), y1: p2[1].toFixed(2), x2: pY[0].toFixed(2), y2: pY[1].toFixed(2), class: "guide-2" }));
    svg.appendChild(svgEl(ns, "circle", { cx: p2[0].toFixed(2), cy: p2[1].toFixed(2), r: 4.5, class: "point-2" }));
    etiquette(svg, ns, p2[0], p2[1], c.labelExt + "(" + formatNombreFr(v1, 2) + ")=" + formatNombreFr(v2, 2), "etiquette-2");
  };

  if (!customElements.get("composition-machine-widget")) {
    customElements.define("composition-machine-widget", CompositionMachineWidgetClass);
  }

  /* <composition-graphique-widget> — même atelier, ouvert directement en mode
   * « un seul repère + droite y = x » (section « Lire une composée sur un graphique »). */
  class CompositionGraphiqueWidgetClass extends CompositionMachineWidgetClass {}
  CompositionGraphiqueWidgetClass.modeInitial = "diagonale";

  if (!customElements.get("composition-graphique-widget")) {
    customElements.define("composition-graphique-widget", CompositionGraphiqueWidgetClass);
  }
})();
