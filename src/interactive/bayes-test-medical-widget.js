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
   * Ajouts (audit 6e ch. 6) : préréglages « exemple du cours » et
   * « maladie rare » (prévalence 1 %, sensibilité 99 %, faux positifs
   * 5 % → P(malade|T⁺) = 1/6), case « 2e test positif » (Bayes
   * réappliqué avec P(malade|T⁺) comme nouvelle prévalence), vocabulaire
   * sensibilité / spécificité / faux positifs, et option « 1 000
   * personnes » en grille de points. Prévalence réglable dès 0,5 %.
   * ================================================================ */

  var DEFAUT = { pMalade: 10, pTplusSiMalade: 90, pTplusSiNonMalade: 20 };
  var BORNES_P_MALADE = { min: 0.5, max: 50, step: 0.5 };
  var PRESETS = {
    cours: { pMalade: 10, pTplusSiMalade: 90, pTplusSiNonMalade: 20 },
    rare: { pMalade: 1, pTplusSiMalade: 99, pTplusSiNonMalade: 5 },
  };
  var BORNES_P_MALADE_TEST = { min: 50, max: 100, step: 1 };
  var BORNES_P_NONMALADE_TEST = { min: 0, max: 50, step: 1 };
  var TOTAL = 1000;

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    if (Object.is(arrondi, -0)) arrondi = 0;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }
  function pgcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a || 1; }
  /** Nombre avec au plus `d` décimales, zéros inutiles retirés (« 0,5 », « 10 », « 9,9 »). */
  function court(n, d) {
    var t = formatNombreFr(n, d);
    return t.indexOf(",") >= 0 ? t.replace(/0+$/, "").replace(/,$/, "") : t;
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
    '.presets{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 14px;}' +
    '.btn-preset{padding:7px 14px;border-radius:999px;border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--surface,#fff);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.86rem;font-family:inherit;}' +
    '.btn-preset.actif{background:var(--accent,#a8471f);border-color:var(--accent,#a8471f);color:var(--surface,#fff);}' +
    '.options{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;margin:0 0 14px;font-size:0.88rem;color:var(--ink,#241f1a);}' +
    '.options label{display:flex;align-items:center;gap:6px;cursor:pointer;}' +
    '.options input{accent-color:var(--accent,#a8471f);width:18px;height:18px;}' +
    '.derive{font-size:0.78rem;color:var(--ink-soft,#6b6055);font-variant-numeric:tabular-nums;}' +
    '.grille-zone{margin:0 auto 16px;max-width:420px;}' +
    '.grille{display:grid;grid-template-columns:repeat(40,1fr);gap:1px;}' +
    '.pt{aspect-ratio:1;border-radius:50%;}' +
    '.pt-mp{background:var(--accent,#a8471f);}' +
    '.pt-mn{background:var(--accent-soft-line,#e8c4a4);}' +
    '.pt-np{background:var(--good,#2f7a4f);}' +
    '.pt-nn{background:var(--good-soft,#cfe8da);}' +
    '.legende{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;margin-top:8px;font-size:0.76rem;color:var(--ink-soft,#6b6055);font-variant-numeric:tabular-nums;}' +
    '.legende span{display:inline-flex;align-items:center;gap:5px;}' +
    '.legende i{display:inline-block;width:10px;height:10px;border-radius:50%;}' +
    '.ligne-second{color:var(--good,#2f7a4f);}' +
    '</style>' +
    '<div class="presets"><button type="button" class="btn-preset" data-preset="cours">Exemple du cours</button>' +
    '<button type="button" class="btn-preset" data-preset="rare">Maladie rare</button></div>' +
    '<div class="options"><label><input type="checkbox" id="grille-on"> Voir les 1 000 personnes</label>' +
    '<label><input type="checkbox" id="second"> 2e test positif</label></div>' +
    '<div class="colonnes" id="colonnes"></div>' +
    '<div class="grille-zone" id="grille-zone" hidden></div>' +
    '<div class="contraste" id="contraste"></div>' +
    '<div class="controles">' +
    '<div class="curseur"><label for="pmalade">Prévalence = P(malade)</label><div class="curseur-row">' +
    '<input type="range" id="pmalade" min="' + BORNES_P_MALADE.min + '" max="' + BORNES_P_MALADE.max + '" step="' + BORNES_P_MALADE.step + '" value="' + DEFAUT.pMalade + '">' +
    '<span class="curseur-valeur" id="pmalade-valeur"></span></div></div>' +
    '<div class="curseur"><label for="ptm">Sensibilité = P(T⁺|malade)</label><div class="curseur-row">' +
    '<input type="range" id="ptm" min="' + BORNES_P_MALADE_TEST.min + '" max="' + BORNES_P_MALADE_TEST.max + '" step="' + BORNES_P_MALADE_TEST.step + '" value="' + DEFAUT.pTplusSiMalade + '">' +
    '<span class="curseur-valeur" id="ptm-valeur"></span></div></div>' +
    '<div class="curseur"><label for="ptn">Faux positifs = P(T⁺|non malade)</label><div class="curseur-row">' +
    '<input type="range" id="ptn" min="' + BORNES_P_NONMALADE_TEST.min + '" max="' + BORNES_P_NONMALADE_TEST.max + '" step="' + BORNES_P_NONMALADE_TEST.step + '" value="' + DEFAUT.pTplusSiNonMalade + '">' +
    '<span class="curseur-valeur" id="ptn-valeur"></span></div>' +
    '<div class="derive" id="specificite"></div></div>' +
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
    this._presetBtns = Array.prototype.slice.call(shadow.querySelectorAll(".btn-preset"));
    this._grilleOn = shadow.getElementById("grille-on");
    this._second = shadow.getElementById("second");
    this._grilleZone = shadow.getElementById("grille-zone");
    this._specificite = shadow.getElementById("specificite");
  };

  BayesTestMedicalWidgetClass.prototype._appliquer = function (r) {
    this._pMalade = r.pMalade; this._pTm = r.pTplusSiMalade; this._pTn = r.pTplusSiNonMalade;
    this._inputPmalade.value = String(r.pMalade);
    this._inputPtm.value = String(r.pTplusSiMalade);
    this._inputPtn.value = String(r.pTplusSiNonMalade);
    this._rendre();
  };

  BayesTestMedicalWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    this._onInputPmalade = function () { self._pMalade = parseFloat(self._inputPmalade.value); self._rendre(); };
    this._onInputPtm = function () { self._pTm = parseFloat(self._inputPtm.value); self._rendre(); };
    this._onInputPtn = function () { self._pTn = parseFloat(self._inputPtn.value); self._rendre(); };
    this._onReset = function () {
      self._grilleOn.checked = false;
      self._second.checked = false;
      self._appliquer(DEFAUT);
    };
    this._onPreset = function (ev) { self._appliquer(PRESETS[ev.currentTarget.getAttribute("data-preset")]); };
    this._onOption = function () { self._rendre(); };
    this._presetBtns.forEach(function (b) { b.addEventListener("click", self._onPreset); });
    this._grilleOn.addEventListener("change", this._onOption);
    this._second.addEventListener("change", this._onOption);
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
    var self = this;
    this._presetBtns.forEach(function (b) { b.removeEventListener("click", self._onPreset); });
    this._grilleOn.removeEventListener("change", this._onOption);
    this._second.removeEventListener("change", this._onOption);
  };

  BayesTestMedicalWidgetClass.prototype._rendre = function () {
    var pMalade = this._pMalade / 100, pTm = this._pTm / 100, pTn = this._pTn / 100;
    this._valeurPmalade.textContent = court(this._pMalade, 1) + " %";
    this._specificite.textContent = "spécificité = P(T⁻|non malade) = " + court(100 - this._pTn, 1) + " %";
    var self = this;
    this._presetBtns.forEach(function (b) {
      var r = PRESETS[b.getAttribute("data-preset")];
      b.classList.toggle("actif", r.pMalade === self._pMalade && r.pTplusSiMalade === self._pTm && r.pTplusSiNonMalade === self._pTn);
    });
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
      segment(maladesTplus, maxColonne, "T⁺ " + court(maladesTplus, 1), "segment-accent") +
      segment(maladesTmoins, maxColonne, "T⁻ " + court(maladesTmoins, 1), "segment-accent-faint") +
      '</div><div class="colonne-pied">' + court(malades, 1) + ' malades</div></div>' +
      '<div class="colonne"><div class="colonne-titre titre-good">non malades</div>' +
      '<div class="barre">' +
      segment(nonMaladesTplus, maxColonne, "T⁺ " + court(nonMaladesTplus, 1), "segment-good") +
      segment(nonMaladesTmoins, maxColonne, "T⁻ " + court(nonMaladesTmoins, 1), "segment-good-faint") +
      '</div><div class="colonne-pied">' + court(nonMalades, 1) + ' non malades</div></div>' +
      '<div class="colonne"><div class="colonne-titre titre-accent">T⁺ au total</div>' +
      '<div class="barre">' +
      segment(maladesTplus, maxColonne, court(maladesTplus, 1), "segment-accent") +
      segment(nonMaladesTplus, maxColonne, court(nonMaladesTplus, 1), "segment-good") +
      '</div><div class="colonne-pied">' + court(totalTplus, 1) + ' positifs</div></div>';

    // Grille des 1 000 personnes (effectifs arrondis à l'unité, dans l'ordre : malades T⁺, malades T⁻,
    // non malades T⁺, non malades T⁻).
    if (this._grilleOn.checked) {
      var m = Math.round(TOTAL * pMalade), mp = Math.round(m * pTm), np = Math.round((TOTAL - m) * pTn);
      var comptes = [["pt-mp", mp, "malades positifs"], ["pt-mn", m - mp, "malades négatifs"],
        ["pt-np", np, "non malades positifs"], ["pt-nn", TOTAL - m - np, "non malades négatifs"]];
      var points = "";
      comptes.forEach(function (c) { for (var i = 0; i < c[1]; i++) points += '<div class="pt ' + c[0] + '"></div>'; });
      this._grilleZone.innerHTML = '<div class="grille" role="img" aria-label="1 000 personnes">' + points + '</div>' +
        '<div class="legende">' + comptes.map(function (c) { return '<span><i class="' + c[0] + '"></i>' + c[1] + ' ' + c[2] + '</span>'; }).join("") + '</div>';
      this._grilleZone.hidden = false;
    } else {
      this._grilleZone.hidden = true;
      this._grilleZone.innerHTML = "";
    }

    var ecart = Math.abs(pTm - pMaladeSachantTplus);
    // Fraction EXACTE de P(malade|T⁺) : prévalence au demi-pour-cent, sensibilité et faux positifs au
    // pour-cent → numérateur et dénominateur entiers (en 1/20 000).
    var a1 = Math.round(this._pMalade * 2) * Math.round(this._pTm);
    var b1 = a1 + Math.round(200 - this._pMalade * 2) * Math.round(this._pTn);
    var g1 = pgcd(a1, b1), fr1 = b1 > 0 && b1 / g1 <= 1000 ? " = " + (a1 / g1) + "/" + (b1 / g1) : "";
    var lignes =
      '<div class="ligne-contraste ligne-donnee">Sensibilité : P(T⁺|malade) = ' + court(this._pTm, 1) + ' % (donnée du test)</div>' +
      '<div class="ligne-contraste ligne-donnee">P(T⁺) = ' + court(this._pTm, 1) + ' % × ' + court(this._pMalade, 1) + ' % + ' + court(this._pTn, 1) + ' % × ' + court(100 - this._pMalade, 1) + ' % = ' + court(pTplus * 100, 2) + ' %</div>' +
      '<div class="ligne-contraste ligne-calculee">P(malade|T⁺) = ' + court(maladesTplus, 2) + '/' + court(totalTplus, 2) + fr1 + ' ≈ ' + formatNombreFr(pMaladeSachantTplus * 100, 1) + ' %' +
      (ecart > 0.1 ? ' — très différent de P(T⁺|malade) !' : ' — proche de P(T⁺|malade) ici') + '</div>';

    if (this._second.checked) {
      // 2e test, indépendant du 1er et de mêmes caractéristiques : la prévalence devient P(malade|T⁺).
      var p1 = pMaladeSachantTplus;
      var num = p1 * pTm, den = p1 * pTm + (1 - p1) * pTn;
      var p2 = den > 0 ? num / den : 0;
      var a2 = (a1 / g1) * Math.round(this._pTm), b2 = a2 + (b1 / g1 - a1 / g1) * Math.round(this._pTn);
      var g2 = pgcd(a2, b2), fr2 = b2 > 0 && b2 / g2 <= 1000 && fr1 ? " = " + (a2 / g2) + "/" + (b2 / g2) : "";
      lignes += '<div class="ligne-contraste ligne-second">2e test positif : on repart avec P(malade) = ' + formatNombreFr(p1 * 100, 1) + ' %, d\'où ' +
        'P(malade|T⁺T⁺) = ' + court(this._pTm, 1) + ' % × ' + formatNombreFr(p1 * 100, 1) + ' % / (' + court(this._pTm, 1) + ' % × ' + formatNombreFr(p1 * 100, 1) + ' % + ' +
        court(this._pTn, 1) + ' % × ' + formatNombreFr((1 - p1) * 100, 1) + ' %)' + fr2 + ' ≈ ' + formatNombreFr(p2 * 100, 1) + ' %</div>';
    }
    this._contraste.innerHTML = lignes;
  };

  if (!customElements.get("bayes-test-medical-widget")) {
    customElements.define("bayes-test-medical-widget", BayesTestMedicalWidgetClass);
  }
})();
