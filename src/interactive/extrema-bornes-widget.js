(function () {
  "use strict";

  /* ================================================================
   * <extrema-bornes-widget> — atelier interactif : extremums ABSOLUS sur
   * un intervalle fermé [a ; b]. Trois fonctions au choix (la cubique de
   * l'exemple résolu par défaut), deux curseurs (bornes a et b), et la
   * liste des candidats en direct : valeurs aux extremums locaux
   * INTÉRIEURS à ]a ; b[ ET aux deux bornes, maximum et minimum absolus
   * surlignés, égalités signalées. Réglages par défaut (cubique, a = 0,
   * b = 5) = l'exemple résolu : maximum absolu 22, atteint à la borne
   * t = 5. Le basculement du maximum (local → borne) a lieu en b = 4,
   * où f(4) = 6 = f(1). Web Component (Shadow DOM).
   * ================================================================ */

  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;
  var ECART_MIN = 0.5;
  var EPS_EGALITE = 0.02;

  var FONCTIONS = {
    cubique: {
      libelle: "t³ − 6t² + 9t + 2",
      f: function (t) { return t * t * t - 6 * t * t + 9 * t + 2; },
      fpp: function (t) { return 6 * t - 12; },
      critiques: [{ t: 1, nom: "1" }, { t: 3, nom: "3" }],
      a: { min: -1, max: 2, defaut: 0 },
      b: { min: 2, max: 6, defaut: 5 },
      fenetre: { xMin: -1.4, xMax: 6.4, yMin: -16, yMax: 58 },
    },
    cubiqueInverse: {
      libelle: "−t³ + 3t² + 1",
      f: function (t) { return -t * t * t + 3 * t * t + 1; },
      fpp: function (t) { return -6 * t + 6; },
      critiques: [{ t: 0, nom: "0" }, { t: 2, nom: "2" }],
      a: { min: -2, max: 1, defaut: -1 },
      b: { min: 1, max: 4, defaut: 3 },
      fenetre: { xMin: -2.4, xMax: 4.4, yMin: -16, yMax: 22 },
    },
    quartique: {
      libelle: "t⁴ − 4t² + 1",
      f: function (t) { return t * t * t * t - 4 * t * t + 1; },
      fpp: function (t) { return 12 * t * t - 8; },
      critiques: [{ t: -Math.SQRT2, nom: "−√2" }, { t: 0, nom: "0" }, { t: Math.SQRT2, nom: "√2" }],
      a: { min: -2.5, max: 0, defaut: -1 },
      b: { min: 0, max: 2.5, defaut: 2 },
      fenetre: { xMin: -2.8, xMax: 2.8, yMin: -4.5, yMax: 16 },
    },
  };
  var ORDRE = ["cubique", "cubiqueInverse", "quartique"];
  var DEFAUT_FONCTION = "cubique";
  var PAS = 0.05;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    var s = arrondi.toFixed(decimales);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  // Valeur exacte si entière (à 1e-9 près), sinon « ≈ » arrondi au centième.
  function formatValeur(v) {
    if (Math.abs(v - Math.round(v)) < 1e-9) return "= " + formatNombreFr(Math.round(v), 0);
    return "≈ " + formatNombreFr(v, 2);
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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.05rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);display:block;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.hors-domaine{stroke:var(--ink-faint,#9c9083);stroke-width:1.8;fill:none;opacity:0.5;}' +
    '.courbe{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.borne{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.point{fill:var(--surface,#fff);stroke:var(--ink-soft,#6b6055);stroke-width:1.6;}' +
    '.point-max{fill:var(--good,#2f7a4f);stroke:none;}' +
    '.point-min{fill:var(--bad,#b23a3a);stroke:none;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);fill:var(--ink-soft,#6b6055);}' +
    '.etiquette-max{fill:var(--good,#2f7a4f);}' +
    '.etiquette-min{fill:var(--bad,#b23a3a);}' +
    '.borne-nom{font-size:11px;font-style:italic;font-family:var(--serif,serif);fill:var(--ink-soft,#6b6055);}' +
    '.candidats{width:100%;max-width:420px;margin:0 auto 10px;border-collapse:collapse;font-size:0.86rem;font-variant-numeric:tabular-nums;}' +
    '.candidats th,.candidats td{padding:5px 6px;border-bottom:1px solid var(--line,#e2d8cc);text-align:left;}' +
    '.candidats th{font-size:0.76rem;color:var(--ink-soft,#6b6055);font-weight:600;}' +
    '.candidats td.val{text-align:right;white-space:nowrap;}' +
    '.candidats tr.est-max td{color:var(--good,#2f7a4f);font-weight:700;}' +
    '.candidats tr.est-min td{color:var(--bad,#b23a3a);font-weight:700;}' +
    '.verdict{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 14px;padding:10px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);color:var(--ink,#241f1a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.choix{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;}' +
    '.choix button{min-height:44px;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8cc);background:var(--surface,#fff);color:var(--ink,#241f1a);font-family:var(--serif,serif);font-style:italic;font-size:0.9rem;cursor:pointer;}' +
    '.choix button[aria-pressed="true"]{background:var(--accent-soft,#f6e2d3);border-color:var(--accent,#a8471f);color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;min-height:44px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:52px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Courbe de f sur l\'intervalle [a ; b]"></svg></div>' +
    '<table class="candidats"><thead><tr><th>candidat</th><th>t</th><th style="text-align:right">f(t)</th></tr></thead><tbody id="liste"></tbody></table>' +
    '<p class="verdict" id="verdict" aria-live="polite"></p>' +
    '<div class="controles">' +
    '<div class="choix" id="choix" role="group" aria-label="Fonction étudiée"></div>' +
    '<div class="curseur"><label for="a">a (borne gauche)</label><div class="curseur-row">' +
    '<input type="range" id="a" step="' + PAS + '"><span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b (borne droite)</label><div class="curseur-row">' +
    '<input type="range" id="b" step="' + PAS + '"><span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class ExtremaBornesWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  ExtremaBornesWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._liste = shadow.getElementById("liste");
    this._verdict = shadow.getElementById("verdict");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._choix = shadow.getElementById("choix");
    this._boutons = {};
    var self = this;
    ORDRE.forEach(function (cle) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = FONCTIONS[cle].libelle;
      btn.dataset.cle = cle;
      self._choix.appendChild(btn);
      self._boutons[cle] = btn;
    });
  };

  ExtremaBornesWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      var a = parseFloat(self._inputA.value);
      if (a > self._b - ECART_MIN) { a = self._b - ECART_MIN; self._inputA.value = String(a); }
      self._a = a; self._rendre();
    };
    this._onInputB = function () {
      var b = parseFloat(self._inputB.value);
      if (b < self._a + ECART_MIN) { b = self._a + ECART_MIN; self._inputB.value = String(b); }
      self._b = b; self._rendre();
    };
    this._onChoix = function (e) {
      var btn = e.target.closest("button");
      if (!btn || !btn.dataset.cle) return;
      self._choisir(btn.dataset.cle);
    };
    this._onReset = function () { self._choisir(DEFAUT_FONCTION); };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._choix.addEventListener("click", this._onChoix);
    this._resetBtn.addEventListener("click", this._onReset);
    this._choisir(DEFAUT_FONCTION);
  };

  ExtremaBornesWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._choix.removeEventListener("click", this._onChoix);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  ExtremaBornesWidgetClass.prototype._choisir = function (cle) {
    var F = FONCTIONS[cle];
    this._cle = cle;
    this._a = F.a.defaut;
    this._b = F.b.defaut;
    this._inputA.min = String(F.a.min); this._inputA.max = String(F.a.max); this._inputA.value = String(this._a);
    this._inputB.min = String(F.b.min); this._inputB.max = String(F.b.max); this._inputB.value = String(this._b);
    for (var k in this._boutons) this._boutons[k].setAttribute("aria-pressed", k === cle ? "true" : "false");
    this._formule.textContent = "f(t) = " + F.libelle + ", sur [a ; b]";
    this._rendre();
  };

  ExtremaBornesWidgetClass.prototype._toPx = function (xMath, yMath) {
    var w = FONCTIONS[this._cle].fenetre;
    var px = MARGE + (xMath - w.xMin) / (w.xMax - w.xMin) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - w.yMin) / (w.yMax - w.yMin) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  ExtremaBornesWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, classe) {
    var F = FONCTIONS[this._cle];
    if (xMax - xMin < 1e-6) return;
    var w = F.fenetre;
    var n = Math.max(4, Math.round(240 * (xMax - xMin) / (w.xMax - w.xMin)));
    var d = "", ouvert = false;
    for (var i = 0; i <= n; i++) {
      var xx = xMin + (i / n) * (xMax - xMin);
      var yy = F.f(xx);
      if (yy > w.yMax + 2 || yy < w.yMin - 2) { ouvert = false; continue; }
      var p = this._toPx(xx, Math.max(w.yMin, Math.min(w.yMax, yy)));
      d += (ouvert ? "L" : "M") + p[0].toFixed(2) + " " + p[1].toFixed(2) + " ";
      ouvert = true;
    }
    if (d) svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: classe }));
  };

  // Liste des candidats : bornes a et b, extremums locaux strictement intérieurs à ]a ; b[.
  ExtremaBornesWidgetClass.prototype._candidats = function () {
    var F = FONCTIONS[this._cle], a = this._a, b = this._b;
    var liste = [{ t: a, tNom: formatNombreFr(a, 2), v: F.f(a), type: "borne a" }];
    F.critiques.forEach(function (c) {
      if (c.t > a + 1e-9 && c.t < b - 1e-9) {
        var nature = F.fpp(c.t) < 0 ? "max local" : "min local";
        liste.push({ t: c.t, tNom: c.nom, v: F.f(c.t), type: nature });
      }
    });
    liste.push({ t: b, tNom: formatNombreFr(b, 2), v: F.f(b), type: "borne b" });
    return liste;
  };

  ExtremaBornesWidgetClass.prototype._rendre = function () {
    var F = FONCTIONS[this._cle], w = F.fenetre;
    var a = this._a, b = this._b;
    this._valeurA.textContent = formatNombreFr(a, 2);
    this._valeurB.textContent = formatNombreFr(b, 2);

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche-eb", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE + 8, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche-eb)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE + 6, y2: MARGE - 8, class: "axe", "marker-end": "url(#fleche-eb)" }));
    var nomT = svgEl(ns, "text", { x: LARGEUR - MARGE + 4, y: (origine[1] - 6).toFixed(2), "text-anchor": "end", class: "borne-nom" });
    nomT.textContent = "t";
    svg.appendChild(nomT);

    self._traceIntervalle(svg, ns, w.xMin, a, "hors-domaine");
    self._traceIntervalle(svg, ns, b, w.xMax, "hors-domaine");
    self._traceIntervalle(svg, ns, a, b, "courbe");

    [[a, "a"], [b, "b"]].forEach(function (paire) {
      var haut = self._toPx(paire[0], w.yMax), bas = self._toPx(paire[0], w.yMin);
      svg.appendChild(svgEl(ns, "line", { x1: haut[0].toFixed(2), y1: haut[1].toFixed(2), x2: bas[0].toFixed(2), y2: bas[1].toFixed(2), class: "borne" }));
      var et = svgEl(ns, "text", { x: (haut[0] + (paire[1] === "a" ? -4 : 4)).toFixed(2), y: (HAUTEUR - MARGE + 18).toFixed(2), "text-anchor": paire[1] === "a" ? "end" : "start", class: "borne-nom" });
      et.textContent = paire[1];
      svg.appendChild(et);
    });

    var candidats = self._candidats();
    var vMax = Math.max.apply(null, candidats.map(function (c) { return c.v; }));
    var vMin = Math.min.apply(null, candidats.map(function (c) { return c.v; }));
    candidats.forEach(function (c) {
      c.estMax = Math.abs(c.v - vMax) < EPS_EGALITE;
      c.estMin = Math.abs(c.v - vMin) < EPS_EGALITE;
    });

    // Points sur la courbe (étiquettes au-dessus pour un maximum absolu, en dessous sinon).
    candidats.forEach(function (c) {
      var p = self._toPx(c.t, c.v);
      var classe = c.estMax ? "point-max" : c.estMin ? "point-min" : "point";
      svg.appendChild(svgEl(ns, "circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: c.estMax || c.estMin ? 6 : 4.5, class: classe }));
      if (c.estMax || c.estMin) {
        var dessus = c.estMax;
        var y = p[1] + (dessus ? -11 : 19);
        if (y < 12) y = p[1] + 19;
        if (y > HAUTEUR - 4) y = p[1] - 11;
        var x = Math.max(40, Math.min(LARGEUR - 40, p[0]));
        var et = svgEl(ns, "text", { x: x.toFixed(2), y: y.toFixed(2), "text-anchor": "middle", class: "etiquette " + (c.estMax ? "etiquette-max" : "etiquette-min") });
        et.textContent = (c.estMax ? "max abs. " : "min abs. ") + formatNombreFr(c.v, 2);
        svg.appendChild(et);
      }
    });

    // Tableau des candidats.
    var lignes = "";
    candidats.forEach(function (c) {
      var classe = c.estMax ? "est-max" : c.estMin ? "est-min" : "";
      var marque = c.estMax ? " — maximum absolu" : c.estMin ? " — minimum absolu" : "";
      lignes += '<tr class="' + classe + '"><td>' + c.type + marque + "</td><td>" + c.tNom + '</td><td class="val">' + formatValeur(c.v) + "</td></tr>";
    });
    this._liste.innerHTML = lignes;

    // Verdict.
    var nbMax = candidats.filter(function (c) { return c.estMax; });
    var nbMin = candidats.filter(function (c) { return c.estMin; });
    function lieux(liste) {
      return liste.map(function (c) { return "t = " + c.tNom + (c.type.indexOf("borne") === 0 ? " (borne)" : ""); }).join(" et ");
    }
    var phraseMax = "Maximum absolu " + formatValeur(vMax) + ", atteint en " + lieux(nbMax);
    var phraseMin = "minimum absolu " + formatValeur(vMin) + ", atteint en " + lieux(nbMin);
    var egalite = nbMax.length > 1 || nbMin.length > 1 ? " Égalité entre candidats : la valeur est atteinte plusieurs fois." : "";
    this._verdict.textContent = phraseMax + " ; " + phraseMin + "." + egalite;
  };

  if (!customElements.get("extrema-bornes-widget")) {
    customElements.define("extrema-bornes-widget", ExtremaBornesWidgetClass);
  }
})();
