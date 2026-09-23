(function () {
  "use strict";

  /* ================================================================
   * <convergence-suite-widget> — atelier interactif : sélecteur
   * arithmétique/géométrique, curseur de raison (r ou q) et de u1, trace
   * les 10 premiers termes et classe EN DIRECT le comportement — reprend
   * mot pour mot la classification des deux featureTable de la section.
   * Matérialise le piège central : q=−1 (oscille, ne diverge PAS vers
   * l'infini) et q<−1 (oscille, amplitude croissante), tous deux
   * surlignés en rouge, jamais confondus avec q>1 (croissante) ni avec un
   * cas convergent. Même langage visuel que SequencePlot.tsx. Web
   * Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { mode: "geometrique", r: 2, q: 0.65, u1: 6 };
  var BORNES_R = { min: -3, max: 3, step: 0.5 };
  var BORNES_Q = { min: -2, max: 2, step: 0.05 };
  var BORNES_U1 = { min: 1, max: 8, step: 1 };
  var N_TERMES = 10;

  // Fenêtre FIXE (jamais recalculée depuis r/q/u1) : couvre l'oscillation q=−1 jusqu'à u1=8
  // ([-8;8]) avec marge ; les croissances rapides (|q|>1, r>0) sortent vite de la fenêtre et sont
  // simplement clippées, ce qui montre déjà « grandit sans borne » sans avoir besoin de les
  // afficher en entier.
  var LARGEUR = 460, HAUTEUR = 280, MARGE_G = 40, MARGE_D = 20, MARGE_H = 18, MARGE_B = 30;
  var Y_MIN = -12, Y_MAX = 12;

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
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:12px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 12px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.connecteur-ok{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:3 3;fill:none;}' +
    '.connecteur-piege{stroke:var(--bad,#b23a3a);stroke-width:1.8;stroke-dasharray:3 3;fill:none;}' +
    '.point-ok{fill:var(--accent,#a8471f);}' +
    '.point-piege{fill:var(--bad,#b23a3a);}' +
    '.ligne-limite{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.etiquette-limite{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.etiquette-n{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-valeur{font-size:10.5px;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-neutre{color:var(--ink,#241f1a);background:var(--surface-2,#faf6f0);}' +
    '.verdict-piege{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="mode">Type de suite</label>' +
    '<select id="mode"><option value="arithmetique">arithmétique</option><option value="geometrique">géométrique</option></select></div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles" id="zone-controles"></div>' +
    '<div class="curseur"><label for="u1">u₁</label><div class="curseur-row">' +
    '<input type="range" id="u1" min="' + BORNES_U1.min + '" max="' + BORNES_U1.max + '" step="' + BORNES_U1.step + '" value="' + DEFAUT.u1 + '">' +
    '<span class="curseur-valeur" id="u1-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>';

  function curseurHTML(id, label, min, max, step, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  class ConvergenceSuiteWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ConvergenceSuiteWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._mode = DEFAUT.mode;
    this._r = DEFAUT.r;
    this._q = DEFAUT.q;
    this._u1 = DEFAUT.u1;
    this._selectMode = shadow.getElementById("mode");
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._zoneControles = shadow.getElementById("zone-controles");
    this._inputU1 = shadow.getElementById("u1");
    this._valeurU1 = shadow.getElementById("u1-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._shadow = shadow;
    this._selectMode.value = this._mode;
  };

  ConvergenceSuiteWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onChangeMode = function () { self._mode = self._selectMode.value; self._construireControles(); self._rendre(); };
    this._onInputU1 = function () { self._u1 = parseFloat(self._inputU1.value); self._rendre(); };
    this._onReset = function () {
      self._mode = DEFAUT.mode; self._r = DEFAUT.r; self._q = DEFAUT.q; self._u1 = DEFAUT.u1;
      self._selectMode.value = DEFAUT.mode;
      self._inputU1.value = String(DEFAUT.u1);
      self._construireControles();
      self._rendre();
    };
    this._selectMode.addEventListener("change", this._onChangeMode);
    this._inputU1.addEventListener("input", this._onInputU1);
    this._resetBtn.addEventListener("click", this._onReset);
    this._construireControles();
    this._rendre();
  };

  ConvergenceSuiteWidgetClass.prototype.disconnectedCallback = function () {
    this._selectMode.removeEventListener("change", this._onChangeMode);
    this._inputU1.removeEventListener("input", this._onInputU1);
    this._resetBtn.removeEventListener("click", this._onReset);
    if (this._detacherControles) this._detacherControles();
  };

  ConvergenceSuiteWidgetClass.prototype._construireControles = function () {
    var self = this;
    if (this._detacherControles) this._detacherControles();
    var shadow = this._shadow;
    if (this._mode === "arithmetique") {
      this._zoneControles.innerHTML = curseurHTML("r", "r — raison", BORNES_R.min, BORNES_R.max, BORNES_R.step, this._r);
      var inputR = shadow.getElementById("r");
      var onR = function () { self._r = parseFloat(inputR.value); self._rendre(); };
      inputR.addEventListener("input", onR);
      this._detacherControles = function () { inputR.removeEventListener("input", onR); };
    } else {
      this._zoneControles.innerHTML = curseurHTML("q", "q — raison", BORNES_Q.min, BORNES_Q.max, BORNES_Q.step, this._q);
      var inputQ = shadow.getElementById("q");
      var onQ = function () { self._q = parseFloat(inputQ.value); self._rendre(); };
      inputQ.addEventListener("input", onQ);
      this._detacherControles = function () { inputQ.removeEventListener("input", onQ); };
    }
  };

  ConvergenceSuiteWidgetClass.prototype._toPx = function (n) {
    return MARGE_G + ((n - 1) / (N_TERMES - 1)) * (LARGEUR - MARGE_G - MARGE_D);
  };
  ConvergenceSuiteWidgetClass.prototype._toPy = function (v) {
    var vClamp = Math.max(Y_MIN, Math.min(Y_MAX, v));
    return HAUTEUR - MARGE_B - ((vClamp - Y_MIN) / (Y_MAX - Y_MIN)) * (HAUTEUR - MARGE_H - MARGE_B);
  };

  ConvergenceSuiteWidgetClass.prototype._rendre = function () {
    var mode = this._mode, u1 = this._u1;
    var termes = [u1];
    var classe, limite, estPiege;
    var EPS = 1e-9;

    if (mode === "arithmetique") {
      var r = this._r;
      for (var i = 1; i < N_TERMES; i++) termes.push(termes[i - 1] + r);
      this._formule.textContent = "u₁ = " + formatNombreFr(u1, 1) + " ,  u_(n+1) = u_n " + (r >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(r), 1);
      estPiege = false;
      if (Math.abs(r) < EPS) { classe = "r = 0 : suite constante — lim u_n = u₁ = " + formatNombreFr(u1, 2) + "."; limite = u1; }
      else if (r > 0) { classe = "r > 0 : croissante, sans borne — lim u_n = +∞."; limite = null; }
      else { classe = "r < 0 : décroissante, sans borne — lim u_n = −∞."; limite = null; }
    } else {
      var q = this._q;
      for (var j = 1; j < N_TERMES; j++) termes.push(termes[j - 1] * q);
      this._formule.textContent = "u₁ = " + formatNombreFr(u1, 1) + " ,  u_(n+1) = " + formatNombreFr(q, 2) + "·u_n";
      if (Math.abs(q - 1) < EPS) { classe = "q = 1 : suite constante — lim u_n = u₁ = " + formatNombreFr(u1, 2) + "."; limite = u1; estPiege = false; }
      else if (Math.abs(q + 1) < EPS) { classe = "q = −1 : oscille entre u₁ et −u₁ — la limite n'existe PAS (elle ne diverge pas vers l'infini, ne la classe jamais avec q>1 !)"; limite = null; estPiege = true; }
      else if (q < -1) { classe = "q < −1 : oscille, amplitude croissante — la limite n'existe PAS."; limite = null; estPiege = true; }
      else if (q > 1) { classe = "q > 1 : croissante en valeur absolue — lim u_n = ±∞ (signe de u₁)."; limite = null; estPiege = false; }
      else { classe = "|q| < 1 : décroissante en valeur absolue — lim u_n = 0."; limite = 0; estPiege = false; }
    }

    this._valeurU1.textContent = formatNombreFr(u1, 1);
    if (mode === "arithmetique" && this._shadow.getElementById("r")) this._shadow.getElementById("r-valeur").textContent = formatNombreFr(this._r, 1);
    if (mode === "geometrique" && this._shadow.getElementById("q")) this._shadow.getElementById("q-valeur").textContent = formatNombreFr(this._q, 2);

    this._verdict.className = "verdict " + (estPiege ? "verdict-piege" : limite !== null ? "verdict-ok" : "verdict-neutre");
    this._verdict.textContent = classe;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var zeroY = self._toPy(0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D + 8, y1: zeroY.toFixed(2), y2: zeroY.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: MARGE_G, y1: HAUTEUR - MARGE_B, y2: MARGE_H - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE_D + 10, y: HAUTEUR - MARGE_B + 14, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "n";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: MARGE_G + 6, y: MARGE_H - 10, class: "etiquette" });
    etiqY.textContent = "u_n";
    svg.appendChild(etiqY);

    if (limite !== null && limite >= Y_MIN && limite <= Y_MAX) {
      var yL = self._toPy(limite);
      var yDernierTerme = self._toPy(termes[termes.length - 1]);
      var decalageL = Math.abs(yL - yDernierTerme) < 16 ? 18 : -5;
      svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: yL.toFixed(2), y2: yL.toFixed(2), class: "ligne-limite" }));
      var etL = svgEl(ns, "text", { x: LARGEUR - MARGE_D - 4, y: (yL + decalageL).toFixed(2), "text-anchor": "end", class: "etiquette-limite" });
      etL.textContent = "L=" + formatNombreFr(limite, 2);
      svg.appendChild(etL);
    }

    var courant = "";
    termes.forEach(function (v, i) {
      var x = self._toPx(i + 1), y = self._toPy(v);
      courant += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    });
    svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: estPiege ? "connecteur-piege" : "connecteur-ok" }));

    termes.forEach(function (v, i) {
      var visible = v >= Y_MIN - 0.01 && v <= Y_MAX + 0.01;
      if (!visible) return;
      var x = self._toPx(i + 1), y = self._toPy(v);
      svg.appendChild(svgEl(ns, "circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: 4.5, class: estPiege ? "point-piege" : "point-ok" }));
      var etN = svgEl(ns, "text", { x: x.toFixed(2), y: (HAUTEUR - MARGE_B + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-n" });
      etN.textContent = String(i + 1);
      svg.appendChild(etN);
      var etV = svgEl(ns, "text", { x: x.toFixed(2), y: (y - 9).toFixed(2), "text-anchor": "middle", class: "etiquette-valeur" });
      etV.textContent = formatNombreFr(v, 2);
      svg.appendChild(etV);
    });
  };

  if (!customElements.get("convergence-suite-widget")) {
    customElements.define("convergence-suite-widget", ConvergenceSuiteWidgetClass);
  }
})();
