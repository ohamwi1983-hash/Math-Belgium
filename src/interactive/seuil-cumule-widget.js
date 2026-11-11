(function () {
  "use strict";

  /* ================================================================
   * <seuil-cumule-widget> — atelier interactif, deux modes :
   *
   * 1) « valeurs isolées » (mode historique, inchangé) : curseurs sur les 4
   *    effectifs d'une série discrète (mêmes 4 valeurs xᵢ que l'exemple
   *    résolu : 2, 6, 9, 12), sélecteur médiane/Q1/Q3, tableau des cumulés
   *    construit en direct, PREMIÈRE ligne dont le cumulé dépasse
   *    STRICTEMENT le seuil surlignée — un cumulé exactement égal au seuil
   *    n'est PAS encore la bonne valeur (« pas encore ! »). Réglages par
   *    défaut (5, 8, 4, 3) = l'exemple résolu, Q1 compris (cumulé = 5 =
   *    seuil pile).
   *
   * 2) « classes » : mêmes effectifs, regroupés dans [0;4[ / [4;8[ /
   *    [8;12[ / [12;16[ (l'exemple de la méthode d'interpolation).
   *    Histogramme + polygone des effectifs cumulés (points aux bornes
   *    SUPÉRIEURES, départ en (0 ; 0)), ligne du seuil, projection sur le
   *    polygone puis sur l'axe, triangle d'interpolation mis en évidence, et
   *    le calcul L + (seuil − CF_avant)/n_classe × amplitude écrit avec les
   *    nombres. Par défaut : médiane = 4 + (10 − 5)/8 × 4 = 6,5.
   *
   * Fenêtre du graphe FIXE (x : 0 à 16, y : 0 à 48 = 4 × l'effectif
   * maximal d'un curseur). Web Component (Shadow DOM).
   * ================================================================ */

  var X_VALEURS = [2, 6, 9, 12];
  var BORNES_CLASSES = [0, 4, 8, 12, 16];
  var AMPLITUDE = 4;
  var DEFAUT_N = [5, 8, 4, 3];
  var BORNES_N = { min: 1, max: 12, step: 1 };
  var DEFAUT_TYPE = { discret: "q1", classes: "mediane" };
  var DEFAUT_MODE = "discret";
  var Y_MAX = 4 * BORNES_N.max;
  var LARGEUR = 420, HAUTEUR = 290;
  var MARGE_G = 40, MARGE_D = 24, MARGE_H = 20, MARGE_B = 48;

  var LABEL_TYPE = { mediane: "médiane — seuil n/2", q1: "Q1 — seuil n/4", q3: "Q3 — seuil 3n/4" };
  var NOM_TYPE = { mediane: "médiane", q1: "Q1", q3: "Q3" };
  var FORMULE_SEUIL = { mediane: "n/2", q1: "n/4", q3: "3n/4" };

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /** Nombre « propre » : sans zéros inutiles après la virgule (6,5 ; 10 ; 6,25). */
  function formatCourt(n) {
    var texte = (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
    return texte.replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function libelleClasse(i) {
    // Espaces insécables : un intervalle n'est jamais coupé en fin de ligne.
    return "[" + BORNES_CLASSES[i] + "\u00a0;\u00a0" + BORNES_CLASSES[i + 1] + (i === 3 ? "]" : "[");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;justify-content:center;gap:0;margin-bottom:12px;}' +
    '.modes button{font:inherit;font-size:0.9rem;font-weight:600;padding:7px 14px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);cursor:pointer;}' +
    '.modes button:first-child{border-radius:var(--radius,3px) 0 0 var(--radius,3px);}' +
    '.modes button:last-child{border-radius:0 var(--radius,3px) var(--radius,3px) 0;border-left:none;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);border-color:var(--accent-soft-line,#e8c4a4);}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    '.graphe-zone.cache{display:none;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille-svg{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.barre{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent-soft-line,#e8c4a4);stroke-width:1.2;}' +
    '.barre-retenue{fill:var(--good-soft,#dcefe1);stroke:var(--good,#2f7a4f);stroke-width:1.4;}' +
    '.polygone{stroke:var(--accent,#a8471f);stroke-width:2.2;fill:none;}' +
    '.segment-retenu{stroke:var(--good,#2f7a4f);stroke-width:3.6;fill:none;}' +
    '.sommet{fill:var(--accent,#a8471f);}' +
    '.seuil{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:5 3;}' +
    '.triangle{fill:var(--plan-soft,#ece9f8);stroke:var(--plan,#5b4ea3);stroke-width:1.2;}' +
    '.triangle-grand{fill:none;stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:3 3;}' +
    '.point-lu{fill:var(--surface,#fff);stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-axe{font-size:11px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette-seuil{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette-valeur{font-size:12px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.table-zone{margin-bottom:14px;overflow-x:auto;}' +
    'table.grille{border-collapse:collapse;font-family:var(--mono,monospace);font-size:13px;margin:0 auto;}' +
    'table.grille th,table.grille td{border:1px solid var(--line,#e2d8c8);padding:8px 14px;text-align:center;min-width:40px;white-space:nowrap;}' +
    'table.grille th{background:var(--surface-2,#faf6f0);color:var(--ink-faint,#9c9083);font-weight:500;}' +
    'table.grille td.retenu{background:var(--good-soft,#dcefe1);color:var(--good,#2f7a4f);font-weight:700;}' +
    'table.grille td.piege{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);font-weight:700;}' +
    'table.grille td.borne{background:var(--plan-soft,#ece9f8);color:var(--plan,#5b4ea3);font-weight:700;}' +
    'table.grille td.neutre{color:var(--ink-soft,#6b6055);}' +
    'table.grille td.aussi{color:var(--ink-faint,#9c9083);}' +
    '.note-ligne{font-size:10.5px;display:block;margin-top:2px;font-weight:600;white-space:normal;}' +
    // Petits écrans : le tableau à 4 classes tient dans la largeur (il défile sinon, sans être tronqué).
    '@media (max-width:480px){table.grille{font-size:11.5px;}table.grille th,table.grille td{padding:6px 6px;min-width:0;}}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 6px;line-height:1.5;}' +
    '.calcul{text-align:center;font-family:var(--mono,monospace);font-size:0.95rem;font-weight:700;color:var(--plan,#5b4ea3);margin:0 0 18px;line-height:1.5;}' +
    '.calcul:empty{display:none;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseurs-n{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:6px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;flex:1 1 150px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:24px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Type de données">' +
    '<button type="button" id="mode-discret">Valeurs isolées</button>' +
    '<button type="button" id="mode-classes">Classes</button>' +
    '</div>' +
    '<div class="ligne-select"><label for="type">Paramètre cherché</label>' +
    '<select id="type">' +
    '<option value="mediane">médiane — seuil n/2</option>' +
    '<option value="q1">Q1 — seuil n/4</option>' +
    '<option value="q3">Q3 — seuil 3n/4</option>' +
    '</select></div>' +
    '<div class="graphe-zone" id="zone-graphe"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Histogramme et polygone des effectifs cumulés"></svg></div>' +
    '<div class="table-zone" id="zone-tableau"></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<p class="calcul" id="calcul"></p>' +
    '<div class="controles">' +
    '<div class="curseurs-n" id="zone-curseurs"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  function curseurHTML(i, valeur) {
    return '<div class="curseur"><label for="n' + i + '" id="n' + i + '-label"></label><div class="curseur-row">' +
      '<input type="range" id="n' + i + '" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="n' + i + '-valeur"></span></div></div>';
  }

  class SeuilCumuleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SeuilCumuleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT_N.slice();
    this._mode = DEFAUT_MODE;
    this._type = DEFAUT_TYPE[DEFAUT_MODE];
    this._selectType = shadow.getElementById("type");
    this._zoneTableau = shadow.getElementById("zone-tableau");
    this._zoneGraphe = shadow.getElementById("zone-graphe");
    this._svg = shadow.getElementById("svg");
    this._resultat = shadow.getElementById("resultat");
    this._calcul = shadow.getElementById("calcul");
    this._zoneCurseurs = shadow.getElementById("zone-curseurs");
    this._resetBtn = shadow.getElementById("reset");
    this._btnDiscret = shadow.getElementById("mode-discret");
    this._btnClasses = shadow.getElementById("mode-classes");
    this._shadow = shadow;
    this._selectType.value = this._type;
    this._zoneCurseurs.innerHTML = DEFAUT_N.map(function (v, i) { return curseurHTML(i, v); }).join("");
  };

  SeuilCumuleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    var shadow = this._shadow;
    this._onChangeType = function () { self._type = self._selectType.value; self._rendre(); };
    this._inputsN = [];
    this._onInputN = [];
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var input = shadow.getElementById("n" + idx);
        var onInput = function () { self._n[idx] = parseInt(input.value, 10); self._rendre(); };
        input.addEventListener("input", onInput);
        self._inputsN.push(input);
        self._onInputN.push(onInput);
      })(i);
    }
    this._onMode = function (mode) {
      return function () {
        if (self._mode === mode) return;
        self._mode = mode;
        self._type = DEFAUT_TYPE[mode];
        self._selectType.value = self._type;
        self._rendre();
      };
    };
    this._onModeDiscret = this._onMode("discret");
    this._onModeClasses = this._onMode("classes");
    this._onReset = function () {
      self._n = DEFAUT_N.slice();
      self._type = DEFAUT_TYPE[self._mode];
      self._selectType.value = self._type;
      self._inputsN.forEach(function (input, i) { input.value = String(DEFAUT_N[i]); });
      self._rendre();
    };
    this._selectType.addEventListener("change", this._onChangeType);
    this._btnDiscret.addEventListener("click", this._onModeDiscret);
    this._btnClasses.addEventListener("click", this._onModeClasses);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SeuilCumuleWidgetClass.prototype.disconnectedCallback = function () {
    this._selectType.removeEventListener("change", this._onChangeType);
    this._btnDiscret.removeEventListener("click", this._onModeDiscret);
    this._btnClasses.removeEventListener("click", this._onModeClasses);
    var self = this;
    this._inputsN.forEach(function (input, i) { input.removeEventListener("input", self._onInputN[i]); });
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SeuilCumuleWidgetClass.prototype._rendre = function () {
    var self = this;
    var classes = this._mode === "classes";
    var nTotal = this._n.reduce(function (a, b) { return a + b; }, 0);
    var seuil = this._type === "mediane" ? nTotal / 2 : this._type === "q1" ? nTotal / 4 : (3 * nTotal) / 4;

    var cumule = 0;
    var cumules = this._n.map(function (v) { cumule += v; return cumule; });

    var premierIndex = -1;
    for (var i = 0; i < cumules.length; i++) {
      if (cumules[i] > seuil) { premierIndex = i; break; }
    }

    this._btnDiscret.setAttribute("aria-pressed", String(!classes));
    this._btnClasses.setAttribute("aria-pressed", String(classes));
    this._zoneGraphe.classList.toggle("cache", !classes);

    var entetes = classes ? BORNES_CLASSES.slice(0, 4).map(function (_, i) { return libelleClasse(i); }) : X_VALEURS.map(String);
    this._zoneTableau.innerHTML = '<table class="grille">' +
      '<tr><th>' + (classes ? "classe" : "xᵢ") + '</th>' + entetes.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>" +
      '<tr><th>nᵢ</th>' + this._n.map(function (n) { return "<td>" + n + "</td>"; }).join("") + "</tr>" +
      '<tr><th>cumulé</th>' + cumules.map(function (c, i) {
        var estEgal = Math.abs(c - seuil) < 1e-9;
        var estRetenu = i === premierIndex;
        var classe = estRetenu ? "retenu" : estEgal ? (classes ? "borne" : "piege") : c > seuil ? "aussi" : "neutre";
        var note = "";
        if (estEgal) note = classes ? '<span class="note-ligne">= seuil : borne ' + BORNES_CLASSES[i + 1] + '</span>' : '<span class="note-ligne">=seuil, pas encore !</span>';
        else if (estRetenu) note = '<span class="note-ligne">' + (classes ? "classe du seuil" : "premier &gt; seuil") + "</span>";
        return '<td class="' + classe + '">' + c + note + "</td>";
      }).join("") + "</tr></table>";

    var nom = NOM_TYPE[this._type];
    if (!classes) {
      this._resultat.textContent =
        "n = " + nTotal + " — seuil (" + LABEL_TYPE[this._type] + ") = " + formatNombreFr(seuil, 2) +
        " → " + (premierIndex === -1 ? "aucune valeur ne dépasse le seuil" : nom + " = " + X_VALEURS[premierIndex]);
      this._calcul.textContent = "";
    } else {
      var L = BORNES_CLASSES[premierIndex];
      var cfAvant = premierIndex === 0 ? 0 : cumules[premierIndex - 1];
      var nClasse = this._n[premierIndex];
      var valeur = L + ((seuil - cfAvant) / nClasse) * AMPLITUDE;
      this._valeurClasses = valeur;
      this._resultat.textContent =
        "n = " + nTotal + " — seuil " + FORMULE_SEUIL[this._type] + " = " + formatCourt(seuil) +
        " → classe " + libelleClasse(premierIndex) + " (cumulés " + cfAvant + " → " + cumules[premierIndex] + ")";
      this._calcul.textContent =
        nom + " = " + L + " + (" + formatCourt(seuil) + " − " + cfAvant + ") / " + nClasse + " × " + AMPLITUDE +
        " = " + formatCourt(valeur);
      this._dessinerClasses(cumules, seuil, premierIndex, valeur);
    }

    this._n.forEach(function (v, i) {
      self._shadow.getElementById("n" + i + "-valeur").textContent = String(v);
      self._shadow.getElementById("n" + i + "-label").textContent = classes ? "n " + libelleClasse(i) : "n₍x=" + X_VALEURS[i] + "₎";
    });
  };

  SeuilCumuleWidgetClass.prototype._dessinerClasses = function (cumules, seuil, k, valeur) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    var n = this._n;
    var x0 = MARGE_G, x1 = LARGEUR - MARGE_D, y0 = HAUTEUR - MARGE_B, y1 = MARGE_H;
    function px(x) { return x0 + (x / 16) * (x1 - x0 - 16); }
    function py(y) { return y0 - (y / Y_MAX) * (y0 - y1 - 10); }

    svg.innerHTML = "";
    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    for (var t = 8; t <= Y_MAX; t += 8) {
      svg.appendChild(svgEl(ns, "line", { x1: x0, x2: (x1 - 16).toFixed(2), y1: py(t).toFixed(2), y2: py(t).toFixed(2), class: "grille-svg" }));
      var ty = svgEl(ns, "text", { x: x0 - 6, y: (py(t) + 4).toFixed(2), class: "etiquette", "text-anchor": "end" });
      ty.textContent = String(t);
      svg.appendChild(ty);
    }

    // Histogramme (effectifs), la classe du seuil en vert.
    for (var i = 0; i < 4; i++) {
      svg.appendChild(svgEl(ns, "rect", {
        x: px(BORNES_CLASSES[i]).toFixed(2), y: py(n[i]).toFixed(2),
        width: (px(BORNES_CLASSES[i + 1]) - px(BORNES_CLASSES[i])).toFixed(2),
        height: (py(0) - py(n[i])).toFixed(2), class: i === k ? "barre-retenue" : "barre",
      }));
    }

    var points = [[0, 0]].concat(cumules.map(function (c, i) { return [BORNES_CLASSES[i + 1], c]; }));
    var cfAvant = points[k][1], cfApres = points[k + 1][1];
    var L = BORNES_CLASSES[k], R = BORNES_CLASSES[k + 1];

    // Grand triangle (toute la classe) en pointillés verts, petit triangle (jusqu'au seuil) violet.
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + px(L).toFixed(2) + "," + py(cfAvant).toFixed(2) + " L" + px(R).toFixed(2) + "," + py(cfAvant).toFixed(2) +
        " L" + px(R).toFixed(2) + "," + py(cfApres).toFixed(2) + " Z",
      class: "triangle-grand",
    }));
    svg.appendChild(svgEl(ns, "path", {
      d: "M" + px(L).toFixed(2) + "," + py(cfAvant).toFixed(2) + " L" + px(valeur).toFixed(2) + "," + py(cfAvant).toFixed(2) +
        " L" + px(valeur).toFixed(2) + "," + py(seuil).toFixed(2) + " Z",
      class: "triangle",
    }));

    // Ligne du seuil (depuis l'axe vertical jusqu'au polygone), puis projection sur l'axe des valeurs.
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: px(valeur).toFixed(2), y1: py(seuil).toFixed(2), y2: py(seuil).toFixed(2), class: "seuil" }));
    svg.appendChild(svgEl(ns, "line", { x1: px(valeur).toFixed(2), x2: px(valeur).toFixed(2), y1: py(seuil).toFixed(2), y2: y0, class: "seuil" }));

    // Polygone des effectifs cumulés, segment de la classe du seuil épaissi.
    svg.appendChild(svgEl(ns, "path", {
      d: points.map(function (p, j) { return (j === 0 ? "M" : "L") + px(p[0]).toFixed(2) + "," + py(p[1]).toFixed(2); }).join(" "),
      class: "polygone",
    }));
    svg.appendChild(svgEl(ns, "line", { x1: px(L).toFixed(2), x2: px(R).toFixed(2), y1: py(cfAvant).toFixed(2), y2: py(cfApres).toFixed(2), class: "segment-retenu" }));
    points.forEach(function (p) {
      svg.appendChild(svgEl(ns, "circle", { cx: px(p[0]).toFixed(2), cy: py(p[1]).toFixed(2), r: 3, class: "sommet" }));
    });
    svg.appendChild(svgEl(ns, "circle", { cx: px(valeur).toFixed(2), cy: py(seuil).toFixed(2), r: 4.6, class: "point-lu" }));

    // Axes avec flèches (vertical tracé de bas en haut).
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x1, y1: y0, y2: y0, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x0, y1: y0, y2: y1, class: "axe", "marker-end": "url(#fleche)" }));
    BORNES_CLASSES.forEach(function (v) {
      svg.appendChild(svgEl(ns, "line", { x1: px(v).toFixed(2), x2: px(v).toFixed(2), y1: y0, y2: y0 + 4, class: "axe" }));
      var tx = svgEl(ns, "text", { x: px(v).toFixed(2), y: y0 + 16, class: "etiquette", "text-anchor": "middle" });
      tx.textContent = String(v);
      svg.appendChild(tx);
    });

    // Valeur lue : sous les graduations (2e rangée), jamais par-dessus un nombre de l'axe.
    // Ancrage adapté près des bords du cadre : l'étiquette n'est jamais coupée.
    var xv = px(valeur);
    var ancre = xv < x0 + 50 ? "start" : xv > LARGEUR - 70 ? "end" : "middle";
    var tv = svgEl(ns, "text", { x: (ancre === "start" ? xv - 6 : ancre === "end" ? xv + 6 : xv).toFixed(2), y: y0 + 32, class: "etiquette-valeur", "text-anchor": ancre });
    tv.textContent = NOM_TYPE[this._type] + " = " + formatCourt(valeur);
    svg.appendChild(tv);
    // Seuil : étiquette juste au-dessus de sa ligne, contre l'axe vertical.
    var ts = svgEl(ns, "text", { x: x0 + 5, y: (py(seuil) - 5).toFixed(2), class: "etiquette-seuil", "text-anchor": "start" });
    ts.textContent = "seuil " + formatCourt(seuil);
    svg.appendChild(ts);

    var ly = svgEl(ns, "text", { x: x0 + 6, y: y1 + 2, class: "etiquette-axe", "text-anchor": "start" });
    ly.textContent = "effectif cumulé";
    svg.appendChild(ly);
    var lx = svgEl(ns, "text", { x: x1, y: HAUTEUR - 2, class: "etiquette-axe", "text-anchor": "end" });
    lx.textContent = "valeur";
    svg.appendChild(lx);
  };

  if (!customElements.get("seuil-cumule-widget")) {
    customElements.define("seuil-cumule-widget", SeuilCumuleWidgetClass);
  }
})();
