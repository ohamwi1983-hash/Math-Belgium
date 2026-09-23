(function () {
  "use strict";

  /* ================================================================
   * <discriminant-racines-widget> — atelier interactif : curseurs a, b, c
   * pilotant Δ = b²−4ac en direct, avec la parabole ax²+bx+c colorée selon
   * son signe (segments coupés exactement aux racines, jamais interpolés) et
   * le nombre de solutions réelles affiché. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 1, b: -1, c: -6 }; // reprend l'exemple x²−x−6 déjà résolu dans la section 2
  var BORNES_A = { min: -3, max: 3, step: 0.1 };
  var BORNES_B = { min: -6, max: 6, step: 0.1 };
  var BORNES_C = { min: -6, max: 6, step: 0.1 };
  var X_MIN = -8, X_MAX = 8, Y_MIN = -10, Y_MAX = 12;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 32;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.2rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:16px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.6;fill:none;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-racine{font-size:11.5px;font-weight:600;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-bottom:20px;flex-wrap:wrap;}' +
    '.stat{flex:1 1 150px;min-width:0;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:8px 6px;text-align:center;background:var(--surface,#fff);}' +
    '.stat-label{display:block;font-family:var(--mono,monospace);font-size:10px;letter-spacing:0.02em;color:var(--ink-faint,#9c9083);margin-bottom:5px;}' +
    '.stat-value{display:block;font-variant-numeric:tabular-nums;font-size:0.94rem;font-weight:600;color:var(--ink,#241f1a);white-space:nowrap;}' +
    '.stat-value.pos{color:var(--good,#2f7a4f);}' +
    '.stat-value.neg{color:var(--bad,#a8322f);}' +
    '.stat-value.zero{color:var(--accent-ink,#7a3212);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Δ = b² − 4ac</span><span class="stat-value" id="val-delta"></span></div>' +
    '<div class="stat"><span class="stat-label">solutions</span><span class="stat-value" id="val-solutions"></span></div>' +
    '</div>' +
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

  class DiscriminantRacinesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  DiscriminantRacinesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._c = DEFAUT.c;
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputC = shadow.getElementById("c");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurC = shadow.getElementById("c-valeur");
    this._valDelta = shadow.getElementById("val-delta");
    this._valSolutions = shadow.getElementById("val-solutions");
    this._resetBtn = shadow.getElementById("reset");
  };

  DiscriminantRacinesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    // a ne peut jamais valoir 0 (sinon ce n'est plus un trinôme du second degré) : un curseur qui
    // franchit 0 est repoussé au pas le plus proche, dans le sens du déplacement.
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
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._c = DEFAUT.c;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputC.value = String(DEFAUT.c);
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputC.addEventListener("input", this._onInputC);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  DiscriminantRacinesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputC.removeEventListener("input", this._onInputC);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  DiscriminantRacinesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  // Trace f sur [xMin, xMax] (sous-intervalle entre deux racines consécutives, ou tout le
  // domaine s'il n'y en a pas), en excluant proprement les portions qui sortent de la fenêtre Y.
  DiscriminantRacinesWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f, classe) {
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

  // Trace la parabole en la coupant EXACTEMENT aux racines (jamais interpolée), colorée par le
  // signe réel du trinôme sur chaque sous-intervalle (évalué en son milieu) — ainsi la couleur
  // reste correcte même dans les cas dégénérés (Δ=0, ou une racine hors fenêtre).
  DiscriminantRacinesWidgetClass.prototype._traceCourbeSignee = function (svg, ns, f, racines) {
    var bornes = [X_MIN].concat(racines.filter(function (r) { return r > X_MIN && r < X_MAX; }).sort(function (a, b) { return a - b; })).concat([X_MAX]);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      if (hi - lo < 1e-6) continue;
      var mid = (lo + hi) / 2;
      var classe = f(mid) >= 0 ? "segment-pos" : "segment-neg";
      this._traceIntervalle(svg, ns, lo, hi, f, classe);
    }
  };

  DiscriminantRacinesWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b, c = this._c;
    var delta = b * b - 4 * a * c;
    var f = function (x) { return a * x * x + b * x + c; };

    this._formule.textContent = "f(x) = " + formatNombreFr(a, 1) + "x² " + (b >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(b), 1) + "x " + (c >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(c), 1);
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurC.textContent = formatNombreFr(c, 1);

    var racines = [];
    var texteSolutions;
    if (delta > 1e-9) {
      var r1 = (-b - Math.sqrt(delta)) / (2 * a);
      var r2 = (-b + Math.sqrt(delta)) / (2 * a);
      racines = [Math.min(r1, r2), Math.max(r1, r2)];
      texteSolutions = "x₁ = " + formatNombreFr(racines[0], 2) + "  x₂ = " + formatNombreFr(racines[1], 2);
      this._valDelta.className = "stat-value pos";
      this._valSolutions.className = "stat-value pos";
    } else if (delta > -1e-9) {
      var r = -b / (2 * a);
      racines = [r];
      texteSolutions = "x = " + formatNombreFr(r, 2) + " (racine double)";
      this._valDelta.className = "stat-value zero";
      this._valSolutions.className = "stat-value zero";
    } else {
      texteSolutions = "aucune solution réelle";
      this._valDelta.className = "stat-value neg";
      this._valSolutions.className = "stat-value neg";
    }
    this._valDelta.textContent = formatNombreFr(delta, 2);
    this._valSolutions.textContent = texteSolutions;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: MARGE, y2: HAUTEUR - MARGE, class: "axe" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 10, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    this._traceCourbeSignee(svg, ns, f, racines);

    racines.forEach(function (r) {
      if (r < X_MIN || r > X_MAX) return;
      var p = self._toPx(r, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 4, class: "racine" }));
      var proche = p[0] > LARGEUR - 60;
      var et = svgEl(ns, "text", { x: (p[0] + (proche ? -8 : 8)).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-racine" });
      et.textContent = formatNombreFr(r, 2);
      svg.appendChild(et);
    });
  };

  if (!customElements.get("discriminant-racines-widget")) {
    customElements.define("discriminant-racines-widget", DiscriminantRacinesWidgetClass);
  }
})();
