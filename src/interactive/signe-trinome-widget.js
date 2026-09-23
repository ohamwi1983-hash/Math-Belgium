(function () {
  "use strict";

  /* ================================================================
   * <signe-trinome-widget> — atelier interactif : curseurs a, b, c, parabole
   * colorée par son signe, tableau de signes construit en direct EN DESSOUS
   * (mêmes bornes que la courbe), et un sélecteur ◇ ∈ {>,≥,<,≤} qui calcule
   * l'ensemble-solution S avec la notation à crochets inversés du site.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 1, b: -1, c: -6 }; // reprend l'exemple x²−x−6 ≥ 0 déjà résolu juste au-dessus
  var BORNES_A = { min: -3, max: 3, step: 0.1 };
  var BORNES_B = { min: -6, max: 6, step: 0.1 };
  var BORNES_C = { min: -6, max: 6, step: 0.1 };
  var X_MIN = -8, X_MAX = 8, Y_MIN = -10, Y_MAX = 12;
  var LARGEUR = 420, HAUTEUR = 260, MARGE = 32;

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

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.15rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.1rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.6;fill:none;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.table-zone{margin-bottom:14px;overflow-x:auto;}' +
    'table.grille{border-collapse:collapse;font-family:var(--mono,monospace);font-size:12.5px;margin:0 auto;}' +
    'table.grille th,table.grille td{border:1px solid var(--line,#e2d8c8);padding:6px 10px;text-align:center;min-width:34px;}' +
    'table.grille th{background:var(--surface-2,#faf6f0);color:var(--ink-faint,#9c9083);font-weight:500;}' +
    'table.grille td.rowlabel{text-align:left;font-family:var(--sans,sans-serif);font-weight:600;color:var(--ink-soft,#6b6055);background:var(--surface-2,#faf6f0);}' +
    'table.grille td.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    'table.grille td.neg{color:var(--bad,#a8322f);font-weight:700;}' +
    'table.grille td.zero{color:var(--ink-faint,#9c9083);}' +
    '.message-delta{text-align:center;font-size:0.9rem;color:var(--ink-soft,#6b6055);margin:0 0 14px;padding:10px 14px;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.solution{text-align:center;font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><span class="formule" id="formule"></span>' +
    '<select id="symbole">' +
    '<option value="gt">&gt; 0</option>' +
    '<option value="ge">&ge; 0</option>' +
    '<option value="lt">&lt; 0</option>' +
    '<option value="le">&le; 0</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div id="zone-tableau"></div>' +
    '<p class="solution" id="solution"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="c">c</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.c + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SigneTrinomeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SigneTrinomeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._c = DEFAUT.c;
    this._symbole = "ge";
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectSymbole = shadow.getElementById("symbole");
    this._zoneTableau = shadow.getElementById("zone-tableau");
    this._solution = shadow.getElementById("solution");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputC = shadow.getElementById("c");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurC = shadow.getElementById("c-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectSymbole.value = this._symbole;
  };

  SigneTrinomeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      var v = parseFloat(self._inputA.value);
      if (Math.abs(v) < BORNES_A.step / 2) {
        v = v >= self._a ? BORNES_A.step : -BORNES_A.step;
        self._inputA.value = String(v);
      }
      self._a = v;
      self._rendre();
    };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onInputC = function () { self._c = parseFloat(self._inputC.value); self._rendre(); };
    this._onChangeSymbole = function () { self._symbole = self._selectSymbole.value; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._c = DEFAUT.c; self._symbole = "ge";
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputC.value = String(DEFAUT.c);
      self._selectSymbole.value = "ge";
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputC.addEventListener("input", this._onInputC);
    this._selectSymbole.addEventListener("change", this._onChangeSymbole);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SigneTrinomeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputC.removeEventListener("input", this._onInputC);
    this._selectSymbole.removeEventListener("change", this._onChangeSymbole);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SigneTrinomeWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  SigneTrinomeWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f, classe) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(120 * (xMax - xMin) / (X_MAX - X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= Y_MIN - 0.5 && yy <= Y_MAX + 0.5;
      if (valide) {
        var p = self._toPx(xx, Math.max(Y_MIN, Math.min(Y_MAX, yy)));
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
  };

  // Colore la courbe selon la solution de l'inéquation SÉLECTIONNÉE (vert = satisfait ◇ 0, rouge
  // = ne satisfait pas), pas selon le signe brut de f — c'est le tableau de signes juste en
  // dessous qui montre le signe brut (+/−), la courbe montre directement S.
  SigneTrinomeWidgetClass.prototype._traceCourbeSignee = function (svg, ns, f, racines, veutPositif) {
    var bornes = [X_MIN].concat(racines.filter(function (r) { return r > X_MIN && r < X_MAX; }).sort(function (a, b) { return a - b; })).concat([X_MAX]);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      if (hi - lo < 1e-6) continue;
      var mid = (lo + hi) / 2;
      var classe = (f(mid) > 0) === veutPositif ? "segment-pos" : "segment-neg";
      this._traceIntervalle(svg, ns, lo, hi, f, classe);
    }
  };

  var FORMAT_BORNE = function (v) {
    if (v === -Infinity) return "−∞";
    if (v === Infinity) return "+∞";
    return formatNombreFr(v, 2);
  };

  // Construit S(symbole) par cas explicites (Δ<0 / Δ=0 / Δ>0 × signe de a × symbole) — pas un
  // algorithme générique : seulement 2 racines possibles ici, la casuistique reste lisible telle
  // quelle, et couvre exactement les 3 cas déjà enseignés dans le featureTable de la section.
  SigneTrinomeWidgetClass.prototype._calculerSolution = function (a, delta, racines, symbole) {
    var large = symbole === "ge" || symbole === "le";
    var veutPositif = symbole === "gt" || symbole === "ge";
    // ±∞ portent TOUJOURS un crochet ouvert vers l'extérieur (on ne les atteint jamais), quel
    // que soit le symbole — piège explicitement signalé dans le contenu de cette section, donc à
    // ne surtout pas confondre avec le crochet (large/strict) des bornes finies.
    var ouvrant = function (v) { return v === -Infinity ? "]" : large ? "[" : "]"; };
    var fermant = function (v) { return v === Infinity ? "[" : large ? "]" : "["; };
    var intervalle = function (lo, hi) { return ouvrant(lo) + FORMAT_BORNE(lo) + " ; " + FORMAT_BORNE(hi) + fermant(hi); };

    if (delta < -1e-9) {
      // signe constant = signe(a), jamais nul
      var constantPositif = a > 0;
      return (constantPositif === veutPositif) ? "S = ℝ" : "S = ∅";
    }
    if (delta < 1e-9) {
      var r = racines[0];
      var signeAilleurs = a > 0; // signe(a) partout sauf en r, où le trinôme vaut 0
      if (signeAilleurs === veutPositif) {
        // le reste de ℝ convient déjà ; le point r s'ajoute seulement si l'inégalité est large
        return large ? "S = ℝ" : "S = ℝ \\ {" + FORMAT_BORNE(r) + "}";
      }
      // seul le point r convient, et seulement si l'inégalité est large (0 satisfait ≥0/≤0)
      return large ? "S = {" + FORMAT_BORNE(r) + "}" : "S = ∅";
    }
    var r1 = racines[0], r2 = racines[1];
    var exterieurPositif = a > 0; // signe(a) à l'extérieur des racines, opposé entre les deux
    if (exterieurPositif === veutPositif) {
      return "S = " + intervalle(-Infinity, r1) + " ∪ " + intervalle(r2, Infinity);
    }
    return "S = " + intervalle(r1, r2);
  };

  // Grille de signes générique (1 ou 2 racines ici) : colonnes en alternance borne/écart, sur le
  // principe déjà utilisé par le vrai signTable du site — une colonne "borne" (blanche aux deux
  // infinis, "0" sur une racine intérieure) et, entre deux bornes consécutives, une colonne
  // "écart" portant le signe évalué en son milieu (±3 au-delà de la dernière racine finie côté
  // infini, jamais une vraie évaluation à l'infini).
  SigneTrinomeWidgetClass.prototype._construireTableau = function (f, racinesTriees) {
    var bornes = [-Infinity].concat(racinesTriees).concat([Infinity]);
    var headCells = "", rowCells = "";
    for (var i = 0; i < bornes.length; i++) {
      headCells += "<th>" + FORMAT_BORNE(bornes[i]) + "</th>";
      rowCells += (i === 0 || i === bornes.length - 1) ? "<td></td>" : '<td class="zero">0</td>';
      if (i < bornes.length - 1) {
        headCells += "<th></th>";
        var lo = bornes[i], hi = bornes[i + 1];
        var mid = lo === -Infinity ? hi - 3 : hi === Infinity ? lo + 3 : (lo + hi) / 2;
        var pos = f(mid) >= 0;
        rowCells += '<td class="' + (pos ? "pos" : "neg") + '">' + (pos ? "+" : "−") + "</td>";
      }
    }
    return '<div class="table-zone"><table class="grille"><tr><th></th>' + headCells + "</tr>" +
      '<tr><td class="rowlabel">signe de f(x)</td>' + rowCells + "</tr></table></div>";
  };

  SigneTrinomeWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b, c = this._c;
    var delta = b * b - 4 * a * c;
    var f = function (x) { return a * x * x + b * x + c; };

    this._formule.textContent = "f(x) = " + formatNombreFr(a, 1) + "x² " + (b >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(b), 1) + "x " + (c >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(c), 1);
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurC.textContent = formatNombreFr(c, 1);

    var racines = [];
    if (delta > 1e-9) {
      var r1 = (-b - Math.sqrt(delta)) / (2 * a);
      var r2 = (-b + Math.sqrt(delta)) / (2 * a);
      racines = [Math.min(r1, r2), Math.max(r1, r2)];
    } else if (delta > -1e-9) {
      racines = [-b / (2 * a)];
    }

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var marker = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    marker.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    var veutPositif = this._symbole === "gt" || this._symbole === "ge";
    this._traceCourbeSignee(svg, ns, f, racines, veutPositif);
    racines.forEach(function (r) {
      if (r < X_MIN || r > X_MAX) return;
      var p = self._toPx(r, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 4, class: "racine" }));
    });

    // Tableau de signes : un message si Δ<0 (rien à cadriller, signe constant), sinon une vraie
    // grille avec une colonne par racine, sur le modèle du site (blanc/valeur/blanc en alternance).
    if (delta < -1e-9) {
      this._zoneTableau.innerHTML =
        '<p class="message-delta">Δ &lt; 0 : aucune racine réelle — le trinôme garde ' +
        'toujours le signe de a (ici ' + (a > 0 ? 'positif' : 'négatif') + '), quel que soit x.</p>';
    } else {
      this._zoneTableau.innerHTML = this._construireTableau(f, racines);
    }

    this._solution.textContent = this._calculerSolution(a, delta, racines, this._symbole);
  };

  if (!customElements.get("signe-trinome-widget")) {
    customElements.define("signe-trinome-widget", SigneTrinomeWidgetClass);
  }
})();
