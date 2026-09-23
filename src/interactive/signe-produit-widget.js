(function () {
  "use strict";

  /* ================================================================
   * <signe-produit-widget> — atelier interactif : 2 ou 3 facteurs du premier
   * degré (x − r₁), (x − r₂), [(x − r₃)] à racine réglable, grille de signes
   * construite en direct (une ligne par facteur + la ligne produit), courbe
   * du produit colorée par son signe, et un sélecteur ◇ ∈ {>,<} qui calcule
   * l'ensemble-solution S. Reprend par défaut l'exemple (x−1)·x·(x−3) > 0
   * déjà résolu juste au-dessus. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { r1: 0, r2: 1, r3: 3, trois: true };
  var BORNES_R = { min: -6, max: 6, step: 0.5 };
  var X_MIN = -7, X_MAX = 7, Y_MIN = -30, Y_MAX = 30;
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

  function labelFacteur(r) {
    if (Math.abs(r) < 1e-9) return "x";
    return "x " + (r > 0 ? "− " + formatNombreFr(r, 2) : "+ " + formatNombreFr(-r, 2));
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.4;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.4;fill:none;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.table-zone{margin-bottom:14px;overflow-x:auto;}' +
    'table.grille{border-collapse:collapse;font-family:var(--mono,monospace);font-size:12.5px;margin:0 auto;}' +
    'table.grille th,table.grille td{border:1px solid var(--line,#e2d8c8);padding:6px 9px;text-align:center;min-width:30px;}' +
    'table.grille th{background:var(--surface-2,#faf6f0);color:var(--ink-faint,#9c9083);font-weight:500;}' +
    'table.grille td.rowlabel{text-align:left;font-family:var(--sans,sans-serif);font-weight:600;color:var(--ink-soft,#6b6055);background:var(--surface-2,#faf6f0);white-space:nowrap;}' +
    'table.grille tr.produit td.rowlabel{color:var(--accent-ink,#7a3212);}' +
    'table.grille td.pos{color:var(--good,#2f7a4f);font-weight:700;}' +
    'table.grille td.neg{color:var(--bad,#a8322f);font-weight:700;}' +
    'table.grille td.zero{color:var(--ink-faint,#9c9083);}' +
    'table.grille tr.produit td.pos,table.grille tr.produit td.neg{font-size:1.05em;}' +
    '.solution{text-align:center;font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.case-3{display:flex;align-items:center;justify-content:center;gap:7px;font-weight:600;font-size:0.92rem;cursor:pointer;}' +
    '.case-3 input[type="checkbox"]{width:16px;height:16px;cursor:pointer;accent-color:var(--accent,#a8471f);}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><span class="formule" id="formule"></span>' +
    '<select id="symbole">' +
    '<option value="gt">&gt; 0</option>' +
    '<option value="lt">&lt; 0</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div id="zone-tableau"></div>' +
    '<p class="solution" id="solution"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="r1">racine du 1er facteur</label><div class="curseur-row">' +
    '<input type="range" id="r1" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r1 + '">' +
    '<span class="curseur-valeur" id="r1-valeur"></span></div></div>' +
    '<div class="curseur"><label for="r2">racine du 2e facteur</label><div class="curseur-row">' +
    '<input type="range" id="r2" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r2 + '">' +
    '<span class="curseur-valeur" id="r2-valeur"></span></div></div>' +
    '<label class="case-3"><input type="checkbox" id="case-3" checked>3 facteurs</label>' +
    '<div class="curseur"><label for="r3">racine du 3e facteur</label><div class="curseur-row">' +
    '<input type="range" id="r3" min="' + BORNES_R.min + '" max="' + BORNES_R.max + '" step="' + BORNES_R.step + '" value="' + DEFAUT.r3 + '">' +
    '<span class="curseur-valeur" id="r3-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SigneProduitWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SigneProduitWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._r1 = DEFAUT.r1;
    this._r2 = DEFAUT.r2;
    this._r3 = DEFAUT.r3;
    this._trois = DEFAUT.trois;
    this._symbole = "gt";
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectSymbole = shadow.getElementById("symbole");
    this._zoneTableau = shadow.getElementById("zone-tableau");
    this._solution = shadow.getElementById("solution");
    this._inputR1 = shadow.getElementById("r1");
    this._inputR2 = shadow.getElementById("r2");
    this._inputR3 = shadow.getElementById("r3");
    this._valeurR1 = shadow.getElementById("r1-valeur");
    this._valeurR2 = shadow.getElementById("r2-valeur");
    this._valeurR3 = shadow.getElementById("r3-valeur");
    this._case3 = shadow.getElementById("case-3");
    this._resetBtn = shadow.getElementById("reset");
  };

  SigneProduitWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputR1 = function () { self._r1 = parseFloat(self._inputR1.value); self._rendre(); };
    this._onInputR2 = function () { self._r2 = parseFloat(self._inputR2.value); self._rendre(); };
    this._onInputR3 = function () { self._r3 = parseFloat(self._inputR3.value); self._rendre(); };
    this._onChangeCase3 = function () {
      self._trois = self._case3.checked;
      self._inputR3.disabled = !self._trois;
      self._rendre();
    };
    this._onChangeSymbole = function () { self._symbole = self._selectSymbole.value; self._rendre(); };
    this._onReset = function () {
      self._r1 = DEFAUT.r1; self._r2 = DEFAUT.r2; self._r3 = DEFAUT.r3; self._trois = DEFAUT.trois; self._symbole = "gt";
      self._inputR1.value = String(DEFAUT.r1);
      self._inputR2.value = String(DEFAUT.r2);
      self._inputR3.value = String(DEFAUT.r3);
      self._inputR3.disabled = false;
      self._case3.checked = true;
      self._selectSymbole.value = "gt";
      self._rendre();
    };
    this._inputR1.addEventListener("input", this._onInputR1);
    this._inputR2.addEventListener("input", this._onInputR2);
    this._inputR3.addEventListener("input", this._onInputR3);
    this._case3.addEventListener("change", this._onChangeCase3);
    this._selectSymbole.addEventListener("change", this._onChangeSymbole);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SigneProduitWidgetClass.prototype.disconnectedCallback = function () {
    this._inputR1.removeEventListener("input", this._onInputR1);
    this._inputR2.removeEventListener("input", this._onInputR2);
    this._inputR3.removeEventListener("input", this._onInputR3);
    this._case3.removeEventListener("change", this._onChangeCase3);
    this._selectSymbole.removeEventListener("change", this._onChangeSymbole);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SigneProduitWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  SigneProduitWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f, classe) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(140 * (xMax - xMin) / (X_MAX - X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= Y_MIN - 1 && yy <= Y_MAX + 1;
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
  // = ne satisfait pas), pas selon le signe brut du produit — c'est la ligne "produit" du tableau
  // juste en dessous qui montre le signe brut (+/−), la courbe montre directement S.
  SigneProduitWidgetClass.prototype._traceCourbeSignee = function (svg, ns, f, racinesTriees, veutPositif) {
    var bornes = [X_MIN].concat(racinesTriees.filter(function (r) { return r > X_MIN && r < X_MAX; })).concat([X_MAX]);
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

  // Grille de signes générique : une ligne par facteur + la ligne produit, colonnes en
  // alternance borne/écart. Chaque cellule (borne OU écart) est obtenue en évaluant DIRECTEMENT
  // la fonction de la ligne à cet endroit — jamais un signe "déduit" — ce qui donne
  // automatiquement 0 dans la colonne du propre facteur, et le vrai signe (pas un blanc) dans la
  // colonne d'un AUTRE facteur, exactement comme la grille de référence de la section 3.
  SigneProduitWidgetClass.prototype._construireTableau = function (lignes, bornesTriees) {
    var bornes = [-Infinity].concat(bornesTriees).concat([Infinity]);
    var headCells = "";
    for (var i = 0; i < bornes.length; i++) {
      headCells += "<th>" + FORMAT_BORNE(bornes[i]) + "</th>";
      if (i < bornes.length - 1) headCells += "<th></th>";
    }
    var corpsLignes = lignes.map(function (ligne) {
      var cells = "";
      for (var i = 0; i < bornes.length; i++) {
        // Colonne borne : ±3 au-delà de la dernière racine finie aux deux extrémités (jamais une
        // vraie évaluation à l'infini), la valeur exacte de la racine sinon — 0 pile pour le
        // propre facteur, un vrai signe (jamais un blanc) pour un facteur qui n'y est pas nul.
        var xBorne = bornes[i] === -Infinity ? bornes[1] - 3 : bornes[i] === Infinity ? bornes[bornes.length - 2] + 3 : bornes[i];
        var v = ligne.fn(xBorne);
        var estZero = Math.abs(v) < 1e-9;
        cells += '<td class="' + (estZero ? "zero" : v > 0 ? "pos" : "neg") + '">' + (estZero ? "0" : v > 0 ? "+" : "−") + "</td>";
        if (i < bornes.length - 1) {
          var lo = bornes[i], hi = bornes[i + 1];
          var mid = lo === -Infinity ? hi - 3 : hi === Infinity ? lo + 3 : (lo + hi) / 2;
          var vg = ligne.fn(mid);
          cells += '<td class="' + (vg > 0 ? "pos" : "neg") + '">' + (vg > 0 ? "+" : "−") + "</td>";
        }
      }
      return '<tr class="' + (ligne.emphase ? "produit" : "") + '"><td class="rowlabel">' + ligne.label + "</td>" + cells + "</tr>";
    }).join("");
    return '<div class="table-zone"><table class="grille"><tr><th></th>' + headCells + "</tr>" + corpsLignes + "</table></div>";
  };

  SigneProduitWidgetClass.prototype._calculerSolution = function (f, racinesTriees, symbole) {
    var bornes = [-Infinity].concat(racinesTriees).concat([Infinity]);
    var veutPositif = symbole === "gt";
    var morceaux = [];
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      var mid = lo === -Infinity ? hi - 3 : hi === Infinity ? lo + 3 : (lo + hi) / 2;
      if ((f(mid) > 0) === veutPositif) {
        morceaux.push("]" + FORMAT_BORNE(lo) + " ; " + FORMAT_BORNE(hi) + "[");
      }
    }
    return morceaux.length ? "S = " + morceaux.join(" ∪ ") : "S = ∅";
  };

  function mkFacteur(r) {
    return { r: r, fn: function (x) { return x - r; } };
  }

  SigneProduitWidgetClass.prototype._rendre = function () {
    var facteurs = [mkFacteur(this._r1), mkFacteur(this._r2)];
    if (this._trois) facteurs.push(mkFacteur(this._r3));

    this._formule.textContent = "(" + facteurs.map(function (fa) { return labelFacteur(fa.r); }).join(")(") + ")";
    this._valeurR1.textContent = formatNombreFr(this._r1, 2);
    this._valeurR2.textContent = formatNombreFr(this._r2, 2);
    this._valeurR3.textContent = formatNombreFr(this._r3, 2);

    var f = function (x) {
      var v = 1;
      for (var i = 0; i < facteurs.length; i++) v *= facteurs[i].fn(x);
      return v;
    };

    var racinesTriees = facteurs.map(function (fa) { return fa.r; }).sort(function (a, b) { return a - b; })
      .filter(function (r, i, arr) { return i === 0 || Math.abs(r - arr[i - 1]) > 1e-9; });

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

    this._traceCourbeSignee(svg, ns, f, racinesTriees, this._symbole === "gt");
    racinesTriees.forEach(function (r) {
      if (r < X_MIN || r > X_MAX) return;
      var p = self._toPx(r, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 4, class: "racine" }));
    });

    var lignes = facteurs.map(function (fa) { return { label: labelFacteur(fa.r), fn: fa.fn }; });
    lignes.push({ label: "produit", fn: f, emphase: true });
    this._zoneTableau.innerHTML = this._construireTableau(lignes, racinesTriees);

    this._solution.textContent = this._calculerSolution(f, racinesTriees, this._symbole);
  };

  if (!customElements.get("signe-produit-widget")) {
    customElements.define("signe-produit-widget", SigneProduitWidgetClass);
  }
})();
