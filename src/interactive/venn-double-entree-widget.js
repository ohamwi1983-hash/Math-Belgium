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
   * ================================================================ */

  var N = 40;
  var DEFAUT = { nA: 18, nB: 15, nAB: 6 };
  var BORNES_AB = { min: 0, max: N, step: 1 };

  function svgSafeInt(n) { return Math.round(n); }

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
    '<span class="curseur-valeur" id="nab-valeur"></span></div></div>' +
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
    this._rendre();
  };

  VennDoubleEntreeWidgetClass.prototype.disconnectedCallback = function () {
    this._inputNa.removeEventListener("input", this._onInputNa);
    this._inputNb.removeEventListener("input", this._onInputNb);
    this._inputNab.removeEventListener("input", this._onInputNab);
    this._resetBtn.removeEventListener("click", this._onReset);
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

    this._table.innerHTML =
      "<tr><th></th><th>B</th><th>B̄</th><th>Total</th></tr>" +
      "<tr><th>A</th><td class=\"donne\">" + nAB + "</td><td class=\"deduit\">" + aSeul + "</td><td class=\"deduit\">" + nA + "</td></tr>" +
      "<tr><th>Ā</th><td class=\"deduit\">" + bSeul + "</td><td class=\"deduit\">" + ni + "</td><td class=\"deduit\">" + (N - nA) + "</td></tr>" +
      "<tr><th>Total</th><td class=\"donne\">" + nB + "</td><td class=\"deduit\">" + (N - nB) + "</td><td class=\"donne\">" + N + "</td></tr>";

    this._lecture.innerHTML =
      '<div class="ligne-formule ligne-vrai">P(A∪B) = ' + nA + '/' + N + ' + ' + nB + '/' + N + ' − ' + nAB + '/' + N + ' = ' + union + '/' + N + ' (formule correcte, intersection retirée)</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — additionner sans retirer : ' + nA + '/' + N + ' + ' + nB + '/' + N + ' = ' + sommeSansRetrait + '/' + N + (sommeSansRetrait > N ? ' (dépasse même N !)' : ' — différent de ' + union + '/' + N) + '</div>' +
      '<div class="ligne-formule ligne-vrai">« ni A ni B » = 1 − ' + union + '/' + N + ' = ' + ni + '/' + N + ' (via le complémentaire de A∪B)</div>' +
      '<div class="ligne-formule ligne-faux">✗ Piège — 1 − P(A) − P(B) = ' + N + '/' + N + ' − ' + nA + '/' + N + ' − ' + nB + '/' + N + ' = ' + niFaux + '/' + N + (niFaux < 0 ? ' (négatif, impossible !)' : ' — différent de ' + ni + '/' + N) + '</div>';
  };

  if (!customElements.get("venn-double-entree-widget")) {
    customElements.define("venn-double-entree-widget", VennDoubleEntreeWidgetClass);
  }
})();
