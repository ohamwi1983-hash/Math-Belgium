(function () {
  "use strict";

  /* ================================================================
   * <bayes-test-medical-widget> — atelier interactif : P(malade),
   * P(T+|malade), P(T+|non malade) déplaçables — matérialise en direct
   * LE piège central du théorème de Bayes : P(malade|T+) est TRÈS
   * différent de P(T+|malade), les deux valeurs contrastées côte à
   * côte, avec les fréquences naturelles (sur 1000 personnes)
   * recalculées en direct. Réglage par défaut (P(malade)=10%,
   * P(T+|malade)=90%, P(T+|non malade)=20%) reproduit exactement
   * l'exemple résolu : P(T+)=27%, P(malade|T+)=1/3≈33%. Pas de repère
   * cartésien — barres empilées en HTML/CSS (même logique que les
   * illustrations statiques `naturalFrequencies`). Web Component
   * (Shadow DOM).
   * ================================================================ */

  var DEFAUT = { pMalade: 10, pTplusSiMalade: 90, pTplusSiNonMalade: 20 };
  var BORNES_P_MALADE = { min: 1, max: 50, step: 1 };
  var BORNES_P_MALADE_TEST = { min: 50, max: 100, step: 1 };
  var BORNES_P_NONMALADE_TEST = { min: 0, max: 50, step: 1 };
  var TOTAL = 1000;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.colonnes{display:flex;gap:14px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}' +
    '.colonne{display:flex;flex-direction:column;align-items:center;gap:6px;width:110px;}' +
    '.colonne-titre{font-size:0.82rem;font-weight:700;}' +
    '.titre-accent{color:var(--accent-ink,#7a3212);}' +
    '.titre-good{color:var(--good,#2f7a4f);}' +
    '.barre{width:56px;border-radius:var(--radius,3px);overflow:hidden;display:flex;flex-direction:column-reverse;border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);height:180px;}' +
    '.segment{width:100%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;}' +
    '.segment-accent{background:var(--accent,#a8471f);}' +
    '.segment-accent-faint{background:var(--accent-soft-line,#e8c4a4);color:var(--accent-ink,#7a3212);}' +
    '.segment-good{background:var(--good,#2f7a4f);}' +
    '.segment-good-faint{background:var(--good-soft,#cfe8da);color:var(--good,#2f7a4f);}' +
    '.colonne-pied{font-size:0.76rem;color:var(--ink-soft,#6b6055);}' +
    '.contraste{display:flex;flex-direction:column;gap:8px;margin:0 0 18px;}' +
    '.ligne-contraste{padding:10px 14px;border-radius:var(--radius,3px);background:var(--surface-2,#faf6f0);font-size:0.86rem;font-weight:700;text-align:center;font-variant-numeric:tabular-nums;}' +
    '.ligne-donnee{color:var(--ink-soft,#6b6055);}' +
    '.ligne-calculee{color:var(--accent-ink,#7a3212);}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:56px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="colonnes" id="colonnes"></div>' +
    '<div class="contraste" id="contraste"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="pmalade">P(malade)</label><div class="curseur-row">' +
    '<input type="range" id="pmalade" min="' + BORNES_P_MALADE.min + '" max="' + BORNES_P_MALADE.max + '" step="' + BORNES_P_MALADE.step + '" value="' + DEFAUT.pMalade + '">' +
    '<span class="curseur-valeur" id="pmalade-valeur"></span></div></div>' +
    '<div class="curseur"><label for="ptm">P(T⁺|malade)</label><div class="curseur-row">' +
    '<input type="range" id="ptm" min="' + BORNES_P_MALADE_TEST.min + '" max="' + BORNES_P_MALADE_TEST.max + '" step="' + BORNES_P_MALADE_TEST.step + '" value="' + DEFAUT.pTplusSiMalade + '">' +
    '<span class="curseur-valeur" id="ptm-valeur"></span></div></div>' +
    '<div class="curseur"><label for="ptn">P(T⁺|non malade)</label><div class="curseur-row">' +
    '<input type="range" id="ptn" min="' + BORNES_P_NONMALADE_TEST.min + '" max="' + BORNES_P_NONMALADE_TEST.max + '" step="' + BORNES_P_NONMALADE_TEST.step + '" value="' + DEFAUT.pTplusSiNonMalade + '">' +
    '<span class="curseur-valeur" id="ptn-valeur"></span></div></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  class BayesTestMedicalWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  BayesTestMedicalWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._pMalade = DEFAUT.pMalade; this._pTm = DEFAUT.pTplusSiMalade; this._pTn = DEFAUT.pTplusSiNonMalade;
    this._colonnes = shadow.getElementById("colonnes");
    this._contraste = shadow.getElementById("contraste");
    this._inputPmalade = shadow.getElementById("pmalade");
    this._inputPtm = shadow.getElementById("ptm");
    this._inputPtn = shadow.getElementById("ptn");
    this._valeurPmalade = shadow.getElementById("pmalade-valeur");
    this._valeurPtm = shadow.getElementById("ptm-valeur");
    this._valeurPtn = shadow.getElementById("ptn-valeur");
    this._resetBtn = shadow.getElementById("reset");
  };

  BayesTestMedicalWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputPmalade = function () { self._pMalade = parseFloat(self._inputPmalade.value); self._rendre(); };
    this._onInputPtm = function () { self._pTm = parseFloat(self._inputPtm.value); self._rendre(); };
    this._onInputPtn = function () { self._pTn = parseFloat(self._inputPtn.value); self._rendre(); };
    this._onReset = function () {
      self._pMalade = DEFAUT.pMalade; self._pTm = DEFAUT.pTplusSiMalade; self._pTn = DEFAUT.pTplusSiNonMalade;
      self._inputPmalade.value = String(DEFAUT.pMalade);
      self._inputPtm.value = String(DEFAUT.pTplusSiMalade);
      self._inputPtn.value = String(DEFAUT.pTplusSiNonMalade);
      self._rendre();
    };
    this._inputPmalade.addEventListener("input", this._onInputPmalade);
    this._inputPtm.addEventListener("input", this._onInputPtm);
    this._inputPtn.addEventListener("input", this._onInputPtn);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  BayesTestMedicalWidgetClass.prototype.disconnectedCallback = function () {
    this._inputPmalade.removeEventListener("input", this._onInputPmalade);
    this._inputPtm.removeEventListener("input", this._onInputPtm);
    this._inputPtn.removeEventListener("input", this._onInputPtn);
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  BayesTestMedicalWidgetClass.prototype._rendre = function () {
    var pMalade = this._pMalade / 100, pTm = this._pTm / 100, pTn = this._pTn / 100;
    this._valeurPmalade.textContent = formatNombreFr(this._pMalade, 0) + " %";
    this._valeurPtm.textContent = formatNombreFr(this._pTm, 0) + " %";
    this._valeurPtn.textContent = formatNombreFr(this._pTn, 0) + " %";

    var malades = TOTAL * pMalade;
    var nonMalades = TOTAL - malades;
    var maladesTplus = malades * pTm;
    var maladesTmoins = malades - maladesTplus;
    var nonMaladesTplus = nonMalades * pTn;
    var nonMaladesTmoins = nonMalades - nonMaladesTplus;
    var totalTplus = maladesTplus + nonMaladesTplus;
    var pTplus = totalTplus / TOTAL;
    var pMaladeSachantTplus = totalTplus > 0 ? maladesTplus / totalTplus : 0;

    function segment(valeur, hauteurMax, texte, classe) {
      var pourcent = hauteurMax > 0 ? (valeur / hauteurMax) * 100 : 0;
      return '<div class="segment ' + classe + '" style="height:' + pourcent.toFixed(1) + '%">' + (pourcent > 8 ? texte : "") + '</div>';
    }

    var maxColonne = Math.max(malades, nonMalades, 1);

    this._colonnes.innerHTML =
      '<div class="colonne"><div class="colonne-titre titre-accent">malades</div>' +
      '<div class="barre">' +
      segment(maladesTplus, maxColonne, "T⁺ " + formatNombreFr(maladesTplus, 0), "segment-accent") +
      segment(maladesTmoins, maxColonne, "T⁻ " + formatNombreFr(maladesTmoins, 0), "segment-accent-faint") +
      '</div><div class="colonne-pied">' + formatNombreFr(malades, 0) + ' malades</div></div>' +
      '<div class="colonne"><div class="colonne-titre titre-good">non malades</div>' +
      '<div class="barre">' +
      segment(nonMaladesTplus, maxColonne, "T⁺ " + formatNombreFr(nonMaladesTplus, 0), "segment-good") +
      segment(nonMaladesTmoins, maxColonne, "T⁻ " + formatNombreFr(nonMaladesTmoins, 0), "segment-good-faint") +
      '</div><div class="colonne-pied">' + formatNombreFr(nonMalades, 0) + ' non malades</div></div>' +
      '<div class="colonne"><div class="colonne-titre titre-accent">T⁺ au total</div>' +
      '<div class="barre">' +
      segment(maladesTplus, maxColonne, formatNombreFr(maladesTplus, 0), "segment-accent") +
      segment(nonMaladesTplus, maxColonne, formatNombreFr(nonMaladesTplus, 0), "segment-good") +
      '</div><div class="colonne-pied">' + formatNombreFr(totalTplus, 0) + ' positifs</div></div>';

    this._contraste.innerHTML =
      '<div class="ligne-contraste ligne-donnee">P(T⁺|malade) = ' + formatNombreFr(this._pTm, 0) + ' % (donné — fiabilité du test)</div>' +
      '<div class="ligne-contraste ligne-donnee">P(T⁺) = ' + formatNombreFr(this._pTm, 0) + '%×' + formatNombreFr(this._pMalade, 0) + '% + ' + formatNombreFr(this._pTn, 0) + '%×' + formatNombreFr(100 - this._pMalade, 0) + '% = ' + formatNombreFr(pTplus * 100, 1) + ' %</div>' +
      '<div class="ligne-contraste ligne-calculee">P(malade|T⁺) = ' + formatNombreFr(maladesTplus, 0) + '/' + formatNombreFr(totalTplus, 0) + ' = ' + formatNombreFr(pMaladeSachantTplus * 100, 1) + ' % — TRÈS différent de P(T⁺|malade) !</div>';
  };

  if (!customElements.get("bayes-test-medical-widget")) {
    customElements.define("bayes-test-medical-widget", BayesTestMedicalWidgetClass);
  }
})();
