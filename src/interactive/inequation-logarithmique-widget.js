(function () {
  "use strict";

  /* ================================================================
   * <inequation-logarithmique-widget> — atelier interactif : curseurs a
   * (base), k (constante comparée) et c (décalage de l'argument), sélecteur
   * ◇ ∈ {>,≥,<,≤}, pour logₐ(x − c) ◇ k. Généralise l'illustration statique
   * juste au-dessus (ln contre log₀,₅, comparées à 2 — réglages par défaut
   * c = 0) et matérialise le « piège central » de la section : le DOMAINE
   * (x > c, zone hors domaine hachurée, bande violette sous l'axe) est
   * distinct de l'ENSEMBLE-SOLUTION (bande verte sur l'axe). Principe :
   * logₐ(x − c) ◇ k ⟺ x − c ◇ aᵏ, sens conservé si a > 1, inversé sinon,
   * toujours combiné à x − c > 0. Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 2.72, k: 2, c: 0 }; // a≈e, k=2, c=0 : reproduit presque exactement e²≈7,39 (côté
  // a>1) — faire glisser a vers 0,5 reproduit l'autre côté de l'illustration statique (x=0,25).
  var BORNES_A = { min: 0.2, max: 3, step: 0.01 };
  var BORNES_K = { min: -3, max: 3, step: 0.1 };
  var BORNES_C = { min: -3, max: 3, step: 0.5 };
  // Fenêtre FIXE (jamais recalculée depuis a/k/c) : couvre le domaine x > c pour tout c de
  // BORNES_C ; les bornes x0 = c + aᵏ au-delà de X_MAX sont simplement hors champ.
  var X_MIN = -3.6, X_MAX = 10, Y_MIN = -4, Y_MAX = 4;
  var LARGEUR = 420, HAUTEUR = 320, MARGE = 34;
  var Y_AXE_DOMAINE = HAUTEUR - 14; // bande « domaine », sous le graphique

  var INDICES = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉" };

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (arrondi === 0) arrondi = 0; // pas de « −0 »
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  // Comme formatNombreFr, sans zéros inutiles (« 1 » plutôt que « 1,00 », « 0,25 » gardé).
  function formatCourt(n, decimales) {
    var t = formatNombreFr(n, decimales);
    if (t.indexOf(",") >= 0) t = t.replace(/0+$/, "").replace(/,$/, "");
    return t;
  }

  function indice(texte) {
    return texte.split("").map(function (ch) { return INDICES[ch] || ch; }).join("");
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
    '[hidden]{display:none!important;}' +
    '.formule-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:14px;}' +
    '.formule{font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);}' +
    '.formule-row select{font-family:inherit;font-size:1.05rem;font-weight:700;color:var(--accent-ink,#7a3212);background:var(--surface,#fff);border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);padding:3px 8px;min-height:44px;cursor:pointer;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:420px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.ligne-k{stroke:var(--ink-faint,#9c9083);stroke-width:1.3;stroke-dasharray:5 4;}' +
    '.asymptote{stroke:var(--plan,#5b4ea3);stroke-width:1.3;stroke-dasharray:4 4;}' +
    '.hachure{stroke:var(--ink-faint,#9c9083);stroke-width:1;opacity:0.55;}' +
    '.zone-exclue{fill:url(#hachures);}' +
    '.segment-pos{stroke:var(--good,#2f7a4f);stroke-width:2.6;fill:none;}' +
    '.segment-neg{stroke:var(--bad,#a8322f);stroke-width:2.6;fill:none;}' +
    '.segment-solution{stroke:var(--good,#2f7a4f);stroke-width:5;stroke-linecap:butt;}' +
    '.bande-domaine{stroke:var(--plan,#5b4ea3);stroke-width:5;}' +
    '.point-inclus{fill:var(--good,#2f7a4f);stroke:var(--surface,#fff);stroke-width:1.5;}' +
    '.point-exclus{fill:var(--surface,#fff);stroke:var(--good,#2f7a4f);stroke-width:2;}' +
    '.point-domaine{fill:var(--surface,#fff);stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.point-x0{fill:var(--ink,#241f1a);}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.etiquette-domaine{font-size:11px;font-weight:600;fill:var(--plan,#5b4ea3);font-family:var(--sans,sans-serif);}' +
    '.etiquette-solution{font-size:11px;font-weight:600;fill:var(--good,#2f7a4f);font-family:var(--sans,sans-serif);}' +
    '.etiquette-x0{font-size:11.5px;font-weight:600;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.resultats{display:flex;flex-direction:column;gap:6px;align-items:center;margin:0 0 10px;}' +
    '.ligne-res{font-family:var(--mono,monospace);font-size:0.98rem;font-weight:700;text-align:center;}' +
    '.ligne-domaine{color:var(--plan,#5b4ea3);}' +
    '.ligne-solution{color:var(--good,#2f7a4f);}' +
    '.message{margin:0 0 18px;padding:9px 12px;border:1px solid var(--line,#e2d8c8);border-left:3px solid var(--plan,#5b4ea3);border-radius:var(--radius,3px);background:var(--surface,#fff);color:var(--ink,#241f1a);font-size:0.92rem;line-height:1.5;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="formule-row"><span class="formule" id="formule"></span>' +
    '<select id="symbole" aria-label="Symbole de comparaison">' +
    '<option value="gt">&gt; k</option>' +
    '<option value="ge">&ge; k</option>' +
    '<option value="lt">&lt; k</option>' +
    '<option value="le">&le; k</option>' +
    '</select></div>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + LARGEUR + ' ' + HAUTEUR + '" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<div class="resultats">' +
    '<span class="ligne-res ligne-domaine" id="ligne-domaine"></span>' +
    '<span class="ligne-res ligne-solution" id="ligne-solution"></span>' +
    '</div>' +
    '<p class="message" id="message"></p>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="a">a — base</label><div class="curseur-row">' +
    '<input type="range" id="a" min="' + BORNES_A.min + '" max="' + BORNES_A.max + '" step="' + BORNES_A.step + '" value="' + DEFAUT.a + '">' +
    '<span class="curseur-valeur" id="a-valeur"></span></div></div>' +
    '<div class="curseur"><label for="k">k — constante</label><div class="curseur-row">' +
    '<input type="range" id="k" min="' + BORNES_K.min + '" max="' + BORNES_K.max + '" step="' + BORNES_K.step + '" value="' + DEFAUT.k + '">' +
    '<span class="curseur-valeur" id="k-valeur"></span></div></div>' +
    '<div class="curseur"><label for="c">c — décalage de l\'argument x − c</label><div class="curseur-row">' +
    '<input type="range" id="c" min="' + BORNES_C.min + '" max="' + BORNES_C.max + '" step="' + BORNES_C.step + '" value="' + DEFAUT.c + '">' +
    '<span class="curseur-valeur" id="c-valeur"></span></div></div>' +
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
    this._c = DEFAUT.c;
    this._symbole = "le";
    this._svg = shadow.getElementById("svg");
    this._formule = shadow.getElementById("formule");
    this._selectSymbole = shadow.getElementById("symbole");
    this._ligneDomaine = shadow.getElementById("ligne-domaine");
    this._ligneSolution = shadow.getElementById("ligne-solution");
    this._message = shadow.getElementById("message");
    this._inputA = shadow.getElementById("a");
    this._inputK = shadow.getElementById("k");
    this._inputC = shadow.getElementById("c");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurK = shadow.getElementById("k-valeur");
    this._valeurC = shadow.getElementById("c-valeur");
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
    this._onInputC = function () { self._c = parseFloat(self._inputC.value); self._rendre(); };
    this._onChangeSymbole = function () { self._symbole = self._selectSymbole.value; self._rendre(); };
    this._onReset = function () {
      self._a = DEFAUT.a; self._k = DEFAUT.k; self._c = DEFAUT.c; self._symbole = "le";
      self._inputA.value = String(DEFAUT.a);
      self._inputK.value = String(DEFAUT.k);
      self._inputC.value = String(DEFAUT.c);
      self._selectSymbole.value = "le";
      self._rendre();
    };
    this._inputA.addEventListener("input", this._onInputA);
    this._inputK.addEventListener("input", this._onInputK);
    this._inputC.addEventListener("input", this._onInputC);
    this._selectSymbole.addEventListener("change", this._onChangeSymbole);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  InequationLogarithmiqueWidgetClass.prototype.disconnectedCallback = function () {
    this._inputA.removeEventListener("input", this._onInputA);
    this._inputK.removeEventListener("input", this._onInputK);
    this._inputC.removeEventListener("input", this._onInputC);
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
    var n = Math.max(6, Math.round(260 * (xMax - xMin) / (X_MAX - X_MIN)));
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

  // Trace logₐ(x − c) sur x > c, coupée exactement en x0 = c + aᵏ, colorée selon l'inéquation
  // SÉLECTIONNÉE (vert = satisfait ◇, rouge = ne le satisfait pas).
  InequationLogarithmiqueWidgetClass.prototype._traceCourbeSignee = function (svg, ns, f, x0, veutSup) {
    var xDebut = this._c + 0.002;
    var bornes = [xDebut];
    if (isFinite(x0) && x0 > xDebut && x0 < X_MAX) bornes.push(x0);
    bornes.push(X_MAX);
    for (var i = 0; i < bornes.length - 1; i++) {
      var lo = bornes[i], hi = bornes[i + 1];
      if (hi - lo < 1e-6) continue;
      var mid = (lo + hi) / 2;
      var classe = (f(mid) > this._k) === veutSup ? "segment-pos" : "segment-neg";
      this._traceIntervalle(svg, ns, lo, hi, f, classe);
    }
  };

  InequationLogarithmiqueWidgetClass.prototype._rendre = function () {
    var a = this._a, k = this._k, c = this._c;
    var lnA = Math.log(a);
    var f = function (x) { return x > c ? Math.log(x - c) / lnA : NaN; };
    var texteA = formatCourt(a, 2), texteC = formatCourt(Math.abs(c), 1);
    // Espaces insécables : « x − 1 », « x − 1 > 0 » ne se coupent jamais en fin de ligne.
    var argument = c === 0 ? "x" : (c > 0 ? "x\u00a0−\u00a0" + texteC : "x\u00a0+\u00a0" + texteC);
    this._formule.textContent = "log" + indice(texteA) + "(" + argument + ")";
    this._valeurA.textContent = formatNombreFr(a, 2);
    this._valeurK.textContent = formatNombreFr(k, 1);
    this._valeurC.textContent = formatCourt(c, 1);

    var ak = Math.pow(a, k);
    var x0 = c + ak; // logₐ(x − c) = k ⟺ x − c = aᵏ

    var large = this._symbole === "ge" || this._symbole === "le";
    var veutSup = this._symbole === "gt" || this._symbole === "ge";
    // logₐ(u) ◇ k ⟺ u ◇ aᵏ si a > 1 (ln a > 0), sens inversé si 0 < a < 1 (ln a < 0).
    var sensConserve = lnA > 0;
    var direction = (veutSup === sensConserve); // true → x > x0 (ou ≥), false → c < x < x0 (ou ≤)
    var bornePrecise = Math.abs(ak) < 0.01 ? 4 : 2;
    var texteX0 = formatCourt(x0, bornePrecise);
    var texteBorneC = formatCourt(c, 1);
    this._ligneDomaine.textContent = "Domaine : ]" + texteBorneC + " ; +∞[";
    var texteS, message;
    var symboleU = { gt: ">", ge: "≥", lt: "<", le: "≤" };
    var symboleInverse = { gt: "<", ge: "≤", lt: ">", le: "≥" };
    var symU = sensConserve ? symboleU[this._symbole] : symboleInverse[this._symbole];
    var etape = argument + "\u00a0" + symU + "\u00a0aᵏ\u00a0=\u00a0" + formatCourt(ak, bornePrecise) +
      (sensConserve ? " (a > 1 : sens conservé)" : " (0 < a < 1 : sens inversé)");
    if (direction) {
      texteS = "Solution : S = " + (large ? "[" : "]") + texteX0 + " ; +∞[";
      message = "La solution doit être cherchée dans le domaine : x\u00a0>\u00a0" + texteBorneC + ". Ici " + etape +
        ", et ces x vérifient déjà x\u00a0>\u00a0" + texteBorneC + " : la solution tient tout entière dans le domaine, " +
        "elle n'en est qu'une partie.";
    } else {
      texteS = "Solution : S = ]" + texteBorneC + " ; " + texteX0 + (large ? "]" : "[");
      message = "La solution doit être cherchée dans le domaine : x\u00a0>\u00a0" + texteBorneC + ". Ici " + etape +
        ", qu'il faut combiner avec " + argument + "\u00a0>\u00a00. Le crochet ouvert en " + texteBorneC +
        " vient du domaine, pas de l'inéquation.";
    }
    this._ligneSolution.textContent = texteS;
    this._message.textContent = message;

    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    var self = this;

    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    var motif = svgEl(ns, "pattern", { id: "hachures", width: "8", height: "8", patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    motif.appendChild(svgEl(ns, "line", { x1: "0", y1: "0", x2: "0", y2: "8", class: "hachure" }));
    defs.appendChild(motif);
    svg.appendChild(defs);

    // Zone hors domaine (x ≤ c), hachurée sur toute la hauteur du graphique.
    var pC = self._toPx(c, 0);
    var pGauche = self._toPx(X_MIN, Y_MAX);
    var pBas = self._toPx(X_MIN, Y_MIN);
    if (pC[0] > pGauche[0]) {
      svg.appendChild(svgEl(ns, "rect", { x: pGauche[0].toFixed(2), y: pGauche[1].toFixed(2), width: (pC[0] - pGauche[0]).toFixed(2), height: (pBas[1] - pGauche[1]).toFixed(2), class: "zone-exclue" }));
      var etHors = svgEl(ns, "text", { x: ((pGauche[0] + pC[0]) / 2).toFixed(2), y: (pGauche[1] + 14).toFixed(2), "text-anchor": "middle", class: "etiquette" });
      etHors.textContent = pC[0] - pGauche[0] > 70 ? "hors domaine" : "hors";
      svg.appendChild(etHors);
    }

    var origine = self._toPx(0, 0);
    svg.appendChild(svgEl(ns, "line", { x1: MARGE, x2: LARGEUR - MARGE, y1: origine[1].toFixed(2), y2: origine[1].toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: origine[0].toFixed(2), x2: origine[0].toFixed(2), y1: HAUTEUR - MARGE, y2: MARGE, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: LARGEUR - MARGE + 6, y: origine[1] + 4, class: "etiquette" });
    etiqX.textContent = "x";
    svg.appendChild(etiqX);

    // Asymptote verticale x = c (confondue avec l'axe des ordonnées quand c = 0).
    if (c !== 0) {
      var pA0 = self._toPx(c, Y_MIN), pA1 = self._toPx(c, Y_MAX);
      svg.appendChild(svgEl(ns, "line", { x1: pA0[0].toFixed(2), y1: pA0[1].toFixed(2), x2: pA1[0].toFixed(2), y2: pA1[1].toFixed(2), class: "asymptote" }));
    }

    if (k >= Y_MIN && k <= Y_MAX) {
      var pK0 = self._toPx(X_MIN, k), pK1 = self._toPx(X_MAX, k);
      svg.appendChild(svgEl(ns, "line", { x1: pK0[0].toFixed(2), y1: pK0[1].toFixed(2), x2: pK1[0].toFixed(2), y2: pK1[1].toFixed(2), class: "ligne-k" }));
      var etK = svgEl(ns, "text", { x: (LARGEUR - MARGE - 4).toFixed(2), y: (pK0[1] - 5).toFixed(2), "text-anchor": "end", class: "etiquette" });
      etK.textContent = "y = " + formatNombreFr(k, 1);
      svg.appendChild(etK);
    }

    this._traceCourbeSignee(svg, ns, f, x0, veutSup);

    // Bande « domaine » (violette) sous le graphique : ]c ; +∞[, cercle ouvert en c.
    var pDom0 = self._toPx(Math.max(c, X_MIN), 0), pDom1 = self._toPx(X_MAX, 0);
    svg.appendChild(svgEl(ns, "line", { x1: pDom0[0].toFixed(2), y1: Y_AXE_DOMAINE, x2: pDom1[0].toFixed(2), y2: Y_AXE_DOMAINE, class: "bande-domaine" }));
    svg.appendChild(svgEl(ns, "circle", { cx: pDom0[0].toFixed(2), cy: Y_AXE_DOMAINE, r: 5, class: "point-domaine" }));
    var etDom = svgEl(ns, "text", { x: (pDom1[0]).toFixed(2), y: Y_AXE_DOMAINE - 8, "text-anchor": "end", class: "etiquette-domaine" });
    etDom.textContent = "domaine";
    svg.appendChild(etDom);

    // Ensemble-solution (vert) sur l'axe des x, avec ses vraies bornes : point plein (inclus) ou
    // cercle vide (exclu) en x0 ; côté borné par le domaine, cercle vide en c.
    var xDebut = direction ? Math.max(x0, X_MIN) : Math.max(c, X_MIN);
    var xFin = direction ? X_MAX : Math.min(x0, X_MAX);
    if (xDebut <= xFin) {
      var pSeg0 = self._toPx(xDebut, 0), pSeg1 = self._toPx(xFin, 0);
      svg.appendChild(svgEl(ns, "line", { x1: pSeg0[0].toFixed(2), y1: pSeg0[1].toFixed(2), x2: pSeg1[0].toFixed(2), y2: pSeg1[1].toFixed(2), class: "segment-solution" }));
      var etSol = svgEl(ns, "text", { x: ((pSeg0[0] + pSeg1[0]) / 2).toFixed(2), y: (pSeg0[1] - 8).toFixed(2), "text-anchor": "middle", class: "etiquette-solution" });
      etSol.textContent = pSeg1[0] - pSeg0[0] > 50 ? "solution" : "";
      svg.appendChild(etSol);
      if (!direction && c >= X_MIN) {
        var pCsol = self._toPx(c, 0);
        svg.appendChild(svgEl(ns, "circle", { cx: pCsol[0].toFixed(2), cy: pCsol[1].toFixed(2), r: 5, class: "point-exclus" }));
      }
    }
    if (x0 >= X_MIN && x0 <= X_MAX) {
      var pPointSol = self._toPx(x0, 0);
      svg.appendChild(svgEl(ns, "circle", { cx: pPointSol[0].toFixed(2), cy: pPointSol[1].toFixed(2), r: 5, class: large ? "point-inclus" : "point-exclus" }));
    }

    if (isFinite(x0) && x0 >= X_MIN && x0 <= X_MAX) {
      var pX0 = self._toPx(x0, k);
      if (k >= Y_MIN && k <= Y_MAX) svg.appendChild(svgEl(ns, "circle", { cx: pX0[0].toFixed(2), cy: pX0[1].toFixed(2), r: 4.5, class: "point-x0" }));
      var proche = pX0[0] > LARGEUR - 90;
      var etX0 = svgEl(ns, "text", { x: (pX0[0] + (proche ? -8 : 8)).toFixed(2), y: (origine[1] + 18).toFixed(2), "text-anchor": proche ? "end" : "start", class: "etiquette-x0" });
      etX0.textContent = "x = " + texteX0;
      svg.appendChild(etX0);
    }
  };

  if (!customElements.get("inequation-logarithmique-widget")) {
    customElements.define("inequation-logarithmique-widget", InequationLogarithmiqueWidgetClass);
  }
})();
