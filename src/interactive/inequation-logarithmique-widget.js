(function () {
  "use strict";

  /* ================================================================
   * <inequation-logarithmique-widget> — atelier interactif : curseurs a
   * (base) et k (constante comparée), sélecteur ◇ ∈ {>,≥,<,≤}. Généralise
   * l'illustration statique juste au-dessus (ln contre log₀,₅, comparées à
   * 2) à une base continûment réglable — même principe que
   * inequation-exponentielle-widget (chapitre 2), version logarithme :
   * logₐ(x) ◇ k ⟺ x ◇ aᵏ, sens conservé si a>1, inversé sinon. Web
   * Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 2.72, k: 2 }; // a≈e, k=2 : reproduit presque exactement e²≈7,39 (côté a>1) —
  // faire glisser a vers 0,5 reproduit l'autre côté de l'illustration statique (x=0,25).
  var BORNES_A = { min: 0.2, max: 3, step: 0.01 };
  var BORNES_K = { min: -3, max: 3, step: 0.1 };
  var X_MIN = -0.6, X_MAX = 10, Y_MIN = -4, Y_MAX = 4;
  var LARGEUR = 420, HAUTEUR = 300, MARGE = 34;

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
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.ligne-k{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.6;fill:none;}' +
    '.segment-solution{stroke:var(--good,#2f7a4f);stroke-width:5;stroke-linecap:round;}' +
    '.point-inclus{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-exclus{fill:var(--bad,#a8322f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-x0{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-x0{font-size:11.5px;font-weight:600;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
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
    '<option value="gt">&gt; k</option>' +
    '<option value="ge">&ge; k</option>' +
    '<option value="lt">&lt; k</option>' +
    '<option value="le">&le; k</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="k">k — constante</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class InequationLogarithmiqueWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  InequationLogarithmiqueWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._k = DEFAUT.k;
    this._symbole = "le";
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectSymbole = shadow.getElementById("symbole");
    this._resultat = shadow.getElementById("resultat");
    this._inputA = shadow.getElementById("a");
    this._inputK = shadow.getElementById("k");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurK = shadow.getElementById("k-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._selectSymbole.value = this._symbole;
  };

  InequationLogarithmiqueWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputA = function () {
      var v = parseFloat(self._inputA.value);
      if (Math.abs(v - 1) < BORNES_A.step / 2) {
        v = v >= self._a ? 1 + BORNES_A.step : 1 - BORNES_A.step;
        self._inputA.value = String(v);
      }
      self._a = v;
      self._rendre();
    };
    this._onInputK = function () { self._k = parseFloat(self._inputK.value); self._rendre(); };
    this._onChangeSymbole = function () { self._symbole = self._selectSymbole.value; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._k = DEFAUT.k; self._symbole = "le";
      self._inputA.value = String(DEFAUT.a);
      self._inputK.value = String(DEFAUT.k);
      self._selectSymbole.value = "le";
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputK.addEventListener("input", this._onInputK);
    this._selectSymbole.addEventListener("change", this._onChangeSymbole);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  InequationLogarithmiqueWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputK.removeEventListener("input", this._onInputK);
    this._selectSymbole.removeEventListener("change", this._onChangeSymbole);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  InequationLogarithmiqueWidgetClass.prototype._toPx = function (xMath, yMath) {
    var px = MARGE + (xMath - X_MIN) / (X_MAX - X_MIN) * (LARGEUR - 2 * MARGE);
    var py = HAUTEUR - MARGE - (yMath - Y_MIN) / (Y_MAX - Y_MIN) * (HAUTEUR - 2 * MARGE);
    return [px, py];
  };

  InequationLogarithmiqueWidgetClass.prototype._traceIntervalle = function (svg, ns, xMin, xMax, f, classe) {
    var self = this;
    if (xMax - xMin < 1e-6) return;
    var n = Math.max(4, Math.round(200 * (xMax - xMin) / (X_MAX - X_MIN)));
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

  // Trace logₐ(x) sur x>0, coupée exactement en x0=aᵏ, colorée selon logₐ(x) ≥ k ou < k.
  InequationLogarithmiqueWidgetClass.prototype._traceCourbeSignee = function (svg, ns, f, x0) {
    var xDebut = 0.01;
    var bornes = [xDebut];
    if (isFinite(x0) && x0 > xDebut && x0 < X_MAX) bornes.push(x0);
    bornes.push(X_MAX);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      if (hi - lo < 1e-6) continue;
      var mid = (lo + hi) / 2;
      var classe = f(mid) >= this._k ? "segment-pos" : "segment-neg";
      this._traceIntervalle(svg, ns, lo, hi, f, classe);
    }
  };

  var FORMAT_BORNE = function (v) {
    if (v === -Infinity) return "−∞";
    if (v === Infinity) return "+∞";
    return formatNombreFr(v, 2);
  };

  InequationLogarithmiqueWidgetClass.prototype._rendre = function () {
    var a = this._a, k = this._k;
    var lnA = Math.log(a);
    var f = function (x) { return Math.log(x) / lnA; };
    this._formule.textContent = "log_" + formatNombreFr(a, 2) + "(x)";
    this._valeurA.textContent = formatNombreFr(a, 2);
    this._valeurK.textContent = formatNombreFr(k, 1);

    var x0 = Math.pow(a, k); // logₐ(x0) = k ⟺ x0 = aᵏ

    var large = this._symbole === "ge" || this._symbole === "le";
    var veutSup = this._symbole === "gt" || this._symbole === "ge";
    // logₐ(x) ◇ k ⟺ x ◇ aᵏ, sens conservé si a>1 (ln a>0), inversé si 0<a<1 (ln a<0) — le
    // principe (a)-(h) déjà posé dans le contenu de cette section, plus la CE x>0 (déjà
    // garantie ici : aᵏ>0 pour tout a>0, donc jamais besoin d'intersecter explicitement).
    var sensConserve = lnA > 0;
    var direction = (veutSup === sensConserve); // true → x > x0 (ou ≥), false → x < x0 (ou ≤)
    var texteS;
    if (direction) {
      texteS = "S = " + (large ? "[" : "]") + FORMAT_BORNE(x0) + " ; +∞[";
    } else {
      texteS = "S = ]0 ; " + FORMAT_BORNE(x0) + (large ? "]" : "[");
    }
    this._resultat.textContent = texteS;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    // La verticale x=0 est ici à la fois axe des ordonnées ET asymptote verticale du
    // logarithme (domaine x>0) : une seule ligne solide suffit, avec flèche vers le haut.
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    if (k >= Y_MIN && k <= Y_MAX) {
      var pK0 = self._toPx(X_MIN, k), pK1 = self._toPx(X_MAX, k);
      svg.appendChild(svgEl(ns, "line", { x1: pK0[0].toFixed(2), y1: pK0[1].toFixed(2), x2: pK1[0].toFixed(2), y2: pK1[1].toFixed(2), class: "ligne-k" }));
      var etK = svgEl(ns, "text", { x: (MARGE + 4).toFixed(2), y: (pK0[1] - 5).toFixed(2), class: "etiquette" });
      etK.textContent = "y=" + formatNombreFr(k, 1);
      svg.appendChild(etK);
    }

    this._traceCourbeSignee(svg, ns, f, x0);

    // Demi-droite solution surlignée en vert sur l'axe des x, extrémité en point
    // vert (borne incluse) ou rouge (borne exclue). Le domaine est x>0 : côté
    // ]0 ; x0[, la surbrillance s'arrête à l'asymptote (pas de point là, ce n'est
    // pas une borne de solution) plutôt que de déborder vers X_MIN négatif.
    var xDebut = direction ? Math.max(x0, X_MIN) : 0;
    var xFin = direction ? X_MAX : Math.min(x0, X_MAX);
    if (xDebut <= xFin) {
      var pSeg0 = self._toPx(xDebut, 0), pSeg1 = self._toPx(xFin, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pSeg0[0].toFixed(2), y1: pSeg0[1].toFixed(2), x2: pSeg1[0].toFixed(2), y2: pSeg1[1].toFixed(2), class: "segment-solution" }));
    }
    if (x0 >= X_MIN && x0 <= X_MAX) {
      var pPointSol = self._toPx(x0, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: pPointSol[0].toFixed(2), cy: pPointSol[1].toFixed(2), r: 5, class: large ? "point-inclus" : "point-exclus" }));
    }

    if (isFinite(x0) && x0 >= X_MIN && x0 <= X_MAX) {
      var pX0 = self._toPx(x0, k);
      svg.appendChild(svgEl(ns, "circle", { cx: pX0[0].toFixed(2), cy: pX0[1].toFixed(2), r: 4.5, class: "point-x0" }));
      var proche = pX0[0] > LARGEUR - 70;
      var etX0 = svgEl(ns, "text", { x: (pX0[0] + (proche ? -8 : 8)).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-x0" });
      etX0.textContent = "x=" + formatNombreFr(x0, 2);
      svg.appendChild(etX0);
    }
  };

  if (!customElements.get("inequation-logarithmique-widget")) {
    customElements.define("inequation-logarithmique-widget", InequationLogarithmiqueWidgetClass);
  }
})();
