(function () {
  "use strict";

  /* ================================================================
   * <venn-double-entree-widget> — atelier interactif : n(A), n(B),
   * n(A∩B) déplaçables (N=40 fixe, comme l'exemple), tableau à double
   * entrée recalculé en direct — matérialise en direct les DEUX pièges
   * de la section : additionner P(A)+P(B) SANS retirer l'intersection
   * (33/40, faux), et calculer « ni A ni B » comme 1−P(A)−P(B) au lieu
   * de 1−P(A∪B). Réglage par défaut (n(A)=18, n(B)=15, n(A∩B)=6)
   * reproduit exactement l'exemple résolu : P(A∪B)=27/40, tableau
   * 12/9/13. Pas de repère cartésien — widget purement tabulaire
   * (comme `seuil-cumule-widget`/`frontiere-classe-widget`). Web
   * Component (Shadow DOM).
   * Ajouts (audit 6e ch. 6) : interrupteur « Sachant B » (tout le
   * tableau est grisé sauf la colonne B, P(A|B) affiché à côté de
   * P(A) : conditionner, c'est zoomer), repère « indépendance » sous le
   * curseur n(A∩B) en n(A)·n(B)/N, et verdict exact en entiers :
   * incompatibles / indépendants / ni l'un ni l'autre.
   * ================================================================ */

  var N = 40;
  var DEFAUT = { nA: 18, nB: 15, nAB: 6 };
  var BORNES_AB = { min: 0, max: N, step: 1 };

  function svgSafeInt(n) { return Math.round(n); }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  function nombreFr(x, d) {
    var r = Math.round(x * Math.pow(10, d)) / Math.pow(10, d);
    var t = r.toFixed(d).replace(/0+$/, "").replace(/\.$/, "");
    return t.replace(".", ",").replace("-", "−");
  }
  /** « 6/15 = 2/5 = 0,4 » ou « 5/12 ≈ 0,417 » (fraction, forme irréductible si différente, puis décimal). */
  function fractionEtDecimal(num, den) {
    var g = pgcd(num, den), txt = num + "/" + den;
    if (g > 1 && num !== 0) txt += " = " + (num / g) + "/" + (den / g);
    var v = num / den, exact = Math.abs(v * 1000 - Math.round(v * 1000)) < 1e-9;
    return txt + (exact ? " = " : " ≈ ") + nombreFr(v, 3);
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.table-zone{overflow-x:auto;margin-bottom:14px;}' +
    'table{border-collapse:collapse;margin:0 auto;font-size:0.9rem;}' +
    'th,td{border:1px solid var(--line,#e2d8c8);padding:8px 16px;text-align:center;font-variant-numeric:tabular-nums;}' +
    'th{background:var(--surface-2,#faf6f0);font-family:var(--serif,serif);font-style:italic;}' +
    'td.deduit{color:var(--good,#2f7a4f);font-weight:700;background:var(--surface-2,#faf6f0);}' +
    'td.donne{font-weight:700;color:var(--ink,#241f1a);}' +
    'table.zoom td.hors,table.zoom th.hors{opacity:0.22;}' +
    'table.zoom td.dans{outline:2px solid var(--accent,#a8471f);outline-offset:-2px;}' +
    '.zoom-row{display:flex;justify-content:center;margin:0 0 10px;}' +
    '.btn-zoom{padding:7px 14px;border-radius:999px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--surface,#fff);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;}' +
    '.btn-zoom[aria-pressed="true"]{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fff);}' +
    '.ligne-zoom{color:var(--accent-ink,#7a3212);font-weight:700;}' +
    '.verdict{padding:9px 12px;border-radius:var(--radius,3px);font-size:0.9rem;font-weight:700;border:1px solid var(--line,#e2d8c8);}' +
    '.verdict-indep{color:var(--good,#2f7a4f);border-color:var(--good,#2f7a4f);}' +
    '.verdict-incomp{color:var(--bad,#b23a3a);border-color:var(--bad,#b23a3a);}' +
    '.verdict-ni{color:var(--ink-soft,#6b6055);}' +
    '.reperes{position:relative;height:10px;margin:0 8px;}' +
    '.repere{position:absolute;top:0;width:2px;height:10px;background:var(--good,#2f7a4f);transform:translateX(-1px);}' +
    '.repere-texte{font-size:0.76rem;color:var(--good,#2f7a4f);font-variant-numeric:tabular-nums;text-align:center;}' +
    '.lecture{display:flex;flex-direction:column;gap:6px;margin:0 0 18px;font-variant-numeric:tabular-nums;}' +
    '.ligne-formule{padding:9px 12px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.86rem;}' +
    '.ligne-vrai{font-weight:700;color:var(--good,#2f7a4f);}' +
    '.ligne-faux{color:var(--bad,#b23a3a);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="zoom-row"><button class="btn-zoom" id="zoom" type="button" aria-pressed="false">Sachant B</button></div>' +
    '<div class="table-zone"><table id="table"></table></div>' +
    '<div class="lecture" id="lecture"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="na">n(A) — sur N=' + N + '</label><div class="curseur-row">' +
    '<input type="range" id="na" min="' + BORNES_AB.min + '" max="' + BORNES_AB.max + '" step="' + BORNES_AB.step + '" value="' + DEFAUT.nA + '">' +
    '<span class="curseur-valeur" id="na-valeur"></span></div></div>' +
    '<div class="curseur"><label for="nb">n(B)</label><div class="curseur-row">' +
    '<input type="range" id="nb" min="' + BORNES_AB.min + '" max="' + BORNES_AB.max + '" step="' + BORNES_AB.step + '" value="' + DEFAUT.nB + '">' +
    '<span class="curseur-valeur" id="nb-valeur"></span></div></div>' +
    '<div class="curseur"><label for="nab">n(A∩B)</label><div class="curseur-row">' +
    '<input type="range" id="nab" min="0" max="' + Math.min(DEFAUT.nA, DEFAUT.nB) + '" step="1" value="' + DEFAUT.nAB + '">' +
    '<span class="curseur-valeur" id="nab-valeur"></span></div>' +
    '<div class="curseur-row"><div class="reperes" id="reperes" style="flex:1 1 auto"></div><span class="curseur-valeur"></span></div>' +
    '<div class="repere-texte" id="repere-texte"></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class VennDoubleEntreeWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  VennDoubleEntreeWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._nA = DEFAUT.nA; this._nB = DEFAUT.nB; this._nAB = DEFAUT.nAB;
    this._table = shadow.getElementById("table");
    this._lecture = shadow.getElementById("lecture");
    this._inputNa = shadow.getElementById("na");
    this._inputNb = shadow.getElementById("nb");
    this._inputNab = shadow.getElementById("nab");
    this._valeurNa = shadow.getElementById("na-valeur");
    this._valeurNb = shadow.getElementById("nb-valeur");
    this._valeurNab = shadow.getElementById("nab-valeur");
    this._resetBtn = shadow.getElementById("reset");
    this._zoomBtn = shadow.getElementById("zoom");
    this._reperes = shadow.getElementById("reperes");
    this._repereTexte = shadow.getElementById("repere-texte");
    this._zoom = false;
  };

  VennDoubleEntreeWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputNa = function () {
      self._nA = svgSafeInt(parseFloat(self._inputNa.value));
      self._clampNab();
      self._rendre();
    };
    this._onInputNb = function () {
      self._nB = svgSafeInt(parseFloat(self._inputNb.value));
      self._clampNab();
      self._rendre();
    };
    this._onInputNab = function () { self._nAB = svgSafeInt(parseFloat(self._inputNab.value)); self._rendre(); };
    this._onReset = function () {
      self._nA = DEFAUT.nA; self._nB = DEFAUT.nB; self._nAB = DEFAUT.nAB;
      self._inputNa.value = String(DEFAUT.nA);
      self._inputNb.value = String(DEFAUT.nB);
      self._inputNab.max = String(Math.min(DEFAUT.nA, DEFAUT.nB));
      self._inputNab.value = String(DEFAUT.nAB);
      self._rendre();
    };
    this._inputNa.addEventListener("input", this._onInputNa);
    this._inputNb.addEventListener("input", this._onInputNb);
    this._inputNab.addEventListener("input", this._onInputNab);
    this._resetBtn.addEventListener("click", this._onReset);
    this._onZoom = function () { self._zoom = !self._zoom; self._rendre(); };
    this._zoomBtn.addEventListener("click", this._onZoom);
    this._rendre();
  };

  VennDoubleEntreeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputNa.removeEventListener("input", this._onInputNa);
    this._inputNb.removeEventListener("input", this._onInputNb);
    this._inputNab.removeEventListener("input", this._onInputNab);
    this._resetBtn.removeEventListener("click", this._onReset);
    this._zoomBtn.removeEventListener("click", this._onZoom);
  };

  VennDoubleEntreeWidgetClass.prototype._clampNab = function () {
    var maxAB = Math.min(this._nA, this._nB);
    this._inputNab.max = String(maxAB);
    if (this._nAB > maxAB) {
      this._nAB = maxAB;
      this._inputNab.value = String(maxAB);
    }
  };

  VennDoubleEntreeWidgetClass.prototype._rendre = function () {
    var nA = this._nA, nB = this._nB, nAB = this._nAB;
    this._valeurNa.textContent = String(nA);
    this._valeurNb.textContent = String(nB);
    this._valeurNab.textContent = String(nAB);

    var aSeul = nA - nAB, bSeul = nB - nAB;
    var union = nA + nB - nAB;
    var ni = N - union;
    var sommeSansRetrait = nA + nB;
    var niFaux = N - nA - nB;

    // « Sachant B » : seule la colonne B reste lisible (on « zoome » sur le monde où B est vrai).
    var zB = this._zoom ? " dans" : "", zH = this._zoom ? " hors" : "";
    this._zoomBtn.setAttribute("aria-pressed", this._zoom ? "true" : "false");
    this._table.className = this._zoom ? "zoom" : "";
    this._table.innerHTML =
      "<tr><th class=\"" + zH + "\"></th><th>B</th><th class=\"" + zH + "\">B̄</th><th class=\"" + zH + "\">Total</th></tr>" +
      "<tr><th>A</th><td class=\"donne" + zB + "\">" + nAB + "</td><td class=\"deduit" + zH + "\">" + aSeul + "</td><td class=\"deduit" + zH + "\">" + nA + "</td></tr>" +
      "<tr><th>Ā</th><td class=\"deduit" + zB + "\">" + bSeul + "</td><td class=\"deduit" + zH + "\">" + ni + "</td><td class=\"deduit" + zH + "\">" + (N - nA) + "</td></tr>" +
      "<tr><th>Total</th><td class=\"donne" + zB + "\">" + nB + "</td><td class=\"deduit" + zH + "\">" + (N - nB) + "</td><td class=\"donne" + zH + "\">" + N + "</td></tr>";

    // Repère « indépendance » sous le curseur n(A∩B) : n(A∩B) = n(A)·n(B)/N.
    var maxAB = Math.min(nA, nB);
    var produit = nA * nB, cible = produit / N;
    var entier = produit % N === 0;
    if (maxAB > 0) {
      var pct = (cible / maxAB) * 100;
      this._reperes.innerHTML = '<span class="repere" style="left:' + pct.toFixed(2) + '%"></span>';
      this._repereTexte.textContent = "▲ repère « indépendance » : n(A∩B) = n(A) × n(B) / N = " +
        (entier ? String(cible) : nombreFr(cible, 2) + " (jamais exactement atteint, n(A∩B) est entier)");
    } else {
      this._reperes.innerHTML = "";
      this._repereTexte.textContent = "";
    }

    // Verdict EXACT, en entiers.
    var verdict;
    if (nA === 0 || nB === 0) {
      verdict = '<div class="verdict verdict-ni">Un des deux événements est impossible (probabilité nulle) : A et B sont à la fois incompatibles et indépendants — le seul cas où les deux vont ensemble.</div>';
    } else if (nAB === 0) {
      verdict = '<div class="verdict verdict-incomp">A et B sont incompatibles (n(A∩B) = 0) — donc pas indépendants : 0 ≠ ' + nA + ' × ' + nB + ' / ' + N + '.</div>';
    } else if (nAB * N === produit) {
      verdict = '<div class="verdict verdict-indep">A et B sont indépendants : n(A∩B) × N = ' + nAB + ' × ' + N + ' = ' + (nAB * N) + ' = ' + nA + ' × ' + nB + ' = n(A) × n(B).</div>';
    } else {
      verdict = '<div class="verdict verdict-ni">Ni incompatibles, ni indépendants : n(A∩B) × N = ' + (nAB * N) + ' ≠ ' + produit + ' = n(A) × n(B).</div>';
    }

    var zoomLigne = "";
    if (this._zoom) {
      if (nB === 0) {
        zoomLigne = '<div class="ligne-formule ligne-zoom">Sachant B : B est impossible, P(A|B) n\'est pas défini.</div>';
      } else {
        var cmp = nAB * N === produit ? "la même proportion qu\'avant : savoir que B est réalisé ne change rien (indépendance)"
          : nAB * N > produit ? "plus que P(A) : B rend A plus probable" : "moins que P(A) : B rend A moins probable";
        zoomLigne = '<div class="ligne-formule ligne-zoom">Sachant B, on ne regarde que la colonne B : P(A|B) = n(A∩B)/n(B) = ' +
          fractionEtDecimal(nAB, nB) + ', contre P(A) = ' + fractionEtDecimal(nA, N) + ' — ' + cmp + '.</div>';
      }
    }

    this._lecture.innerHTML = zoomLigne + verdict +
      '<div class="ligne-formule ligne-vrai">P(A∪B) = ' + nA + '/' + N + ' + ' + nB + '/' + N + ' − ' + nAB + '/' + N + ' = ' + union + '/' + N + ' (formule correcte, intersection retirée)</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — additionner sans retirer : ' + nA + '/' + N + ' + ' + nB + '/' + N + ' = ' + sommeSansRetrait + '/' + N + (sommeSansRetrait > N ? ' (dépasse même N !)' : ' — différent de ' + union + '/' + N) + '</div>' +
      '<div class="ligne-formule ligne-vrai">« ni A ni B » = 1 − ' + union + '/' + N + ' = ' + ni + '/' + N + ' (via le complémentaire de A∪B)</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — 1 − P(A) − P(B) = ' + N + '/' + N + ' − ' + nA + '/' + N + ' − ' + nB + '/' + N + ' = ' + niFaux + '/' + N + (niFaux < 0 ? ' (négatif, impossible !)' : ' — différent de ' + ni + '/' + N) + '</div>';
  };

  if (!customElements.get("venn-double-entree-widget")) {
    customElements.define("venn-double-entree-widget", VennDoubleEntreeWidgetClass);
  }
})();
