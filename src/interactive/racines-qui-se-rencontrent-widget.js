(function () {
  "use strict";

  /* ================================================================
   * <racines-qui-se-rencontrent-widget> — atelier interactif (6e, ch. 5,
   * §3 « Équations dans ℂ ») : z² + bz + c = 0 à coefficients RÉELS,
   * curseurs b et c. Les deux racines sont placées dans le plan d'Argand :
   * tant que Δ > 0 elles glissent sur l'axe réel, elles se rejoignent en
   * une racine double quand Δ = 0, puis repartent en PAIRE CONJUGUÉE,
   * symétriques par rapport à l'axe réel, dès que Δ < 0. Une case active
   * la trace du chemin parcouru. Réglage par défaut (b = 2, c = 5) :
   * l'exemple résolu de la section, z² + 2z + 5 = 0, racines −1 ± 2i.
   * Fenêtre FIXE (jamais recalculée depuis b ou c), repère orthonormé.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { b: 2, c: 5 };
  var BORNES_B = { min: -6, max: 6, step: 0.1 };
  var BORNES_C = { min: -4, max: 10, step: 0.1 };

  // Repère orthonormé : 22 px par unité dans les deux directions.
  var X_MIN = -7, X_MAX = 7, Y_MIN = -5, Y_MAX = 5;
  var MARGE = 26, ECHELLE = 22;
  var LARGEUR = 2 * MARGE + (X_MAX - X_MIN) * ECHELLE;
  var HAUTEUR = 2 * MARGE + (Y_MAX - Y_MIN) * ECHELLE;
  var TRACE_MAX = 600;
  var EPS = 1e-9;

  function nombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0) || Math.abs(arrondi) < EPS) arrondi = 0;
    var s = arrondi.toFixed(decimales);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s.replace(".", ",").replace("-", "−");
  }

  /** a + bi lisible : « −1 + 2i », « 3 », « −2,5i », « i ». */
  function complexeFr(re, im) {
    var reS = nombreFr(re, 2), imAbs = nombreFr(Math.abs(im), 2);
    if (imAbs === "0") return reS;
    var imTexte = (imAbs === "1" ? "" : imAbs) + "i";
    if (reS === "0") return (im < 0 ? "−" : "") + imTexte;
    return reS + (im < 0 ? " − " : " + ") + imTexte;
  }

  /** « z² + 2z + 5 = 0 », sans « + 0z », « 1z » ni « + −3 ». */
  function equationFr(b, c) {
    var s = "z²";
    var bS = nombreFr(Math.abs(b), 1);
    if (bS !== "0") s += (b < 0 ? " − " : " + ") + (bS === "1" ? "" : bS) + "z";
    var cS = nombreFr(Math.abs(c), 1);
    if (cS !== "0") s += (c < 0 ? " − " : " + ") + cS;
    return s + " = 0";
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function toPx(x, y) {
    return [MARGE + (x - X_MIN) * ECHELLE, HAUTEUR - MARGE - (y - Y_MIN) * ECHELLE];
  }

  function dansCadre(x, y) {
    return x >= X_MIN && x <= X_MAX && y >= Y_MIN && y <= Y_MAX;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.equation{text-align:center;font-family:var(--serif,serif);font-style:italic;font-weight:700;font-size:1.05rem;color:var(--accent-ink,#7a3212);margin:0 0 10px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:' + LARGEUR + 'px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:0.7;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.3;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{font-size:9px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.nom-axe{font-size:10px;font-weight:700;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.symetrie{stroke:var(--plan,#5b4ea3);stroke-width:1.2;stroke-dasharray:4 3;}' +
    '.trace-1{fill:var(--accent,#a8471f);opacity:0.35;}' +
    '.trace-2{fill:var(--good,#2f7a4f);opacity:0.35;}' +
    '.racine-1{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.racine-2{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.racine-double{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.etiquette-1{fill:var(--accent-ink,#7a3212);}' +
    '.etiquette-2{fill:var(--good,#2f7a4f);}' +
    '.etiquette-double{fill:var(--plan-ink,#443a80);}' +
    '.hors-cadre{font-size:10px;fill:var(--bad,#b23a3a);font-family:var(--sans,sans-serif);}' +
    '.lecture{text-align:center;font-size:0.88rem;font-weight:600;margin:0 0 8px;padding:10px 14px;border-radius:var(--radius,3px);color:var(--ink,#2b2620);background:var(--surface-2,#faf6f0);line-height:1.7;font-variant-numeric:tabular-nums;}' +
    '.verdict{text-align:center;font-size:0.88rem;font-weight:700;margin:0 0 16px;padding:8px 12px;border-radius:var(--radius,3px);}' +
    '.verdict.positif{color:var(--accent-ink,#7a3212);background:var(--accent-soft,#f6e2d3);}' +
    '.verdict.nul{color:var(--plan-ink,#443a80);background:var(--plan-soft,#ece9f8);}' +
    '.verdict.negatif{color:var(--good,#2f7a4f);background:var(--good-soft,#e3f1e8);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:48px;text-align:right;font-size:0.92rem;}' +
    '.options{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:10px 16px;}' +
    '.options label{display:flex;align-items:center;gap:6px;font-size:0.9rem;color:var(--ink,#2b2620);cursor:pointer;}' +
    '.options input{accent-color:var(--accent,#a8471f);}' +
    'button{padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    'button:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="equation" id="equation"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Racines de l\'équation dans le plan d\'Argand"></svg></div>' +
    '<p class="lecture" id="lecture"></p>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="b">b (coefficient de z)</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="c">c (terme constant)</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.c + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
    '<div class="options">' +
    '<label><input type="checkbox" id="trace"> Laisser une trace</label>' +
    '<button type="button" id="effacer">Effacer la trace</button>' +
    '<button type="button" id="reset">Réinitialiser</button>' +
    '</div>' +
    '</div>';

  class RacinesQuiSeRencontrentWidget extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._b = DEFAUT.b;
      this._c = DEFAUT.c;
      this._trace = [];
      this._svg = shadow.getElementById("svg");
      this._equation = shadow.getElementById("equation");
      this._lecture = shadow.getElementById("lecture");
      this._verdict = shadow.getElementById("verdict");
      this._inputB = shadow.getElementById("b");
      this._inputC = shadow.getElementById("c");
      this._valeurB = shadow.getElementById("b-valeur");
      this._valeurC = shadow.getElementById("c-valeur");
      this._caseTrace = shadow.getElementById("trace");
      this._btnEffacer = shadow.getElementById("effacer");
      this._btnReset = shadow.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onB = function () { self._b = parseFloat(self._inputB.value); self._rendre(true); };
      this._onC = function () { self._c = parseFloat(self._inputC.value); self._rendre(true); };
      this._onTrace = function () { if (!self._caseTrace.checked) self._trace = []; self._rendre(true); };
      this._onEffacer = function () { self._trace = []; self._rendre(false); };
      this._onReset = function () {
        self._b = DEFAUT.b; self._c = DEFAUT.c; self._trace = [];
        self._inputB.value = String(DEFAUT.b); self._inputC.value = String(DEFAUT.c);
        self._rendre(false);
      };
      this._inputB.addEventListener("input", this._onB);
      this._inputC.addEventListener("input", this._onC);
      this._caseTrace.addEventListener("change", this._onTrace);
      this._btnEffacer.addEventListener("click", this._onEffacer);
      this._btnReset.addEventListener("click", this._onReset);
      this._rendre(false);
    }

    disconnectedCallback() {
      this._inputB.removeEventListener("input", this._onB);
      this._inputC.removeEventListener("input", this._onC);
      this._caseTrace.removeEventListener("change", this._onTrace);
      this._btnEffacer.removeEventListener("click", this._onEffacer);
      this._btnReset.removeEventListener("click", this._onReset);
    }

    /** Racines exactes de z² + bz + c (Δ arrondi à 1e-9 près : Δ = 0 se détecte malgré le flottant). */
    _racines() {
      var b = this._b, c = this._c;
      var delta = b * b - 4 * c;
      if (Math.abs(delta) < EPS) delta = 0;
      if (delta > 0) {
        var s = Math.sqrt(delta);
        return { delta: delta, z1: { re: (-b - s) / 2, im: 0 }, z2: { re: (-b + s) / 2, im: 0 } };
      }
      if (delta === 0) return { delta: 0, z1: { re: -b / 2, im: 0 }, z2: { re: -b / 2, im: 0 } };
      var t = Math.sqrt(-delta) / 2;
      return { delta: delta, z1: { re: -b / 2, im: t }, z2: { re: -b / 2, im: -t } };
    }

    _rendre(enregistrerTrace) {
      var b = this._b, c = this._c;
      this._valeurB.textContent = nombreFr(b, 1);
      this._valeurC.textContent = nombreFr(c, 1);
      this._equation.textContent = equationFr(b, c);

      var r = this._racines();
      if (enregistrerTrace && this._caseTrace.checked) {
        this._trace.push({ z1: r.z1, z2: r.z2 });
        if (this._trace.length > TRACE_MAX) this._trace.shift();
      }

      var svg = this._svg;
      svg.innerHTML = "";
      var defs = svgEl("defs", {});
      var marqueur = svgEl("marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      marqueur.appendChild(svgEl("path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(marqueur);
      svg.appendChild(defs);

      var k;
      for (k = X_MIN + 1; k < X_MAX; k++) {
        var gx = toPx(k, 0)[0];
        svg.appendChild(svgEl("line", { x1: gx, x2: gx, y1: MARGE, y2: HAUTEUR - MARGE, class: "grille" }));
      }
      for (k = Y_MIN + 1; k < Y_MAX; k++) {
        var gy = toPx(0, k)[1];
        svg.appendChild(svgEl("line", { x1: MARGE, x2: LARGEUR - MARGE, y1: gy, y2: gy, class: "grille" }));
      }
      var o = toPx(0, 0);
      svg.appendChild(svgEl("line", { x1: MARGE - 6, x2: LARGEUR - MARGE + 8, y1: o[1], y2: o[1], class: "axe", "marker-end": "url(#fleche)" }));
      svg.appendChild(svgEl("line", { x1: o[0], x2: o[0], y1: HAUTEUR - MARGE + 6, y2: MARGE - 8, class: "axe", "marker-end": "url(#fleche)" }));
      var nomRe = svgEl("text", { x: LARGEUR - MARGE + 2, y: o[1] - 8, "text-anchor": "end", class: "nom-axe" });
      nomRe.textContent = "Re";
      svg.appendChild(nomRe);
      var nomIm = svgEl("text", { x: o[0] + 8, y: MARGE - 2, class: "nom-axe" });
      nomIm.textContent = "Im";
      svg.appendChild(nomIm);
      [-6, -4, -2, 2, 4, 6].forEach(function (v) {
        var p = toPx(v, 0);
        var t = svgEl("text", { x: p[0], y: p[1] + 13, "text-anchor": "middle", class: "graduation" });
        t.textContent = nombreFr(v, 0);
        svg.appendChild(t);
      });
      [-4, -2, 2, 4].forEach(function (v) {
        var p = toPx(0, v);
        var t = svgEl("text", { x: p[0] - 5, y: p[1] + 3, "text-anchor": "end", class: "graduation" });
        t.textContent = nombreFr(v, 0) + "i";
        svg.appendChild(t);
      });

      // Trace (petits points, couleurs des deux racines).
      this._trace.forEach(function (e) {
        [[e.z1, "trace-1"], [e.z2, "trace-2"]].forEach(function (paire) {
          var z = paire[0];
          if (!dansCadre(z.re, z.im)) return;
          var p = toPx(z.re, z.im);
          svg.appendChild(svgEl("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: 1.8, class: paire[1] }));
        });
      });

      // Segment de symétrie (paire conjuguée).
      if (r.delta < 0) {
        var pa = toPx(r.z1.re, Math.min(r.z1.im, Y_MAX));
        var pb = toPx(r.z2.re, Math.max(r.z2.im, Y_MIN));
        svg.appendChild(svgEl("line", { x1: pa[0], x2: pb[0], y1: pa[1], y2: pb[1], class: "symetrie" }));
      }

      var horsCadre = 0;
      function point(z, classe, classeEt, texte, placement) {
        if (!dansCadre(z.re, z.im)) { horsCadre++; return; }
        var p = toPx(z.re, z.im);
        svg.appendChild(svgEl("circle", { cx: p[0].toFixed(2), cy: p[1].toFixed(2), r: 6, class: classe }));
        var droite = p[0] > LARGEUR - 70;
        var dy = placement === "dessous" ? 18 : -10;
        var et = svgEl("text", { x: (p[0] + (droite ? -9 : 9)).toFixed(2), y: (p[1] + dy).toFixed(2), "text-anchor": droite ? "end" : "start", class: "etiquette " + classeEt });
        et.textContent = texte;
        svg.appendChild(et);
      }
      if (r.delta === 0) {
        point(r.z1, "racine-double", "etiquette-double", "z₁ = z₂", "dessus");
      } else if (r.delta > 0) {
        point(r.z1, "racine-1", "etiquette-1", "z₁", "dessus");
        point(r.z2, "racine-2", "etiquette-2", "z₂", "dessous");
      } else {
        point(r.z1, "racine-1", "etiquette-1", "z₁", "dessus");
        point(r.z2, "racine-2", "etiquette-2", "z₂ = z̄₁", "dessous");
      }
      if (horsCadre > 0) {
        var hc = svgEl("text", { x: MARGE + 4, y: HAUTEUR - MARGE - 6, class: "hors-cadre" });
        hc.textContent = horsCadre === 1 ? "une racine sort du cadre" : "les racines sortent du cadre";
        svg.appendChild(hc);
      }

      var deltaTexte = "Δ = b² − 4c = " + nombreFr(r.delta, 2);
      var racinesTexte = r.delta === 0
        ? "racine double : z₁ = z₂ = " + complexeFr(r.z1.re, r.z1.im)
        : "z₁ = " + complexeFr(r.z1.re, r.z1.im) + "   ;   z₂ = " + complexeFr(r.z2.re, r.z2.im);
      this._lecture.textContent = deltaTexte + "   —   " + racinesTexte;

      if (r.delta > 0) {
        this._verdict.className = "verdict positif";
        this._verdict.textContent = "Δ > 0 : deux racines réelles distinctes, sur l'axe réel.";
      } else if (r.delta === 0) {
        this._verdict.className = "verdict nul";
        this._verdict.textContent = "Δ = 0 : les deux racines se rencontrent sur l'axe réel (racine double).";
      } else {
        this._verdict.className = "verdict negatif";
        this._verdict.textContent = "Δ < 0 : deux racines complexes conjuguées, symétriques par rapport à l'axe réel (même partie réelle −b/2).";
      }
    }
  }

  if (!customElements.get("racines-qui-se-rencontrent-widget")) {
    customElements.define("racines-qui-se-rencontrent-widget", RacinesQuiSeRencontrentWidget);
  }
})();
