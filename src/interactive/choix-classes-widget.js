(function () {
  "use strict";

  /* ================================================================
   * <choix-classes-widget> — atelier interactif : un même jeu de 40
   * temps de trajet domicile-école (en minutes, de 2 à 62 : étendue 60),
   * regroupé en k classes de même amplitude (k réglable de 2 à 12,
   * amplitude = étendue / k, convention [inf ; sup[ sauf la dernière
   * classe, fermée des deux côtés). L'histogramme est redessiné à chaque
   * réglage, dans une fenêtre FIXE (axe x = l'étendue des données, axe y
   * = le plus grand effectif atteint pour TOUS les k possibles) : seul le
   * découpage change, jamais l'échelle. Le texte sous le graphe dit ce
   * qu'on voit : trop peu de classes cachent les deux groupes (à pied /
   * en bus), trop de classes hachent l'histogramme (classes à 0 ou 1).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DONNEES = [
    2, 3, 5, 6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 15, 17, 20,
    24, 26, 27, 29, 30, 31, 31, 32, 33, 34, 35, 35, 36, 37, 38, 40, 42, 44,
    48, 52, 55, 62,
  ];
  var MIN = 2, MAX = 62, ETENDUE = MAX - MIN;
  var K_MIN = 2, K_MAX = 12, K_DEFAUT = 5;
  var LARGEUR = 420, HAUTEUR = 270;
  var MARGE_G = 40, MARGE_D = 22, MARGE_H = 18, MARGE_B = 54;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    var texte = arrondi.toFixed(decimales);
    if (decimales > 0) texte = texte.replace(/\.?0+$/, "");
    return texte.replace(".", ",").replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  /** Effectifs des k classes : [inf ; sup[ partout, sauf la dernière fermée (MAX y tombe). */
  function effectifs(k) {
    var amplitude = ETENDUE / k;
    var n = [];
    for (var i = 0; i < k; i++) n.push(0);
    DONNEES.forEach(function (x) {
      var i = Math.floor((x - MIN) / amplitude + 1e-9);
      if (i >= k) i = k - 1;
      n[i]++;
    });
    return n;
  }

  /** Nombre de « bosses » : maxima locaux stricts (plateaux comptés une fois). */
  function nombreBosses(n) {
    var bosses = 0;
    var i = 0;
    while (i < n.length) {
      var j = i;
      while (j + 1 < n.length && n[j + 1] === n[i]) j++;
      var gauche = i === 0 ? -1 : n[i - 1];
      var droite = j === n.length - 1 ? -1 : n[j + 1];
      if (n[i] > gauche && n[i] > droite && n[i] > 1) bosses++;
      i = j + 1;
    }
    return bosses;
  }

  // Fenêtre Y fixe : le plus grand effectif de classe, tous k confondus (k = 2 en pratique).
  var Y_MAX_DONNEES = 0;
  for (var kk = K_MIN; kk <= K_MAX; kk++) {
    effectifs(kk).forEach(function (v) { if (v > Y_MAX_DONNEES) Y_MAX_DONNEES = v; });
  }
  var Y_MAX = Math.ceil((Y_MAX_DONNEES + 2) / 5) * 5;

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.barre{fill:var(--accent-soft,#f6e2d3);stroke:var(--accent,#a8471f);stroke-width:1.4;}' +
    '.barre-vide{stroke:var(--bad,#b23a3a);stroke-width:2.2;}' +
    '.donnee{fill:var(--ink-soft,#6b6055);}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-axe{font-size:11.5px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.effectif{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--sans,sans-serif);}' +
    '.infos{text-align:center;font-family:var(--mono,monospace);font-size:0.95rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 6px;}' +
    '.verdict{text-align:center;font-size:0.93rem;line-height:1.45;margin:0 0 14px;padding:8px 12px;border-radius:var(--radius,3px);}' +
    '.verdict.trop-peu{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);}' +
    '.verdict.bon{background:var(--good-soft,#dcefe1);color:var(--good,#2f7a4f);}' +
    '.verdict.trop{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:28px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Histogramme des temps de trajet"></svg></div>' +
    '<p class="infos" id="infos"></p>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="k">Nombre de classes</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + K_MIN + '" max="' + K_MAX + '" step="1" value="' + K_DEFAUT + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ChoixClassesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ChoixClassesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._k = K_DEFAUT;
    this._svg = shadow.getElementById("svg");
    this._infos = shadow.getElementById("infos");
    this._verdict = shadow.getElementById("verdict");
    this._inputK = shadow.getElementById("k");
    this._valeurK = shadow.getElementById("k-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  ChoixClassesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputK = function () { self._k = parseInt(self._inputK.value, 10); self._rendre(); };
    this._onReset = function () { self._k = K_DEFAUT; self._inputK.value = String(K_DEFAUT); self._rendre(); };
    this._inputK.addEventListener("input", this._onInputK);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  ChoixClassesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputK.removeEventListener("input", this._onInputK);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ChoixClassesWidgetClass.prototype._rendre = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    var k = this._k;
    var amplitude = ETENDUE / k;
    var n = effectifs(k);
    var x0 = MARGE_G, x1 = LARGEUR - MARGE_D, y0 = HAUTEUR - MARGE_B, y1 = MARGE_H;
    // L'axe x couvre [0 ; 66] : l'étendue des données [2 ; 62] avec une petite marge, jamais recalculée.
    var X_AXE_MIN = 0, X_AXE_MAX = 66;
    function px(x) { return x0 + ((x - X_AXE_MIN) / (X_AXE_MAX - X_AXE_MIN)) * (x1 - x0 - 10); }
    function py(y) { return y0 - (y / Y_MAX) * (y0 - y1 - 8); }

    svg.innerHTML = "";
    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // Quadrillage horizontal + graduations de l'axe y (fixes).
    for (var t = 5; t <= Y_MAX; t += 5) {
      svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x1 - 10, y1: py(t).toFixed(2), y2: py(t).toFixed(2), class: "grille" }));
      var ty = svgEl(ns, "text", { x: x0 - 6, y: (py(t) + 4).toFixed(2), class: "etiquette", "text-anchor": "end" });
      ty.textContent = String(t);
      svg.appendChild(ty);
    }

    // Barres.
    var vides = 0, uneSeule = 0;
    for (var i = 0; i < k; i++) {
      var a = MIN + i * amplitude, b = MIN + (i + 1) * amplitude;
      if (n[i] === 0) vides++;
      if (n[i] === 1) uneSeule++;
      if (n[i] > 0) {
        svg.appendChild(svgEl(ns, "rect", {
          x: px(a).toFixed(2), y: py(n[i]).toFixed(2),
          width: (px(b) - px(a)).toFixed(2), height: (py(0) - py(n[i])).toFixed(2), class: "barre",
        }));
        if (k <= 8) {
          var te = svgEl(ns, "text", { x: ((px(a) + px(b)) / 2).toFixed(2), y: (py(n[i]) - 4).toFixed(2), class: "effectif", "text-anchor": "middle" });
          te.textContent = String(n[i]);
          svg.appendChild(te);
        }
      } else {
        svg.appendChild(svgEl(ns, "line", { x1: px(a).toFixed(2), x2: px(b).toFixed(2), y1: py(0).toFixed(2), y2: py(0).toFixed(2), class: "barre-vide" }));
      }
    }

    // Données brutes (petits points sous l'axe) : la même série, quel que soit le découpage.
    DONNEES.forEach(function (x, idx) {
      var dejaVu = DONNEES.slice(0, idx).filter(function (y) { return y === x; }).length;
      svg.appendChild(svgEl(ns, "circle", { cx: px(x).toFixed(2), cy: (y0 + 7 + dejaVu * 4).toFixed(2), r: 1.8, class: "donnee" }));
    });

    // Axes (avec flèches) : l'axe vertical est tracé de bas en haut pour que la flèche pointe vers le haut.
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x1, y1: y0, y2: y0, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x0, y1: y0, y2: y1, class: "axe", "marker-end": "url(#fleche)" }));
    [2, 12, 22, 32, 42, 52, 62].forEach(function (v) {
      svg.appendChild(svgEl(ns, "line", { x1: px(v).toFixed(2), x2: px(v).toFixed(2), y1: y0, y2: y0 + 4, class: "axe" }));
      var tx = svgEl(ns, "text", { x: px(v).toFixed(2), y: y0 + 28, class: "etiquette", "text-anchor": "middle" });
      tx.textContent = String(v);
      svg.appendChild(tx);
    });
    var lx = svgEl(ns, "text", { x: x1, y: HAUTEUR - 3, class: "etiquette-axe", "text-anchor": "end" });
    lx.textContent = "temps de trajet (min)";
    svg.appendChild(lx);
    var ly = svgEl(ns, "text", { x: x0 + 6, y: y1 + 4, class: "etiquette-axe", "text-anchor": "start" });
    ly.textContent = "effectif";
    svg.appendChild(ly);

    var exacte = Math.abs(amplitude - Math.round(amplitude * 100) / 100) < 1e-9;
    this._infos.textContent =
      k + " classes — amplitude = 60 / " + k + (exacte ? " = " : " ≈ ") + formatNombreFr(amplitude, 2) + " min";

    var bosses = nombreBosses(n);
    var verdict, classe;
    if (k <= 3) {
      classe = "trop-peu";
      verdict = "Trop peu de classes : les élèves qui viennent à pied (vers 10 min) et ceux qui prennent le bus " +
        "(vers 35 min) sont mélangés dans les mêmes barres. L'histogramme cache les deux groupes.";
    } else if (vides + uneSeule >= 3 || k >= 10) {
      classe = "trop";
      verdict = "Trop de classes : l'histogramme devient haché. " +
        (vides + uneSeule) + " classe" + (vides + uneSeule > 1 ? "s ne contiennent" : " ne contient") +
        " que 0 ou 1 donnée" + (vides > 0 ? " (en rouge : classes vides)" : "") + ", la forme se perd dans le bruit.";
    } else {
      classe = "bon";
      verdict = bosses >= 2
        ? "Bon compromis : on voit nettement deux bosses — le groupe « à pied » et le groupe « en bus »."
        : "Découpage acceptable, mais les deux groupes se distinguent moins bien : essaie 5 ou 6 classes.";
    }
    this._verdict.className = "verdict " + classe;
    this._verdict.textContent = verdict;
    this._valeurK.textContent = String(k);
  };

  if (!customElements.get("choix-classes-widget")) {
    customElements.define("choix-classes-widget", ChoixClassesWidgetClass);
  }
})();
