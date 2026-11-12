(function () {
  "use strict";

  /* ================================================================
   * <recette-benefice-widget> — atelier interactif (5e, ch. 5, § 9) :
   * R(x) = x·p(x) avec p(x) = a − x, C(x) = x² + 10x + c.
   * Curseurs : quantité x, prix de départ a, coût fixe c. Panneau du
   * haut : R (vert), C (rouge), l'écart R − C ombré (vert si bénéfice,
   * rouge si perte). Panneau du bas : B(x) = R(x) − C(x) tracé
   * explicitement, optimum x* = (a − 10)/4 et B(x*) marqués.
   * Message clé : changer le coût fixe c NE déplace PAS x* (il décale
   * seulement B vers le bas). Valeurs par défaut (a = 50, c = 20, x = 10)
   * = exemple résolu de la section : R = 400, C = 220, B = 180,
   * Rm = Cm = 30. Fenêtres FIXES couvrant tous les réglages. Figure seule
   * dans son conteneur (épinglage automatique). Web Component.
   * ================================================================ */

  var DEFAUT_X = 10, DEFAUT_A = 50, DEFAUT_C = 20;
  var BORNES_X = { min: 0, max: 20, step: 0.1 };
  var BORNES_A = { min: 30, max: 70, step: 1 };
  var BORNES_C = { min: 0, max: 200, step: 5 };
  var TOLERANCE_MARGINALES = 1;

  /* Fenêtres FIXES couvrant tous les réglages (a ≤ 70, c ≤ 200, x ≤ 20) :
   * R(x) ≤ 20·(70 − 20) = 1000 et C(20) ≤ 800 ; B(x) ∈ [−600 ; 450]. */
  var X_MIN = -1, X_MAX = 21;
  var Y_MIN = -40, Y_MAX = 1060;
  var YB_MIN = -640, YB_MAX = 500;
  var LARGEUR = 420, H_HAUT = 250, ECART = 12, H_BAS = 140;
  var HAUTEUR = H_HAUT + ECART + H_BAS;
  var MARGE_G = 46, MARGE_D = 20, MARGE_H = 16, MARGE_B = 12;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  /* Entier sans décimale, sinon une décimale (« 10 », « 12,5 »). */
  function formatSouple(n) {
    return Math.abs(n - Math.round(n)) < 1e-9 ? formatNombreFr(n, 0) : formatNombreFr(n, n * 10 % 1 === 0 ? 1 : 2);
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
    '.formule{text-align:center;font-size:0.86rem;color:var(--ink-soft,#6b6055);margin:0 0 10px;}' +
    '.formule strong{color:var(--ink,#241f1a);}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:10px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.cadre{fill:none;stroke:var(--line,#d9cfc2);stroke-width:1;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.graduation{stroke:var(--ink-soft,#6b6055);stroke-width:1;}' +
    '.grad-txt{font-size:9.5px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.nom{font-size:12px;font-weight:700;font-family:var(--sans,sans-serif);}' +
    '.courbe-r{stroke:var(--good,#2f7a4f);stroke-width:2.2;fill:none;}' +
    '.courbe-c{stroke:var(--bad,#b23a3a);stroke-width:2.2;fill:none;}' +
    '.courbe-b{stroke:var(--accent,#a8471f);stroke-width:2.4;fill:none;}' +
    '.gain{fill:var(--good,#2f7a4f);opacity:0.16;}' +
    '.perte{fill:var(--bad,#b23a3a);opacity:0.16;}' +
    '.repere-x{stroke:var(--accent,#a8471f);stroke-width:1.3;stroke-dasharray:4 3;}' +
    '.repere-opt{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:2 3;}' +
    '.ecart{stroke:var(--plan,#5b4ea3);stroke-width:2.4;}' +
    '.point-r{fill:var(--good,#2f7a4f);}' +
    '.point-c{fill:var(--bad,#b23a3a);}' +
    '.point-b{fill:var(--accent,#a8471f);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.point-opt{fill:var(--plan,#5b4ea3);stroke:var(--surface,#fff);stroke-width:1.2;}' +
    '.etiquette{font-size:11px;font-weight:700;font-family:var(--sans,sans-serif);paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3px;}' +
    '.etiquette-r{fill:var(--good,#2f7a4f);}' +
    '.etiquette-c{fill:var(--bad,#b23a3a);}' +
    '.etiquette-opt{fill:var(--plan,#5b4ea3);}' +
    '.lecture{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:10px;font-size:0.82rem;font-variant-numeric:tabular-nums;}' +
    '.chip{padding:5px 9px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-weight:600;}' +
    '.chip-r{color:var(--good,#2f7a4f);}' +
    '.chip-c{color:var(--bad,#b23a3a);}' +
    '.chip-b{color:var(--accent-ink,#7a3212);}' +
    '.verdict{text-align:center;font-size:0.86rem;font-weight:600;margin:0 0 8px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-non{color:var(--accent-ink,#7a3212);background:var(--surface-2,#faf6f0);}' +
    '.optimum{text-align:center;font-size:0.84rem;margin:0 0 8px;color:var(--ink,#241f1a);}' +
    '.optimum strong{color:var(--plan,#5b4ea3);}' +
    '.note-c{text-align:center;font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0 0 8px;}' +
    '.rappel-piege{text-align:center;font-size:0.78rem;color:var(--ink-soft,#6b6055);margin:0 0 16px;font-style:italic;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:4px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Recette, coût et bénéfice"></svg></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<p class="optimum" id="optimum"></p>' +
    '<p class="note-c" id="note-c"></p>' +
    '<p class="rappel-piege" id="piege"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="x">x — quantité produite</label><div class="curseur-row">' +
    '<input type="range" id="x" min="' + BORNES_X.min + '" max="' + BORNES_X.max + '" step="' + BORNES_X.step + '" value="' + DEFAUT_X + '">' +
    '<span class="curseur-valeur" id="x-valeur"></span></div></div>' +
    '<div class="curseur"><label for="a">a — prix de départ (p(x) = a − x)</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT_A + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="c">c — coût fixe (€)</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT_C + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class RecetteBeneficeWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._x = DEFAUT_X;
      this._a = DEFAUT_A;
      this._c = DEFAUT_C;
      this._svg = shadow.getElementById("svg");
      this._formule = shadow.getElementById("formule");
      this._lecture = shadow.getElementById("lecture");
      this._verdict = shadow.getElementById("verdict");
      this._optimum = shadow.getElementById("optimum");
      this._noteC = shadow.getElementById("note-c");
      this._piege = shadow.getElementById("piege");
      this._inputX = shadow.getElementById("x");
      this._inputA = shadow.getElementById("a");
      this._inputC = shadow.getElementById("c");
      this._valeurX = shadow.getElementById("x-valeur");
      this._valeurA = shadow.getElementById("a-valeur");
      this._valeurC = shadow.getElementById("c-valeur");
      this._resetBtn = shadow.getElementById("reset");
    }

    connectedCallback() {
      var self = this;
      this._onInputX = function () { self._x = parseFloat(self._inputX.value); self._rendre(); };
      this._onInputA = function () { self._a = parseFloat(self._inputA.value); self._rendre(); };
      this._onInputC = function () { self._c = parseFloat(self._inputC.value); self._rendre(); };
      this._onReset = function () {
        self._x = DEFAUT_X; self._a = DEFAUT_A; self._c = DEFAUT_C;
        self._inputX.value = String(DEFAUT_X); self._inputA.value = String(DEFAUT_A); self._inputC.value = String(DEFAUT_C);
        self._rendre();
      };
      this._inputX.addEventListener("input", this._onInputX);
      this._inputA.addEventListener("input", this._onInputA);
      this._inputC.addEventListener("input", this._onInputC);
      this._resetBtn.addEventListener("click", this._onReset);
      this._rendre();
    }

    disconnectedCallback() {
      this._inputX.removeEventListener("input", this._onInputX);
      this._inputA.removeEventListener("input", this._onInputA);
      this._inputC.removeEventListener("input", this._onInputC);
      this._resetBtn.removeEventListener("click", this._onReset);
    }

    _R(x) { return x * (this._a - x); }
    _C(x) { return x * x + 10 * x + this._c; }
    _B(x) { return this._R(x) - this._C(x); }

    _px(xMath) { return MARGE_G + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - MARGE_G - MARGE_D); }
    _pyHaut(y) { return H_HAUT - MARGE_B - (y - Y_MIN) / (Y_MAX - Y_MIN) * (H_HAUT - MARGE_H - MARGE_B); }
    _pyBas(y) { var h0 = H_HAUT + ECART; return h0 + H_BAS - MARGE_B - (y - YB_MIN) / (YB_MAX - YB_MIN) * (H_BAS - MARGE_H - MARGE_B); }

    _chemin(f, py) {
      var n = 160, d = "";
      for (var i = 0; i <= n; i++) {
        var xx = (i / n) * 20;
        d += (i === 0 ? "M" : "L") + this._px(xx).toFixed(2) + " " + py.call(this, f.call(this, xx)).toFixed(2) + " ";
      }
      return d.trim();
    }

    /* Écart R − C ombré : vert là où R > C (bénéfice), rouge là où R < C (perte). */
    _ombrage(svg, ns) {
      var n = 160, self = this;
      var morceaux = [], courant = null;
      for (var i = 0; i <= n; i++) {
        var xx = (i / n) * 20, gain = this._B(xx) >= 0;
        if (!courant || courant.gain !== gain) { courant = { gain: gain, pts: [] }; morceaux.push(courant); }
        courant.pts.push(xx);
      }
      morceaux.forEach(function (m) {
        if (m.pts.length < 2) return;
        var d = "";
        m.pts.forEach(function (xx, k) { d += (k === 0 ? "M" : "L") + self._px(xx).toFixed(2) + " " + self._pyHaut(self._R(xx)).toFixed(2) + " "; });
        for (var k = m.pts.length - 1; k >= 0; k--) { var xx2 = m.pts[k]; d += "L" + self._px(xx2).toFixed(2) + " " + self._pyHaut(self._C(xx2)).toFixed(2) + " "; }
        svg.appendChild(svgEl(ns, "path", { d: d + "Z", class: m.gain ? "gain" : "perte" }));
      });
    }

    _axes(svg, ns, py, yHautPx, yBasPx, pasY, yMin, yMax) {
      var y0 = py.call(this, 0);
      svg.appendChild(svgEl(ns, "line", { x1: MARGE_G - 4, x2: LARGEUR - MARGE_D + 2, y1: y0.toFixed(2), y2: y0.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
      var x0 = this._px(0);
      svg.appendChild(svgEl(ns, "line", { x1: x0.toFixed(2), x2: x0.toFixed(2), y1: yBasPx, y2: yHautPx, class: "axe", "marker-end": "url(#fleche)" }));
      for (var v = Math.ceil(yMin / pasY) * pasY; v <= yMax; v += pasY) {
        if (v === 0) continue;
        var yy = py.call(this, v);
        svg.appendChild(svgEl(ns, "line", { x1: (x0 - 3).toFixed(2), x2: (x0 + 3).toFixed(2), y1: yy.toFixed(2), y2: yy.toFixed(2), class: "graduation" }));
        var t = svgEl(ns, "text", { x: (x0 - 6).toFixed(2), y: (yy + 3).toFixed(2), "text-anchor": "end", class: "grad-txt" });
        t.textContent = formatNombreFr(v, 0);
        svg.appendChild(t);
      }
      for (var k = 5; k <= 20; k += 5) {
        var xk = this._px(k);
        svg.appendChild(svgEl(ns, "line", { x1: xk.toFixed(2), x2: xk.toFixed(2), y1: (y0 - 3).toFixed(2), y2: (y0 + 3).toFixed(2), class: "graduation" }));
        var tk = svgEl(ns, "text", { x: xk.toFixed(2), y: (y0 + 12).toFixed(2), "text-anchor": "middle", class: "grad-txt" });
        tk.textContent = String(k);
        svg.appendChild(tk);
      }
    }

    _rendre() {
      var x = this._x, a = this._a, c = this._c;
      this._valeurX.textContent = formatNombreFr(x, 1);
      this._valeurA.textContent = formatNombreFr(a, 0);
      this._valeurC.textContent = formatNombreFr(c, 0);
      this._formule.innerHTML = "<strong>R</strong>(x) = x·(" + formatNombreFr(a, 0) + " − x) (vert) &nbsp;·&nbsp; <strong>C</strong>(x) = x² + 10x + " + formatNombreFr(c, 0) + " (rouge)";

      var rx = this._R(x), cx = this._C(x), bx = rx - cx, rpx = a - 2 * x, cpx = 2 * x + 10;
      var xs = (a - 10) / 4, bs = this._B(xs);

      var ns = "http://www.w3.org/2000/svg";
      var svg = this._svg;
      svg.innerHTML = "";

      var defs = svgEl(ns, "defs", {});
      var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
      fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
      defs.appendChild(fleche);
      svg.appendChild(defs);

      /* ---------- Panneau du haut : R, C, écart ombré ---------- */
      svg.appendChild(svgEl(ns, "rect", { x: 2, y: 2, width: LARGEUR - 4, height: H_HAUT - 4, rx: 3, class: "cadre" }));
      this._ombrage(svg, ns);
      this._axes(svg, ns, this._pyHaut, MARGE_H - 4, H_HAUT - 4, 200, Y_MIN, Y_MAX);
      svg.appendChild(svgEl(ns, "path", { d: this._chemin(this._R, this._pyHaut), class: "courbe-r" }));
      svg.appendChild(svgEl(ns, "path", { d: this._chemin(this._C, this._pyHaut), class: "courbe-c" }));
      var nomH = svgEl(ns, "text", { x: LARGEUR - MARGE_D - 2, y: MARGE_H + 6, "text-anchor": "end", class: "nom" });
      nomH.innerHTML = '<tspan class="etiquette-r">R</tspan><tspan class="grad-txt"> et </tspan><tspan class="etiquette-c">C</tspan><tspan class="grad-txt"> (€)</tspan>';
      svg.appendChild(nomH);

      var xpx = this._px(x);
      svg.appendChild(svgEl(ns, "line", { x1: xpx.toFixed(2), x2: xpx.toFixed(2), y1: MARGE_H - 4, y2: HAUTEUR - 4, class: "repere-x" }));
      var pR = this._pyHaut(rx), pC = this._pyHaut(cx);
      svg.appendChild(svgEl(ns, "line", { x1: xpx.toFixed(2), y1: pR.toFixed(2), x2: xpx.toFixed(2), y2: pC.toFixed(2), class: "ecart" }));
      svg.appendChild(svgEl(ns, "circle", { cx: xpx.toFixed(2), cy: pR.toFixed(2), r: 4.5, class: "point-r" }));
      svg.appendChild(svgEl(ns, "circle", { cx: xpx.toFixed(2), cy: pC.toFixed(2), r: 4.5, class: "point-c" }));
      var etR = svgEl(ns, "text", { x: xpx.toFixed(2), y: (Math.min(pR, pC) - 9).toFixed(2), "text-anchor": "middle", class: "etiquette " + (rx >= cx ? "etiquette-r" : "etiquette-c") });
      etR.textContent = rx >= cx ? "R = " + formatNombreFr(rx, 0) + " €" : "C = " + formatNombreFr(cx, 0) + " €";
      svg.appendChild(etR);
      var etC = svgEl(ns, "text", { x: xpx.toFixed(2), y: (Math.max(pR, pC) + 17).toFixed(2), "text-anchor": "middle", class: "etiquette " + (rx >= cx ? "etiquette-c" : "etiquette-r") });
      etC.textContent = rx >= cx ? "C = " + formatNombreFr(cx, 0) + " €" : "R = " + formatNombreFr(rx, 0) + " €";
      svg.appendChild(etC);

      /* ---------- Panneau du bas : B(x) ---------- */
      var h0 = H_HAUT + ECART;
      svg.appendChild(svgEl(ns, "rect", { x: 2, y: h0 + 2, width: LARGEUR - 4, height: H_BAS - 4, rx: 3, class: "cadre" }));
      this._axes(svg, ns, this._pyBas, h0 + MARGE_H - 4, h0 + H_BAS - 4, 300, YB_MIN, YB_MAX);
      svg.appendChild(svgEl(ns, "path", { d: this._chemin(this._B, this._pyBas), class: "courbe-b" }));
      var nomB = svgEl(ns, "text", { x: LARGEUR - MARGE_D - 2, y: h0 + MARGE_H + 6, "text-anchor": "end", class: "nom" });
      nomB.innerHTML = '<tspan style="fill:var(--accent,#a8471f)">B = R − C</tspan><tspan class="grad-txt"> (€)</tspan>';
      svg.appendChild(nomB);
      var xsPx = this._px(xs), bsPx = this._pyBas(bs);
      svg.appendChild(svgEl(ns, "line", { x1: xsPx.toFixed(2), x2: xsPx.toFixed(2), y1: this._pyBas(0).toFixed(2), y2: bsPx.toFixed(2), class: "repere-opt" }));
      svg.appendChild(svgEl(ns, "circle", { cx: xsPx.toFixed(2), cy: bsPx.toFixed(2), r: 5, class: "point-opt" }));
      var etOpt = svgEl(ns, "text", { x: xsPx.toFixed(2), y: (bsPx - 9).toFixed(2), "text-anchor": xs > 14 ? "end" : "middle", class: "etiquette etiquette-opt" });
      etOpt.textContent = "max : x* = " + formatSouple(xs) + ", B = " + formatNombreFr(bs, 1) + " €";
      svg.appendChild(etOpt);
      svg.appendChild(svgEl(ns, "circle", { cx: xpx.toFixed(2), cy: this._pyBas(bx).toFixed(2), r: 4.2, class: "point-b" }));

      this._lecture.innerHTML =
        '<span class="chip chip-r">R(' + formatNombreFr(x, 1) + ') = ' + formatNombreFr(rx, 1) + ' €</span>' +
        '<span class="chip chip-c">C(' + formatNombreFr(x, 1) + ') = ' + formatNombreFr(cx, 1) + ' €</span>' +
        '<span class="chip chip-b">B(' + formatNombreFr(x, 1) + ') = ' + formatNombreFr(bx, 1) + ' €</span>' +
        '<span class="chip">R′ = ' + formatNombreFr(rpx, 1) + '</span>' +
        '<span class="chip">C′ = ' + formatNombreFr(cpx, 1) + '</span>';

      if (Math.abs(rpx - cpx) < TOLERANCE_MARGINALES) {
        this._verdict.className = "verdict verdict-ok";
        this._verdict.textContent = "Rm ≈ Cm (" + formatNombreFr(rpx, 1) + " ≈ " + formatNombreFr(cpx, 1) + ") → bénéfice MAXIMAL, B = " + formatNombreFr(bx, 1) + " €.";
      } else if (rpx > cpx) {
        this._verdict.className = "verdict verdict-non";
        this._verdict.textContent = "Rm > Cm (" + formatNombreFr(rpx, 1) + " > " + formatNombreFr(cpx, 1) + ") → produire une unité de plus reste rentable, le bénéfice peut encore augmenter.";
      } else {
        this._verdict.className = "verdict verdict-non";
        this._verdict.textContent = "Rm < Cm (" + formatNombreFr(rpx, 1) + " < " + formatNombreFr(cpx, 1) + ") → produire une unité de plus coûte plus qu'elle ne rapporte, le bénéfice diminue déjà.";
      }

      this._optimum.innerHTML = "Optimum : B′(x) = (a − 10) − 4x = 0 ⟹ <strong>x* = (" + formatNombreFr(a, 0) + " − 10)/4 = " + formatSouple(xs) +
        "</strong>, bénéfice maximal <strong>B(x*) = " + formatNombreFr(bs, 1) + " €</strong>" + (bs < 0 ? " : même à l'optimum, l'entreprise perd de l'argent." : ".");
      this._noteC.textContent = "Le coût fixe c ne change pas x* (il n'apparaît pas dans B′) : il décale seulement toute la courbe de B de " +
        formatNombreFr(c, 0) + " € vers le bas. Seul le prix a déplace l'optimum.";

      var xr = a / 2, br = this._B(xr);
      this._piege.textContent = "La recette seule est maximale en x = a/2 = " + formatSouple(xr) + (xr > 20 ? " (hors curseur)" : "") +
        ", mais B(" + formatSouple(xr) + ") = " + formatNombreFr(br, 1) + " € : maximiser la recette n'est pas maximiser le bénéfice.";
    }
  }

  if (!customElements.get("recette-benefice-widget")) {
    customElements.define("recette-benefice-widget", RecetteBeneficeWidgetClass);
  }
})();
