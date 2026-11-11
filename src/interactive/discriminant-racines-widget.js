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

  // Nombre court : au plus 2 décimales, zéros inutiles retirés, virgule, « − » typographique.
  function nombreCourt(n) {
    var arrondi = Math.round(n * 100) / 100;
    if (Math.abs(arrondi) < 1e-12) arrondi = 0;
    var t = String(arrondi);
    if (t.indexOf("e") >= 0) t = arrondi.toFixed(2);
    return t.replace(".", ",").replace("-", "−");
  }

  // Valeur exacte si possible (fraction à petit dénominateur, ou décimal court), sinon ≈ arrondi
  // au centième. Renvoie { texte, exact }.
  function valeurExacte(v) {
    for (var d = 1; d <= 12; d++) {
      var num = Math.round(v * d);
      if (Math.abs(num / d - v) < 1e-7) {
        var g = pgcd(Math.abs(num), d);
        var p = num / g, q = d / g;
        if (q === 1) return { texte: nombreCourt(p), exact: true };
        var dec = p / q;
        if (Math.abs(Math.round(dec * 100) / 100 - dec) < 1e-9) return { texte: nombreCourt(dec), exact: true };
        return { texte: (p < 0 ? "−" : "") + Math.abs(p) + "/" + q, exact: true };
      }
    }
    return { texte: nombreCourt(v), exact: false };
  }

  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  // « x² − x − 6 » : coefficients ±1 simplifiés, termes nuls retirés.
  function trinomeTexte(a, b, c) {
    var t = (Math.abs(a - 1) < 1e-9 ? "" : Math.abs(a + 1) < 1e-9 ? "−" : nombreCourt(a)) + "x²";
    if (Math.abs(b) > 1e-9) t += (b > 0 ? " + " : " − ") + (Math.abs(Math.abs(b) - 1) < 1e-9 ? "" : nombreCourt(Math.abs(b))) + "x";
    if (Math.abs(c) > 1e-9) t += (c > 0 ? " + " : " − ") + nombreCourt(Math.abs(c));
    return t;
  }

  // Facteur (x − r) écrit proprement : « x » si r = 0, « (x + 2) » si r = −2.
  function facteurTexte(r) {
    if (Math.abs(r.valeur) < 1e-9) return "x";
    return "(x " + (r.valeur > 0 ? "− " : "+ ") + r.texte.replace(/^−/, "") + ")";
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
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.6;fill:none;}' +
    '.racine{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-racine{font-size:11.5px;font-weight:600;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.stats{display:flex;align-items:stretch;justify-content:center;gap:6px;margin-top:20px;flex-wrap:wrap;}' +
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
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.stat-large{flex:1 1 100%;}' +
    '.note-sommet{text-align:center;font-size:0.88rem;color:var(--ink-soft,#6b6055);margin:10px 0 0;}' +
    '.sommet-ligne{stroke:var(--plan,#6b4fa3);stroke-width:1.4;stroke-dasharray:4 3;}' +
    '.sommet-point{fill:var(--plan,#6b4fa3);}' +
    '.etiquette-sommet{font-size:11.5px;font-weight:600;fill:var(--plan,#6b4fa3);font-family:var(--mono,monospace);}' +
    '.btn-reset{margin-top:2px;min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
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
    '</div>' +
    '<div class="stats">' +
    '<div class="stat"><span class="stat-label">Δ = b² − 4ac</span><span class="stat-value" id="val-delta"></span></div>' +
    '<div class="stat"><span class="stat-label">solutions</span><span class="stat-value" id="val-solutions"></span></div>' +
    '<div class="stat"><span class="stat-label">S = x₁ + x₂ = −b/a</span><span class="stat-value" id="val-somme"></span></div>' +
    '<div class="stat"><span class="stat-label">P = x₁ · x₂ = c/a</span><span class="stat-value" id="val-produit"></span></div>' +
    '<div class="stat stat-large"><span class="stat-label">forme factorisée</span><span class="stat-value" id="val-factorisee"></span></div>' +
    '</div>' +
    '<p class="note-sommet" id="note-sommet"></p>';

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
    this._valSomme = shadow.getElementById("val-somme");
    this._valProduit = shadow.getElementById("val-produit");
    this._valFactorisee = shadow.getElementById("val-factorisee");
    this._noteSommet = shadow.getElementById("note-sommet");
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

    this._formule.textContent = "f(x) = " + trinomeTexte(a, b, c);
    this._valeurA.textContent = nombreCourt(a);
    this._valeurB.textContent = nombreCourt(b);
    this._valeurC.textContent = nombreCourt(c);

    var racines = [];
    var texteSolutions;
    var egal = function (v) { return v.exact ? " = " : " ≈ "; };
    var coefA = Math.abs(a - 1) < 1e-9 ? "" : Math.abs(a + 1) < 1e-9 ? "−" : nombreCourt(a);
    if (delta > 1e-9) {
      var r1 = (-b - Math.sqrt(delta)) / (2 * a);
      var r2 = (-b + Math.sqrt(delta)) / (2 * a);
      racines = [Math.min(r1, r2), Math.max(r1, r2)];
      var e1 = valeurExacte(racines[0]), e2 = valeurExacte(racines[1]);
      texteSolutions = "x₁" + egal(e1) + e1.texte + " ; x₂" + egal(e2) + e2.texte;
      var exactes = e1.exact && e2.exact;
      this._valFactorisee.textContent = "f(x) " + (exactes ? "= " : "≈ ") + coefA +
        facteurTexte({ valeur: racines[0], texte: e1.texte }) + facteurTexte({ valeur: racines[1], texte: e2.texte });
      this._valDelta.className = "stat-value pos";
      this._valSolutions.className = "stat-value pos";
    } else if (delta > -1e-9) {
      var r = -b / (2 * a);
      racines = [r];
      var er = valeurExacte(r);
      texteSolutions = "x" + egal(er) + er.texte + " (racine double)";
      var fac = facteurTexte({ valeur: r, texte: er.texte });
      this._valFactorisee.textContent = "f(x) " + (er.exact ? "= " : "≈ ") + coefA + (fac === "x" ? "x²" : fac + "²");
      this._valDelta.className = "stat-value zero";
      this._valSolutions.className = "stat-value zero";
    } else {
      texteSolutions = "aucune solution réelle";
      this._valFactorisee.textContent = "pas de forme factorisée réelle (Δ < 0)";
      this._valDelta.className = "stat-value neg";
      this._valSolutions.className = "stat-value neg";
    }
    this._valDelta.textContent = valeurExacte(delta).exact ? valeurExacte(delta).texte : "≈ " + valeurExacte(delta).texte;
    this._valSolutions.textContent = texteSolutions;

    // Somme et produit (Viète) : la racine double compte deux fois quand Δ = 0.
    if (delta > -1e-9) {
      var sv = valeurExacte(-b / a), pv = valeurExacte(c / a);
      this._valSomme.textContent = (sv.exact ? "" : "≈ ") + sv.texte;
      this._valProduit.textContent = (pv.exact ? "" : "≈ ") + pv.texte;
      var xs = valeurExacte(-b / (2 * a));
      this._noteSommet.textContent = delta > 1e-9
        ? "Le sommet est à mi-chemin des racines : xₛ = S/2" + (xs.exact ? " = " : " ≈ ") + xs.texte + "."
        : "Racine double : le sommet est sur l'axe, en xₛ = S/2" + (xs.exact ? " = " : " ≈ ") + xs.texte + ".";
    } else {
      this._valSomme.textContent = "— (pas de racines réelles)";
      this._valProduit.textContent = "— (pas de racines réelles)";
      var xs2 = valeurExacte(-b / (2 * a));
      this._noteSommet.textContent = "Pas de racines : le sommet (xₛ" + (xs2.exact ? " = " : " ≈ ") + xs2.texte + ") reste du même côté de l'axe que la parabole.";
    }
    this._valSomme.className = "stat-value";
    this._valProduit.className = "stat-value";
    this._valFactorisee.className = "stat-value";

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
    var etiqY = svgEl(ns, "text", { x: origine[0] + 6, y: MARGE - 10, class: "etiquette" });
    etiqY.textContent = "y";
    svg.appendChild(etiqY);

    this._traceCourbeSignee(svg, ns, f, racines);

    // Abscisse du sommet xₛ = −b/(2a) = S/2 : pointillés de l'axe au sommet (coupés à la fenêtre).
    var xS = -b / (2 * a), yS = f(xS);
    if (xS > X_MIN && xS < X_MAX) {
      var pAxe = self._toPx(xS, 0);
      var pSom = self._toPx(xS, Math.max(Y_MIN, Math.min(Y_MAX, yS)));
      svg.appendChild(svgEl(ns, "line", { x1: pAxe[0].toFixed(2), x2: pSom[0].toFixed(2), y1: pAxe[1].toFixed(2), y2: pSom[1].toFixed(2), class: "sommet-ligne" }));
      if (yS >= Y_MIN && yS <= Y_MAX) svg.appendChild(svgEl(ns, "circle", { cx: pSom[0].toFixed(2), cy: pSom[1].toFixed(2), r: 3.5, class: "sommet-point" }));
      var lab = svgEl(ns, "text", { x: (pAxe[0]).toFixed(2), y: (yS >= 0 ? pAxe[1] + 30 : pAxe[1] - 10).toFixed(2), "text-anchor": "middle", class: "etiquette-sommet" });
      lab.textContent = "xₛ";
      svg.appendChild(lab);
    }

    racines.forEach(function (r) {
      if (r < X_MIN || r > X_MAX) return;
      var p = self._toPx(r, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 4, class: "racine" }));
      var proche = p[0] > LARGEUR - 60;
      var et = svgEl(ns, "text", { x: (p[0] + (proche ? -8 : 8)).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-racine" });
      et.textContent = nombreCourt(r);
      svg.appendChild(et);
    });
  };

  if (!customElements.get("discriminant-racines-widget")) {
    customElements.define("discriminant-racines-widget", DiscriminantRacinesWidgetClass);
  }
})();
