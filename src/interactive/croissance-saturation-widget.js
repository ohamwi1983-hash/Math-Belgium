(function () {
  "use strict";

  /* ================================================================
   * <croissance-saturation-widget> — atelier interactif : bascule entre les
   * deux modèles de la section (croissance libre Q(t)=Q₀·rᵗ, et saturation
   * p(t)=L·(1−e⁻ᵏᵗ)), chacun avec ses propres curseurs et un curseur t
   * commun pour lire la valeur à un instant précis. Reprend les valeurs des
   * exemples déjà résolus (Q₀=100, r=1,5 ; k=0,15) comme réglages par
   * défaut. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT_CROISSANCE = { Q0: 100, r: 1.5, t: 3, tMax: 10 };
  var DEFAUT_SATURATION = { L: 100, k: 0.15, t: 10, tMax: 40 };
  var BORNES_Q0 = { min: 10, max: 500, step: 10 };
  var BORNES_R = { min: 0.5, max: 2, step: 0.01 };
  var BORNES_L = { min: 10, max: 200, step: 5 };
  var BORNES_K = { min: 0.02, max: 0.3, step: 0.01 };

  var LARGEUR = 420, HAUTEUR = 300, MARGE = 40;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  // Convertit un exposant composé (ex. "−0,15t") en unicode superscript, jamais en "^" littéral
  // (convention déjà établie sur ce site — aucune fonction .formule n'est passée par KaTeX, donc
  // un "^" y resterait affiché tel quel). Pas de virgule superscript dans Unicode : laissée telle
  // quelle, meilleure approximation possible.
  var SUPERSCRIPT_MAP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "−": "⁻", "t": "ᵗ" };
  function versExposant(s) {
    var out = "";
    for (var i = 0; i < s.length; i++) out += SUPERSCRIPT_MAP[s[i]] !== undefined ? SUPERSCRIPT_MAP[s[i]] : s[i];
    return out;
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  // Fenêtres Y fixes (jamais recalculées depuis les curseurs courants) : les axes ne doivent
  // pas bouger pendant qu'on fait varier Q₀/r/L/k, sous peine d'effacer l'effet pédagogique du
  // curseur. 8000 couvre largement le cas par défaut (Q₀=100, r=1,5 → Q(10)≈5767) ; les combinaisons
  // extrêmes (Q₀=500, r=2) sortent de la fenêtre et sont simplement coupées (_traceCourbe clippe déjà
  // les points hors [yMin,yMax]). 220 couvre tout p(t) puisque p(t) < L ≤ 200 (BORNES_L.max) toujours.
  var Y_MAX_CROISSANCE = 8000;
  var Y_MAX_SATURATION = 220;

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.select-row{display:flex;justify-content:center;margin-bottom:12px;}' +
    '.select-row select{font-family:inherit;font-size:0.9rem;font-weight:600;color:var(--ink,#241f1a);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:6px 10px;cursor:pointer;max-width:100%;}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.asymptote{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.6;fill:none;}' +
    '.guide{stroke:var(--good,#2f7a4f);stroke-width:1.2;stroke-dasharray:4 3;opacity:0.8;}' +
    '.point{fill:var(--good,#2f7a4f);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 130px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--good,#2f7a4f);white-space:nowrap;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:60px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="select-row"><select id="mode">' +
    '<option value="croissance">Croissance libre — Q(t) = Q₀·rᵗ</option>' +
    '<option value="saturation">Saturation — p(t) = L·(1−e⁻ᵏᵗ)</option>' +
    '</select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label" id="label-valeur">Q(t)</span><span class="stat-value" id="val-y"></span></div>' +
    '<div class="stat"><span class="stat-label" id="label-info">tendance</span><span class="stat-value" id="val-info"></span></div>' +
    '</div>' +
    '<div class="controles" id="zone-controles"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  function curseurHTML(id, label, min, max, step, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  class CroissanceSaturationWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  CroissanceSaturationWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._mode = "croissance";
    this._croissance = { Q0: DEFAUT_CROISSANCE.Q0, r: DEFAUT_CROISSANCE.r, t: DEFAUT_CROISSANCE.t };
    this._saturation = { L: DEFAUT_SATURATION.L, k: DEFAUT_SATURATION.k, t: DEFAUT_SATURATION.t };
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectMode = shadow.getElementById("mode");
    this._zoneControles = shadow.getElementById("zone-controles");
    this._labelValeur = shadow.getElementById("label-valeur");
    this._labelInfo = shadow.getElementById("label-info");
    this._valY = shadow.getElementById("val-y");
    this._valInfo = shadow.getElementById("val-info");
    this._resetBtn = shadow.getElementById("reset");
    this._shadow = shadow;
  };

  CroissanceSaturationWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._construireControles(); self._rendre(); };
    this._onReset = function () {
      self._croissance = { Q0: DEFAUT_CROISSANCE.Q0, r: DEFAUT_CROISSANCE.r, t: DEFAUT_CROISSANCE.t };
      self._saturation = { L: DEFAUT_SATURATION.L, k: DEFAUT_SATURATION.k, t: DEFAUT_SATURATION.t };
      self._mode = "croissance";
      self._selectMode.value = "croissance";
      self._construireControles();
      self._rendre();
    };
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._resetBtn.addEventListener("click", this._onReset);
    this._construireControles();
    this._rendre();
  };

  CroissanceSaturationWidgetClass.prototype.disconnectedCallback = function () {
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._resetBtn.removeEventListener("click", this._onReset);
    if (this._detacherControles) this._detacherControles();
  };

  CroissanceSaturationWidgetClass.prototype._construireControles = function () {
    var self = this;
    if (this._detacherControles) this._detacherControles();
    var shadow = this._shadow;
    if (this._mode === "croissance") {
      var c = this._croissance;
      this._zoneControles.innerHTML =
        curseurHTML("Q0", "Q₀ — valeur initiale", BORNES_Q0.min, BORNES_Q0.max, BORNES_Q0.step, c.Q0) +
        curseurHTML("r", "r — taux", BORNES_R.min, BORNES_R.max, BORNES_R.step, c.r) +
        curseurHTML("t", "t", 0, DEFAUT_CROISSANCE.tMax, 0.1, c.t);
      var inputQ0 = shadow.getElementById("Q0"), inputR = shadow.getElementById("r"), inputT = shadow.getElementById("t");
      var onQ0 = function () { self._croissance.Q0 = parseFloat(inputQ0.value); self._rendre(); };
      var onR = function () { self._croissance.r = parseFloat(inputR.value); self._rendre(); };
      var onT = function () { self._croissance.t = parseFloat(inputT.value); self._rendre(); };
      inputQ0.addEventListener("input", onQ0);
      inputR.addEventListener("input", onR);
      inputT.addEventListener("input", onT);
      this._detacherControles = function () {
        inputQ0.removeEventListener("input", onQ0);
        inputR.removeEventListener("input", onR);
        inputT.removeEventListener("input", onT);
      };
    } else {
      var s = this._saturation;
      this._zoneControles.innerHTML =
        curseurHTML("L", "L — plafond", BORNES_L.min, BORNES_L.max, BORNES_L.step, s.L) +
        curseurHTML("k", "k — vitesse", BORNES_K.min, BORNES_K.max, BORNES_K.step, s.k) +
        curseurHTML("t", "t", 0, DEFAUT_SATURATION.tMax, 0.5, s.t);
      var inputL = shadow.getElementById("L"), inputK = shadow.getElementById("k"), inputT2 = shadow.getElementById("t");
      var onL = function () { self._saturation.L = parseFloat(inputL.value); self._rendre(); };
      var onK = function () { self._saturation.k = parseFloat(inputK.value); self._rendre(); };
      var onT2 = function () { self._saturation.t = parseFloat(inputT2.value); self._rendre(); };
      inputL.addEventListener("input", onL);
      inputK.addEventListener("input", onK);
      inputT2.addEventListener("input", onT2);
      this._detacherControles = function () {
        inputL.removeEventListener("input", onL);
        inputK.removeEventListener("input", onK);
        inputT2.removeEventListener("input", onT2);
      };
    }
  };

  CroissanceSaturationWidgetClass.prototype._toPx = function (win, xMath, yMath) {
    var px = MARGE + (xMath - win.xMin) / (win.xMax - win.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - win.yMin) / (win.yMax - win.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  CroissanceSaturationWidgetClass.prototype._traceCourbe = function (svg, ns, win, f) {
    var self = this;
    var n = 240, segments = [], courant = "", dernierValide = false;
    for (var i = 0; i <= n; i++) {
      var xx = win.xMin + (i / n) * (win.xMax - win.xMin);
      var yy = f(xx);
      var valide = isFinite(yy) && yy >= win.yMin - 0.5 && yy <= win.yMax + 0.5;
      if (valide) {
        var p = self._toPx(win, xx, Math.max(win.yMin, Math.min(win.yMax, yy)));
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

  CroissanceSaturationWidgetClass.prototype._rendre = function () {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;
    var f, win, t, valeur;

    if (this._mode === "croissance") {
      var c = this._croissance;
      f = function (x) { return c.Q0 * Math.pow(c.r, x); };
      win = { xMin: 0, xMax: DEFAUT_CROISSANCE.tMax, yMin: 0, yMax: Y_MAX_CROISSANCE };
      t = c.t;
      valeur = f(t);
      this._formule.textContent = "Q(t) = " + formatNombreFr(c.Q0, 0) + "·" + formatNombreFr(c.r, 2) + "ᵗ";
      this._labelValeur.textContent = "Q(t)";
      this._labelInfo.textContent = "tendance";
      this._valInfo.textContent = c.r > 1 ? "croissance" : c.r < 1 ? "décroissance" : "constante";
    } else {
      var s = this._saturation;
      f = function (x) { return s.L * (1 - Math.exp(-s.k * x)); };
      win = { xMin: 0, xMax: DEFAUT_SATURATION.tMax, yMin: 0, yMax: Y_MAX_SATURATION };
      t = s.t;
      valeur = f(t);
      var exposant = versExposant("−" + formatNombreFr(s.k, 2) + "t");
      this._formule.textContent = "p(t) = " + formatNombreFr(s.L, 0) + "·(1−e" + "⁽" + exposant + "⁾" + ")";
      this._labelValeur.textContent = "p(t)";
      this._labelInfo.textContent = "% du plafond";
      this._valInfo.textContent = formatNombreFr(100 * valeur / s.L, 1) + " %";
    }

    this._valY.textContent = formatNombreFr(valeur, 2);

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(win, win.xMin, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqT = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqT.textContent = "t";
    svg.appendChild(etiqT);

    if (this._mode === "saturation") {
      var pA0 = self._toPx(win, win.xMin, this._saturation.L), pA1 = self._toPx(win, win.xMax, this._saturation.L);
      svg.appendChild(svgEl(ns, "line", { x1: pA0[0].toFixed(2), y1: pA0[1].toFixed(2), x2: pA1[0].toFixed(2), y2: pA1[1].toFixed(2), class: "asymptote" }));
      var etA = svgEl(ns, "text", { x: (MARGE + 4).toFixed(2), y: (pA0[1] - 6).toFixed(2), class: "etiquette" });
      etA.textContent = "asymptote y=" + formatNombreFr(this._saturation.L, 0);
      svg.appendChild(etA);
    }

    this._traceCourbe(svg, ns, win, f);

    var pT = self._toPx(win, t, valeur);
    var pTaxe = self._toPx(win, t, win.yMin);
    var pTy = self._toPx(win, win.xMin, valeur);
    svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pTaxe[1].toFixed(2), x2: pT[0].toFixed(2), y2: pT[1].toFixed(2), class: "guide" }));
    svg.appendChild(svgEl(ns, "line", { x1: pT[0].toFixed(2), y1: pT[1].toFixed(2), x2: pTy[0].toFixed(2), y2: pT[1].toFixed(2), class: "guide" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pT[0].toFixed(2), cy: pT[1].toFixed(2), r: 4.5, class: "point" }));
  };

  if (!customElements.get("croissance-saturation-widget")) {
    customElements.define("croissance-saturation-widget", CroissanceSaturationWidgetClass);
  }
})();
