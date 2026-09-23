(function () {
  "use strict";

  /* ================================================================
   * <suite-recurrente-affine-widget> — atelier interactif : curseurs a, b,
   * u1 pour u_(n+1)=a·u_n+b, calcule et trace les 10 premiers termes, et
   * matérialise le piège central de la section : la formule L=b/(1-a)
   * produit toujours UN nombre, mais ce nombre n'est un vrai régime
   * permanent QUE si |a|<1 — au-delà, la ligne de référence bascule en
   * rouge et le texte l'affirme explicitement. Même langage visuel que
   * SequencePlot.tsx (axes fléchés, points isolés, connecteur pointillé).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 0.7, b: 3, u1: 1 };
  var BORNES_A = { min: -1.5, max: 1.5, step: 0.1 };
  var BORNES_B = { min: -3, max: 3, step: 0.5 };
  var BORNES_U1 = { min: -5, max: 10, step: 0.5 };
  var N_TERMES = 10;

  // Fenêtre FIXE (jamais recalculée depuis a/b/u1) : couvre largement le cas de démonstration
  // (L=10) avec de la marge pour les cas divergents proches — au-delà, les points sont
  // simplement clippés (jamais de rescale), exactement comme les autres widgets de ce dossier.
  var LARGEUR = 460, HAUTEUR = 280, MARGE_G = 40, MARGE_D = 20, MARGE_H = 18, MARGE_B = 30;
  var Y_MIN = -15, Y_MAX = 40;

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
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.connecteur{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:3 3;fill:none;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.ligne-limite-ok{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.ligne-limite-piege{stroke:var(--bad,#b23a3a);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.etiquette-limite-ok{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.etiquette-limite-piege{font-size:11.5px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--mono,monospace);}' +
    '.etiquette-n{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-valeur{font-size:10.5px;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 18px;padding:10px 14px;border-radius:var(--radius,3px);}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
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
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="b">b</label><div class="curseur-row">' +
    '<input type="range" id="b" min="' + BORNES_B.min + '" max="' + BORNES_B.max + '" step="' + BORNES_B.step + '" value="' + DEFAUT.b + '">' +
    '<span class="curseur-valeur" id="b-valeur"></span></div></div>' +
    '<div class="curseur"><label for="u1">u₁</label><div class="curseur-row">' +
    '<input type="range" id="u1" min="' + BORNES_U1.min + '" max="' + BORNES_U1.max + '" step="' + BORNES_U1.step + '" value="' + DEFAUT.u1 + '">' +
    '<span class="curseur-valeur" id="u1-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class SuiteRecurrenteAffineWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SuiteRecurrenteAffineWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._a = DEFAUT.a;
    this._b = DEFAUT.b;
    this._u1 = DEFAUT.u1;
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputU1 = shadow.getElementById("u1");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurU1 = shadow.getElementById("u1-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  SuiteRecurrenteAffineWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    // a ne peut jamais valoir exactement 1 (division par 1−a impossible ; l'énoncé exclut ce cas
    // : « avec a≠1, sinon elle serait arithmétique ») — curseur repoussé au pas le plus proche.
    this._onInputA = function () {
      var v = parseFloat(self._inputA.value);
      if (Math.abs(v - 1) < BORNES_A.step / 2) {
        v = v >= self._a ? 1 + BORNES_A.step : 1 - BORNES_A.step;
        self._inputA.value = String(v);
      }
      self._a = v;
      self._rendre();
    };
    this._onInputB = function () { self._b = parseFloat(self._inputB.value); self._rendre(); };
    this._onInputU1 = function () { self._u1 = parseFloat(self._inputU1.value); self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._u1 = DEFAUT.u1;
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputU1.value = String(DEFAUT.u1);
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputB.addEventListener("input", this._onInputB);
    this._inputU1.addEventListener("input", this._onInputU1);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SuiteRecurrenteAffineWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputB.removeEventListener("input", this._onInputB);
    this._inputU1.removeEventListener("input", this._onInputU1);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SuiteRecurrenteAffineWidgetClass.prototype._toPx = function (n) {
    var px = MARGE_G + ((n - 1) / (N_TERMES - 1)) * (LARGEUR - MARGE_G - MARGE_D);
    return px;
  };
  SuiteRecurrenteAffineWidgetClass.prototype._toPy = function (v) {
    var vClamp = Math.max(Y_MIN, Math.min(Y_MAX, v));
    return HAUTEUR - MARGE_B - ((vClamp - Y_MIN) / (Y_MAX - Y_MIN)) * (HAUTEUR - MARGE_H - MARGE_B);
  };

  SuiteRecurrenteAffineWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b, u1 = this._u1;
    var large = Math.abs(a) < 1;
    var L = b / (1 - a);

    this._formule.textContent = "u₁ = " + formatNombreFr(u1, 1) + " ,  u_(n+1) = " + formatNombreFr(a, 1) + "·u_n " + (b >= 0 ? "+ " : "− ") + formatNombreFr(Math.abs(b), 1);
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurU1.textContent = formatNombreFr(u1, 1);

    var termes = [u1];
    for (var i = 1; i < N_TERMES; i++) termes.push(a * termes[i - 1] + b);

    if (large) {
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent = "|a| = " + formatNombreFr(Math.abs(a), 2) + " < 1 : le régime permanent existe — L = b/(1−a) = " + formatNombreFr(L, 2) + ".";
    } else {
      this._verdict.className = "verdict verdict-piege";
      this._verdict.textContent = "|a| = " + formatNombreFr(Math.abs(a), 2) + " ≥ 1 : la formule donne L = " + formatNombreFr(L, 2) + ", mais ce n'est PAS une limite — la suite diverge !";
    }

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

    // Ligne de référence : toujours tracée (la formule donne toujours un nombre), mais sa couleur
    // et son étiquette matérialisent le piège — verte/OK si |a|<1, rouge/piège sinon. Si sa valeur
    // est proche de celle du dernier terme affiché, son étiquette se croiserait avec celle du
    // point — décalée vers le bas dans ce cas seulement (même parade que SequencePlot.tsx).
    if (L >= Y_MIN && L <= Y_MAX) {
      var yL = self._toPy(L);
      var yDernierTerme = self._toPy(termes[termes.length - 1]);
      var decalageL = Math.abs(yL - yDernierTerme) < 16 ? 18 : -5;
      svg.appendChild(svgEl(ns, "line", { x1: MARGE_G, x2: LARGEUR - MARGE_D, y1: yL.toFixed(2), y2: yL.toFixed(2), class: large ? "ligne-limite-ok" : "ligne-limite-piege" }));
      var etL = svgEl(ns, "text", { x: LARGEUR - MARGE_D - 4, y: (yL + decalageL).toFixed(2), "text-anchor": "end", class: large ? "etiquette-limite-ok" : "etiquette-limite-piege" });
      etL.textContent = large ? "L=" + formatNombreFr(L, 2) : "L calc.=" + formatNombreFr(L, 2) + " (pas une limite)";
      svg.appendChild(etL);
    }

    var courant = "";
    termes.forEach(function (v, i) {
      var x = self._toPx(i + 1), y = self._toPy(v);
      courant += (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    });
    svg.appendChild(svgEl(ns, "path", { d: courant.trim(), class: "connecteur" }));

    termes.forEach(function (v, i) {
      var visible = v >= Y_MIN - 0.01 && v <= Y_MAX + 0.01;
      var x = self._toPx(i + 1), y = self._toPy(v);
      if (!visible) return;
      svg.appendChild(svgEl(ns, "circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: 4.5, class: "point" }));
      var etN = svgEl(ns, "text", { x: x.toFixed(2), y: (HAUTEUR - MARGE_B + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-n" });
      etN.textContent = String(i + 1);
      svg.appendChild(etN);
      var etV = svgEl(ns, "text", { x: x.toFixed(2), y: (y - 9).toFixed(2), "text-anchor": "middle", class: "etiquette-valeur" });
      etV.textContent = formatNombreFr(v, 2);
      svg.appendChild(etV);
    });
  };

  if (!customElements.get("suite-recurrente-affine-widget")) {
    customElements.define("suite-recurrente-affine-widget", SuiteRecurrenteAffineWidgetClass);
  }
})();
