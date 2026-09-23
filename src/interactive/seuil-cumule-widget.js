(function () {
  "use strict";

  /* ================================================================
   * <seuil-cumule-widget> — atelier interactif : curseurs sur les 4
   * effectifs d'une série discrète (mêmes 4 valeurs xᵢ que l'exemple
   * résolu : 2, 6, 9, 12), sélecteur médiane/Q1/Q3, construit le tableau
   * des cumulés en direct et surligne la PREMIÈRE ligne dont le cumulé
   * dépasse STRICTEMENT le seuil — matérialise le piège central de la
   * section : un cumulé exactement égal au seuil n'est PAS encore la
   * bonne valeur. Réglages par défaut (5,8,4,3) reproduisent exactement
   * l'exemple résolu, Q1 y compris son cas-piège (cumulé=5=seuil pile).
   * Web Component (Shadow DOM).
   * ================================================================ */

  var X_VALEURS = [2, 6, 9, 12];
  var DEFAUT_N = [5, 8, 4, 3];
  var BORNES_N = { min: 1, max: 12, step: 1 };
  var DEFAUT_TYPE = "q1";

  var LABEL_TYPE = { mediane: "médiane — seuil n/2", q1: "Q1 — seuil n/4", q3: "Q3 — seuil 3n/4" };

  function formatNombreFr(n, decimales) {
    var facteur = Math.pow(10, decimales);
    var arrondi = Math.round(n * facteur) / facteur;
    return arrondi.toFixed(decimales).replace(".", ",").replace("-", "−");
  }

  var TEMPLATE = document.createElement("template");
  TEMPLATE.innerHTML =
    '<style>' +
    ':host{display:block;font-family:var(--sans,system-ui,sans-serif);}' +
    '*{box-sizing:border-box;}' +
    '.ligne-select{display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:14px;}' +
    '.ligne-select label{font-weight:600;color:var(--ink,#241f1a);}' +
    'select{font:inherit;padding:6px 10px;border-radius:var(--radius,3px);border:1px solid var(--line,#e2d8c8);background:var(--surface,#fff);color:var(--ink,#241f1a);}' +
    '.table-zone{margin-bottom:14px;overflow-x:auto;}' +
    'table.grille{border-collapse:collapse;font-family:var(--mono,monospace);font-size:13px;margin:0 auto;}' +
    'table.grille th,table.grille td{border:1px solid var(--line,#e2d8c8);padding:8px 16px;text-align:center;min-width:40px;}' +
    'table.grille th{background:var(--surface-2,#faf6f0);color:var(--ink-faint,#9c9083);font-weight:500;}' +
    'table.grille td.retenu{background:var(--good-soft,#dcefe1);color:var(--good,#2f7a4f);font-weight:700;}' +
    'table.grille td.piege{background:var(--bad-soft,#f6dede);color:var(--bad,#b23a3a);font-weight:700;}' +
    'table.grille td.neutre{color:var(--ink-soft,#6b6055);}' +
    'table.grille td.aussi{color:var(--ink-faint,#9c9083);}' +
    '.note-ligne{font-size:10.5px;display:block;margin-top:2px;font-weight:600;}' +
    '.resultat{text-align:center;font-family:var(--mono,monospace);font-size:1rem;font-weight:700;color:var(--accent-ink,#7a3212);margin:0 0 18px;}' +
    '.controles{display:flex;flex-direction:column;gap:12px;}' +
    '.curseurs-n{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:6px;}' +
    '.curseur{display:flex;flex-direction:column;gap:6px;flex:1 1 150px;}' +
    '.curseur label{font-family:var(--serif,serif);font-style:italic;font-weight:700;color:var(--accent-ink,#7a3212);}' +
    '.curseur-row{display:flex;align-items:center;gap:12px;}' +
    '.curseur-row input[type="range"]{flex:1 1 auto;accent-color:var(--accent,#a8471f);}' +
    '.curseur-valeur{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink-soft,#6b6055);min-width:24px;text-align:right;font-size:0.92rem;}' +
    '.btn-reset{margin-top:2px;padding:8px 14px;border-radius:var(--radius,3px);border:1px solid var(--accent-soft-line,#e8c4a4);background:var(--accent-soft,#f6e2d3);color:var(--accent-ink,#7a3212);font-weight:600;cursor:pointer;font-size:0.88rem;font-family:inherit;align-self:center;}' +
    '.btn-reset:hover{background:var(--accent-soft-line,#e8c4a4);}' +
    '</style>' +
    '<div class="ligne-select"><label for="type">Paramètre cherché</label>' +
    '<select id="type">' +
    '<option value="mediane">médiane — seuil n/2</option>' +
    '<option value="q1">Q1 — seuil n/4</option>' +
    '<option value="q3">Q3 — seuil 3n/4</option>' +
    '</select></div>' +
    '<div class="table-zone" id="zone-tableau"></div>' +
    '<p class="resultat" id="resultat"></p>' +
    '<div class="controles">' +
    '<div class="curseurs-n" id="zone-curseurs"></div>' +
    '<button class="btn-reset" id="reset" type="button">Réinitialiser</button>' +
    '</div>';

  function curseurHTML(i, valeur) {
    return '<div class="curseur"><label for="n' + i + '">n₍x=' + X_VALEURS[i] + '₎</label><div class="curseur-row">' +
      '<input type="range" id="n' + i + '" min="' + BORNES_N.min + '" max="' + BORNES_N.max + '" step="' + BORNES_N.step + '" value="' + valeur + '">' +
      '<span class="curseur-valeur" id="n' + i + '-valeur"></span></div></div>';
  }

  class SeuilCumuleWidgetClass extends HTMLElement {
    constructor() {
      super();
      this._init();
    }
  }

  SeuilCumuleWidgetClass.prototype._init = function () {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this._n = DEFAUT_N.slice();
    this._type = DEFAUT_TYPE;
    this._selectType = shadow.getElementById("type");
    this._zoneTableau = shadow.getElementById("zone-tableau");
    this._resultat = shadow.getElementById("resultat");
    this._zoneCurseurs = shadow.getElementById("zone-curseurs");
    this._resetBtn = shadow.getElementById("reset");
    this._shadow = shadow;
    this._selectType.value = this._type;
    this._zoneCurseurs.innerHTML = DEFAUT_N.map(function (v, i) { return curseurHTML(i, v); }).join("");
  };

  SeuilCumuleWidgetClass.prototype.connectedCallback = function () {
    var self = this;
    var shadow = this._shadow;
    this._onChangeType = function () { self._type = self._selectType.value; self._rendre(); };
    this._inputsN = [];
    this._onInputN = [];
    for (var i = 0; i < 4; i++) {
      (function (idx) {
        var input = shadow.getElementById("n" + idx);
        var onInput = function () { self._n[idx] = parseInt(input.value, 10); self._rendre(); };
        input.addEventListener("input", onInput);
        self._inputsN.push(input);
        self._onInputN.push(onInput);
      })(i);
    }
    this._onReset = function () {
      self._n = DEFAUT_N.slice();
      self._type = DEFAUT_TYPE;
      self._selectType.value = DEFAUT_TYPE;
      self._inputsN.forEach(function (input, i) { input.value = String(DEFAUT_N[i]); });
      self._rendre();
    };
    this._selectType.addEventListener("change", this._onChangeType);
    this._resetBtn.addEventListener("click", this._onReset);
    this._rendre();
  };

  SeuilCumuleWidgetClass.prototype.disconnectedCallback = function () {
    this._selectType.removeEventListener("change", this._onChangeType);
    var self = this;
    this._inputsN.forEach(function (input, i) { input.removeEventListener("input", self._onInputN[i]); });
    this._resetBtn.removeEventListener("click", this._onReset);
  };

  SeuilCumuleWidgetClass.prototype._rendre = function () {
    var self = this;
    var nTotal = this._n.reduce(function (a, b) { return a + b; }, 0);
    var seuil = this._type === "mediane" ? nTotal / 2 : this._type === "q1" ? nTotal / 4 : (3 * nTotal) / 4;

    var cumule = 0;
    var cumules = this._n.map(function (v) { cumule += v; return cumule; });

    var premierIndex = -1;
    for (var i = 0; i < cumules.length; i++) {
      if (cumules[i] > seuil) { premierIndex = i; break; }
    }

    this._zoneTableau.innerHTML = '<table class="grille">' +
      '<tr><th>xᵢ</th>' + X_VALEURS.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>" +
      '<tr><th>nᵢ</th>' + this._n.map(function (n) { return "<td>" + n + "</td>"; }).join("") + "</tr>" +
      '<tr><th>cumulé</th>' + cumules.map(function (c, i) {
        var estPiege = Math.abs(c - seuil) < 1e-9;
        var estRetenu = i === premierIndex;
        var classe = estRetenu ? "retenu" : estPiege ? "piege" : c > seuil ? "aussi" : "neutre";
        var note = estPiege
          ? '<span class="note-ligne">=seuil, pas encore !</span>'
          : estRetenu
            ? '<span class="note-ligne">premier &gt; seuil</span>'
            : "";
        return '<td class="' + classe + '">' + c + note + "</td>";
      }).join("") + "</tr></table>";

    this._resultat.textContent =
      "n = " + nTotal + " — seuil (" + LABEL_TYPE[this._type] + ") = " + formatNombreFr(seuil, 2) +
      " → " + (premierIndex === -1 ? "aucune valeur ne dépasse le seuil" : LABEL_TYPE[this._type].split(" —")[0] + " = " + X_VALEURS[premierIndex]);

    this._n.forEach(function (v, i) { self._shadow.getElementById("n" + i + "-valeur").textContent = String(v); });
  };

  if (!customElements.get("seuil-cumule-widget")) {
    customElements.define("seuil-cumule-widget", SeuilCumuleWidgetClass);
  }
})();
