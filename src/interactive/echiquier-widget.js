(function () {
  "use strict";

  /* ================================================================
   * <echiquier-widget> — atelier interactif (5e, chapitre 3 « Suites »,
   * section « Problèmes classiques », légende de l'échiquier) : un grain
   * sur la case 1, deux sur la case 2, quatre sur la case 3… L'élève
   * avance case par case (curseur ou boutons) :
   *   - la case n contient 2ⁿ⁻¹ grains, le total des n premières cases
   *     vaut Sₙ = 2ⁿ − 1 (suite géométrique u₁ = 1, q = 2) ;
   *   - propriété visible : la case n contient un grain de plus que
   *     toutes les cases précédentes réunies (2ⁿ⁻¹ = (2ⁿ⁻¹ − 1) + 1) ;
   *   - masse à 0,05 g le grain, et comparaison avec la production
   *     mondiale annuelle de blé (ordre de grandeur : 8 × 10⁸ t) ;
   *   - repères franchis : le million de grains (n = 20), le milliard
   *     (n = 30), la tonne (n = 25), la production mondiale (n = 54).
   * Calculs exacts en BigInt (écriture complète jusqu'à n = 30, puis
   * notation scientifique à 4 chiffres significatifs). S₆₄ =
   * 18 446 744 073 709 551 615 ≈ 1,845 × 10¹⁹ grains ≈ 9,2 × 10¹¹ t.
   * Web Component (Shadow DOM).
   * ================================================================ */

  var NS = "http://www.w3.org/2000/svg";
  var CASE = 50, BORD = 4, COTE = 8 * CASE + 2 * BORD;
  var MASSE_GRAIN_G = 0.05;
  var PRODUCTION_MONDIALE_T = 8e8;
  var DEFAUT_N = 10;
  var EXPOSANTS = "⁰¹²³⁴⁵⁶⁷⁸⁹";

  function exposant(n) {
    return String(n).split("").map(function (c) { return c === "-" ? "⁻" : EXPOSANTS[+c]; }).join("");
  }

  function groupes(chaine) {
    return chaine.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  /** Écriture scientifique « 1,845 × 10¹⁹ » d'un nombre positif (Number suffit pour 4 chiffres). */
  function scientifique(x, chiffres) {
    if (x === 0) return "0";
    var e = Math.floor(Math.log10(x));
    var m = x / Math.pow(10, e);
    var mArr = parseFloat(m.toFixed(chiffres - 1));
    if (mArr >= 10) { mArr = mArr / 10; e += 1; }
    var mTexte = mArr.toFixed(chiffres - 1).replace(".", ",");
    if (e === 0) return mTexte;
    return mTexte + " × 10" + exposant(e);
  }

  /** Nombre décimal à la française, au plus `dec` décimales, sans zéros inutiles. */
  function decimalFr(v, dec) {
    var t = v.toFixed(dec);
    if (dec > 0) t = t.replace(/0+$/, "").replace(/\.$/, "");
    var parties = t.split(".");
    parties[0] = groupes(parties[0]);
    return parties.join(",");
  }

  /** Grand entier précédé de « = » (écriture complète si n ≤ 30) ou de « ≈ » (scientifique). */
  function egalGrandNombre(big, n) {
    if (n <= 30) return "= " + groupes(big.toString());
    return "≈ " + scientifique(Number(big), 4);
  }

  function masseTexte(grains) {
    var g = grains * MASSE_GRAIN_G;
    if (g < 1000) return decimalFr(g, 2) + " g";
    if (g < 1e6) return decimalFr(g / 1000, 2) + " kg";
    var t = g / 1e6;
    if (t < 1e6) return decimalFr(t, t < 100 ? 2 : 0) + " t";
    return "≈ " + scientifique(t, 2) + " t";
  }

  var REPERES = [
    { n: 20, texte: "plus d'un million de grains (S₂₀ = 1 048 575)" },
    { n: 25, texte: "plus d'une tonne de blé (S₂₅ = 33 554 431 grains ≈ 1,68 t)" },
    { n: 30, texte: "plus d'un milliard de grains (S₃₀ = 1 073 741 823)" },
    { n: 54, texte: "plus que la production mondiale annuelle de blé (S₅₄ ≈ 1,8 × 10¹⁶ grains ≈ 9 × 10⁸ t)" },
  ];

  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var key in attrs) el.setAttribute(key, attrs[key]);
    return el;
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);color:var(--ink,#241f1a);}' +
    '*{box-sizing:border-box;}' +
    '.graphe-zone{display:flex;justify-content:center;margin-bottom:12px;}' +
    'svg{width:100%;max-width:408px;height:auto;aspect-ratio:1/1;}' +
    '.cadre{fill:var(--ink-soft,#6b6055);}' +
    '.case-claire{fill:var(--surface,#fff);}' +
    '.case-foncee{fill:var(--surface-2,#faf6f0);}' +
    '.case-remplie{fill:var(--accent,#a8471f);}' +
    '.case-courante{fill:none;stroke:var(--plan,#5b4ea3);stroke-width:4;}' +
    '.num{font-size:10px;font-family:var(--mono,monospace);fill:var(--ink-faint,#9c9083);}' +
    '.num-remplie{fill:var(--on-accent,#fff);}' +
    '.etiquette-courante{font-size:12px;font-weight:700;font-family:var(--mono,monospace);fill:var(--on-accent,#fff);}' +
    '.controles{display:flex;align-items:center;gap:8px;margin-bottom:12px;}' +
    '.controles input[type="range"]{flex:1 1 auto;min-width:0;height:36px;accent-color:var(--accent,#a8471f);}' +
    '.btn{min-width:44px;min-height:44px;padding:6px 12px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);font-weight:700;font-size:1rem;cursor:pointer;font-family:inherit;}' +
    '.btn:disabled{opacity:0.45;cursor:default;}' +
    '.btn:focus-visible,input:focus-visible{outline:2px solid var(--accent,#a8471f);outline-offset:2px;}' +
    '.case-n{font-variant-numeric:tabular-nums;font-weight:700;min-width:64px;text-align:right;color:var(--accent-ink,#7a3212);}' +
    '.bilan{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;font-size:0.92rem;line-height:1.4;margin:0 0 12px;padding:10px 14px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);}' +
    '.bilan dt{color:var(--ink-soft,#6b6055);font-weight:600;}' +
    '.bilan dd{margin:0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere;}' +
    '.propriete{font-size:0.92rem;line-height:1.45;margin:0 0 12px;padding:10px 14px;border-radius:var(--radius,3px);border-left:4px solid var(--plan,#5b4ea3);background:var(--surface-2,#faf6f0);}' +
    '.reperes{list-style:none;padding:0;margin:0 0 12px;font-size:0.88rem;line-height:1.4;}' +
    '.reperes li{padding:4px 0 4px 26px;position:relative;color:var(--ink-faint,#9c9083);}' +
    '.reperes li::before{content:"○";position:absolute;left:4px;}' +
    '.reperes li.atteint{color:var(--ink,#241f1a);}' +
    '.reperes li.atteint::before{content:"✓";color:var(--good,#2f7a4f);font-weight:700;}' +
    '.note{font-size:0.8rem;color:var(--ink-soft,#6b6055);margin:0;}' +
    '</style>' +
    '<div class="graphe-zone"><svg id="svg" viewBox="0 0 ' + COTE + ' ' + COTE + '" role="img" aria-label="Échiquier rempli case par case"></svg></div>' +
    '<div class="controles">' +
    '<button type="button" class="btn" id="moins" aria-label="Case précédente">−</button>' +
    '<input type="range" id="n" min="1" max="64" step="1" aria-label="Numéro de la case">' +
    '<button type="button" class="btn" id="plus" aria-label="Case suivante">+</button>' +
    '<span class="case-n" id="case-n"></span></div>' +
    '<dl class="bilan" id="bilan"></dl>' +
    '<p class="propriete" id="propriete" aria-live="polite"></p>' +
    '<ul class="reperes" id="reperes"></ul>' +
    '<p class="note">Masse d\'un grain : 0,05 g. Production mondiale annuelle de blé : environ 8 × 10⁸ t (ordre de grandeur).</p>';

  class EchiquierWidgetClass extends HTMLElement {
    constructor() {
      super();
      var shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(TEMPLATE.content.cloneNode(true));
      this._n = DEFAUT_N;
      this._svg = shadow.getElementById("svg");
      this._input = shadow.getElementById("n");
      this._moins = shadow.getElementById("moins");
      this._plus = shadow.getElementById("plus");
      this._caseN = shadow.getElementById("case-n");
      this._bilan = shadow.getElementById("bilan");
      this._propriete = shadow.getElementById("propriete");
      this._reperes = shadow.getElementById("reperes");
      this._construireGrille();
    }

    connectedCallback() {
      var self = this;
      this._onInput = function () { self._n = parseInt(self._input.value, 10); self._rendre(); };
      this._onMoins = function () { if (self._n > 1) { self._n--; self._rendre(); } };
      this._onPlus = function () { if (self._n < 64) { self._n++; self._rendre(); } };
      this._input.addEventListener("input", this._onInput);
      this._moins.addEventListener("click", this._onMoins);
      this._plus.addEventListener("click", this._onPlus);
      this._rendre();
    }

    disconnectedCallback() {
      this._input.removeEventListener("input", this._onInput);
      this._moins.removeEventListener("click", this._onMoins);
      this._plus.removeEventListener("click", this._onPlus);
    }

    /** Cases numérotées de 1 à 64, ligne par ligne, de gauche à droite et de haut en bas. */
    _construireGrille() {
      var svg = this._svg;
      svg.appendChild(svgEl("rect", { x: 0, y: 0, width: COTE, height: COTE, rx: 3, class: "cadre" }));
      this._cases = [];
      for (var k = 1; k <= 64; k++) {
        var lig = Math.floor((k - 1) / 8), col = (k - 1) % 8;
        var x = BORD + col * CASE, y = BORD + lig * CASE;
        var fond = svgEl("rect", { x: x, y: y, width: CASE, height: CASE, class: (lig + col) % 2 ? "case-foncee" : "case-claire" });
        var remplie = svgEl("rect", { x: x, y: y, width: CASE, height: CASE, class: "case-remplie", opacity: 0 });
        var num = svgEl("text", { x: x + 4, y: y + 12, class: "num" });
        num.textContent = String(k);
        svg.appendChild(fond);
        svg.appendChild(remplie);
        svg.appendChild(num);
        this._cases.push({ x: x, y: y, remplie: remplie, num: num });
      }
      this._cadreCourant = svgEl("rect", { width: CASE - 4, height: CASE - 4, class: "case-courante" });
      this._etiquette = svgEl("text", { "text-anchor": "middle", class: "etiquette-courante" });
      svg.appendChild(this._cadreCourant);
      svg.appendChild(this._etiquette);
    }

    _rendre() {
      var n = this._n;
      this._input.value = String(n);
      this._moins.disabled = n <= 1;
      this._plus.disabled = n >= 64;
      this._caseN.textContent = "case " + n;
      // Intensité « logarithmique » : la case k contient 2ᵏ⁻¹ grains, son log₂ vaut k − 1.
      for (var k = 1; k <= 64; k++) {
        var c = this._cases[k - 1];
        var dedans = k <= n;
        c.remplie.setAttribute("opacity", dedans ? (0.28 + 0.72 * (k - 1) / 63).toFixed(3) : "0");
        c.num.setAttribute("class", dedans && k > 24 ? "num num-remplie" : "num");
      }
      var cn = this._cases[n - 1];
      this._cadreCourant.setAttribute("x", cn.x + 2);
      this._cadreCourant.setAttribute("y", cn.y + 2);
      this._etiquette.setAttribute("x", cn.x + CASE / 2);
      this._etiquette.setAttribute("y", cn.y + CASE / 2 + 9);
      this._etiquette.textContent = "2" + exposant(n - 1);
      this._etiquette.setAttribute("class", "etiquette-courante");
      this._etiquette.style.fill = n <= 24 ? "var(--ink,#241f1a)" : "";

      var caseBig = BigInt(1) << BigInt(n - 1);
      var totalBig = (BigInt(1) << BigInt(n)) - BigInt(1);
      var totalNum = Number(totalBig);
      var lignes = [
        ["Case " + n, "2" + exposant(n - 1) + " " + egalGrandNombre(caseBig, n) + (n === 1 ? " grain" : " grains")],
        ["Total S" + indice(n), "2" + exposant(n) + " − 1 " + egalGrandNombre(totalBig, n) + (totalBig === BigInt(1) ? " grain" : " grains")],
        ["Masse", masseTexte(totalNum)],
      ];
      var tonnes = totalNum * MASSE_GRAIN_G / 1e6;
      if (tonnes >= 1) {
        var rapport = tonnes / PRODUCTION_MONDIALE_T;
        var comp;
        if (rapport >= 1) comp = "≈ " + troisChiffres(rapport) + " fois la production mondiale annuelle de blé";
        else comp = pourcentage(rapport * 100) + " de la production mondiale annuelle de blé";
        lignes.push(["Comparaison", comp]);
      }
      this._bilan.innerHTML = lignes.map(function (l) { return "<dt>" + l[0] + "</dt><dd>" + l[1] + "</dd>"; }).join("");

      if (n === 1) {
        this._propriete.textContent = "La première case contient 1 grain. Avance : chaque nouvelle case contient un grain de plus que toutes les cases précédentes réunies.";
      } else {
        var avant = caseBig - BigInt(1);
        // Écriture complète (BigInt) même au-delà de la case 30 : c'est la seule façon de VOIR le « un de plus ».
        this._propriete.textContent = "La case " + n + " contient " + groupes(caseBig.toString()) + " grains, les cases 1 à " + (n - 1) +
          " réunies en contiennent " + groupes(avant.toString()) + " : un de plus ! En effet, 2" + exposant(n - 1) +
          " = (2" + exposant(n - 1) + " − 1) + 1 — c'est pour ça que le total vaut 2" + exposant(n) + " − 1.";
      }
      this._reperes.innerHTML = REPERES.map(function (r) {
        return '<li class="' + (n >= r.n ? "atteint" : "") + '">Case ' + r.n + " : " + r.texte + "</li>";
      }).join("");
    }
  }

  function indice(n) {
    var chiffres = "₀₁₂₃₄₅₆₇₈₉";
    return String(n).split("").map(function (c) { return chiffres[+c]; }).join("");
  }

  /** Arrondi à 3 chiffres significatifs (1 décimale sous 10). */
  function troisChiffres(x) {
    if (x < 10) return decimalFr(x, 1);
    var pas = Math.pow(10, Math.floor(Math.log10(x)) - 2);
    return decimalFr(Math.round(x / pas) * pas, 0);
  }

  function pourcentage(p) {
    if (p >= 1) return "≈ " + decimalFr(p, 1) + " %";
    if (p >= 0.001) return "≈ " + decimalFr(p, 3) + " %";
    return "moins de 0,001 %";
  }

  if (!customElements.get("echiquier-widget")) {
    customElements.define("echiquier-widget", EchiquierWidgetClass);
  }
})();
