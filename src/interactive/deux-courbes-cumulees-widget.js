(function () {
  "use strict";

  /* ================================================================
   * <deux-courbes-cumulees-widget> — atelier interactif : deux séries A et
   * B de 25 valeurs chacune (temps, en min, mis par deux classes pour
   * résoudre un même problème), regroupées dans les classes [0 ; 10[,
   * [10 ; 20[, [20 ; 30[, [30 ; 40[, [40 ; 50]. Leurs deux polygones des
   * FRÉQUENCES cumulées (%) sont superposés (points aux bornes
   * supérieures, départ en (0 ; 0 %)). Un curseur a lit le cumulé de A et
   * de B en a (projections) ; l'option « entre a et b » ajoute un second
   * curseur b et calcule cumulé(b) − cumulé(a) pour chaque série — l'astuce
   * de la section : on ne lit jamais un intervalle d'un seul coup. Les deux
   * médianes (seuil 50 %) sont lues sur chaque courbe. Fenêtre FIXE
   * (x : 0 à 50, y : 0 à 100 %). Web Component (Shadow DOM).
   * ================================================================ */

  var BORNES = [0, 10, 20, 30, 40, 50];
  var SERIES = [
    { id: "A", nom: "série A", effectifs: [2, 6, 10, 5, 2], classe: "a" },
    { id: "B", nom: "série B", effectifs: [1, 3, 7, 9, 5], classe: "b" },
  ];
  var DEFAUT = { a: 25, b: 35, entre: false };
  var LARGEUR = 420, HAUTEUR = 280;
  var MARGE_G = 46, MARGE_D = 22, MARGE_H = 18, MARGE_B = 40;

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

  /** Fréquences cumulées (%) aux bornes [0, 10, …, 50] : 0 % puis cumul après chaque classe. */
  function cumulesPourcent(effectifs) {
    var n = effectifs.reduce(function (s, v) { return s + v; }, 0);
    var cumul = 0;
    var res = [0];
    effectifs.forEach(function (v) { cumul += v; res.push((cumul / n) * 100); });
    return res;
  }

  /** Lecture sur le polygone : interpolation linéaire entre deux bornes consécutives. */
  function lireCumul(cumules, x) {
    if (x <= BORNES[0]) return 0;
    if (x >= BORNES[BORNES.length - 1]) return 100;
    for (var i = 0; i < BORNES.length - 1; i++) {
      if (x <= BORNES[i + 1]) {
        var t = (x - BORNES[i]) / (BORNES[i + 1] - BORNES[i]);
        return cumules[i] + t * (cumules[i + 1] - cumules[i]);
      }
    }
    return 100;
  }

  /** Valeur dont le cumulé vaut p % (première classe où le cumulé dépasse strictement p, interpolation). */
  function lireValeur(cumules, p) {
    for (var i = 0; i < BORNES.length - 1; i++) {
      if (cumules[i + 1] > p) {
        return BORNES[i] + ((p - cumules[i]) / (cumules[i + 1] - cumules[i])) * (BORNES[i + 1] - BORNES[i]);
      }
    }
    return BORNES[BORNES.length - 1];
  }

  SERIES.forEach(function (s) { s.cumules = cumulesPourcent(s.effectifs); s.mediane = lireValeur(s.cumules, 50); });

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.legende{display:flex;flex-wrap:wrap;gap:6px 16px;justify-content:center;margin-bottom:8px;font-size:0.9rem;font-weight:600;}' +
    '.legende span{display:inline-flex;align-items:center;gap:6px;}' +
    '.pastille{display:inline-block;width:18px;height:4px;border-radius:2px;}' +
    '.pastille.a{background:var(--accent,#a8471f);}' +
    '.pastille.b{background:var(--sky,#2f6fb0);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.courbe-a{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.courbe-b{stroke:var(--sky,#2f6fb0);stroke-width:2.4;fill:none;}' +
    '.sommet-a{fill:var(--accent,#a8471f);}' +
    '.sommet-b{fill:var(--sky,#2f6fb0);}' +
    '.lecture-a{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.lecture-b{stroke:var(--sky,#2f6fb0);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.curseur-ligne{stroke:var(--ink,#241f1a);stroke-width:1.4;stroke-dasharray:5 3;}' +
    '.mediane{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:2 3;}' +
    '.point-a{fill:var(--surface,#fff);stroke:var(--accent,#a8471f);stroke-width:2.2;}' +
    '.point-b{fill:var(--surface,#fff);stroke:var(--sky,#2f6fb0);stroke-width:2.2;}' +
    '.etiquette{font-size:11.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-axe{font-size:11px;fill:var(--ink-faint,#9c9083);font-family:var(--sans,sans-serif);}' +
    '.etiquette-mediane{font-size:11px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette-curseur{font-size:11.5px;font-weight:700;fill:var(--ink,#241f1a);font-family:var(--sans,sans-serif);}' +
    '.lectures{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:0 0 12px;}' +
    '.carte{border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 10px;background:var(--surface,#fff);}' +
    '.carte.a{border-left:4px solid var(--accent,#a8471f);}' +
    '.carte.b{border-left:4px solid var(--sky,#2f6fb0);}' +
    '.carte-titre{font-weight:700;font-size:0.88rem;margin:0 0 4px;color:var(--ink,#241f1a);}' +
    '.carte-ligne{font-family:var(--mono,monospace);font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:2px 0;}' +
    '.carte-ligne strong{color:var(--ink,#241f1a);}' +
    '.phrase{text-align:center;font-size:0.92rem;line-height:1.45;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.case{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:0.92rem;cursor:pointer;}' +
    '.case input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:var(--accent,#a8471f);}' +
    '.cache{display:none;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="legende"><span><i class="pastille a"></i>série A</span><span><i class="pastille b"></i>série B</span>' +
    '<span><i class="pastille" style="background:var(--plan,#5b4ea3)"></i>médianes (seuil 50 %)</span></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Deux polygones des fréquences cumulées"></svg></div>' +
    '<div class="lectures" id="lectures"></div>' +
    '<p class="phrase" id="phrase"></p>' +
    '<div class="controles">' +
    '<label class="case"><input type="checkbox" id="entre">Lire entre a et b</label>' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="0" max="50" step="1" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur" id="bloc-b"><label for="b">b</label><div class="curseur-row">' +
    '<input type="range" id="b" min="0" max="50" step="1" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class DeuxCourbesCumuleesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  DeuxCourbesCumuleesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._entre = DEFAUT.entre;
    this._svg = shadow.getElementById("svg");
    this._lectures = shadow.getElementById("lectures");
    this._phrase = shadow.getElementById("phrase");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._blocB = shadow.getElementById("bloc-b");
    this._caseEntre = shadow.getElementById("entre");
    this._resetBtn = shadow.getElementById("reset");
  };

  DeuxCourbesCumuleesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () { self._a = parseInt(self._inputA.value, 10); self._rendre(); };
    this._onInputB = function () { self._b = parseInt(self._inputB.value, 10); self._rendre(); };
    this._onEntre = function () { self._entre = self._caseEntre.checked; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._entre = DEFAUT.entre;
      self._inputA.value = String(DEFAUT.a); self._inputB.value = String(DEFAUT.b);
      self._caseEntre.checked = DEFAUT.entre;
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._caseEntre.addEventListener("change", this._onEntre);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  DeuxCourbesCumuleesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._caseEntre.removeEventListener("change", this._onEntre);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  DeuxCourbesCumuleesWidgetClass.prototype._rendre = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    var x0 = MARGE_G, x1 = LARGEUR - MARGE_D, y0 = HAUTEUR - MARGE_B, y1 = MARGE_H;
    function px(x) { return x0 + (x / 50) * (x1 - x0 - 14); }
    function py(p) { return y0 - (p / 100) * (y0 - y1 - 10); }
    var entre = this._entre;
    // « entre a et b » : on lit toujours de la plus petite à la plus grande valeur.
    var lo = entre ? Math.min(this._a, this._b) : this._a;
    var hi = entre ? Math.max(this._a, this._b) : this._a;

    svg.innerHTML = "";
    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    [25, 50, 75, 100].forEach(function (p) {
      svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x1 - 14, y1: py(p).toFixed(2), y2: py(p).toFixed(2), class: "grille" }));
      var t = svgEl(ns, "text", { x: x0 - 6, y: (py(p) + 4).toFixed(2), class: "etiquette", "text-anchor": "end" });
      t.textContent = p + " %";
      svg.appendChild(t);
    });

    // Médianes : ligne horizontale à 50 %, puis descente verticale pour chaque série.
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: px(Math.max(SERIES[0].mediane, SERIES[1].mediane)).toFixed(2), y1: py(50).toFixed(2), y2: py(50).toFixed(2), class: "mediane" }));
    SERIES.forEach(function (s) {
      svg.appendChild(svgEl(ns, "line", { x1: px(s.mediane).toFixed(2), x2: px(s.mediane).toFixed(2), y1: py(50).toFixed(2), y2: y0, class: "mediane" }));
    });

    // Projections du (des) curseur(s), dessinées sous les courbes.
    var valeursCurseurs = entre ? [lo, hi] : [lo];
    valeursCurseurs.forEach(function (v) {
      svg.appendChild(svgEl(ns, "line", { x1: px(v).toFixed(2), x2: px(v).toFixed(2), y1: y0, y2: py(100).toFixed(2), class: "curseur-ligne" }));
      SERIES.forEach(function (s) {
        var c = lireCumul(s.cumules, v);
        svg.appendChild(svgEl(ns, "line", { x1: x0, x2: px(v).toFixed(2), y1: py(c).toFixed(2), y2: py(c).toFixed(2), class: "lecture-" + s.classe }));
      });
    });

    // Les deux polygones (points aux bornes supérieures des classes).
    SERIES.forEach(function (s) {
      var d = s.cumules.map(function (c, i) { return (i === 0 ? "M" : "L") + px(BORNES[i]).toFixed(2) + "," + py(c).toFixed(2); }).join(" ");
      svg.appendChild(svgEl(ns, "path", { d: d, class: "courbe-" + s.classe }));
      s.cumules.forEach(function (c, i) {
        svg.appendChild(svgEl(ns, "circle", { cx: px(BORNES[i]).toFixed(2), cy: py(c).toFixed(2), r: 2.8, class: "sommet-" + s.classe }));
      });
    });

    // Points lus sur les courbes.
    valeursCurseurs.forEach(function (v) {
      SERIES.forEach(function (s) {
        svg.appendChild(svgEl(ns, "circle", { cx: px(v).toFixed(2), cy: py(lireCumul(s.cumules, v)).toFixed(2), r: 4.2, class: "point-" + s.classe }));
      });
    });

    // Axes avec flèches (vertical tracé de bas en haut).
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x1, y1: y0, y2: y0, class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: x0, x2: x0, y1: y0, y2: y1, class: "axe", "marker-end": "url(#fleche)" }));
    BORNES.forEach(function (v) {
      svg.appendChild(svgEl(ns, "line", { x1: px(v).toFixed(2), x2: px(v).toFixed(2), y1: y0, y2: y0 + 4, class: "axe" }));
      var t = svgEl(ns, "text", { x: px(v).toFixed(2), y: y0 + 16, class: "etiquette", "text-anchor": "middle" });
      t.textContent = String(v);
      svg.appendChild(t);
    });
    // Étiquettes des curseurs au-dessus du cadre (jamais sur les graduations du bas).
    valeursCurseurs.forEach(function (v, idx) {
      var nom = entre ? (idx === 0 ? "a" : "b") : "a";
      if (entre && Math.min(this._a, this._b) !== this._a) nom = idx === 0 ? "b" : "a";
      var t = svgEl(ns, "text", { x: px(v).toFixed(2), y: (py(100) - 4).toFixed(2), class: "etiquette-curseur", "text-anchor": "middle" });
      t.textContent = nom;
      svg.appendChild(t);
    }, this);
    var lx = svgEl(ns, "text", { x: x1, y: HAUTEUR - 6, class: "etiquette-axe", "text-anchor": "end" });
    lx.textContent = "temps (min)";
    svg.appendChild(lx);
    var ly = svgEl(ns, "text", { x: x0 + 6, y: y1 + 2, class: "etiquette-axe", "text-anchor": "start" });
    ly.textContent = "fréquence cumulée";
    svg.appendChild(ly);

    // Lectures chiffrées.
    var html = "";
    var phrases = [];
    var aLabel = this._a, bLabel = this._b;
    SERIES.forEach(function (s) {
      var cLo = lireCumul(s.cumules, lo);
      var lignes = '<p class="carte-titre">' + (s.id === "A" ? "Série A" : "Série B") + "</p>";
      if (!entre) {
        lignes += '<p class="carte-ligne">cumulé en ' + formatNombreFr(lo, 0) + " : <strong>" + formatNombreFr(cLo, 1) + " %</strong></p>";
        phrases.push(formatNombreFr(cLo, 1) + " % des élèves de la " + s.nom);
      } else {
        var cHi = lireCumul(s.cumules, hi);
        lignes += '<p class="carte-ligne">cumulé(' + formatNombreFr(hi, 0) + ") − cumulé(" + formatNombreFr(lo, 0) + ")</p>";
        lignes += '<p class="carte-ligne">= ' + formatNombreFr(cHi, 1) + " − " + formatNombreFr(cLo, 1) + " = <strong>" + formatNombreFr(cHi - cLo, 1) + " %</strong></p>";
        phrases.push(formatNombreFr(cHi - cLo, 1) + " % pour la " + s.nom);
      }
      lignes += '<p class="carte-ligne">médiane ≈ <strong>' + formatNombreFr(s.mediane, 1) + " min</strong></p>";
      html += '<div class="carte ' + s.classe + '">' + lignes + "</div>";
    });
    this._lectures.innerHTML = html;
    this._phrase.textContent = entre
      ? (lo === hi
        ? "a et b sont égaux : l'intervalle est vide, 0 % pour chaque série."
        : "Entre " + formatNombreFr(lo, 0) + " et " + formatNombreFr(hi, 0) + " min : " + phrases[0] + ", " + phrases[1] + ".")
      : phrases[0] + " et " + phrases[1] + " ont mis au plus " + formatNombreFr(lo, 0) + " min.";

    this._valeurA.textContent = formatNombreFr(aLabel, 0) + " min";
    this._valeurB.textContent = formatNombreFr(bLabel, 0) + " min";
    this._blocB.classList.toggle("cache", !entre);
  };

  if (!customElements.get("deux-courbes-cumulees-widget")) {
    customElements.define("deux-courbes-cumulees-widget", DeuxCourbesCumuleesWidgetClass);
  }
})();
