(function () {
  "use strict";

  /* ================================================================
   * <suite-recurrente-affine-widget> — atelier interactif : curseurs a, b,
   * u₁ pour uₙ₊₁ = a·uₙ + b. Deux vues :
   * - « Termes » : les 10 premiers termes et la ligne L = b/(1−a). Le
   *   piège central de la section : la formule produit toujours UN nombre,
   *   mais ce n'est un vrai régime permanent QUE si |a| < 1 — sinon la
   *   ligne bascule en rouge.
   * - « Toile d'araignée » : droites y = x et y = a·x + b, et le chemin
   *   de la récurrence (vertical vers y = a·x + b, horizontal vers y = x).
   *   Le point fixe L est leur intersection : escalier si 0 < a < 1,
   *   spirale si −1 < a < 0, cycle de 2 valeurs si a = −1, éloignement si
   *   |a| > 1.
   * Sous le graphique : la suite des écarts vₙ = uₙ − L, multipliée par a
   * à chaque rang. Réglages par défaut = l'exemple de l'aquarium
   * (a = 0,7 ; b = 3 ; u₁ = 1 ; L = 10). Web Component (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { a: 0.7, b: 3, u1: 1 };
  var BORNES_A = { min: -1.5, max: 1.5, step: 0.1 };
  var BORNES_B = { min: -3, max: 3, step: 0.5 };
  var BORNES_U1 = { min: -5, max: 10, step: 0.5 };
  var N_TERMES = 10;
  var N_PAS_TOILE = 14;
  var EPS = 1e-9;

  // Vue « Termes » — fenêtre FIXE (jamais recalculée depuis a/b/u₁) : au-delà, les points sont
  // simplement clippés (jamais de rescale), comme les autres widgets de ce dossier.
  var T = { L: 460, H: 280, G: 40, D: 20, HT: 18, B: 30, yMin: -15, yMax: 40 };
  // Vue « Toile d'araignée » — repère orthonormé FIXE [−6 ; 16] × [−6 ; 16] (zone de tracé
  // carrée de 290 × 290) pour que y = x soit bien la bissectrice. Fenêtre centrée sur le cas de
  // l'aquarium (u₁ = 1, L = 10) ; un point fixe hors fenêtre est signalé dans le texte.
  var W = { L: 340, H: 336, G: 34, D: 16, HT: 16, B: 30, min: -6, max: 16, pas: 5 };

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Math.abs(arrondi) < 0.5 / facteur) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }
  // Jusqu'à 3 décimales, zéros inutiles retirés (−6,3 et non −6,300).
  function formatCourt(n) {
    var t = formatNombreFr(n, 3);
    if (t.indexOf(",") >= 0) t = t.replace(/0+$/, "").replace(/,$/, "");
    return t;
  }

  function svgEl(ns, tag, attrs) {
    var el = document.createElementNS(ns, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  function curseurHTML(id, label, bornes, valeur) {
    return '<div class="curseur"><label for="' + id + '">' + label + '</label><div class="curseur-row">' +
      '<input type="range" id="' + id + '" min="' + bornes.min + '" max="' + bornes.max + '" step="' + bornes.step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="' + id + '-valeur"></span></div></div>';
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '[hidden]{display:none!important;}' +
    '.onglets{display:flex;gap:8px;justify-content:center;margin:0 0 12px;}' +
    '.onglet{min-height:44px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font:inherit;font-size:0.88rem;font-weight:600;cursor:pointer;}' +
    '.onglet[aria-pressed="true"]{border-color:var(--accent,#a8471f);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);}' +
    '.formule{text-align:center;font-family:var(--serif,serif);font-style:italic;font-size:1.1rem;font-weight:600;color:var(--ink,#241f1a);margin:0 0 14px;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:14px;}' +
    'svg{width:100%;max-width:460px;height:auto;background:var(--surface-2,#faf6f0);border-radius:var(--radius,3px);}' +
    'svg.toile{max-width:380px;}' +
    '.axe{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.fleche{fill:var(--ink-soft,#6b6055);}' +
    '.grille{stroke:var(--line,#e2d8c8);stroke-width:1;}' +
    '.connecteur{stroke:var(--accent,#a8471f);stroke-width:1.6;stroke-dasharray:3 3;fill:none;}' +
    '.point{fill:var(--accent,#a8471f);}' +
    '.ligne-limite-ok{stroke:var(--good,#2f7a4f);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.ligne-limite-piege{stroke:var(--bad,#b23a3a);stroke-width:1.6;stroke-dasharray:4 3;}' +
    '.etiquette-limite-ok{font-size:11.5px;font-weight:700;fill:var(--good,#2f7a4f);font-family:var(--mono,monospace);}' +
    '.etiquette-limite-piege{font-size:11.5px;font-weight:700;fill:var(--bad,#b23a3a);font-family:var(--mono,monospace);}' +
    '.point-fixe-ok{fill:var(--good,#2f7a4f);}' +
    '.point-fixe-piege{fill:var(--bad,#b23a3a);}' +
    '.droite-id{stroke:var(--ink-soft,#6b6055);stroke-width:1.4;}' +
    '.droite-f{stroke:var(--plan,#5b4ea3);stroke-width:2;}' +
    '.etiquette-id{font-size:11.5px;font-weight:600;fill:var(--ink-soft,#6b6055);font-family:var(--serif,serif);font-style:italic;}' +
    '.etiquette-f{font-size:11.5px;font-weight:700;fill:var(--plan,#5b4ea3);font-family:var(--serif,serif);font-style:italic;}' +
    '.chemin{stroke:var(--accent,#a8471f);stroke-width:1.7;fill:none;}' +
    '.repere-u{stroke:var(--accent,#a8471f);stroke-width:1;stroke-dasharray:2 3;}' +
    '.etiquette-n{font-size:11px;fill:var(--ink-soft,#6b6055);font-family:var(--mono,monospace);}' +
    '.etiquette-valeur{font-size:10.5px;fill:var(--ink,#241f1a);font-family:var(--mono,monospace);}' +
    '.etiquette-u{font-size:11px;font-weight:700;fill:var(--accent-ink,#7a3212);font-family:var(--serif,serif);font-style:italic;}' +
    '.halo{paint-order:stroke;stroke:var(--surface-2,#faf6f0);stroke-width:3.5px;stroke-linejoin:round;}' +
    '.etiquette{font-size:12px;fill:var(--ink-soft,#6b6055);font-family:var(--sans,sans-serif);}' +
    '.verdict{text-align:center;font-size:0.9rem;font-weight:600;margin:0 0 12px;padding:10px 14px;border-radius:var(--radius,3px);line-height:1.45;}' +
    '.verdict-ok{color:var(--good,#2f7a4f);background:var(--surface-2,#faf6f0);}' +
    '.verdict-piege{color:var(--bad,#b23a3a);background:var(--surface-2,#faf6f0);}' +
    '.forme{text-align:center;font-size:0.88rem;margin:0 0 12px;color:var(--plan,#5b4ea3);font-weight:600;line-height:1.45;}' +
    '.ecarts{margin:0 0 18px;padding:10px 12px;border:1px solid var(--line,#e2d8c8);border-radius:var(--radius,3px);font-size:0.88rem;line-height:1.5;color:var(--ink,#241f1a);}' +
    '.ecarts-titre{font-weight:700;color:var(--ink-soft,#6b6055);margin:0 0 4px;}' +
    '.ecarts-suite{font-variant-numeric:tabular-nums;font-family:var(--mono,monospace);font-size:0.86rem;margin:0 0 4px;}' +
    '.ecarts-suite span{white-space:nowrap;}' +
    '.ecarts-message{margin:0;font-weight:600;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;min-height:44px;min-width:0;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{min-height:44px;margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="onglets" role="group" aria-label="Vue">' +
    '<button type="button" class="onglet" data-vue="termes" aria-pressed="true">Termes</button>' +
    '<button type="button" class="onglet" data-vue="toile" aria-pressed="false">Toile d\'araignée</button>' +
    '</div>' +
    '<p class="formule" id="formule"></p>' +
    '<div class="graphe-zone"><svg id="svg" xmlns="http://www.w3.org/2000/svg"></svg></div>' +
    '<p class="verdict" id="verdict"></p>' +
    '<p class="forme" id="forme" hidden></p>' +
    '<div class="ecarts"><p class="ecarts-titre">Écarts au point fixe : vₙ = uₙ − L</p>' +
    '<p class="ecarts-suite" id="ecarts-suite"></p><p class="ecarts-message" id="ecarts-message"></p></div>' +
    '<div class="controles">' +
    curseurHTML("a", "a", BORNES_A, DEFAUT.a) +
    curseurHTML("b", "b", BORNES_B, DEFAUT.b) +
    curseurHTML("u1", "u₁", BORNES_U1, DEFAUT.u1) +
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
    this._vue = "termes";
    this._formule = shadow.getElementById("formule");
    this._svg = shadow.getElementById("svg");
    this._verdict = shadow.getElementById("verdict");
    this._forme = shadow.getElementById("forme");
    this._ecartsSuite = shadow.getElementById("ecarts-suite");
    this._ecartsMessage = shadow.getElementById("ecarts-message");
    this._inputA = shadow.getElementById("a");
    this._inputB = shadow.getElementById("b");
    this._inputU1 = shadow.getElementById("u1");
    this._valeurA = shadow.getElementById("a-valeur");
    this._valeurB = shadow.getElementById("b-valeur");
    this._valeurU1 = shadow.getElementById("u1-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._onglets = Array.prototype.slice.call(shadow.querySelectorAll(".onglet"));
  };

  SuiteRecurrenteAffineWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._handlers = [];
    function on(el, ev, fn) { el.addEventListener(ev, fn); self._handlers.push([el, ev, fn]); }
    // a ne peut jamais valoir exactement 1 (division par 1−a impossible ; le texte exclut ce cas :
    // « avec a≠1, sinon elle serait arithmétique ») — curseur repoussé au pas le plus proche.
    on(this._inputA, "input", function () {
      var v = Math.round(parseFloat(self._inputA.value) * 10) / 10;
      if (Math.abs(v - 1) < BORNES_A.step / 2) {
        v = v >= self._a ? 1 + BORNES_A.step : 1 - BORNES_A.step;
        v = Math.round(v * 10) / 10;
        self._inputA.value = String(v);
      }
      self._a = v;
      self._rendre();
    });
    on(this._inputB, "input", function () { self._b = Math.round(parseFloat(self._inputB.value) * 10) / 10; self._rendre(); });
    on(this._inputU1, "input", function () { self._u1 = Math.round(parseFloat(self._inputU1.value) * 10) / 10; self._rendre(); });
    on(this._resetBtn, "click", function () {
      self._a = DEFAUT.a; self._b = DEFAUT.b; self._u1 = DEFAUT.u1; self._vue = "termes";
      self._inputA.value = String(DEFAUT.a);
      self._inputB.value = String(DEFAUT.b);
      self._inputU1.value = String(DEFAUT.u1);
      self._rendre();
    });
    this._onglets.forEach(function (btn) {
      on(btn, "click", function () { self._vue = btn.dataset.vue; self._rendre(); });
    });
    this._rendre();
  };

  SuiteRecurrenteAffineWidgetClass.prototype.disconnectedCallback = function () {
    (this._handlers || []).forEach(function (h) { h[0].removeEventListener(h[1], h[2]); });
    this._handlers = [];
  };

  SuiteRecurrenteAffineWidgetClass.prototype._rendre = function () {
    var a = this._a, b = this._b, u1 = this._u1;
    var L = b / (1 - a);
    var converge = Math.abs(a) < 1 - EPS;
    var moinsUn = Math.abs(a + 1) < EPS;
    var constante = Math.abs(u1 - L) < EPS;
    var self = this;

    this._formule.textContent = "u₁ = " + formatCourt(u1) + " ,  uₙ₊₁ = " + formatCourt(a) + " · uₙ " + (b >= 0 ? "+ " : "− ") + formatCourt(Math.abs(b));
    this._valeurA.textContent = formatNombreFr(a, 1);
    this._valeurB.textContent = formatNombreFr(b, 1);
    this._valeurU1.textContent = formatNombreFr(u1, 1);
    this._onglets.forEach(function (btn) { btn.setAttribute("aria-pressed", btn.dataset.vue === self._vue ? "true" : "false"); });

    var termes = [u1];
    for (var i = 1; i < N_TERMES; i++) termes.push(a * termes[i - 1] + b);

    // ---- Verdict (commun aux deux vues) ----
    var absA = "|a| = " + formatNombreFr(Math.abs(a), 1);
    if (constante) {
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent = "u₁ = L = " + formatCourt(L) + " : la suite est constante, tous les termes valent L" +
        (converge ? "." : " — mais avec " + absA + " ≥ 1, le moindre écart au départ serait amplifié.");
    } else if (converge) {
      this._verdict.className = "verdict verdict-ok";
      this._verdict.textContent = absA + " < 1 : le régime permanent existe — L = b/(1 − a) = " + formatCourt(L) + ".";
    } else if (moinsUn) {
      this._verdict.className = "verdict verdict-piege";
      this._verdict.textContent = "a = −1 : la formule donne L = " + formatCourt(L) + ", mais ce n'est PAS une limite. La suite oscille entre u₁ = " +
        formatCourt(u1) + " et b − u₁ = " + formatCourt(b - u1) + " (amplitude constante) : elle ne s'éloigne pas, mais ne se rapproche pas non plus.";
    } else {
      this._verdict.className = "verdict verdict-piege";
      this._verdict.textContent = absA + " > 1 : la formule donne L = " + formatCourt(L) + ", mais ce n'est PAS une limite — les termes s'éloignent de L, la suite diverge !";
    }

    // ---- Écarts vₙ = uₙ − L ----
    var v = termes.slice(0, 4).map(function (t) { return t - L; });
    this._ecartsSuite.innerHTML = "";
    var indices = ["₁", "₂", "₃", "₄"];
    v.forEach(function (val, k) {
      if (k > 0) self._ecartsSuite.appendChild(document.createTextNode(" → "));
      var s = document.createElement("span");
      s.textContent = "v" + indices[k] + " = " + formatCourt(val);
      self._ecartsSuite.appendChild(s);
    });
    var aTxt = "a = " + formatCourt(a);
    if (constante) this._ecartsMessage.textContent = "Tous les écarts valent 0 : la suite reste sur L.";
    else if (Math.abs(a) < EPS) this._ecartsMessage.textContent = "Chaque écart est multiplié par a = 0 : dès v₂, l'écart est nul.";
    else if (converge) this._ecartsMessage.textContent = "Chaque écart est multiplié par " + aTxt + " : (vₙ) est géométrique de raison a, et comme |a| < 1, l'écart tend vers 0." + (a < 0 ? " Le signe alterne : les termes passent d'un côté à l'autre de L." : "");
    else if (moinsUn) this._ecartsMessage.textContent = "Chaque écart est multiplié par a = −1 : il change de signe, mais ne rétrécit jamais.";
    else this._ecartsMessage.textContent = "Chaque écart est multiplié par " + aTxt + " : comme |a| > 1, l'écart grandit à chaque rang.";

    // ---- Forme de la toile (vue toile seulement) ----
    this._forme.hidden = this._vue !== "toile";
    if (this._vue === "toile") {
      var forme;
      if (constante) forme = "Le départ u₁ est déjà le point fixe : le chemin ne bouge pas.";
      else if (Math.abs(a) < EPS) forme = "a = 0 : la droite y = b est horizontale — dès u₂, on est sur le point fixe.";
      else if (converge && a > 0) forme = "Escalier : le chemin monte (ou descend) vers le point fixe, sans jamais le dépasser.";
      else if (converge) forme = "Spirale qui se resserre : le chemin tourne autour du point fixe, alternativement d'un côté et de l'autre.";
      else if (moinsUn) forme = "Cycle de 2 valeurs : le chemin repasse indéfiniment par le même carré autour du point fixe.";
      else if (a > 1) forme = "Escalier qui s'éloigne : le chemin fuit le point fixe — la suite diverge.";
      else forme = "Spirale qui s'élargit : le chemin s'écarte de plus en plus du point fixe — pas de limite.";
      if (L < W.min || L > W.max) forme += " (Le point fixe L = " + formatCourt(L) + " est hors de la fenêtre.)";
      this._forme.textContent = forme;
    }

    if (this._vue === "toile") this._rendreToile(L, converge, constante);
    else this._rendreTermes(termes, L, converge);
  };

  SuiteRecurrenteAffineWidgetClass.prototype._fleches = function (svg, ns) {
    var defs = svgEl(ns, "defs", {});
    var fleche = svgEl(ns, "marker", { id: "fleche", markerWidth: "8", markerHeight: "8", refX: "6", refY: "4", orient: "auto" });
    fleche.appendChild(svgEl(ns, "path", { d: "M0,0 L8,4 L0,8 Z", class: "fleche" }));
    defs.appendChild(fleche);
    svg.appendChild(defs);
    return defs;
  };

  SuiteRecurrenteAffineWidgetClass.prototype._rendreTermes = function (termes, L, converge) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + T.L + " " + T.H);
    svg.setAttribute("class", "termes");
    function toPx(n) { return T.G + ((n - 1) / (N_TERMES - 1)) * (T.L - T.G - T.D); }
    function toPy(val) {
      var vc = Math.max(T.yMin, Math.min(T.yMax, val));
      return T.H - T.B - ((vc - T.yMin) / (T.yMax - T.yMin)) * (T.H - T.HT - T.B);
    }
    this._fleches(svg, ns);
    var zeroY = toPy(0);
    svg.appendChild(svgEl(ns, "line", { x1: T.G, x2: T.L - T.D + 8, y1: zeroY.toFixed(2), y2: zeroY.toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: T.G, x2: T.G, y1: T.H - T.B, y2: T.HT - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var etiqX = svgEl(ns, "text", { x: T.L - T.D + 10, y: T.H - T.B + 14, "text-anchor": "end", class: "etiquette" });
    etiqX.textContent = "n";
    svg.appendChild(etiqX);
    var etiqY = svgEl(ns, "text", { x: T.G + 6, y: T.HT - 10, class: "etiquette" });
    etiqY.textContent = "uₙ";
    svg.appendChild(etiqY);

    // Ligne de référence : toujours tracée (la formule donne toujours un nombre), mais sa couleur
    // et son étiquette matérialisent le piège — verte si |a|<1, rouge sinon (a = −1 compris).
    if (L >= T.yMin && L <= T.yMax) {
      var yL = toPy(L);
      var yDernier = toPy(termes[termes.length - 1]);
      var decalage = Math.abs(yL - yDernier) < 16 ? 18 : -5;
      svg.appendChild(svgEl(ns, "line", { x1: T.G, x2: T.L - T.D, y1: yL.toFixed(2), y2: yL.toFixed(2), class: converge ? "ligne-limite-ok" : "ligne-limite-piege" }));
      var etL = svgEl(ns, "text", { x: T.L - T.D - 4, y: (yL + decalage).toFixed(2), "text-anchor": "end", class: converge ? "etiquette-limite-ok" : "etiquette-limite-piege" });
      etL.textContent = converge ? "L = " + formatCourt(L) : "L calculé = " + formatCourt(L) + " (pas une limite)";
      svg.appendChild(etL);
    }

    var d = "";
    termes.forEach(function (val, i) { d += (i === 0 ? "M" : "L") + toPx(i + 1).toFixed(2) + " " + toPy(val).toFixed(2) + " "; });
    svg.appendChild(svgEl(ns, "path", { d: d.trim(), class: "connecteur" }));
    termes.forEach(function (val, i) {
      if (val < T.yMin - 0.01 || val > T.yMax + 0.01) return;
      var x = toPx(i + 1), y = toPy(val);
      svg.appendChild(svgEl(ns, "circle", { cx: x.toFixed(2), cy: y.toFixed(2), r: 4.5, class: "point" }));
      var etN = svgEl(ns, "text", { x: x.toFixed(2), y: (T.H - T.B + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-n" });
      etN.textContent = String(i + 1);
      svg.appendChild(etN);
      var etV = svgEl(ns, "text", { x: x.toFixed(2), y: (y - 9).toFixed(2), "text-anchor": "middle", class: "etiquette-valeur" });
      etV.textContent = formatNombreFr(val, 2);
      svg.appendChild(etV);
    });
  };

  SuiteRecurrenteAffineWidgetClass.prototype._rendreToile = function (L, converge, constante) {
    var a = this._a, b = this._b, u1 = this._u1;
    var ns = "http://www.w3.org/2000/svg";
    var svg = this._svg;
    svg.innerHTML = "";
    svg.setAttribute("viewBox", "0 0 " + W.L + " " + W.H);
    svg.setAttribute("class", "toile");
    var largeurZone = W.L - W.G - W.D, hauteurZone = W.H - W.HT - W.B;
    function px(x) { return W.G + ((x - W.min) / (W.max - W.min)) * largeurZone; }
    function py(y) { return W.H - W.B - ((y - W.min) / (W.max - W.min)) * hauteurZone; }
    var defs = this._fleches(svg, ns);
    var clip = svgEl(ns, "clipPath", { id: "zone-toile" });
    clip.appendChild(svgEl(ns, "rect", { x: W.G, y: W.HT, width: largeurZone, height: hauteurZone }));
    defs.appendChild(clip);

    // Grille et graduations (tous les 10)
    var repU = [];
    for (var jj = 0, uu = u1; jj < 3; jj++) { repU.push(uu); uu = a * uu + b; }
    for (var g = Math.ceil(W.min / W.pas) * W.pas; g <= W.max; g += W.pas) {
      if (g !== 0) {
        svg.appendChild(svgEl(ns, "line", { x1: px(g).toFixed(2), x2: px(g).toFixed(2), y1: W.HT, y2: W.H - W.B, class: "grille" }));
        svg.appendChild(svgEl(ns, "line", { x1: W.G, x2: W.L - W.D, y1: py(g).toFixed(2), y2: py(g).toFixed(2), class: "grille" }));
        // Graduation masquée si un repère u₁/u₂/u₃ tombe dessus (étiquettes superposées sinon).
        if (!repU.some(function (t) { return Math.abs(px(t) - px(g)) < 16; })) {
          var tx = svgEl(ns, "text", { x: px(g).toFixed(2), y: (py(0) + 13).toFixed(2), "text-anchor": "middle", class: "etiquette-n" });
          tx.textContent = formatNombreFr(g, 0);
          svg.appendChild(tx);
        }
        var ty = svgEl(ns, "text", { x: (px(0) - 5).toFixed(2), y: (py(g) + 4).toFixed(2), "text-anchor": "end", class: "etiquette-n" });
        ty.textContent = formatNombreFr(g, 0);
        svg.appendChild(ty);
      }
    }
    // Axes fléchés passant par l'origine
    svg.appendChild(svgEl(ns, "line", { x1: W.G, x2: W.L - W.D + 8, y1: py(0).toFixed(2), y2: py(0).toFixed(2), class: "axe", "marker-end": "url(#fleche)" }));
    svg.appendChild(svgEl(ns, "line", { x1: px(0).toFixed(2), x2: px(0).toFixed(2), y1: W.H - W.B, y2: W.HT - 8, class: "axe", "marker-end": "url(#fleche)" }));
    var ex = svgEl(ns, "text", { x: W.L - W.D + 6, y: (py(0) - 6).toFixed(2), "text-anchor": "end", class: "etiquette" });
    ex.textContent = "x";
    svg.appendChild(ex);
    var ey = svgEl(ns, "text", { x: (px(0) + 8).toFixed(2), y: W.HT - 2, class: "etiquette" });
    ey.textContent = "y";
    svg.appendChild(ey);

    var groupe = svgEl(ns, "g", { "clip-path": "url(#zone-toile)" });
    svg.appendChild(groupe);
    // Droites y = x et y = a·x + b (tracées sur toute la fenêtre, puis clippées)
    groupe.appendChild(svgEl(ns, "line", { x1: px(W.min).toFixed(2), y1: py(W.min).toFixed(2), x2: px(W.max).toFixed(2), y2: py(W.max).toFixed(2), class: "droite-id" }));
    groupe.appendChild(svgEl(ns, "line", { x1: px(W.min).toFixed(2), y1: py(a * W.min + b).toFixed(2), x2: px(W.max).toFixed(2), y2: py(a * W.max + b).toFixed(2), class: "droite-f" }));

    // Chemin de la récurrence : (u₁ ; 0) → (u₁ ; u₂) → (u₂ ; u₂) → (u₂ ; u₃) → …
    var u = u1, d = "M" + px(u1).toFixed(2) + " " + py(0).toFixed(2);
    var termes = [u1];
    for (var k = 0; k < N_PAS_TOILE; k++) {
      var suivant = a * u + b;
      // Bornage numérique seulement (le clip fait le travail visuel) : évite des coordonnées énormes.
      if (Math.abs(suivant) > 1e4) break;
      d += " L" + px(u).toFixed(2) + " " + py(suivant).toFixed(2) + " L" + px(suivant).toFixed(2) + " " + py(suivant).toFixed(2);
      termes.push(suivant);
      u = suivant;
    }
    if (!constante) groupe.appendChild(svgEl(ns, "path", { d: d, class: "chemin" }));

    // Repères u₁, u₂, u₃ sur l'axe des abscisses (s'ils sont visibles et assez espacés)
    var placés = [];
    var noms = ["u₁", "u₂", "u₃"];
    for (var j = 0; j < Math.min(3, termes.length); j++) {
      var t = termes[j];
      if (t < W.min || t > W.max) continue;
      var xt = px(t);
      if (placés.some(function (p) { return Math.abs(p - xt) < 18; })) continue;
      placés.push(xt);
      if (j > 0) groupe.appendChild(svgEl(ns, "line", { x1: xt.toFixed(2), x2: xt.toFixed(2), y1: py(t).toFixed(2), y2: py(0).toFixed(2), class: "repere-u" }));
      var et = svgEl(ns, "text", { x: xt.toFixed(2), y: (py(0) + 14).toFixed(2), "text-anchor": "middle", class: "etiquette-u halo" });
      et.textContent = noms[j];
      svg.appendChild(et);
    }

    // Point fixe L (intersection des deux droites)
    if (L >= W.min && L <= W.max) {
      svg.appendChild(svgEl(ns, "circle", { cx: px(L).toFixed(2), cy: py(L).toFixed(2), r: 5.5, class: converge ? "point-fixe-ok" : "point-fixe-piege" }));
      // Étiquette placée du côté opposé à la droite y = a·x + b : au-dessus à gauche si la droite
      // monte moins vite que y = x (0 ≤ a < 1), sinon en dessous à droite.
      var auDessus = a >= 0 && a < 1;
      var etL = svgEl(ns, "text", { x: (px(L) + (auDessus ? -8 : 8)).toFixed(2), y: (py(L) + (auDessus ? -9 : 18)).toFixed(2), "text-anchor": auDessus ? "end" : "start", class: (converge ? "etiquette-limite-ok" : "etiquette-limite-piege") + " halo" });
      etL.textContent = "L = " + formatCourt(L);
      svg.appendChild(etL);
    }

    // Étiquettes des droites, près du bord droit (ou du bord haut/bas si la droite sort avant)
    var etId = svgEl(ns, "text", { x: (px(W.max) - 4).toFixed(2), y: (py(W.max) + 14).toFixed(2), "text-anchor": "end", class: "etiquette-id halo" });
    etId.textContent = "y = x";
    svg.appendChild(etId);
    // Étiquette de y = a·x + b : du côté (gauche ou droite) où elle est la plus éloignée de y = x,
    // pour ne jamais chevaucher l'étiquette « y = x » ; ramenée dans la fenêtre si besoin.
    var candidats = [W.min + 2.5, W.max - 1].map(function (x0) {
      var y0 = a * x0 + b;
      if (y0 > W.max - 1.5 || y0 < W.min + 1.5) {
        var yC = y0 > W.max - 1.5 ? W.max - 1.5 : W.min + 1.5;
        if (Math.abs(a) > EPS) { x0 = (yC - b) / a; y0 = yC; }
      }
      return { x: x0, y: y0, ecart: Math.abs(y0 - x0) };
    }).filter(function (c) { return c.x >= W.min && c.x <= W.max; });
    var choix = candidats.sort(function (p1, p2) { return p2.ecart - p1.ecart; })[0] || { x: W.max - 1, y: a * (W.max - 1) + b };
    var aGauche = choix.x < (W.min + W.max) / 2;
    var etF = svgEl(ns, "text", {
      x: px(choix.x).toFixed(2), y: (py(choix.y) + (choix.y > choix.x ? -7 : 15)).toFixed(2),
      "text-anchor": aGauche ? "start" : "end", class: "etiquette-f halo"
    });
    etF.textContent = "y = a·x + b";
    svg.appendChild(etF);
  };

  if (!customElements.get("suite-recurrente-affine-widget")) {
    customElements.define("suite-recurrente-affine-widget", SuiteRecurrenteAffineWidgetClass);
  }
})();
