(function () {
  "use strict";

  /* ================================================================
   * <familles-parite-widget> — atelier interactif, deux modes :
   *
   * 1) « Fonction de référence » (par défaut, comportement historique) :
   *    sélecteur de famille (les 6 fonctions de référence), curseur t>0 qui
   *    place un point (t;f(t)) et son symétrique automatique en −t — miroir
   *    vertical (axe Oy) pour les familles paires, rotation de 180°
   *    (symétrie centrale) pour les impaires. Pour la racine carrée (domaine
   *    à sens unique), montre explicitement qu'aucun symétrique n'existe.
   *
   * 2) « Fonction transformée » : f(x) = g(x − TH) + TV (curseurs TH, TV).
   *    Le widget TESTE la parité de f (domaine symétrique ? f(−x) comparé à
   *    f(x) et à −f(x) en plusieurs abscisses) et rend un verdict : paire,
   *    impaire ou ni l'un ni l'autre. Le symétrique attendu d'après la
   *    famille (miroir ou demi-tour) est dessiné : vert s'il tombe sur la
   *    courbe, rouge (cercle vide) s'il ne tombe plus dessus, avec le vrai
   *    point de la courbe en −t. Une translation horizontale casse toujours
   *    la parité ; une translation verticale casse l'imparité, pas la parité.
   *
   * Fenêtres FIXES par famille et par mode (jamais recalculées depuis un
   * curseur). Web Component (Shadow DOM).
   * ================================================================ */

  var FAMILLES = {
    carre: { symbole: "x²", g: function (u) { return u * u; }, parite: "paire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -1, Y_MAX: 10, T: { X_MIN: -5, X_MAX: 5, Y_MIN: -3, Y_MAX: 12 } },
    cube: { symbole: "x³", g: function (u) { return u * u * u; }, parite: "impaire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -28, Y_MAX: 28, T: { X_MIN: -4, X_MAX: 4, Y_MIN: -30, Y_MAX: 30 } },
    racine: { symbole: "√x", g: function (u) { return u < 0 ? NaN : Math.sqrt(u); }, parite: "aucune", t: { min: 0.3, max: 8, step: 0.1, defaut: 4 }, X_MIN: -1, X_MAX: 9, Y_MIN: -1, Y_MAX: 3.5, T: { X_MIN: -4, X_MAX: 9, Y_MIN: -3, Y_MAX: 5 } },
    racineCubique: { symbole: "∛x", g: function (u) { return (u < 0 ? -1 : 1) * Math.pow(Math.abs(u), 1 / 3); }, parite: "impaire", t: { min: 0.3, max: 7, step: 0.1, defaut: 3.5 }, X_MIN: -8, X_MAX: 8, Y_MIN: -2, Y_MAX: 2, T: { X_MIN: -8, X_MAX: 8, Y_MIN: -4, Y_MAX: 4 } },
    inverse: { symbole: "1/x", g: function (u) { return Math.abs(u) < 1e-9 ? NaN : 1 / u; }, parite: "impaire", t: { min: 0.5, max: 3, step: 0.1, defaut: 1 }, X_MIN: -4, X_MAX: 4, Y_MIN: -5, Y_MAX: 5, T: { X_MIN: -5, X_MAX: 5, Y_MIN: -7, Y_MAX: 7 } },
    valeurAbsolue: { symbole: "|x|", g: function (u) { return Math.abs(u); }, parite: "paire", t: { min: 0.3, max: 3, step: 0.1, defaut: 1.5 }, X_MIN: -4, X_MAX: 4, Y_MIN: -1, Y_MAX: 4, T: { X_MIN: -5, X_MAX: 5, Y_MIN: -3, Y_MAX: 7 } },
  };
  var DEFAUT_FAMILLE = "cube";
  var DEFAUT_MODE = "reference";
  var DEFAUT_TRANSFO = { th: 1, tv: 0 };
  var BORNES_TRANSLATION = { min: -2, max: 2, step: 0.5 };
  var ABSCISSES_TEST = [0.5, 1, 1.5, 2, 2.5, 3];

  var LARGEUR = 400, HAUTEUR = 300, MARGE = 34;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /** Nombre court : « 2 », « 0,5 », « −1,5 ». */
  function fmt(n) {
    var r = Math.round(n * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    return (Number.isInteger(r) ? String(r) : String(r).replace(".", ",")).replace("-", "−");
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  /** f(x) = g(x − TH) + TV, écrite comme dans le chapitre. */
  function texteTransformee(famille, th, tv) {
    var arg = th === 0 ? "x" : (th > 0 ? "x − " + fmt(th) : "x + " + fmt(-th));
    var simple = th === 0;
    var corps;
    if (famille === "carre") corps = simple ? "x²" : "(" + arg + ")²";
    else if (famille === "cube") corps = simple ? "x³" : "(" + arg + ")³";
    else if (famille === "racine") corps = simple ? "√x" : "√(" + arg + ")";
    else if (famille === "racineCubique") corps = simple ? "∛x" : "∛(" + arg + ")";
    else if (famille === "inverse") corps = "1/" + (simple ? "x" : "(" + arg + ")");
    else corps = "|" + arg + "|";
    if (tv > 0) corps += " + " + fmt(tv);
    else if (tv < 0) corps += " − " + fmt(-tv);
    return "f(x) = " + corps;
  }

  function egaux(a, b) { return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(a), Math.abs(b)); }

  /** Test de parité de f(x) = g(x − TH) + TV : domaine symétrique, puis f(−x) comparé à f(x) et à
   * −f(x) sur plusieurs abscisses. Renvoie { verdict: "paire" | "impaire" | "aucune", raison }. */
  function testerParite(famille, th, tv) {
    var g = FAMILLES[famille].g;
    var f = function (x) { return g(x - th) + tv; };
    if (famille === "racine") {
      return { verdict: "aucune", raison: "le domaine [" + fmt(th) + " ; +∞[ n'est pas symétrique par rapport à 0 : −x n'est pas toujours dans le domaine." };
    }
    if (famille === "inverse" && th !== 0) {
      return { verdict: "aucune", raison: "le domaine ℝ \\ {" + fmt(th) + "} n'est pas symétrique : " + fmt(-th) + " est dans le domaine, mais pas son opposé " + fmt(th) + "." };
    }
    var paire = true, impaire = true, contre = null;
    for (var i = 0; i < ABSCISSES_TEST.length; i++) {
      var x = ABSCISSES_TEST[i];
      var a = f(-x), b = f(x);
      if (!isFinite(a) || !isFinite(b)) continue;
      if (!egaux(a, b)) paire = false;
      if (!egaux(a, -b)) impaire = false;
      if (!contre && !egaux(a, b) && !egaux(a, -b)) contre = { x: x, a: a, b: b };
    }
    if (paire) return { verdict: "paire", raison: "f(−x) = f(x) pour chaque x testé : la courbe est symétrique par rapport à l'axe Oy." };
    if (impaire) return { verdict: "impaire", raison: "f(−x) = −f(x) pour chaque x testé : la courbe est symétrique par rapport à l'origine." };
    var c = contre || { x: 1, a: f(-1), b: f(1) };
    return {
      verdict: "aucune",
      raison: "par exemple f(−" + fmt(c.x) + ") = " + formatNombreFr(c.a, 2) + " alors que f(" + fmt(c.x) + ") = " + formatNombreFr(c.b, 2) + " : ni égal, ni opposé.",
    };
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.modes{display:flex;justify-content:center;gap:0;margin-bottom:12px;}' +
    '.modes button{font:inherit;font-size:0.88rem;font-weight:600;padding:7px 12px;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink-soft,#6b6055);cursor:pointer;min-height:38px;}' +
    '.modes button:first-child{border-radius:var(--radius,3px) 0 0 var(--radius,3px);}' +
    '.modes button:last-child{border-radius:0 var(--radius,3px) var(--radius,3px) 0;border-left:none;}' +
    '.modes button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);border-color:var(--accent-soft-line,#e8c4a4);}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 10px;}' +
    '.formule[hidden]{display:none;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:400px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.miroir{stroke:var(--plan,#5b4ea3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.guide{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:3 3;opacity:0.8;}' +
    '.guide-rate{stroke:var(--bad,#b23a3a);stroke-width:1.2;stroke-dasharray:3 3;opacity:0.85;}' +
    '.point-t{fill:var(--accent,#a8471f);}' +
    '.point-symetrique{fill:var(--plan,#5b4ea3);}' +
    '.point-ok{fill:var(--good,#2f7a4f);}' +
    '.point-rate{fill:none;stroke:var(--bad,#b23a3a);stroke-width:2.2;}' +
    '.point-reel{fill:var(--accent,#a8471f);opacity:0.75;}' +
    '.origine{fill:var(--ink,#241f1a);}' +
    '.etiquette-point{font-size:11.5px;font-weight:700;font-family:var(--mono,monospace);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etiquette-point-t{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-point-sym{fill:var(--plan,#5b4ea3);}' +
    '.etiquette-ok{fill:var(--good,#2f7a4f);}' +
    '.etiquette-rate{fill:var(--bad,#b23a3a);}' +
    '.etiquette-vide{font-size:12px;font-weight:600;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.verdict.aucune{color:var(--bad,#b23a3a);}' +
    '.verdict.ok{color:var(--good,#2f7a4f);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur[hidden]{display:none;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;min-height:38px;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    'button:focus-visible,select:focus-visible{outline:2px solid var(--plan,#5b4ea3);outline-offset:2px;}' +
    '</style>' +
    '<div class="modes" role="group" aria-label="Mode">' +
    '<button type="button" id="mode-reference">Fonction de référence</button>' +
    '<button type="button" id="mode-transformee">Fonction transformée</button>' +
    '</div>' +
    '<div class="ligne-select"><label for="famille">Famille</label>' +
    '<select id="famille">' +
    '<option value="carre">carrée — x²</option>' +
    '<option value="cube">cube — x³</option>' +
    '<option value="racine">racine carrée — √x</option>' +
    '<option value="racineCubique">racine cubique — ∛x</option>' +
    '<option value="inverse">inverse — 1/x</option>' +
    '<option value="valeurAbsolue">valeur absolue — |x|</option>' +
    '</select></div>' +
    '<p class="formule" id="formule" hidden></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<div class="controles">' +
    '<div class="curseur" id="bloc-th" hidden><label for="th">TH — translation horizontale</label><div class="curseur-row">' +
    '<input type="range" id="th" min="' + BORNES_TRANSLATION.min + '" max="' + BORNES_TRANSLATION.max + '" step="' + BORNES_TRANSLATION.step + '" value="' + DEFAUT_TRANSFO.th + '">' +
    '<span class="curseur-valeur" id="th-valeur"></span></div></div>' +
    '<div class="curseur" id="bloc-tv" hidden><label for="tv">TV — translation verticale</label><div class="curseur-row">' +
    '<input type="range" id="tv" min="' + BORNES_TRANSLATION.min + '" max="' + BORNES_TRANSLATION.max + '" step="' + BORNES_TRANSLATION.step + '" value="' + DEFAUT_TRANSFO.tv + '">' +
    '<span class="curseur-valeur" id="tv-valeur"></span></div></div>' +
    '<div class="curseur"><label for="t">t</label><div class="curseur-row">' +
    '<input type="range" id="t" min="0" max="3" step="0.1" value="1.5">' +
    '<span class="curseur-valeur" id="t-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class FamillesPariteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  FamillesPariteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._mode = DEFAUT_MODE;
    this._famille = DEFAUT_FAMILLE;
    this._t = FAMILLES[DEFAUT_FAMILLE].t.defaut;
    this._th = DEFAUT_TRANSFO.th;
    this._tv = DEFAUT_TRANSFO.tv;
    this._selectFamille = shadow.getElementById("famille");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._formule = shadow.getElementById("formule");
    this._inputT = shadow.getElementById("t");
    this._valeurT = shadow.getElementById("t-valeur");
    this._inputTh = shadow.getElementById("th");
    this._inputTv = shadow.getElementById("tv");
    this._valeurTh = shadow.getElementById("th-valeur");
    this._valeurTv = shadow.getElementById("tv-valeur");
    this._blocTh = shadow.getElementById("bloc-th");
    this._blocTv = shadow.getElementById("bloc-tv");
    this._resetBtn = shadow.getElementById("reset");
    this._btnReference = shadow.getElementById("mode-reference");
    this._btnTransformee = shadow.getElementById("mode-transformee");
    this._selectFamille.value = this._famille;
  };

  FamillesPariteWidgetClass.prototype._appliquerBornesT = function () {
    var bornesT = FAMILLES[this._famille].t;
    this._inputT.min = String(bornesT.min);
    this._inputT.max = String(bornesT.max);
    this._inputT.step = String(bornesT.step);
    this._t = bornesT.defaut;
    this._inputT.value = String(bornesT.defaut);
  };

  FamillesPariteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeFamille = function () {
      self._famille = self._selectFamille.value;
      self._appliquerBornesT();
      self._rendre();
    };
    this._onInputT = function () { self._t = parseFloat(self._inputT.value); self._rendre(); };
    this._onInputTh = function () { self._th = parseFloat(self._inputTh.value); self._rendre(); };
    this._onInputTv = function () { self._tv = parseFloat(self._inputTv.value); self._rendre(); };
    this._onMode = function (mode) {
      return function () {
        if (self._mode === mode) return;
        self._mode = mode;
        self._rendre();
      };
    };
    this._onModeReference = this._onMode("reference");
    this._onModeTransformee = this._onMode("transformee");
    this._onReset = function () {
      self._famille = DEFAUT_FAMILLE;
      self._selectFamille.value = DEFAUT_FAMILLE;
      self._th = DEFAUT_TRANSFO.th;
      self._tv = DEFAUT_TRANSFO.tv;
      self._inputTh.value = String(DEFAUT_TRANSFO.th);
      self._inputTv.value = String(DEFAUT_TRANSFO.tv);
      self._appliquerBornesT();
      self._rendre();
    };
    this._selectFamille.addEventListener("change", this._onChangeFamille);
    this._inputT.addEventListener("input", this._onInputT);
    this._inputTh.addEventListener("input", this._onInputTh);
    this._inputTv.addEventListener("input", this._onInputTv);
    this._btnReference.addEventListener("click", this._onModeReference);
    this._btnTransformee.addEventListener("click", this._onModeTransformee);
    this._resetBtn.addEventListener("click", this._onReset);
    this._onChangeFamille();
  };

  FamillesPariteWidgetClass.prototype.disconnectedCallback = function () {
    this._selectFamille.removeEventListener("change", this._onChangeFamille);
    this._inputT.removeEventListener("input", this._onInputT);
    this._inputTh.removeEventListener("input", this._onInputTh);
    this._inputTv.removeEventListener("input", this._onInputTv);
    this._btnReference.removeEventListener("click", this._onModeReference);
    this._btnTransformee.removeEventListener("click", this._onModeTransformee);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  FamillesPariteWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.X_MIN) / (win.X_MAX - win.X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.Y_MIN) / (win.Y_MAX - win.Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  FamillesPariteWidgetClass.prototype._traceIntervalle = function (svg, ns, win, xMin, xMax, f) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(220 * (xMax - xMin) / (win.X_MAX - win.X_MIN)));
    var segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.Y_MIN - 0.3 && yy <= win.Y_MAX + 0.3;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.Y_MIN, Math.min(win.Y_MAX, yy)));
        courant += (!dernierValide ? "M" : "L") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      } else if (dernierValide && courant) {
        segments.push(courant.trim());
        courant = "";
      }
      dernierValide = valide;
    }
    if (courant) segments.push(courant.trim());
    segments.forEach(function (seg) {
      svg.appendChild(svgEl(ns, "path", { d: seg, class: "courbe" }));
    });
  };

  /** Axes avec flèches + étiquette x, communs aux deux modes. */
  FamillesPariteWidgetClass.prototype._axes = function (svg, ns, win) {
    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);
    var origine = this._toPx(win, 0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    return origine;
  };

  /** Étiquette d'un point, tournée vers l'intérieur du cadre (jamais coupée par le bord). */
  FamillesPariteWidgetClass.prototype._etiquette = function (svg, ns, px, py, texte, classe, dessous) {
    var ancre = "middle", x = px;
    if (px > LARGEUR - MARGE - 50) { ancre = "end"; x = px - 6; }
    else if (px < MARGE + 50) { ancre = "start"; x = px + 6; }
    var y = dessous ? py + 17 : py - 10;
    if (y < 14) y = py + 17;
    if (y > HAUTEUR - 6) y = py - 10;
    var t = svgEl(ns, "text", { x: x.toFixed(2), y: y.toFixed(2), "text-anchor": ancre, class: "etiquette-point " + classe });
    t.textContent = texte;
    svg.appendChild(t);
  };

  FamillesPariteWidgetClass.prototype._rendre = function () {
    var transformee = this._mode === "transformee";
    this._btnReference.setAttribute("aria-pressed", transformee ? "false" : "true");
    this._btnTransformee.setAttribute("aria-pressed", transformee ? "true" : "false");
    this._blocTh.hidden = !transformee;
    this._blocTv.hidden = !transformee;
    this._formule.hidden = !transformee;
    this._valeurT.textContent = formatNombreFr(this._t, 1);
    this._valeurTh.textContent = formatNombreFr(this._th, 1);
    this._valeurTv.textContent = formatNombreFr(this._tv, 1);
    if (transformee) this._rendreTransformee();
    else this._rendreReference();
  };

  FamillesPariteWidgetClass.prototype._rendreReference = function () {
    var famille = this._famille, t = this._t;
    var def = FAMILLES[famille];
    var win = def;
    var f = def.g;
    var ft = f(t);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;
    var origine = this._axes(svg, ns, win);

    if (famille === "racine") this._traceIntervalle(svg, ns, win, 0, win.X_MAX, f);
    else this._traceIntervalle(svg, ns, win, win.X_MIN, win.X_MAX, f);

    var pT = self._toPx(win, t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, ft)));
    svg.appendChild(svgEl(ns, "circle", { cx: pT[0].toFixed(2), cy: pT[1].toFixed(2), r: 5, class: "point-t" }));
    var etT = svgEl(ns, "text", { x: pT[0].toFixed(2), y: (pT[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-t" });
    etT.textContent = "(" + formatNombreFr(t, 1) + ";" + formatNombreFr(ft, 2) + ")";
    svg.appendChild(etT);

    if (def.parite === "aucune") {
      this._verdict.className = "verdict aucune";
      this._verdict.textContent = "√x n'a ni parité ni imparité : le domaine [0;+∞[ ne contient pas −t, donc aucun symétrique n'existe.";
      var xVideMath = -t;
      if (xVideMath >= win.X_MIN) {
        var pVide = self._toPx(win, xVideMath, 0);
        var etVide = svgEl(ns, "text", { x: pVide[0].toFixed(2), y: (origine[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-vide" });
        etVide.textContent = "x=−t : hors domaine";
        svg.appendChild(etVide);
      }
    } else if (def.parite === "paire") {
      // Miroir vertical (axe Oy) : (−t;f(t)) — même ordonnée, symétrique en x.
      var pSym = self._toPx(win, -t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, ft)));
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "miroir" }));
      svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pT[1].toFixed(2), x2: pSym[0].toFixed(2), y2: pSym[1].toFixed(2), class: "guide" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pSym[0].toFixed(2), cy: pSym[1].toFixed(2), r: 5, class: "point-symetrique" }));
      var etSym = svgEl(ns, "text", { x: pSym[0].toFixed(2), y: (pSym[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-sym" });
      etSym.textContent = "(−" + formatNombreFr(t, 1) + ";" + formatNombreFr(ft, 2) + ")";
      svg.appendChild(etSym);
      this._verdict.className = "verdict";
      this._verdict.textContent = "f(−t) = f(t) = " + formatNombreFr(ft, 2) + " : fonction PAIRE — miroir vertical sur l'axe Oy.";
    } else {
      // Symétrie centrale (rotation 180°) : (−t;−f(t)) — droite passant par l'origine.
      var pSym2 = self._toPx(win, -t, Math.max(win.Y_MIN, Math.min(win.Y_MAX, -ft)));
      svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pT[1].toFixed(2), x2: pSym2[0].toFixed(2), y2: pSym2[1].toFixed(2), class: "miroir" }));
      svg.appendChild(svgEl(ns, "circle", { cx: origine[0].toFixed(2), cy: origine[1].toFixed(2), r: 3, class: "origine" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pSym2[0].toFixed(2), cy: pSym2[1].toFixed(2), r: 5, class: "point-symetrique" }));
      var etSym2 = svgEl(ns, "text", { x: pSym2[0].toFixed(2), y: (pSym2[1] + (ft >= 0 ? 16 : -10)).toFixed(2), "text-anchor": "middle", class: "etiquette-point etiquette-point-sym" });
      etSym2.textContent = "(−" + formatNombreFr(t, 1) + ";" + formatNombreFr(-ft, 2) + ")";
      svg.appendChild(etSym2);
      this._verdict.className = "verdict";
      this._verdict.textContent = "f(−t) = −f(t) = " + formatNombreFr(-ft, 2) + " : fonction IMPAIRE — symétrie centrale (rotation de 180° autour de l'origine).";
    }
  };

  FamillesPariteWidgetClass.prototype._rendreTransformee = function () {
    var famille = this._famille, t = this._t, th = this._th, tv = this._tv;
    var def = FAMILLES[famille];
    var win = def.T;
    var g = def.g;
    var f = function (x) { return g(x - th) + tv; };
    var test = testerParite(famille, th, tv);
    this._formule.textContent = texteTransformee(famille, th, tv);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;
    var origine = this._axes(svg, ns, win);

    if (famille === "racine") this._traceIntervalle(svg, ns, win, th, win.X_MAX, f);
    else if (famille === "inverse") {
      this._traceIntervalle(svg, ns, win, win.X_MIN, th - 0.02, f);
      this._traceIntervalle(svg, ns, win, th + 0.02, win.X_MAX, f);
    } else this._traceIntervalle(svg, ns, win, win.X_MIN, win.X_MAX, f);

    var dansY = function (y) { return y >= win.Y_MIN && y <= win.Y_MAX; };
    var ft = f(t), fmt_ = f(-t);
    var phrase = test.verdict === "paire" ? "f est PAIRE" : test.verdict === "impaire" ? "f est IMPAIRE" : "f n'est ni paire ni impaire";
    this._verdict.className = "verdict" + (test.verdict === "aucune" ? " aucune" : " ok");
    this._verdict.textContent = phrase + " : " + test.raison;

    // Point (t ; f(t)).
    if (isFinite(ft) && dansY(ft)) {
      var pT = self._toPx(win, t, ft);
      svg.appendChild(svgEl(ns, "circle", { cx: pT[0].toFixed(2), cy: pT[1].toFixed(2), r: 5, class: "point-t" }));
      self._etiquette(svg, ns, pT[0], pT[1], "(" + fmt(t) + ";" + formatNombreFr(ft, 2) + ")", "etiquette-point-t", false);
    } else if (!isFinite(ft)) {
      var pHors = self._toPx(win, t, 0);
      var etHors = svgEl(ns, "text", { x: pHors[0].toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": pHors[0] > LARGEUR - MARGE - 60 ? "end" : "middle", class: "etiquette-vide" });
      etHors.textContent = "x=t : hors domaine";
      svg.appendChild(etHors);
    }

    // Symétrique attendu d'après la famille de départ.
    if (def.parite === "aucune") {
      if (-t >= win.X_MIN) {
        var pVide = self._toPx(win, -t, 0);
        var etVide = svgEl(ns, "text", { x: pVide[0].toFixed(2), y: (origine[1] - 10).toFixed(2), "text-anchor": pVide[0] < MARGE + 60 ? "start" : "middle", class: "etiquette-vide" });
        etVide.textContent = "x=−t : hors domaine";
        svg.appendChild(etVide);
      }
      return;
    }
    if (!isFinite(ft)) return;
    var ySym = def.parite === "paire" ? ft : -ft;
    var tombe = isFinite(fmt_) && egaux(fmt_, ySym);
    if (def.parite === "paire") {
      svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "miroir" }));
    } else {
      svg.appendChild(svgEl(ns, "circle", { cx: origine[0].toFixed(2), cy: origine[1].toFixed(2), r: 3, class: "origine" }));
    }
    if (dansY(ySym) && isFinite(ft) && dansY(ft)) {
      var pT2 = self._toPx(win, t, ft);
      var pS = self._toPx(win, -t, ySym);
      svg.appendChild(svgEl(ns, "line", { x1: pT2[0].toFixed(2), y1: pT2[1].toFixed(2), x2: pS[0].toFixed(2), y2: pS[1].toFixed(2), class: tombe ? "guide" : "guide-rate" }));
      svg.appendChild(svgEl(ns, "circle", { cx: pS[0].toFixed(2), cy: pS[1].toFixed(2), r: tombe ? 5 : 6, class: tombe ? "point-ok" : "point-rate" }));
      self._etiquette(svg, ns, pS[0], pS[1], tombe ? "symétrique : sur la courbe" : "symétrique : hors courbe", tombe ? "etiquette-ok" : "etiquette-rate", !tombe && isFinite(fmt_) && fmt_ > ySym);
    }
    // Vrai point de la courbe en −t (quand le symétrique ne tombe pas dessus).
    if (!tombe && isFinite(fmt_) && dansY(fmt_) && -t >= win.X_MIN) {
      var pR = self._toPx(win, -t, fmt_);
      svg.appendChild(svgEl(ns, "circle", { cx: pR[0].toFixed(2), cy: pR[1].toFixed(2), r: 4, class: "point-reel" }));
      self._etiquette(svg, ns, pR[0], pR[1], "f(−t) = " + formatNombreFr(fmt_, 2), "etiquette-point-t", fmt_ < ySym);
    }
  };

  if (!customElements.get("familles-parite-widget")) {
    customElements.define("familles-parite-widget", FamillesPariteWidgetClass);
  }
})();
